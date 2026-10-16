import type {
  GlassSurfaceOptions,
  GlassSurfaceState,
  ShapeState,
} from "./types";

export type SurfaceProperties = Record<`--glass-${string}`, string>;

/** Inline declarations that win over the element's own style, as in the original component. */
export type SurfaceOverrides = Record<string, string>;

const SHAPE_CLASSES: Record<ShapeState["status"], string[]> = {
  failed: [],
  loading: ["glass-surface--pending"],
  none: [],
  ready: ["glass-surface--shaped"],
};

function escapeMaskSource(source: string): string {
  return source.replaceAll('"', "%22").replaceAll(/[\n\r]+/g, " ");
}

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
    "--glass-shape": `url("${escapeMaskSource(source)}") ${box.x}px ${box.y}px / ${box.width}px ${box.height}px no-repeat`,
  };
}

/** Kebab-case declarations: the radius, and the outline or the hidden state of a shape. */
export function getSurfaceOverrides(
  options: GlassSurfaceOptions,
  { shape }: GlassSurfaceState
): SurfaceOverrides {
  if (shape.status === "loading") {
    return {
      "border-radius": `${options.borderRadius}px`,
      opacity: "0",
      transition: "none",
    };
  }

  if (shape.status !== "ready") {
    return { "border-radius": `${options.borderRadius}px` };
  }

  const { source, box } = shape.outline;
  const mask = `url("${escapeMaskSource(source)}") ${box.x}px ${box.y}px / ${box.width}px ${box.height}px no-repeat`;

  return {
    "-webkit-mask": mask,
    "border-radius": "0",
    "box-shadow": "none",
    mask,
  };
}

/** The same declarations with the property names React expects. */
export function toStyleObject(
  declarations: SurfaceOverrides
): Record<string, string> {
  const entries = Object.entries(declarations).map(function toCamelCase([
    name,
    value,
  ]) {
    const camelName = name.replaceAll(
      /-([a-z])/g,
      function upper(_match, letter: string) {
        return letter.toUpperCase();
      }
    );

    return [camelName, value];
  });

  return Object.fromEntries(entries);
}
