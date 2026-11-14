export type Size = {
  height: number;
  width: number;
};

export type Rectangle = Size & {
  x: number;
  y: number;
};

export function isEmptySize({ height, width }: Size): boolean {
  return width * height === 0;
}

export function scaleSize({ height, width }: Size, scale: number): Size {
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}
