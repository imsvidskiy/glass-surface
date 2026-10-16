// Flat geometric artwork for covers, avatars and photo tiles, drawn from the playground palette.

import type { ReactNode } from "react";

export const PALETTE = {
  blue: "#2f49d1",
  cream: "#f3ede2",
  ink: "#141414",
  navy: "#173a5e",
  orange: "#ef6f3c",
  pink: "#f2a7b8",
  sage: "#8fb39a",
  yellow: "#f4b942",
} as const;

const SCHEMES: [string, string, string][] = [
  [PALETTE.navy, PALETTE.orange, PALETTE.cream],
  [PALETTE.yellow, PALETTE.ink, PALETTE.pink],
  [PALETTE.blue, PALETTE.yellow, PALETTE.cream],
  [PALETTE.pink, PALETTE.navy, PALETTE.orange],
  [PALETTE.sage, PALETTE.cream, PALETTE.navy],
  [PALETTE.orange, PALETTE.cream, PALETTE.blue],
  [PALETTE.cream, PALETTE.blue, PALETTE.orange],
  [PALETTE.ink, PALETTE.yellow, PALETTE.sage],
];

const RING_RADII = [46, 38, 30, 22, 14, 6];
const STRIPES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DOTS = [15, 35, 50, 65, 85];

function rings(accent: string, light: string): ReactNode {
  return RING_RADII.map(function renderRing(radius, index) {
    return (
      <circle
        cx="50"
        cy="50"
        fill={index % 2 === 0 ? accent : light}
        key={radius}
        r={radius}
      />
    );
  });
}

function stripes(accent: string): ReactNode {
  return STRIPES.map(function renderStripe(index) {
    return (
      <rect
        fill={accent}
        height="5"
        key={index}
        width="100"
        x="0"
        y={index * 10 + 2.5}
      />
    );
  });
}

function dots(accent: string): ReactNode {
  return DOTS.flatMap(function renderRow(y) {
    return DOTS.map(function renderDot(x) {
      return <circle cx={x} cy={y} fill={accent} key={`${x}-${y}`} r="5" />;
    });
  });
}

function composition(
  variant: number,
  accent: string,
  light: string
): ReactNode {
  const kind = variant % 6;

  if (kind === 0) {
    return rings(accent, light);
  }

  if (kind === 1) {
    return (
      <>
        {stripes(accent)}
        <circle cx="50" cy="50" fill={light} r="26" />
      </>
    );
  }

  if (kind === 2) {
    return (
      <>
        <path d="M0 100 A50 50 0 0 1 100 100 Z" fill={accent} />
        <path d="M20 100 A30 30 0 0 1 80 100 Z" fill={light} />
        <circle cx="74" cy="24" fill={accent} r="12" />
      </>
    );
  }

  if (kind === 3) {
    return (
      <>
        <path d="M0 0 H100 V100 Z" fill={accent} />
        <circle cx="32" cy="66" fill={light} r="20" />
      </>
    );
  }

  if (kind === 4) {
    return dots(accent);
  }

  return (
    <>
      <path d="M0 0 H50 A50 50 0 0 1 0 50 Z" fill={accent} />
      <path d="M100 100 H50 A50 50 0 0 1 100 50 Z" fill={light} />
      <rect fill={accent} height="16" rx="8" width="40" x="30" y="42" />
    </>
  );
}

/** A square artwork; the variant picks the shapes and the colors. */
export function Artwork(props: { variant: number }): ReactNode {
  const { variant } = props;

  const [background, accent, light] = SCHEMES[(variant * 3) % SCHEMES.length];

  return (
    <svg
      aria-hidden="true"
      className="artwork"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <rect fill={background} height="100" width="100" />
      {composition(variant, accent, light)}
    </svg>
  );
}

const AVATAR_COLORS = [
  PALETTE.orange,
  PALETTE.blue,
  PALETTE.sage,
  PALETTE.pink,
  PALETTE.yellow,
  PALETTE.navy,
];

/** A round avatar with initials. */
export function Avatar(props: {
  name: string;
  size: number;
  tone: number;
}): ReactNode {
  const { name, size, tone } = props;

  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2);

  return (
    <span
      className="avatar"
      style={{
        background: AVATAR_COLORS[tone % AVATAR_COLORS.length],
        fontSize: size * 0.38,
        height: size,
        width: size,
      }}
    >
      {initials}
    </span>
  );
}
