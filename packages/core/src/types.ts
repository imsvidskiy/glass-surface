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

export type ColorChannel = "R" | "G" | "B" | "A";

export type GlassMode = "fallback" | "svg" | "webgl";

export type GlassRenderer = "auto" | "svg" | "webgl";

export type Size = {
  height: number;
  width: number;
};

export type Rectangle = Size & {
  x: number;
  y: number;
};

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

export type ShapeOutline = {
  box: Rectangle;
  glowMask: string;
  lineMask: string;
  source: string;
};

export type ShapeState =
  | {
      readonly status: "failed";
    }
  | {
      readonly status: "loading";
    }
  | {
      readonly status: "none";
    }
  | {
      readonly outline: ShapeOutline;
      readonly status: "ready";
    };

export type GlassSurfaceState = {
  readonly displacementMap: string;
  readonly mode: GlassMode;
  readonly shape: ShapeState;
  readonly size: Size;
};
