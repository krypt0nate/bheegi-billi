"use client";

import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useState } from "react";
import { emitHornBlared, onHornPressed } from "@/lib/horn";

try {
  const session = (navigator as Navigator & { audioSession?: AudioSession })
    .audioSession;
  if (session) session.type = "playback";
} catch {
  /* not supported */
}

type AudioSession = {
  type: "auto" | "ambient" | "playback";
};

const HORN_SRC = "/assets/audio/bheegi-billi.mp3";

let audioCtx: AudioContext | null = null;
let hornBytes: ArrayBuffer | null = null;
let hornBuffer: AudioBuffer | null = null;
let hornSource: AudioBufferSourceNode | null = null;

function ensureAudio() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function primeAudio() {
  const ctx = ensureAudio();
  if (ctx) {
    void loadHorn(ctx);
  }
}

if (typeof document !== "undefined") {
  for (const evt of ["pointerdown", "keydown"]) {
    document.addEventListener(evt, primeAudio, {
      once: true,
      capture: true,
      passive: true,
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    // iOS suspends the audio context when the page is backgrounded.
    if (audioCtx?.state === "suspended") audioCtx.resume();
  });
}

if (typeof window !== "undefined") {
  fetch(HORN_SRC)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((b) => (hornBytes = b))
    .catch(() => {});
}

async function loadHorn(ctx: AudioContext) {
  if (hornBuffer) return hornBuffer;
  if (!hornBytes) {
    try {
      hornBytes = await (await fetch(HORN_SRC)).arrayBuffer();
    } catch {
      return null;
    }
  }
  try {
    hornBuffer = await ctx.decodeAudioData(hornBytes.slice(0));
  } catch {
    return null;
  }
  return hornBuffer;
}

let duckTimer: ReturnType<typeof setTimeout> | null = null;
let duckedFrom: number | null = null;

function duckMusic(ms: number) {
  const yt = (window as unknown as { yt?: YTPlayer }).yt;
  if (!yt || typeof yt.getVolume !== "function") {
    return;
  }
  if (duckedFrom === null) duckedFrom = yt.getVolume();
  yt.setVolume(Math.round(duckedFrom * 0.4));

  if (duckTimer !== null) {
    clearTimeout(duckTimer);
  }
  duckTimer = setTimeout(() => {
    if (duckedFrom !== null) {
      yt.setVolume(duckedFrom);
    }
    duckedFrom = null;
  }, ms + 120);
}

const honk = stylex.keyframes({
  "0%, 100%": {
    transform: "translateX(0)",
  },
  "20%": {
    transform: "translateX(-4px) rotate(-1.6deg)",
  },
  "50%": {
    transform: "translateX(5px) rotate(1.6deg)",
  },
});

const iconBlare = stylex.keyframes({
  "0%": {
    backgroundColor: "#fff",
    color: "#111",
  },
  "100%": {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    color: "#fff",
  },
});

const styles = stylex.create({
  horns: {
    position: "fixed",
    left: "clamp(1rem, 2.2vw, 1.75rem)",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 20,
  },
  horn: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.28rem 0.7rem 0.28rem 0.3rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "999px",
    backgroundColor: {
      default: "rgba(255, 255, 255, 0.2)",
      ":hover": "rgba(255, 255, 255, 0.2)",
    },
    borderColor: {
      default: "rgba(255, 255, 255, 0.2)",
      ":hover": "rgba(255, 255, 255, 0.4)",
    },
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    boxShadow:
      "0 6px 22px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
    color: "#fff",
    cursor: "pointer",
    transform: {
      default: "none",
      ":active": "scale(0.95)",
    },
    transitionProperty: "background, transform, border-color",
    transitionDuration: "140ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  hornBlaring: {
    animationName: honk,
    animationDuration: "0.45s",
    animationTimingFunction: "ease",
  },
  hornIcon: {
    display: "grid",
    placeItems: "center",
    width: "1.6rem",
    height: "1.6rem",
    flex: "none",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    color: "#fff",
  },
  hornIconBlaring: {
    animationName: iconBlare,
    animationDuration: "0.45s",
    animationTimingFunction: "ease",
  },
  hornSvg: {
    width: "15px",
    height: "15px",
  },
  hornText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.1",
    textAlign: "left",
  },
  hornDeva: {
    fontSize: "0.76rem",
    fontWeight: 700,
  },
  hornEn: {
    fontSize: "0.58rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "rgba(255, 255, 255, 0.62)",
  },
});

type YTPlayer = {
  getVolume: () => number;
  setVolume: (v: number) => void;
};

export default function BheegiBilli() {
  const [hornKey, setHornKey] = useState(0);
  const [hasBlared, setHasBlared] = useState(false);

  const honk = useCallback(async () => {
    const ctx = ensureAudio();
    if (!ctx) {
      return;
    }

    const buffer = await loadHorn(ctx);
    if (!buffer) {
      return;
    }

    try {
      hornSource?.stop();
    } catch {
      /* already finished */
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.9;
    source.connect(gain).connect(ctx.destination);
    source.onended = () => {
      if (hornSource === source) {
        hornSource = null;
      }
    };
    source.start();
    hornSource = source;

    duckMusic(buffer.duration * 1000);

    emitHornBlared();
    setHasBlared(true);
    setHornKey((k) => k + 1);
  }, []);

  useEffect(() => onHornPressed(() => void honk()), [honk]);

  return (
    <aside {...stylex.props(styles.horns)}>
      <button
        key={hornKey}
        {...stylex.props(styles.horn, hasBlared && styles.hornBlaring)}
        id="horn"
        type="button"
        aria-label="Sound the horn"
        onClick={honk}
      >
        <span
          {...stylex.props(
            styles.hornIcon,
            hasBlared && styles.hornIconBlaring,
          )}
          aria-hidden="true"
        >
          <svg
            {...stylex.props(styles.hornSvg)}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3z" />
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M15.4 8.4a5.2 5.2 0 010 7.2" />
              <path d="M18.2 5.6a9.2 9.2 0 010 12.8" />
            </g>
          </svg>
        </span>
        <span {...stylex.props(styles.hornText)}>
          <span {...stylex.props(styles.hornDeva)} lang="hi">
            भीगी बिल्ली
          </span>
          <span {...stylex.props(styles.hornEn)}>Bheegi Billi Readyyyy?</span>
        </span>
      </button>
    </aside>
  );
}
