import type { GlassSurfaceOptions, GlassSurfaceState } from "../types";

type Channel = "blue" | "green" | "red";

export type FilterPrimitiveTag = "feBlend" | "feColorMatrix" | "feDisplacementMap" | "feGaussianBlur" | "feImage";

export type SvgAttributes = Record<string, number | string>;

export type FilterPrimitive = {
  attributes: SvgAttributes;
  result: string;
  tag: FilterPrimitiveTag;
};

export type FilterDescription = {
  attributes: SvgAttributes;
  primitives: FilterPrimitive[];
};

const CHANNEL_MATRICES: Record<Channel, string> = {
  blue: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  green: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  red: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
};

const BLUR_REACH = 3;

function displaceChannel(channel: Channel, offset: number, options: GlassSurfaceOptions): FilterPrimitive[] {
  const displaced = `${channel}-displaced`;

  return [
    {
      attributes: {
        in: "SourceGraphic",
        in2: "map",
        scale: options.distortionScale + offset,
        xChannelSelector: options.xChannel,
        yChannelSelector: options.yChannel,
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

export function describeFilter(
  id: string,
  options: GlassSurfaceOptions,
  { displacementMap, mode, size }: GlassSurfaceState
): FilterDescription | null {
  if (mode !== "svg") {
    return null;
  }

  const padding = Math.ceil(Math.max(0, options.displace) * BLUR_REACH);

  return {
    attributes: {
      filterUnits: "userSpaceOnUse",
      height: size.height + padding * 2,
      id,
      width: size.width + padding * 2,
      x: -padding,
      y: -padding,
    },
    primitives: [
      {
        attributes: {
          height: size.height,
          href: displacementMap,
          preserveAspectRatio: "none",
          width: size.width,
          x: 0,
          y: 0,
        },
        result: "map",
        tag: "feImage",
      },
      ...displaceChannel("red", options.redOffset, options),
      ...displaceChannel("green", options.greenOffset, options),
      ...displaceChannel("blue", options.blueOffset, options),
      {
        attributes: {
          in: "red",
          in2: "green",
          mode: "screen",
        },
        result: "red-green",
        tag: "feBlend",
      },
      {
        attributes: {
          in: "red-green",
          in2: "blue",
          mode: "screen",
        },
        result: "refracted",
        tag: "feBlend",
      },
      {
        attributes: {
          in: "refracted",
          stdDeviation: options.displace,
        },
        result: "output",
        tag: "feGaussianBlur",
      },
    ],
  };
}
