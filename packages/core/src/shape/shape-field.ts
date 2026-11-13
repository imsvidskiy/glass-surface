import { createCanvas, getContext2d } from "../canvas";
import type { Rectangle, Size } from "../types";
import { squaredDistanceTransform, UNREACHED } from "./distance-transform";

export type ShapeField = {
  box: Rectangle;
  cellsPerPixel: number;
  columns: number;
  depth: Float32Array;
  rows: number;
};

const MINIMUM_CELLS = 2;

function fitImage(image: HTMLImageElement, { height, width }: Size): Rectangle {
  const naturalWidth = image.naturalWidth > 0 ? image.naturalWidth : width;
  const naturalHeight = image.naturalHeight > 0 ? image.naturalHeight : height;
  const fit = Math.min(width / naturalWidth, height / naturalHeight);

  return {
    height: naturalHeight * fit,
    width: naturalWidth * fit,
    x: (width - naturalWidth * fit) / 2,
    y: (height - naturalHeight * fit) / 2,
  };
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

  squaredDistanceTransform(distanceOutside, columns, rows);
  squaredDistanceTransform(distanceInside, columns, rows);

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
