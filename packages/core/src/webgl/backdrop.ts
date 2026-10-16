import type { Backdrop, BackdropElement, Rectangle, Size } from "../types";

export function resolveBackdrop(
  backdrop: Backdrop | null
): BackdropElement | null {
  if (!backdrop) {
    return null;
  }

  return "current" in backdrop ? backdrop.current : backdrop;
}

export function getSourceSize(source: BackdropElement): Size {
  if (source instanceof HTMLImageElement) {
    return { height: source.naturalHeight, width: source.naturalWidth };
  }

  if (source instanceof HTMLVideoElement) {
    return { height: source.videoHeight, width: source.videoWidth };
  }

  return { height: source.height, width: source.width };
}

/** Identifies the current frame of the source; empty while the source is not ready. */
export function getFrameKey(source: BackdropElement): string {
  if (source instanceof HTMLImageElement) {
    const loaded = source.complete && source.naturalWidth > 0;

    if (!loaded) {
      return "";
    }

    return source.currentSrc || source.src;
  }

  if (source instanceof HTMLVideoElement) {
    const ready = source.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    return ready ? `${source.currentSrc}|${source.currentTime}` : "";
  }

  return `${source.width}x${source.height}|${performance.now()}`;
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

  return Number.isFinite(value) ? value : freeSpace / 2;
}

/** Viewport rectangle occupied by the rendered content of the source, honouring object-fit and object-position. */
export function getContentBox(source: BackdropElement): Rectangle {
  const bounds = source.getBoundingClientRect();
  const natural = getSourceSize(source);
  const { objectFit, objectPosition } = getComputedStyle(source);

  const stretched =
    objectFit === "fill" || natural.width * natural.height === 0;

  if (stretched) {
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

  const [horizontal = "50%", vertical = horizontal] = objectPosition.split(" ");

  return {
    height,
    width,
    x: bounds.left + placeAlongAxis(horizontal, bounds.width - width),
    y: bounds.top + placeAlongAxis(vertical, bounds.height - height),
  };
}
