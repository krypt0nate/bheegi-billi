import * as stylex from "@stylexjs/stylex";
import Dock from "@/components/main/dock";
import Logo from "@/components/main/logo";

const styles = stylex.create({
  main: {
    position: "relative",
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding:
      "max(clamp(1rem, 2.2vw, 1.75rem), env(safe-area-inset-top)) max(clamp(1rem, 2.2vw, 1.75rem), env(safe-area-inset-bottom))",
  },
});

export default function Main() {
  return (
    <main {...stylex.props(styles.main)}>
      <Logo />
      <Dock />
    </main>
  );
}
