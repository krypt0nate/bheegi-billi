import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const styles = stylex.create({
  links: {
    justifySelf: "end",
    display: "flex",
    alignItems: "center",
  },
  link: {
    display: "grid",
    placeItems: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    color: "rgba(255, 255, 255, 0.92)",
    textDecoration: "none",
    transitionProperty: "background, transform, color",
    transitionDuration: "140ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      color: "#fff",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
});

export default function YoutubeMusicLink() {
  return (
    <nav {...stylex.props(styles.links)} aria-label="Listen elsewhere">
      <Link
        {...stylex.props(styles.link)}
        href="https://music.youtube.com/playlist?list=PLecVQJ7nYtTs"
        rel="noopener noreferrer"
        title="Open the playlist on YouTube Music"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
        </svg>
      </Link>
    </nav>
  );
}
