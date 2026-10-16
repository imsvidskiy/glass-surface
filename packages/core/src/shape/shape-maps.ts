import { approximateNormalCdf, clamp, renderPixels } from "../utilities";
import { boxBlur } from "./box-blur";
import type { ShapeField } from "./shape-field";

const OUTSIDE_DEPTH_LIMIT = -6;

export interface ShapeMapInput {
  /** Displacement level of the flat center, from 0 to 1. */
  centerBrightness: number;

  /** How strongly the flat center overrides the edge slope, from 0 to 1. */
  centerOpacity: number;
  /** Width of the refracting edge, in layout pixels. */
  edgeWidth: number;

  /** Softness of the transition between the edge and the center, in layout pixels. */
  softness: number;
}

function renderEdgeMask(
  field: ShapeField,
  falloff: (depth: number) => number
): string {
  return renderPixels(
    { height: field.rows, width: field.columns },
    function fill(pixels) {
      pixels.fill(255);

      for (let index = 0; index < field.depth.length; index += 1) {
        pixels[index * 4 + 3] = 255 * (1 - falloff(field.depth[index]));
      }
    }
  );
}

export function createLineMask(field: ShapeField): string {
  return renderEdgeMask(field, function falloff(depth) {
    return approximateNormalCdf(depth - 1);
  });
}

export function createGlowMask(field: ShapeField): string {
  return renderEdgeMask(field, function falloff(depth) {
    return approximateNormalCdf((depth - 4) / 5);
  });
}

export function createShapeMap(
  field: ShapeField,
  input: ShapeMapInput
): string {
  const { depth, columns, rows, scale } = field;
  const { edgeWidth, softness, centerOpacity, centerBrightness } = input;

  const reach = edgeWidth + softness * 2;
  const radius = Math.max(
    1,
    Math.round(Math.max(1.5, softness * 0.35) * scale)
  );
  const surface = depth.map((value) =>
    clamp(value, OUTSIDE_DEPTH_LIMIT, reach)
  );

  boxBlur(surface, columns, rows, radius);

  function height(column: number, row: number): number {
    return surface[
      clamp(row, 0, rows - 1) * columns + clamp(column, 0, columns - 1)
    ];
  }

  return renderPixels({ height: rows, width: columns }, function fill(pixels) {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;

        const slopeX = height(column + 1, row) - height(column - 1, row);
        const slopeY = height(column, row + 1) - height(column, row - 1);

        const flatness =
          centerOpacity *
          approximateNormalCdf((depth[index] - edgeWidth) / softness);
        const bend = (1 - flatness) * scale * 0.25;
        const shift = flatness * (centerBrightness - 0.5);

        pixels[index * 4] = 255 * (0.5 + slopeX * bend + shift);
        pixels[index * 4 + 1] = 255 * (0.5 + slopeY * bend + shift);
        pixels[index * 4 + 2] = 255 * (0.5 + shift);
        pixels[index * 4 + 3] = 255;
      }
    }
  });
}
