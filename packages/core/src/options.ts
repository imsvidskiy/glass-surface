export type BackdropElement = HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;

export type Backdrop =
  | BackdropElement
  | {
      readonly current: BackdropElement | null;
    };

export type BlendMode =
  | "color"
  | "color-burn"
  | "color-dodge"
  | "darken"
  | "difference"
  | "exclusion"
  | "hard-light"
  | "hue"
  | "lighten"
  | "luminosity"
  | "multiply"
  | "normal"
  | "overlay"
  | "saturation"
  | "screen"
  | "soft-light";

export type ColorChannel = "A" | "B" | "G" | "R";

export type GlassRenderer = "auto" | "svg" | "webgl";

export type GlassSurfaceOptions = {
  backdrop: Backdrop | null;
  backgroundOpacity: number;
  blueOffset: number;
  blur: number;
  borderRadius: number;
  borderWidth: number;
  brightness: number;
  displace: number;
  distortionScale: number;
  greenOffset: number;
  mixBlendMode: BlendMode;
  opacity: number;
  redOffset: number;
  refraction: boolean;
  renderer: GlassRenderer;
  saturation: number;
  shape: string | null;
  xChannel: ColorChannel;
  yChannel: ColorChannel;
};

export type GlassSurfaceInput = {
  [Option in keyof GlassSurfaceOptions]?: GlassSurfaceOptions[Option] | undefined;
};

export const defaultOptions: Readonly<GlassSurfaceOptions> = {
  backdrop: null,
  backgroundOpacity: 0,
  blueOffset: 20,
  blur: 11,
  borderRadius: 20,
  borderWidth: 0.07,
  brightness: 50,
  displace: 0.8,
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
  const defined = Object.entries(input).filter(([, value]) => {
    return value !== undefined;
  });

  return {
    ...defaultOptions,
    ...Object.fromEntries(defined),
  };
}
