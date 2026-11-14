import { haveSameValues } from "../lib/memoize";
import type { GlassSurfaceOptions } from "../options";
import { type BackdropVersion, readBackdropVersion, resolveBackdrop } from "./backdrop";
import { type Frame, measureFrame } from "./frame";
import { createPainter } from "./painter";

type Drawing = Frame & {
  backdrop: BackdropVersion;
  map: HTMLCanvasElement;
  options: GlassSurfaceOptions;
};

export type RendererSource = {
  canvas: HTMLCanvasElement;
  element: HTMLElement;
  onFailure: () => void;
  readMap: () => HTMLCanvasElement | null;
  readOptions: () => GlassSurfaceOptions;
};

export type WebglRenderer = {
  destroy: () => void;
};

function isLatest<Value extends object>(latest: Value | null, next: Value): boolean {
  if (latest === null) {
    return false;
  }

  return haveSameValues(latest, next);
}

export function createWebglRenderer({
  canvas,
  element,
  onFailure,
  readMap,
  readOptions,
}: RendererSource): WebglRenderer {
  const painter = createPainter(canvas);
  const lifetime = new AbortController();
  const visibilityObserver = new IntersectionObserver(handleIntersection);

  let backdrop: BackdropVersion | null = null;
  let map: HTMLCanvasElement | null = null;
  let drawn: Drawing | null = null;
  let frameRequest = 0;
  let isVisible = true;

  function isRunning(): boolean {
    if (document.hidden) {
      return false;
    }

    return isVisible;
  }

  function wake(): void {
    if (frameRequest !== 0) {
      return;
    }

    if (isRunning()) {
      frameRequest = requestAnimationFrame(renderFrame);
    }
  }

  function uploadBackdrop(version: BackdropVersion | null): void {
    if (version === null) {
      return;
    }

    if (isLatest(backdrop, version)) {
      return;
    }

    painter.uploadBackdrop(version.element);

    backdrop = version;
  }

  function uploadMap(next: HTMLCanvasElement | null): void {
    if (next === null) {
      return;
    }

    if (next === map) {
      return;
    }

    painter.uploadMap(next);

    map = next;
  }

  function renderSurface(): void {
    const options = readOptions();
    const backdropElement = resolveBackdrop(options.backdrop);

    if (backdropElement === null) {
      return;
    }

    uploadBackdrop(readBackdropVersion(backdropElement));
    uploadMap(readMap());

    if (backdrop === null) {
      return;
    }

    if (map === null) {
      return;
    }

    const frame = measureFrame(element, backdropElement);

    if (frame === null) {
      return;
    }

    const drawing: Drawing = {
      ...frame,
      backdrop,
      map,
      options,
    };

    if (isLatest(drawn, drawing)) {
      return;
    }

    painter.paint(frame, options);

    drawn = drawing;
  }

  function renderFrame(): void {
    frameRequest = 0;

    if (!isRunning()) {
      return;
    }

    frameRequest = requestAnimationFrame(renderFrame);

    try {
      renderSurface();
    } catch {
      onFailure();
    }
  }

  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    isVisible = entries.some((entry) => {
      return entry.isIntersecting;
    });

    wake();
  }

  function destroy(): void {
    lifetime.abort();
    cancelAnimationFrame(frameRequest);
    visibilityObserver.disconnect();
    painter.destroy();
  }

  visibilityObserver.observe(element);

  document.addEventListener("visibilitychange", wake, {
    signal: lifetime.signal,
  });

  canvas.addEventListener("webglcontextlost", onFailure, {
    signal: lifetime.signal,
  });

  wake();

  return {
    destroy,
  };
}
