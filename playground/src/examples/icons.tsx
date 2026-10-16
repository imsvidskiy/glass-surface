import type { ReactNode } from "react";

const PATHS = {
  attach:
    "M20 11.5 12.4 19a5 5 0 0 1-7.1-7.1l7.8-7.8a3.3 3.3 0 0 1 4.7 4.7l-7.8 7.8a1.7 1.7 0 0 1-2.4-2.4l7.1-7.1",
  back: "M15 5 8 12l7 7",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z",
  compose: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
  directions: "M12 3 21 12l-9 9-9-9 9-9Zm-2 11v-3h4l-1.5-1.5M14 11l-1.5 1.5",
  filter: "M4 7h16M7 12h10M10 17h4",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z",
  grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z",
  layers: "m12 4 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5",
  library: "M5 4v16M10 4v16M15 5l4 15",
  location: "M20 4 4 11l7 2 2 7 7-16Z",
  microphone:
    "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  next: "M6 6v12l8-6-8-6Zm11 0v12",
  phone:
    "M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 4 5a2 2 0 0 1 2-2Z",
  play: "M7 5v14l12-7L7 5Z",
  radio:
    "M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
}

const FILLED: IconName[] = ["play", "star"];

export function Icon(props: IconProps): ReactNode {
  const { name, size = 22 } = props;

  const filled = FILLED.includes(name);

  return (
    <svg
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={name === "more" ? 3.4 : 2}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
