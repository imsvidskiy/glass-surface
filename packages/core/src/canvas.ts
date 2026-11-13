import type { Size } from "./types";

const MAXIMUM_PIXEL_RATIO = 2;

export function getPixelRatio(): number {
  return Math.min(MAXIMUM_PIXEL_RATIO, window.devicePixelRatio);
}

export function isEmptySize({ height, width }: Size): boolean {
  return width * height === 0;
}

export function scaleSize({ height, width }: Size, scale: number): Size {
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

export function createCanvas({ height, width }: Size): HTMLCanvasElement {
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

  if (context === null) {
    throw new Error("Canvas 2D context is unavailable");
  }

  return context;
}

export function renderPixels(size: Size, fill: (pixels: Uint8ClampedArray) => void): HTMLCanvasElement {
  const canvas = createCanvas(size);
  const context = getContext2d(canvas);
  const image = context.createImageData(size.width, size.height);

  fill(image.data);
  context.putImageData(image, 0, 0);

  return canvas;
}

export function resizeCanvas(source: HTMLCanvasElement, size: Size): HTMLCanvasElement {
  const canvas = createCanvas(size);

  getContext2d(canvas).drawImage(source, 0, 0, size.width, size.height);

  return canvas;
}
