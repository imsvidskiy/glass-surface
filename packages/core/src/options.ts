import type { GlassSurfaceInput, GlassSurfaceOptions } from "./types";

export const defaultOptions: Readonly<GlassSurfaceOptions> = {
  backdrop: null,
  backgroundOpacity: 0.05,
  blueOffset: 10,
  blur: 6,
  borderRadius: 20,
  borderWidth: 0.15,
  brightness: 50,
  displace: 0.4,
  distortionScale: -60,
  greenOffset: 5,
  mixBlendMode: "difference",
  opacity: 0.93,
  redOffset: 0,
  refraction: true,
  renderer: "auto",
  saturation: 1.2,
  shape: null,
  xChannel: "R",
  yChannel: "B",
};

export function resolveOptions(input: GlassSurfaceInput): GlassSurfaceOptions {
  const defined = Object.entries(input).filter(function isDefined([, value]) {
    return value !== undefined;
  });

  return { ...defaultOptions, ...Object.fromEntries(defined) };
}
