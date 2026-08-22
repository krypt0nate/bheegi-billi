import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { styles } from "@/components/main/dock/styles";
import type { DockPlayer } from "@/hooks/use-dock-player";

export function Player({ player }: { player: DockPlayer }) {
  const { current, playing, ready, open, shuffle, swapping, refs, actions } =
    player;
  const artist = current?.artist ?? current?.rawTitle ?? "\u00a0";
  const [seekActive, setSeekActive] = useState(false);

  return (
    <section aria-label="Player" {...stylex.props(styles.player)}>
      <div {...stylex.props(styles.disc, playing && styles.discPlaying)}>
        <div
          {...stylex.props(styles.discRing, playing && styles.discRingPlaying)}
        >
          {current?.cover ? (
            // biome-ignore lint/performance/noImgElement: external thumbnails
            <img
              src={current.cover}
              alt={`${current.title} artwork`}
              {...stylex.props(
                styles.discArt,
                current.cover.includes("ytimg.com") && styles.discArtBoxed,
              )}
            />
          ) : null}
        </div>
        <span aria-hidden="true" {...stylex.props(styles.discHub)} />
      </div>

      <div {...stylex.props(styles.meta)}>
        <p {...stylex.props(styles.metaTitle, swapping && styles.metaSwap)}>
          {current?.title ??
            (player.loadError ? "Could not load the playlist" : "Loading…")}
        </p>
        <p {...stylex.props(styles.metaArtist, swapping && styles.metaSwap)}>
          {current ? artist : player.loadError ? "Check tracks.json" : "\u00a0"}
        </p>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          ref={refs.seekRef}
          onMouseEnter={() => setSeekActive(true)}
          onMouseLeave={() => setSeekActive(false)}
          onFocus={() => setSeekActive(true)}
          onBlur={() => setSeekActive(false)}
          onPointerDown={actions.onSeekDown}
          onPointerMove={actions.onSeekMove}
          onPointerUp={actions.onSeekUp}
          onKeyDown={actions.onSeekKey}
          {...stylex.props(styles.seek)}
        >
          <div {...stylex.props(styles.seekRail)}>
            <div ref={refs.seekFillRef} {...stylex.props(styles.seekFill)} />
          </div>
          <div
            ref={refs.seekKnobRef}
            {...stylex.props(
              styles.seekKnob,
              seekActive && styles.seekKnobVisible,
            )}
          />
        </div>
        <div {...stylex.props(styles.time)}>
          <span ref={refs.tCurRef}>0:00</span>
          <span aria-hidden="true"> / </span>
          <span ref={refs.tDurRef}>0:00</span>
        </div>
      </div>

      <div {...stylex.props(styles.controls)}>
        <button
          type="button"
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={actions.toggleShuffle}
          {...stylex.props(styles.btn, shuffle && styles.btnToggleOn)}
        >
          <ShuffleIcon />
        </button>
        <button
          type="button"
          aria-label="Previous track"
          onClick={actions.prev}
          {...stylex.props(styles.btn)}
        >
          <PrevIcon />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={actions.toggle}
          disabled={!ready}
          {...stylex.props(styles.btn, styles.btnPlay)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          aria-label="Next track"
          onClick={actions.next}
          {...stylex.props(styles.btn)}
        >
          <NextIcon />
        </button>
        <button
          type="button"
          aria-label="Playlist"
          aria-expanded={open}
          aria-controls="list"
          onClick={actions.toggleOpen}
          {...stylex.props(styles.btn, open && styles.btnToggleOn)}
        >
          <PlaylistIcon />
        </button>
      </div>

      <div {...stylex.props(styles.ytHost)} aria-hidden="true">
        <div id="yt-player" />
      </div>
    </section>
  );
}

function Icon({
  children,
  play = false,
}: {
  children: React.ReactNode;
  play?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...stylex.props(play ? styles.btnPlaySvg : styles.btnSvg)}
    >
      {children}
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <Icon>
      <path d="M17 3l4 4-4 4V8h-2.2l-2.3 3.1 2.3 3.1H17V11l4 4-4 4v-3h-3.2l-4.4-5.9H3v-2h6.4l2.5-3.5H17V3zm-8 12H3v-2h6.4l2.4 2-2.4 2H9z" />
    </Icon>
  );
}

function PrevIcon() {
  return (
    <Icon>
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </Icon>
  );
}

function NextIcon() {
  return (
    <Icon>
      <path d="M16 6h2v12h-2zm-2 6l-8.5 6V6z" />
    </Icon>
  );
}

function PlayIcon() {
  return (
    <Icon play>
      <path d="M8 5v14l11-7z" />
    </Icon>
  );
}

function PauseIcon() {
  return (
    <Icon play>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </Icon>
  );
}

function PlaylistIcon() {
  return (
    <Icon>
      <path d="M3 6h13v2H3zm0 5h13v2H3zm0 5h9v2H3zm15-6.5l4 3-4 3z" />
    </Icon>
  );
}
