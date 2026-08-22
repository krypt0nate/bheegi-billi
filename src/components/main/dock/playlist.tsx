import * as stylex from "@stylexjs/stylex";
import { styles } from "@/components/main/dock/styles";
import type { DockPlayer } from "@/hooks/use-dock-player";

export function Playlist({ player }: { player: DockPlayer }) {
  const { tracks, order, pos, open, loadError, refs, actions } = player;

  return (
    <section
      id="list"
      aria-label="Playlist"
      {...stylex.props(styles.list, open && styles.listOpen)}
    >
      <ol ref={refs.listItemsRef} {...stylex.props(styles.listItems)}>
        {order.map((trackIndex, index) => {
          const track = tracks[trackIndex];
          return (
            <li key={trackIndex}>
              <button
                type="button"
                onClick={() => actions.go(index)}
                {...stylex.props(
                  styles.listButton,
                  index === pos && styles.listButtonCurrent,
                )}
              >
                <span {...stylex.props(styles.listNumber)}>{index + 1}</span>
                <span {...stylex.props(styles.listTitle)}>{track?.title}</span>
                <span {...stylex.props(styles.listArtist)}>
                  {track?.artist ?? track?.rawTitle ?? ""}
                </span>
              </button>
            </li>
          );
        })}
        {loadError && (
          <li>
            <button type="button" disabled {...stylex.props(styles.listButton)}>
              <span {...stylex.props(styles.listTitle)}>
                Could not load the playlist
              </span>
              <span {...stylex.props(styles.listArtist)}>
                Check tracks.json
              </span>
            </button>
          </li>
        )}
      </ol>
    </section>
  );
}
