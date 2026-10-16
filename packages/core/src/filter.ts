import type { GlassSurfaceOptions } from "./types";

export type FilterPrimitiveTag =
  | "feImage"
  | "feDisplacementMap"
  | "feColorMatrix"
  | "feBlend"
  | "feGaussianBlur";

export type SvgAttributes = Record<string, string | number>;

export interface FilterPrimitive {
  attributes: SvgAttributes;

  /** Unique name of the step's output, referenced by later steps. */
  result: string;
  tag: FilterPrimitiveTag;
}

export type FilterInput = Pick<
  GlassSurfaceOptions,
  | "distortionScale"
  | "redOffset"
  | "greenOffset"
  | "blueOffset"
  | "xChannel"
  | "yChannel"
  | "displace"
>;

export const FILTER_REGION = {
  height: "100%",
  width: "100%",
  x: "0%",
  y: "0%",
} as const;

const CHANNEL_MATRICES = {
  blue: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  green: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  red: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
} as const;

function displaceChannel(
  channel: keyof typeof CHANNEL_MATRICES,
  scale: number,
  input: FilterInput
): FilterPrimitive[] {
  const displaced = `${channel}-displaced`;

  return [
    {
      attributes: {
        in: "SourceGraphic",
        in2: "map",
        scale,
        xChannelSelector: input.xChannel,
        yChannelSelector: input.yChannel,
      },
      result: displaced,
      tag: "feDisplacementMap",
    },
    {
      attributes: {
        in: displaced,
        type: "matrix",
        values: CHANNEL_MATRICES[channel],
      },
      result: channel,
      tag: "feColorMatrix",
    },
  ];
}

/** Steps of the SVG filter that refracts the backdrop, shared by every renderer of the surface. */
export function describeFilter(
  input: FilterInput,
  displacementMap: string
): FilterPrimitive[] {
  const { distortionScale, redOffset, greenOffset, blueOffset, displace } =
    input;

  const source = displacementMap ? { href: displacementMap } : {};

  return [
    {
      attributes: {
        height: "100%",
        preserveAspectRatio: "none",
        width: "100%",
        x: 0,
        y: 0,
        ...source,
      },
      result: "map",
      tag: "feImage",
    },
    ...displaceChannel("red", distortionScale + redOffset, input),
    ...displaceChannel("green", distortionScale + greenOffset, input),
    ...displaceChannel("blue", distortionScale + blueOffset, input),
    {
      attributes: { in: "red", in2: "green", mode: "screen" },
      result: "red-green",
      tag: "feBlend",
    },
    {
      attributes: { in: "red-green", in2: "blue", mode: "screen" },
      result: "refracted",
      tag: "feBlend",
    },
    {
      attributes: { in: "refracted", stdDeviation: displace },
      result: "output",
      tag: "feGaussianBlur",
    },
  ];
}
