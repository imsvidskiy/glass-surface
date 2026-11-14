import { isEmptySize } from "../lib/geometry";
import { getPixelRatio } from "../lib/pixel-ratio";
import type { BackdropElement } from "../options";
import { getContentBox } from "./backdrop";

export type Frame = {
  layoutHeight: number;
  layoutWidth: number;
  originX: number;
  originY: number;
  pixelRatio: number;
  stepX: number;
  stepY: number;
};

export function measureFrame(element: HTMLElement, backdrop: BackdropElement): Frame | null {
  const layout = {
    height: element.offsetHeight,
    width: element.offsetWidth,
  };

  if (isEmptySize(layout)) {
    return null;
  }

  const content = getContentBox(backdrop);

  if (isEmptySize(content)) {
    return null;
  }

  const bounds = element.getBoundingClientRect();

  return {
    layoutHeight: layout.height,
    layoutWidth: layout.width,
    originX: (bounds.left - content.x) / content.width,
    originY: (bounds.top - content.y) / content.height,
    pixelRatio: getPixelRatio(),
    stepX: bounds.width / layout.width / content.width,
    stepY: bounds.height / layout.height / content.height,
  };
}
