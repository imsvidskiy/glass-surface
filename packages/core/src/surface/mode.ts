import type { GlassSurfaceOptions } from "../options";

type ModeInput = {
  hasWebglFailed: boolean;
  isSvgSupported: boolean;
  options: GlassSurfaceOptions;
};

export type GlassMode = "fallback" | "svg" | "webgl";

function shouldUseWebgl({ hasWebglFailed, isSvgSupported, options }: ModeInput): boolean {
  if (options.backdrop === null) {
    return false;
  }

  if (hasWebglFailed) {
    return false;
  }

  if (options.renderer === "auto") {
    return !isSvgSupported;
  }

  return options.renderer === "webgl";
}

export function resolveMode(input: ModeInput): GlassMode {
  if (!input.options.refraction) {
    return "fallback";
  }

  if (shouldUseWebgl(input)) {
    return "webgl";
  }

  if (input.isSvgSupported) {
    return "svg";
  }

  return "fallback";
}
