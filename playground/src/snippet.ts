import { defaultOptions } from "@svidskiy/glass-surface";
import type { Settings } from "./settings";

const COMPONENT_DEFAULTS: Record<string, unknown> = {
  ...defaultOptions,
  height: 80,
  width: 200,
};

function formatProp(name: string, value: unknown): string {
  if (typeof value === "string") {
    return `${name}="${value}"`;
  }

  return `${name}={${String(value)}}`;
}

/** JSX for the surface with every prop that differs from the component defaults. */
export function createSnippet(settings: Settings): string {
  const { preset, ...props } = settings;

  const changed = Object.entries(props).filter(function differsFromDefault([
    name,
    value,
  ]) {
    return value !== COMPONENT_DEFAULTS[name];
  });

  const lines = changed.map(function toLine([name, value]) {
    return `  ${formatProp(name, value)}`;
  });

  return ["<GlassSurface", ...lines, ">", "  …", "</GlassSurface>"].join("\n");
}
