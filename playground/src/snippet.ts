import { defaultOptions } from "@svidskiy/glass-surface";
import type { Settings } from "./settings";

const COMPONENT_DEFAULTS: Record<string, unknown> = {
  ...defaultOptions,
  height: 80,
  width: 200,
};

const PROP_INDENT = "        ";

function formatProp(name: string, value: unknown): string {
  if (typeof value === "string") {
    return `${name}="${value}"`;
  }

  return `${name}={${String(value)}}`;
}

function differsFromDefault([name, value]: [string, unknown]): boolean {
  return value !== COMPONENT_DEFAULTS[name];
}

/** A ready-to-paste component with every prop that differs from the defaults, sorted by name. */
export function createSnippet(settings: Settings): string {
  const { preset, ...props } = settings;

  const changed = Object.entries(props).filter(differsFromDefault);

  const propLines = changed
    .map(function toProp([name, value]) {
      return formatProp(name, value);
    })
    .concat("backdrop={backdrop}")
    .sort()
    .map(function indent(prop) {
      return `${PROP_INDENT}${prop}`;
    });

  return [
    'import "@svidskiy/glass-surface-react/style.css";',
    'import { GlassSurface } from "@svidskiy/glass-surface-react";',
    'import { useRef } from "react";',
    "",
    "export function Glass() {",
    "  const backdrop = useRef<HTMLImageElement>(null);",
    "",
    "  return (",
    "    <>",
    '      <img alt="" ref={backdrop} src="/backdrop.jpg" />',
    "",
    "      <GlassSurface",
    ...propLines,
    "      />",
    "    </>",
    "  );",
    "}",
    "",
  ].join("\n");
}
