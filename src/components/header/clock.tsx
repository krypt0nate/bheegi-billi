"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const styles = stylex.create({
  clock: {
    justifySelf: "start",
    fontFamily:
      'ui-sans-serif, -apple-system, "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
    fontSize: "0.82rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    fontVariantNumeric: "tabular-nums",
    color: "rgba(255, 255, 255, 0.92)",
  },
});

function formatTime(date: Date) {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(formatTime(new Date()));
      const msUntilNextMinute = 60000 - (Date.now() % 60000) + 1000;
      timeout = setTimeout(tick, msUntilNextMinute);
    };
    let timeout: ReturnType<typeof setTimeout>;
    tick();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div {...stylex.props(styles.clock)} id="clock" role="timer">
      {time}
    </div>
  );
}
