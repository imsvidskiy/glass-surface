import { createCanvas, getContext2d } from "../lib/canvas";
import { type Size, scaleSize } from "../lib/geometry";
import type { BlendMode } from "../options";

export type RectangleMapInput = Size & {
  blur: number;
  borderRadius: number;
  brightness: number;
  edgeWidth: number;
  mixBlendMode: BlendMode;
  opacity: number;
  texelsPerPixel: number;
};

const SHADOW_DISTANCE = 10_000;

function toCompositeOperation(blendMode: BlendMode): GlobalCompositeOperation {
  if (blendMode === "normal") {
    return "source-over";
  }

  return blendMode;
}

function traceRoundedRectangle(context: CanvasRenderingContext2D, { height, width }: Size, radius: number): void {
  context.beginPath();

  context.roundRect(0, 0, width, height, {
    x: Math.min(radius, width / 2),
    y: Math.min(radius, height / 2),
  });
}

function fillFade(context: CanvasRenderingContext2D, fade: CanvasGradient, color: string): void {
  fade.addColorStop(0, "#0000");
  fade.addColorStop(1, color);

  context.fillStyle = fade;
  context.fill();
}

export function createRectangleMap(input: RectangleMapInput): HTMLCanvasElement {
  const { blur, borderRadius, brightness, edgeWidth, height, mixBlendMode, opacity, texelsPerPixel, width } = input;

  const canvas = createCanvas(scaleSize(input, texelsPerPixel));
  const context = getContext2d(canvas);
  const scaleX = canvas.width / width;

  context.scale(scaleX, canvas.height / height);
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  traceRoundedRectangle(context, input, borderRadius);
  fillFade(context, context.createLinearGradient(width, 0, 0, 0), "red");

  context.globalCompositeOperation = toCompositeOperation(mixBlendMode);
  fillFade(context, context.createLinearGradient(0, 0, 0, height), "blue");

  context.globalCompositeOperation = "source-over";
  context.shadowColor = `hsl(0 0% ${brightness}% / ${opacity})`;
  context.shadowBlur = blur * 2 * scaleX;
  context.shadowOffsetX = SHADOW_DISTANCE * scaleX;
  context.translate(edgeWidth - SHADOW_DISTANCE, edgeWidth);

  traceRoundedRectangle(
    context,
    {
      height: height - edgeWidth * 2,
      width: width - edgeWidth * 2,
    },
    borderRadius
  );

  context.fillStyle = "black";
  context.fill();

  return canvas;
}
