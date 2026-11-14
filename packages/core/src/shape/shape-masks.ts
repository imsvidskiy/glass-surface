import { renderPixels } from "../lib/canvas";
import { approximateNormalCdf } from "../lib/math";
import type { ShapeField } from "./shape-field";

function renderEdgeMask(field: ShapeField, readFalloff: (depth: number) => number): string {
  const mask = renderPixels(
    {
      height: field.rows,
      width: field.columns,
    },
    (pixels) => {
      pixels.fill(255);

      for (let index = 0; index < field.depth.length; index += 1) {
        pixels[index * 4 + 3] = 255 * (1 - readFalloff(field.depth[index]));
      }
    }
  );

  return mask.toDataURL();
}

export function createLineMask(field: ShapeField): string {
  return renderEdgeMask(field, (depth) => {
    return approximateNormalCdf(depth - 1);
  });
}

export function createGlowMask(field: ShapeField): string {
  return renderEdgeMask(field, (depth) => {
    return approximateNormalCdf((depth - 4) / 5);
  });
}
