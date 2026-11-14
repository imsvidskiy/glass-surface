import { defaultOptions } from "@imsvidskiy/glass-surface";
import type { Settings } from "../model/settings";

type Prop = [
  name: string,
  value: unknown,
];

const COMPONENT_DEFAULTS: Record<string, unknown> = {
  ...defaultOptions,
  height: 80,
  width: 200,
};

const PROP_INDENT = "        ";

function isCustomized([name, value]: Prop): boolean {
  return value !== COMPONENT_DEFAULTS[name];
}

function formatProp([name, value]: Prop): string {
  if (typeof value === "string") {
    return `${name}="${value}"`;
  }

  return `${name}={${String(value)}}`;
}

function indentProp(prop: string): string {
  return `${PROP_INDENT}${prop}`;
}

export function createSnippet(settings: Settings): string {
  const customProps = Object.entries(settings).filter(isCustomized).map(formatProp);

  const propLines = [
    ...customProps,
    "backdrop={backdropRef}",
  ]
    .sort()
    .map(indentProp);

  return [
    'import "@imsvidskiy/glass-surface-react/style.css";',
    'import { GlassSurface } from "@imsvidskiy/glass-surface-react";',
    'import { useRef } from "react";',
    "",
    "export function Glass() {",
    "  const backdropRef = useRef<HTMLImageElement>(null);",
    "",
    "  return (",
    "    <>",
    '      <img alt="" ref={backdropRef} src="/backdrop.jpg" />',
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
