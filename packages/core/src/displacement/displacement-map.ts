import { memoizeLatest } from "../memoize";
import type { ShapeField } from "../shape/shape-field";
import type { GlassSurfaceOptions, Size } from "../types";
import { createRectangleMap } from "./rectangle-map";
import { createShapeMap } from "./shape-map";

export type DisplacementMapper = (
  options: GlassSurfaceOptions,
  size: Size,
  field: ShapeField | null
) => HTMLCanvasElement;

const TEXEL_BUDGET = 250_000;

const MINIMUM_SOFTNESS = 0.5;

function getTexelsPerPixel({ height, width }: Size): number {
  return Math.min(1, Math.sqrt(TEXEL_BUDGET / (width * height)));
}

export function createDisplacementMapper(): DisplacementMapper {
  const drawRectangle = memoizeLatest(createRectangleMap);
  const drawShape = memoizeLatest(createShapeMap);

  return (options, size, field) => {
    const texelsPerPixel = getTexelsPerPixel(size);

    if (field === null) {
      return drawRectangle({
        blur: options.blur,
        borderRadius: options.borderRadius,
        borderWidth: options.borderWidth,
        brightness: options.brightness,
        height: size.height,
        mixBlendMode: options.mixBlendMode,
        opacity: options.opacity,
        texelsPerPixel,
        width: size.width,
      });
    }

    return drawShape({
      centerBrightness: options.brightness / 100,
      centerOpacity: options.opacity,
      edgeWidth: Math.min(size.width, size.height) * options.borderWidth * 0.5,
      field,
      softness: Math.max(options.blur, MINIMUM_SOFTNESS),
      texelsPerPixel,
    });
  };
}
