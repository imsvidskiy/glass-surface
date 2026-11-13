import { createCanvas, getContext2d, scaleSize } from "../canvas";
import type { BlendMode, Size } from "../types";

export type RectangleMapInput = Size & {
  blur: number;
  borderRadius: number;
  borderWidth: number;
  brightness: number;
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
  const { blur, borderRadius, borderWidth, brightness, height, mixBlendMode, opacity, texelsPerPixel, width } = input;

  const canvas = createCanvas(scaleSize(input, texelsPerPixel));
  const context = getContext2d(canvas);
  const scaleX = canvas.width / width;
  const edge = Math.min(width, height) * borderWidth * 0.5;

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
  context.translate(edge - SHADOW_DISTANCE, edge);

  traceRoundedRectangle(
    context,
    {
      height: height - edge * 2,
      width: width - edge * 2,
    },
    borderRadius
  );

  context.fillStyle = "black";
  context.fill();

  return canvas;
}
