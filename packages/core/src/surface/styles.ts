import type { GlassSurfaceOptions } from "../options";
import type { ShapeState } from "../shape/shape-tracer";
import type { GlassSurfaceState } from "./controller";

export type SurfaceProperties = Record<`--glass-${string}`, string>;

const SHAPE_CLASSES: Record<ShapeState["status"], string[]> = {
  failed: [],
  loading: [
    "glass-surface--pending",
  ],
  none: [],
  ready: [
    "glass-surface--shaped",
  ],
};

function escapeUrl(source: string): string {
  return source.replaceAll('"', "%22").replaceAll(/[\n\r]+/gu, " ");
}

export function toFilterId(id: string): string {
  return `glass-surface-${id.replaceAll(/[^\w-]/gu, "")}`;
}

export function getSurfaceClasses({ mode, shape }: GlassSurfaceState): string[] {
  return [
    "glass-surface",
    `glass-surface--${mode}`,
    ...SHAPE_CLASSES[shape.status],
  ];
}

export function getSurfaceProperties(
  filterId: string,
  options: GlassSurfaceOptions,
  { shape }: GlassSurfaceState
): SurfaceProperties {
  const properties: SurfaceProperties = {
    "--glass-filter": `url(#${filterId})`,
    "--glass-frost": `${options.backgroundOpacity}`,
    "--glass-radius": `${options.borderRadius}px`,
    "--glass-saturation": `${options.saturation}`,
  };

  if (shape.status !== "ready") {
    return properties;
  }

  const { box, glowMask, lineMask, source } = shape.outline;

  return {
    ...properties,
    "--glass-glow": `url("${glowMask}")`,
    "--glass-line": `url("${lineMask}")`,
    "--glass-shape": `url("${escapeUrl(source)}") ${box.x}px ${box.y}px / ${box.width}px ${box.height}px no-repeat`,
  };
}
