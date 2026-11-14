import type { Size } from "../lib/geometry";
import { memoizeLatest } from "../lib/memoize";
import type { GlassSurfaceOptions } from "../options";
import type { ShapeField } from "../shape/shape-field";
import { createRectangleMap } from "./rectangle-map";
import { createShapeMap } from "./shape-map";

export type DisplacementMapper = (
  options: GlassSurfaceOptions,
  size: Size,
  field: ShapeField | null
) => HTMLCanvasElement;

const TEXEL_BUDGET = 250_000;

function getTexelsPerPixel({ height, width }: Size): number {
  return Math.min(1, Math.sqrt(TEXEL_BUDGET / (width * height)));
}

export function createDisplacementMapper(): DisplacementMapper {
  const drawRectangle = memoizeLatest(createRectangleMap);
  const drawShape = memoizeLatest(createShapeMap);

  return (options, size, field) => {
    const input = {
      blur: options.blur,
      brightness: options.brightness,
      edgeWidth: Math.min(size.width, size.height) * options.borderWidth * 0.5,
      opacity: options.opacity,
      texelsPerPixel: getTexelsPerPixel(size),
    };

    if (field === null) {
      return drawRectangle({
        ...input,
        borderRadius: options.borderRadius,
        height: size.height,
        mixBlendMode: options.mixBlendMode,
        width: size.width,
      });
    }

    return drawShape({
      ...input,
      field,
    });
  };
}
