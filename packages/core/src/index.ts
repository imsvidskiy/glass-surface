export { defaultOptions, resolveOptions } from "./options";
export { createGlassSurfaceController, type GlassSurfaceController } from "./surface/controller";
export {
  describeFilter,
  type FilterDescription,
  type FilterPrimitive,
  type FilterPrimitiveTag,
  type SvgAttributes,
} from "./surface/filter";
export { createGlassSurface, type GlassSurfaceInstance } from "./surface/mount";
export { getSurfaceClasses, getSurfaceProperties, type SurfaceProperties, toFilterId } from "./surface/styles";
export type {
  Backdrop,
  BackdropElement,
  BlendMode,
  ColorChannel,
  GlassMode,
  GlassRenderer,
  GlassSurfaceInput,
  GlassSurfaceOptions,
  GlassSurfaceState,
  Rectangle,
  ShapeOutline,
  ShapeState,
  Size,
} from "./types";
