"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { onHornBlared } from "@/lib/horn";

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

const shake = stylex.keyframes({
  "0%": {
    transform: "translate3d(0, 0, 0) rotate(0deg)",
  },
  "8%": {
    transform: "translate3d(-4px, 2px, 0) rotate(-1.1deg)",
  },
  "18%": {
    transform: "translate3d(4px, -2px, 0) rotate(0.9deg)",
  },
  "28%": {
    transform: "translate3d(-3px, 1px, 0) rotate(-0.75deg)",
  },
  "38%": {
    transform: "translate3d(3px, -1px, 0) rotate(0.6deg)",
  },
  "50%": {
    transform: "translate3d(-2px, 1px, 0) rotate(-0.45deg)",
  },
  "62%": {
    transform: "translate3d(2px, 0, 0) rotate(0.3deg)",
  },
  "74%": {
    transform: "translate3d(-1px, 0, 0) rotate(-0.18deg)",
  },
  "86%": {
    transform: "translate3d(1px, 0, 0) rotate(0.08deg)",
  },
  "100%": {
    transform: "none",
  },
});

const styles = stylex.create({
  logo: {
    animationName: rise,
    animationDuration: "620ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "both",
    animationDelay: "0.06s",
    margin: "13vh 0 0",
    translate: "0vw 0",
    display: "flex",
    alignItems: "baseline",
    gap: "0.22em",
    fontFamily:
      "Baloo 2, Kohinoor Devanagari, Nirmala UI, Noto Sans Devanagari, ui-rounded, system-ui, sans-serif",
    fontWeight: "800",
    fontSize: "clamp(2.5rem, 8.5vw, 7rem)",
    lineHeight: "1",
    letterSpacing: "-0.01em",
    color: "white",
    textAlign: "center",
    filter: "drop-shadow(0 4px 24px rgba(0, 0, 0, 0.5))",
    userSelect: "none",
    "@media (max-width: 640px)": {
      margin: "16vh 0 0",
    },
  },
  logoLine: {
    animationName: shake,
    animationDuration: "720ms",
    animationTimingFunction: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
    animationFillMode: "both",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    border: "0",
  },
});

const logoLines = ["भीगी", "बिल्ली", "मोड"] as const;

export default function Logo() {
  const [shakes, setShakes] = useState(0);

  useEffect(() => onHornBlared(() => setShakes((s) => s + 1)), []);

  return (
    <h1 {...stylex.props(styles.logo)} lang="hi">
      {logoLines.map((line) => (
        <span
          key={`${line}-${shakes}`}
          {...(shakes > 0 ? stylex.props(styles.logoLine) : undefined)}
        >
          {line}
        </span>
      ))}
      <span {...stylex.props(styles.srOnly)} lang="en">
        9xm Morning Hits — Bheegi Billi Readyyyy?
      </span>
    </h1>
  );
}
