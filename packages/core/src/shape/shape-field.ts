import type { Rectangle, Size } from "../types";
import { createCanvas, getContext2d } from "../utilities";
import { squaredDistanceTransform, UNREACHED } from "./distance-transform";

const MINIMUM_CELLS = 2;

export interface ShapeField {
  /** Where the shape image is drawn inside the surface, in layout pixels. */
  box: Rectangle;

  columns: number;

  /** Signed distance to the outline in layout pixels: positive inside, negative outside. */
  depth: Float32Array;
  rows: number;

  /** Field cells per layout pixel. */
  scale: number;
}

function fitImage(image: HTMLImageElement, { width, height }: Size): Rectangle {
  const naturalWidth = image.naturalWidth || width;
  const naturalHeight = image.naturalHeight || height;

  const fit = Math.min(width / naturalWidth, height / naturalHeight);

  return {
    height: naturalHeight * fit,
    width: naturalWidth * fit,
    x: (width - naturalWidth * fit) / 2,
    y: (height - naturalHeight * fit) / 2,
  };
}

function readAlpha(
  image: HTMLImageElement,
  box: Rectangle,
  grid: Size,
  scale: number
): Uint8ClampedArray {
  const canvas = createCanvas(grid);
  const context = getContext2d(canvas, { willReadFrequently: true });

  context.drawImage(
    image,
    box.x * scale,
    box.y * scale,
    box.width * scale,
    box.height * scale
  );

  return context.getImageData(0, 0, grid.width, grid.height).data;
}

export function measureShape(
  image: HTMLImageElement,
  size: Size,
  scale: number
): ShapeField {
  const box = fitImage(image, size);

  const columns = Math.max(MINIMUM_CELLS, Math.round(size.width * scale));
  const rows = Math.max(MINIMUM_CELLS, Math.round(size.height * scale));
  const pixels = readAlpha(image, box, { height: rows, width: columns }, scale);

  const distanceOutside = new Float32Array(columns * rows);
  const distanceInside = new Float32Array(columns * rows);

  for (let index = 0; index < distanceOutside.length; index += 1) {
    const edge = 0.5 - pixels[index * 4 + 3] / 255;

    distanceOutside[index] = edge >= 0.5 ? UNREACHED : Math.max(edge, 0) ** 2;
    distanceInside[index] = edge <= -0.5 ? UNREACHED : Math.min(edge, 0) ** 2;
  }

  squaredDistanceTransform(distanceOutside, columns, rows);
  squaredDistanceTransform(distanceInside, columns, rows);

  const depth = new Float32Array(columns * rows);

  for (let index = 0; index < depth.length; index += 1) {
    depth[index] =
      (Math.sqrt(distanceInside[index]) - Math.sqrt(distanceOutside[index])) /
      scale;
  }

  return { box, columns, depth, rows, scale };
}
