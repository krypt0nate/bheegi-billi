import { useCallback, useEffect, useRef, useState } from "react";
import {
  BUMPER_INTERVAL,
  BUMPER_LINES,
  buildOrder,
  formatTime,
  newBumperOrder,
  type Track,
  type WindowWithYT,
  type YTPlayerInstance,
} from "@/components/main/dock/shared";
import { emitHornPressed } from "@/lib/horn";

export function useDockPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [shuffle, setShuffle] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [bumperOrder, setBumperOrder] = useState<number[]>(() =>
    BUMPER_LINES.map((_, i) => i),
  );
  const [bumperPos, setBumperPos] = useState(0);
  const [bumperSwapping, setBumperSwapping] = useState(false);

  const seekRef = useRef<HTMLDivElement | null>(null);
  const seekFillRef = useRef<HTMLDivElement | null>(null);
  const seekKnobRef = useRef<HTMLDivElement | null>(null);
  const tCurRef = useRef<HTMLSpanElement | null>(null);
  const tDurRef = useRef<HTMLSpanElement | null>(null);
  const listItemsRef = useRef<HTMLOListElement | null>(null);
  const ytRef = useRef<YTPlayerInstance | null>(null);
  const orderRef = useRef(order);
  const nextRef = useRef(() => {});
  const bumperOrderRef = useRef(bumperOrder);
  const bumperPosRef = useRef(bumperPos);
  const ytBootedRef = useRef(false);
  const bumperBootedRef = useRef(false);
  const metaRenderedRef = useRef(false);
  const scrubbingRef = useRef(false);
  const pollRef = useRef({ at: 0, time: 0, duration: 0 });
  const lastSecondRef = useRef(-1);
  const lastDurationRef = useRef(-1);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaSwapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({
    pos,
    order,
    tracks,
    ready,
    playing,
    started,
  });

  const current = tracks[order[pos]];

  useEffect(() => {
    orderRef.current = order;
    bumperOrderRef.current = bumperOrder;
    bumperPosRef.current = bumperPos;
    stateRef.current = {
      pos,
      order,
      tracks,
      ready,
      playing,
      started,
    };
  });

  const go = useCallback((target: number) => {
    const state = stateRef.current;
    const count = state.order.length;
    if (!count) return;
    const next = ((target % count) + count) % count;
    const track = state.tracks[state.order[next]];
    state.pos = next;
    setPos(next);
    if (track && ytRef.current) {
      state.started = true;
      setStarted(true);
      ytRef.current.loadVideoById(track.id);
    }
    (window as unknown as WindowWithYT).rotateBackground?.();
  }, []);

  const toggle = useCallback(() => {
    if (!ytRef.current || !stateRef.current.ready) return;
    if (stateRef.current.playing) ytRef.current.pauseVideo();
    else {
      stateRef.current.started = true;
      setStarted(true);
      ytRef.current.playVideo();
    }
  }, []);

  const next = useCallback(() => go(stateRef.current.pos + 1), [go]);
  const prev = useCallback(() => {
    const yt = ytRef.current;
    if (yt && (yt.getCurrentTime() || 0) > 3) yt.seekTo(0, true);
    else go(stateRef.current.pos - 1);
  }, [go]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const toggleShuffle = useCallback(() => {
    const state = stateRef.current;
    const currentIndex = state.order[state.pos];
    const nextOrder = shuffle
      ? Array.from({ length: state.tracks.length }, (_, i) => i)
      : buildOrder(state.tracks.length);
    const nextPos = Math.max(0, nextOrder.indexOf(currentIndex));
    state.order = nextOrder;
    state.pos = nextPos;
    setOrder(nextOrder);
    setPos(nextPos);
    setShuffle((value) => !value);
  }, [shuffle]);

  const toggleOpen = useCallback(() => {
    setOpen((value) => {
      const nextValue = !value;
      if (nextValue) {
        listItemsRef.current?.children[stateRef.current.pos]?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
      return nextValue;
    });
  }, []);

  const samplePlayer = useCallback(() => {
    const yt = ytRef.current;
    if (!yt) return;
    pollRef.current = {
      time: yt.getCurrentTime() || 0,
      duration: yt.getDuration() || 0,
      at: performance.now(),
    };
  }, []);

  const fractionFromX = useCallback((clientX: number) => {
    const rect = seekRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const previewSeek = useCallback((fraction: number) => {
    const seek = seekRef.current;
    if (!seek) return;
    seekFillRef.current?.style.setProperty("transform", `scaleX(${fraction})`);
    seekKnobRef.current?.style.setProperty(
      "transform",
      `translate(-50%, -50%) translateX(${fraction * seek.clientWidth}px)`,
    );
    if (tCurRef.current && ytRef.current) {
      tCurRef.current.textContent = formatTime(
        (ytRef.current.getDuration() || 0) * fraction,
      );
    }
  }, []);

  const onSeekDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!ytRef.current) return;
      scrubbingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      previewSeek(fractionFromX(event.clientX));
    },
    [fractionFromX, previewSeek],
  );

  const onSeekMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (scrubbingRef.current) previewSeek(fractionFromX(event.clientX));
    },
    [fractionFromX, previewSeek],
  );

  const onSeekUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const yt = ytRef.current;
      if (!scrubbingRef.current || !yt) return;
      const duration = yt.getDuration() || 0;
      if (duration) yt.seekTo(duration * fractionFromX(event.clientX), true);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      scrubbingRef.current = false;
      samplePlayer();
    },
    [fractionFromX, samplePlayer],
  );

  const onSeekKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        event.key === "ArrowRight" ? 5 : event.key === "ArrowLeft" ? -5 : 0;
      if (!step || !ytRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      ytRef.current.seekTo(
        Math.max(0, (ytRef.current.getCurrentTime() || 0) + step),
        true,
      );
      samplePlayer();
    },
    [samplePlayer],
  );

  const bump = useCallback(() => {
    setBumperSwapping(true);
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    swapTimerRef.current = setTimeout(() => {
      let nextPos = bumperPosRef.current + 1;
      let nextOrder = bumperOrderRef.current;
      if (nextPos >= nextOrder.length) {
        const previousLast = nextOrder[nextOrder.length - 1];
        nextOrder = newBumperOrder();
        if (nextOrder[0] === previousLast && nextOrder.length > 1) {
          [nextOrder[0], nextOrder[1]] = [nextOrder[1], nextOrder[0]];
        }
        setBumperOrder(nextOrder);
        nextPos = 0;
      }
      setBumperPos(nextPos);
      setBumperSwapping(false);
    }, 250);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/tracks.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Track[]>;
      })
      .then((data) => {
        if (cancelled) return;
        setTracks(data);
        setOrder(buildOrder(data.length));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bumperBootedRef.current) {
      bumperBootedRef.current = true;
      setBumperOrder(newBumperOrder());
    }
    const timer = setInterval(bump, BUMPER_INTERVAL);
    return () => clearInterval(timer);
  }, [bump]);

  useEffect(() => {
    if (!current || !metaRenderedRef.current) {
      if (current) metaRenderedRef.current = true;
      return;
    }
    setSwapping(true);
    if (metaSwapTimerRef.current) clearTimeout(metaSwapTimerRef.current);
    metaSwapTimerRef.current = setTimeout(() => setSwapping(false), 40);
    return () => {
      if (metaSwapTimerRef.current) clearTimeout(metaSwapTimerRef.current);
    };
  }, [current]);

  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = requestAnimationFrame(paint);
      const poll = pollRef.current;
      if (!ytRef.current || scrubbingRef.current || !poll.duration) return;
      const currentTime = Math.min(
        poll.duration,
        poll.time +
          (stateRef.current.playing ? (performance.now() - poll.at) / 1000 : 0),
      );
      const fraction = Math.min(1, Math.max(0, currentTime / poll.duration));
      seekFillRef.current?.style.setProperty(
        "transform",
        `scaleX(${fraction})`,
      );
      seekKnobRef.current?.style.setProperty(
        "transform",
        `translate(-50%, -50%) translateX(${fraction * (seekRef.current?.clientWidth ?? 0)}px)`,
      );
      const second = Math.floor(currentTime);
      if (second !== lastSecondRef.current) {
        lastSecondRef.current = second;
        if (tCurRef.current)
          tCurRef.current.textContent = formatTime(currentTime);
        seekRef.current?.setAttribute(
          "aria-valuenow",
          String(Math.round(fraction * 100)),
        );
      }
      if (poll.duration !== lastDurationRef.current) {
        lastDurationRef.current = poll.duration;
        if (tDurRef.current)
          tDurRef.current.textContent = formatTime(poll.duration);
      }
    };
    raf = requestAnimationFrame(paint);
    const interval = setInterval(samplePlayer, 250);
    const onVisible = () => {
      if (!document.hidden) samplePlayer();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [samplePlayer]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable]")) return;
      if (event.key === " " || event.key === "k") {
        event.preventDefault();
        toggle();
      } else if (event.key === "n" || event.key === "ArrowRight") {
        if (target !== seekRef.current) next();
      } else if (event.key === "p" || event.key === "ArrowLeft") {
        if (target !== seekRef.current) prev();
      } else if (event.key.toLowerCase() === "h") {
        emitHornPressed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggle]);

  useEffect(() => {
    if (!tracks.length || ytBootedRef.current) return;
    ytBootedRef.current = true;
    const win = window as unknown as WindowWithYT;
    const createPlayer = () => {
      const YT = win.YT;
      if (!YT || ytRef.current) return;
      const player = new YT.Player("yt-player", {
        height: "1",
        width: "1",
        videoId: tracks[orderRef.current[0]]?.id || "",
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            ytRef.current = player;
            win.yt = player;
            setReady(true);
          },
          onStateChange: (event: { data: number }) => {
            const state = YT.PlayerState;
            if (event.data === state.PLAYING) {
              stateRef.current.playing = true;
              setPlaying(true);
              player.setPlaybackQuality?.("tiny");
            } else if (
              event.data === state.PAUSED ||
              event.data === state.BUFFERING
            ) {
              const buffering =
                event.data === state.BUFFERING && stateRef.current.playing;
              stateRef.current.playing = buffering;
              setPlaying(buffering);
            } else if (event.data === state.ENDED) nextRef.current();
          },
          onError: () => {
            if (stateRef.current.started) nextRef.current();
          },
        },
      });
    };
    if (win.YT?.Player) createPlayer();
    else {
      win.onYouTubeIframeAPIReady = createPlayer;
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.append(script);
      }
    }
  }, [tracks]);

  useEffect(() => {
    if (started && current) document.title = `${current.title} — Bheegi Billi`;
  }, [current, started]);

  return {
    tracks,
    order,
    pos,
    shuffle,
    playing,
    ready,
    open,
    loadError,
    swapping,
    bumperText: BUMPER_LINES[bumperOrder[bumperPos] ?? bumperOrder[0]],
    bumperSwapping,
    current,
    refs: { seekRef, seekFillRef, seekKnobRef, tCurRef, tDurRef, listItemsRef },
    actions: {
      go,
      toggle,
      next,
      prev,
      toggleShuffle,
      toggleOpen,
      bump,
      onSeekDown,
      onSeekMove,
      onSeekUp,
      onSeekKey,
    },
  };
}

export type DockPlayer = ReturnType<typeof useDockPlayer>;
