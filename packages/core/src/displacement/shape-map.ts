import { renderPixels, resizeCanvas, scaleSize } from "../canvas";
import { approximateNormalCdf, clamp } from "../math";
import { boxBlur } from "../shape/box-blur";
import type { ShapeField } from "../shape/shape-field";

export type ShapeMapInput = {
  centerBrightness: number;
  centerOpacity: number;
  edgeWidth: number;
  field: ShapeField;
  softness: number;
  texelsPerPixel: number;
};

const OUTSIDE_DEPTH_LIMIT = -6;

function renderShapeMap(input: ShapeMapInput): HTMLCanvasElement {
  const { centerBrightness, centerOpacity, edgeWidth, field, softness } = input;
  const { cellsPerPixel, columns, depth, rows } = field;

  const reach = edgeWidth + softness * 2;
  const radius = Math.max(1, Math.round(Math.max(1.5, softness * 0.35) * cellsPerPixel));

  const surface = depth.map((value) => {
    return clamp(value, OUTSIDE_DEPTH_LIMIT, reach);
  });

  function readHeight(column: number, row: number): number {
    return surface[clamp(row, 0, rows - 1) * columns + clamp(column, 0, columns - 1)];
  }

  boxBlur(surface, columns, rows, radius);

  return renderPixels(
    {
      height: rows,
      width: columns,
    },
    (pixels) => {
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;

          const slopeX = readHeight(column + 1, row) - readHeight(column - 1, row);
          const slopeY = readHeight(column, row + 1) - readHeight(column, row - 1);

          const flatness = centerOpacity * approximateNormalCdf((depth[index] - edgeWidth) / softness);
          const bend = (1 - flatness) * cellsPerPixel * 0.25;
          const shift = flatness * (centerBrightness - 0.5);

          pixels[index * 4] = 255 * (0.5 + slopeX * bend + shift);
          pixels[index * 4 + 1] = 255 * (0.5 + slopeY * bend + shift);
          pixels[index * 4 + 2] = 255 * (0.5 + shift);
          pixels[index * 4 + 3] = 255;
        }
      }
    }
  );
}

export function createShapeMap(input: ShapeMapInput): HTMLCanvasElement {
  const { field, texelsPerPixel } = input;

  const map = renderShapeMap(input);
  const reduction = texelsPerPixel / field.cellsPerPixel;

  if (reduction >= 1) {
    return map;
  }

  return resizeCanvas(map, scaleSize(map, reduction));
}
