import type { GlassSurfaceInput, GlassSurfaceOptions } from "./types";

export const defaultOptions: Readonly<GlassSurfaceOptions> = {
  backdrop: null,
  backgroundOpacity: 0,
  blueOffset: 20,
  blur: 11,
  borderRadius: 20,
  borderWidth: 0.07,
  brightness: 50,
  displace: 0,
  distortionScale: -180,
  greenOffset: 10,
  mixBlendMode: "difference",
  opacity: 0.93,
  redOffset: 0,
  refraction: true,
  renderer: "auto",
  saturation: 1,
  shape: null,
  xChannel: "R",
  yChannel: "G",
};

export function resolveOptions(input: GlassSurfaceInput): GlassSurfaceOptions {
  const defined = Object.entries(input).filter(function isDefined([, value]) {
    return value !== undefined;
  });

  return { ...defaultOptions, ...Object.fromEntries(defined) };
}
