export type { Rectangle, Size } from "./lib/geometry";
export {
  type Backdrop,
  type BackdropElement,
  type BlendMode,
  type ColorChannel,
  defaultOptions,
  type GlassRenderer,
  type GlassSurfaceInput,
  type GlassSurfaceOptions,
  resolveOptions,
} from "./options";
export type { ShapeOutline, ShapeState } from "./shape/shape-tracer";
export {
  createGlassSurfaceController,
  type GlassSurfaceController,
  type GlassSurfaceState,
} from "./surface/controller";
export {
  describeFilter,
  type FilterDescription,
  type FilterPrimitive,
  type FilterPrimitiveTag,
  type SvgAttributes,
} from "./surface/filter";
export type { GlassMode } from "./surface/mode";
export { createGlassSurface, type GlassSurfaceInstance } from "./surface/mount";
export { getSurfaceClasses, getSurfaceProperties, type SurfaceProperties, toFilterId } from "./surface/styles";
