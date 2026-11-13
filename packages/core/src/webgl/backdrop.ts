import { isEmptySize } from "../canvas";
import type { Backdrop, BackdropElement, Rectangle, Size } from "../types";

export type BackdropVersion = {
  source: string;
  time: number;
};

const DEFAULT_POSITION = "50%";

function readImageVersion(image: HTMLImageElement): BackdropVersion | null {
  if (!image.complete) {
    return null;
  }

  if (image.naturalWidth === 0) {
    return null;
  }

  return {
    source: image.currentSrc,
    time: 0,
  };
}

function readVideoVersion(video: HTMLVideoElement): BackdropVersion | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  return {
    source: video.currentSrc,
    time: video.currentTime,
  };
}

function getFitScale(fit: string, bounds: Size, natural: Size): number {
  const horizontal = bounds.width / natural.width;
  const vertical = bounds.height / natural.height;

  switch (fit) {
    case "cover": {
      return Math.max(horizontal, vertical);
    }

    case "contain": {
      return Math.min(horizontal, vertical);
    }

    case "none": {
      return 1;
    }

    default: {
      return Math.min(1, horizontal, vertical);
    }
  }
}

function placeAlongAxis(position: string, freeSpace: number): number {
  const value = Number.parseFloat(position);

  if (position.endsWith("%")) {
    return (value / 100) * freeSpace;
  }

  if (Number.isFinite(value)) {
    return value;
  }

  return freeSpace / 2;
}

function isStretched(fit: string, natural: Size): boolean {
  if (fit === "fill") {
    return true;
  }

  return isEmptySize(natural);
}

export function resolveBackdrop(backdrop: Backdrop | null): BackdropElement | null {
  if (backdrop === null) {
    return null;
  }

  if ("current" in backdrop) {
    return backdrop.current;
  }

  return backdrop;
}

export function getSourceSize(source: BackdropElement): Size {
  if (source instanceof HTMLImageElement) {
    return {
      height: source.naturalHeight,
      width: source.naturalWidth,
    };
  }

  if (source instanceof HTMLVideoElement) {
    return {
      height: source.videoHeight,
      width: source.videoWidth,
    };
  }

  return {
    height: source.height,
    width: source.width,
  };
}

export function readBackdropVersion(source: BackdropElement): BackdropVersion | null {
  if (source instanceof HTMLImageElement) {
    return readImageVersion(source);
  }

  if (source instanceof HTMLVideoElement) {
    return readVideoVersion(source);
  }

  return {
    source: "",
    time: performance.now(),
  };
}

export function getContentBox(source: BackdropElement): Rectangle {
  const bounds = source.getBoundingClientRect();
  const natural = getSourceSize(source);
  const { objectFit, objectPosition } = getComputedStyle(source);

  if (isStretched(objectFit, natural)) {
    return {
      height: bounds.height,
      width: bounds.width,
      x: bounds.left,
      y: bounds.top,
    };
  }

  const scale = getFitScale(objectFit, bounds, natural);
  const width = natural.width * scale;
  const height = natural.height * scale;
  const [horizontal = DEFAULT_POSITION, vertical = horizontal] = objectPosition.split(" ");

  return {
    height,
    width,
    x: bounds.left + placeAlongAxis(horizontal, bounds.width - width),
    y: bounds.top + placeAlongAxis(vertical, bounds.height - height),
  };
}
