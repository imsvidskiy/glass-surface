import type { Size } from "./types";

const MAX_PIXEL_RATIO = 2;

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function approximateNormalCdf(value: number): number {
  return 1 / (1 + Math.exp(-1.702 * value));
}

export function isEmptySize({ width, height }: Size): boolean {
  return width * height === 0;
}

export function haveSameValues<Value extends object>(
  left: Value,
  right: Value
): boolean {
  const keys = Object.keys(left) as (keyof Value)[];

  return keys.every((key) => Object.is(left[key], right[key]));
}

export function getPixelRatio(): number {
  return Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio);
}

export function createCanvas({ width, height }: Size): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  return canvas;
}

export function getContext2d(
  canvas: HTMLCanvasElement,
  settings?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", settings);

  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }

  return context;
}

export function renderPixels(
  size: Size,
  fill: (pixels: Uint8ClampedArray) => void
): string {
  const canvas = createCanvas(size);
  const context = getContext2d(canvas);
  const image = context.createImageData(size.width, size.height);

  fill(image.data);
  context.putImageData(image, 0, 0);

  return canvas.toDataURL();
}

export function loadImage(source: string): Promise<HTMLImageElement> {
  const image = new Image();

  image.crossOrigin = "anonymous";
  image.decoding = "async";

  return new Promise(function waitForImage(resolve, reject) {
    image.onload = function handleLoad() {
      resolve(image);
    };

    image.onerror = function handleError() {
      reject(new Error(`Failed to load image: ${source}`));
    };

    image.src = source;
  });
}
