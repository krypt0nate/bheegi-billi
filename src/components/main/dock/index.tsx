"use client";

import * as stylex from "@stylexjs/stylex";
import { Bumper } from "@/components/main/dock/bumper";
import { Player } from "@/components/main/dock/player";
import { Playlist } from "@/components/main/dock/playlist";
import { styles } from "@/components/main/dock/styles";
import { useDockPlayer } from "@/hooks/use-dock-player";

export default function Dock() {
  const player = useDockPlayer();

  return (
    <div {...stylex.props(styles.dock)}>
      <Playlist player={player} />
      <Bumper player={player} />
      <Player player={player} />
    </div>
  );
}
