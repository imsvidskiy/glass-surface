import { createCanvas, getContext2d } from "../lib/canvas";
import { transformSquaredDistances, UNREACHED } from "../lib/distance-transform";
import type { Rectangle, Size } from "../lib/geometry";
import { fitObject, type ObjectFitStyle } from "../lib/object-fit";

export type ShapeField = {
  box: Rectangle;
  cellsPerPixel: number;
  columns: number;
  depth: Float32Array;
  rows: number;
};

const MINIMUM_CELLS = 2;

const CONTAINED: ObjectFitStyle = {
  objectFit: "contain",
  objectPosition: "50%",
};

function fitImage(image: HTMLImageElement, size: Size): Rectangle {
  const bounds = {
    ...size,
    x: 0,
    y: 0,
  };

  const natural = {
    height: image.naturalHeight,
    width: image.naturalWidth,
  };

  return fitObject(bounds, natural, CONTAINED);
}

function readAlpha(image: HTMLImageElement, box: Rectangle, grid: Size, cellsPerPixel: number): Uint8ClampedArray {
  const canvas = createCanvas(grid);

  const context = getContext2d(canvas, {
    willReadFrequently: true,
  });

  context.drawImage(
    image,
    box.x * cellsPerPixel,
    box.y * cellsPerPixel,
    box.width * cellsPerPixel,
    box.height * cellsPerPixel
  );

  return context.getImageData(0, 0, grid.width, grid.height).data;
}

export function measureShape(image: HTMLImageElement, size: Size, cellsPerPixel: number): ShapeField {
  const box = fitImage(image, size);
  const columns = Math.max(MINIMUM_CELLS, Math.round(size.width * cellsPerPixel));
  const rows = Math.max(MINIMUM_CELLS, Math.round(size.height * cellsPerPixel));

  const pixels = readAlpha(
    image,
    box,
    {
      height: rows,
      width: columns,
    },
    cellsPerPixel
  );

  const distanceOutside = new Float32Array(columns * rows);
  const distanceInside = new Float32Array(columns * rows);
  const depth = new Float32Array(columns * rows);

  for (let index = 0; index < depth.length; index += 1) {
    const edge = 0.5 - pixels[index * 4 + 3] / 255;

    distanceOutside[index] = edge >= 0.5 ? UNREACHED : Math.max(edge, 0) ** 2;
    distanceInside[index] = edge <= -0.5 ? UNREACHED : Math.min(edge, 0) ** 2;
  }

  transformSquaredDistances(distanceOutside, columns, rows);
  transformSquaredDistances(distanceInside, columns, rows);

  for (let index = 0; index < depth.length; index += 1) {
    depth[index] = (Math.sqrt(distanceInside[index]) - Math.sqrt(distanceOutside[index])) / cellsPerPixel;
  }

  return {
    box,
    cellsPerPixel,
    columns,
    depth,
    rows,
  };
}
