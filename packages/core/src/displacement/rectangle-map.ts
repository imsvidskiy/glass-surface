import type { GlassSurfaceOptions, Size } from "../types";

export type RectangleMapInput = Size &
  Pick<
    GlassSurfaceOptions,
    | "borderRadius"
    | "borderWidth"
    | "brightness"
    | "opacity"
    | "blur"
    | "mixBlendMode"
  >;

export function createRectangleMap(input: RectangleMapInput): string {
  const {
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    mixBlendMode,
  } = input;

  const edge = Math.min(width, height) * borderWidth * 0.5;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="horizontal" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>

          <stop offset="100%" stop-color="red"/>
        </linearGradient>

        <linearGradient id="vertical" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>

          <stop offset="100%" stop-color="blue"/>
        </linearGradient>

        <filter
          id="soften"
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="${width}"
          height="${height}"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur stdDeviation="${blur}"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="black"/>

      <rect width="${width}" height="${height}" rx="${borderRadius}" fill="url(#horizontal)"/>

      <rect
        width="${width}"
        height="${height}"
        rx="${borderRadius}"
        fill="url(#vertical)"
        style="mix-blend-mode: ${mixBlendMode}"
      />

      <rect
        x="${edge}"
        y="${edge}"
        width="${width - edge * 2}"
        height="${height - edge * 2}"
        rx="${borderRadius}"
        fill="hsl(0 0% ${brightness}% / ${opacity})"
        filter="url(#soften)"
      />
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
