import * as stylex from "@stylexjs/stylex";
import { styles } from "@/components/main/dock/styles";
import type { DockPlayer } from "@/hooks/use-dock-player";

export function Bumper({ player }: { player: DockPlayer }) {
  return (
    <p {...stylex.props(styles.bumper)}>
      <span
        lang="hi"
        aria-live="polite"
        {...stylex.props(
          styles.bumperText,
          player.bumperSwapping && styles.bumperSwapping,
        )}
      >
        {player.bumperText}
      </span>
      <button
        type="button"
        aria-label="Another line"
        onClick={player.actions.bump}
        {...stylex.props(styles.bumperNext)}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          {...stylex.props(styles.bumperIcon)}
        >
          <path d="M20 11.5A8 8 0 106.3 17.7" />
          <path d="M20 5.5v6h-6" />
        </svg>
      </button>
    </p>
  );
}
