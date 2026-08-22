"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const ping = stylex.keyframes({
  "75%, 100%": {
    transform: "scale(2.2)",
    opacity: 0,
  },
});

const styles = stylex.create({
  presence: {
    justifySelf: "center",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontFamily:
      'ui-sans-serif, -apple-system, "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
    fontSize: "0.82rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    color: "rgba(255, 255, 255, 0.92)",
  },
  dot: {
    position: "relative",
    width: "10px",
    height: "10px",
    flex: "none",
    borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 8px rgba(74, 222, 128, 0.9)",
    "::after": {
      content: "",
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      backgroundColor: "#4ade80",
      opacity: 0.75,
      animationName: {
        default: ping,
        "@media (prefers-reduced-motion: reduce)": null,
      },
      animationDuration: "1900ms",
      animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
      animationIterationCount: "infinite",
    },
  },
  count: {
    fontVariantNumeric: "tabular-nums",
  },
  label: {
    display: {
      default: "inline",
      "@media (max-width: 640px)": "none",
    },
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.62)",
  },
});

const MIN = 500;
const MAX = 800;

export default function ActiveMembers() {
  const [count, setCount] = useState(MIN);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    setCount(MIN + Math.floor(Math.random() * (MAX - MIN)));
    const step = () => {
      setCount((prev) => {
        const midpoint = (MIN + MAX) / 2;
        const up = Math.random() < (prev < midpoint ? 0.58 : 0.42);
        return Math.max(MIN, Math.min(MAX, prev + (up ? 1 : -1)));
      });
      id = setTimeout(step, 2500 + Math.random() * 3500);
    };
    id = setTimeout(step, 2000);
    return () => {
      if (id) clearTimeout(id);
    };
  }, []);

  return (
    <div {...stylex.props(styles.presence)}>
      <span {...stylex.props(styles.dot)} />
      <span {...stylex.props(styles.count)} id="listeners">
        {count}
      </span>
      <span {...stylex.props(styles.label)}>on the highway</span>
    </div>
  );
}
