export type Size = {
  height: number;
  width: number;
};

export type Rectangle = Size & {
  x: number;
  y: number;
};

export const EMPTY_SIZE: Size = {
  height: 0,
  width: 0,
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

export function measureElement(element: HTMLElement): Size {
  return {
    height: element.offsetHeight,
    width: element.offsetWidth,
  };
}
