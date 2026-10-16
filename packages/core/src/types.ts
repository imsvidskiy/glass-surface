export type ColorChannel = "R" | "G" | "B" | "A";

export type GlassRenderer = "auto" | "svg" | "webgl";

export type GlassMode = "webgl" | "svg" | "fallback";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export type BackdropElement =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement;

export type Backdrop =
  | BackdropElement
  | { readonly current: BackdropElement | null };

export interface Size {
  height: number;
  width: number;
}

export interface Rectangle extends Size {
  x: number;
  y: number;
}

export interface GlassSurfaceOptions {
  /** Image, video or canvas behind the surface; required for WebGL. */
  backdrop: Backdrop | null;

  /** Opacity of the tint layer, from 0 to 1. */
  backgroundOpacity: number;

  /** Extra displacement of the blue channel, for chromatic aberration. */
  blueOffset: number;

  /** Softness of the transition between the edge and the center, in pixels. */
  blur: number;
  /** Corner radius in pixels. */
  borderRadius: number;

  /** Width of the refracting edge, relative to the shorter side. */
  borderWidth: number;

  /** Lightness of the flat center of the displacement map, from 0 to 100. */
  brightness: number;

  /** Blur of the refracted result, in pixels. */
  displace: number;

  /** Strength of the displacement. */
  distortionScale: number;

  /** Extra displacement of the green channel, for chromatic aberration. */
  greenOffset: number;

  /** Blend mode of the vertical gradient in the displacement map. */
  mixBlendMode: BlendMode;

  /** How strongly the flat center overrides the edge gradient, from 0 to 1. */
  opacity: number;

  /** Extra displacement of the red channel, for chromatic aberration. */
  redOffset: number;

  /** Enables refraction; without it the surface is frosted. */
  refraction: boolean;

  /** Preferred renderer; `auto` uses WebGL when a backdrop is given and the SVG filter otherwise. */
  renderer: GlassRenderer;

  /** Saturation multiplier of the refracted backdrop. */
  saturation: number;

  /** URL of an image whose alpha channel defines the outline of the surface. */
  shape: string | null;

  /** Displacement map channel that drives the horizontal shift. */
  xChannel: ColorChannel;

  /** Displacement map channel that drives the vertical shift. */
  yChannel: ColorChannel;
}

export type GlassSurfaceInput = Partial<GlassSurfaceOptions>;

export interface ShapeOutline {
  box: Rectangle;
  glowMask: string;
  lineMask: string;
  source: string;
}

export type ShapeState =
  | { readonly status: "none" }
  | { readonly status: "loading" }
  | { readonly status: "failed" }
  | { readonly status: "ready"; readonly outline: ShapeOutline };

export interface GlassSurfaceState {
  readonly displacementMap: string;
  readonly mode: GlassMode;
  readonly shape: ShapeState;
}
