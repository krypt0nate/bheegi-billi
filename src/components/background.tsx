"use client";

import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useRef, useState } from "react";

const backgroundImages = [
  "/bheegi-billi-1.webp",
  "/bheegi-billi-2.webp",
  "/bheegi-billi-3.webp",
] as const;

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const styles = stylex.create({
  container: {
    position: "fixed",
    inset: 0,
    zIndex: -10,
    backgroundColor: "#0a1416",
  },
  layer: {
    position: "absolute",
    inset: 0,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center 38%",
    backgroundSize: "cover",
    opacity: 0,
    transition: "opacity 1.1s ease-in-out",
  },
  layerActive: {
    opacity: 1,
    animationName: fadeIn,
    animationDuration: "900ms",
    animationTimingFunction: "ease",
    animationFillMode: "both",
  },
  layerImage: (src: string) => ({
    backgroundImage: `url("${src}")`,
  }),
  scrim: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.06) 26%, rgba(0,0,0,0.1) 58%, rgba(0,0,0,0.48) 100%)",
    pointerEvents: "none",
  },
});

export default function Background() {
  const [armed, setArmed] = useState<boolean[]>(() =>
    backgroundImages.map((_, i) => i === 0),
  );
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const armRest = () =>
      setArmed((prev) => prev.map((was, i) => was || i > 0));
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (fn: () => void) => setTimeout(fn, 1200);
    if (document.readyState === "complete") {
      idle(armRest);
    } else {
      window.addEventListener("load", () => idle(armRest), { once: true });
    }
  }, []);

  const rotate = useCallback((to?: number) => {
    const n = backgroundImages.length;
    const next = (((to ?? activeRef.current + 1) % n) + n) % n;
    setActive(next);
  }, []);

  useEffect(() => {
    (
      window as unknown as { rotateBackground?: (to?: number) => void }
    ).rotateBackground = rotate;
    return () => {
      delete (window as unknown as { rotateBackground?: unknown })
        .rotateBackground;
    };
  }, [rotate]);

  return (
    <div {...stylex.props(styles.container)} aria-hidden="true">
      {backgroundImages.map((src, i) => (
        <div
          key={src}
          {...stylex.props(
            styles.layer,
            armed[i] && styles.layerImage(src),
            i === active && styles.layerActive,
          )}
        />
      ))}
      <div {...stylex.props(styles.scrim)} />
    </div>
  );
}
