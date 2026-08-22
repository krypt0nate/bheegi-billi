import * as stylex from "@stylexjs/stylex";
import ActiveMembers from "@/components/header/active-members";
import Clock from "@/components/header/clock";
import YoutubeMusicLink from "@/components/header/youtube-music-link";

const rise = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translate3d(0, 14px, 0)",
  },
  to: {
    opacity: 1,
    transform: "none",
  },
});

const styles = stylex.create({
  header: {
    animationName: rise,
    animationDuration: "620ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    animationDelay: "0.28s",
    position: "fixed",
    top: "max(1.15rem, env(safe-area-inset-top))",
    left: "clamp(1rem, 2.2vw, 1.75rem)",
    right: "clamp(1rem, 2.2vw, 1.75rem)",
    zIndex: 20,
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "0.75rem",
    textShadow: "0 1px 6px rgba(0, 0, 0, 0.55)",
  },
});

export default function Header() {
  return (
    <header {...stylex.props(styles.header)}>
      <Clock />
      <ActiveMembers />
      <YoutubeMusicLink />
    </header>
  );
}
