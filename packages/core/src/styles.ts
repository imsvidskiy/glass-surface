import type {
  GlassSurfaceOptions,
  GlassSurfaceState,
  ShapeState,
} from "./types";

export type SurfaceProperties = Record<`--glass-${string}`, string>;

const SHAPE_CLASSES: Record<ShapeState["status"], string[]> = {
  failed: [],
  loading: ["glass-surface--pending"],
  none: [],
  ready: ["glass-surface--shaped"],
};

export function toFilterId(id: string): string {
  return `glass-surface-${id.replaceAll(/[^\w-]/g, "")}`;
}

export function getSurfaceClasses({
  mode,
  shape,
}: GlassSurfaceState): string[] {
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

  const { source, box, lineMask, glowMask } = shape.outline;

  return {
    ...properties,
    "--glass-glow": `url("${glowMask}")`,
    "--glass-line": `url("${lineMask}")`,
    "--glass-shape": `url("${source.replaceAll('"', "%22")}") ${box.x}px ${box.y}px / ${box.width}px ${box.height}px no-repeat`,
  };
}
