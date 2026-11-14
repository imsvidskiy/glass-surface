import type { Rectangle, Size } from "../lib/geometry";
import type { Backdrop, BackdropElement } from "../options";
import { fitObject } from "./object-fit";

export type BackdropVersion = {
  element: BackdropElement;
  source: string;
  time: number;
};

function readImageVersion(image: HTMLImageElement): BackdropVersion | null {
  if (!image.complete) {
    return null;
  }

  if (image.naturalWidth === 0) {
    return null;
  }

  return {
    element: image,
    source: image.currentSrc,
    time: 0,
  };
}

function readVideoVersion(video: HTMLVideoElement): BackdropVersion | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  return {
    element: video,
    source: video.currentSrc,
    time: video.currentTime,
  };
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
    element: source,
    source: "",
    time: performance.now(),
  };
}

export function getContentBox(source: BackdropElement): Rectangle {
  return fitObject(source.getBoundingClientRect(), getSourceSize(source), getComputedStyle(source));
}
