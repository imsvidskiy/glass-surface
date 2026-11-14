import { createDisplacementMapper } from "../displacement/displacement-map";
import { isEmptySize, type Size } from "../lib/geometry";
import { haveSameValues, memoizeLatest } from "../lib/memoize";
import { type GlassSurfaceInput, type GlassSurfaceOptions, resolveOptions } from "../options";
import type { ShapeField } from "../shape/shape-field";
import { createShapeTracer, type ShapeState } from "../shape/shape-tracer";
import { createWebglRenderer, type WebglRenderer } from "../webgl/renderer";
import { type GlassMode, resolveMode } from "./mode";
import { supportsSvgBackdropFilter } from "./support";

type Listener = () => void;

export type GlassSurfaceState = {
  readonly displacementMap: string;
  readonly mode: GlassMode;
  readonly shape: ShapeState;
  readonly size: Size;
};

export type GlassSurfaceController = {
  getOptions: () => GlassSurfaceOptions;
  getState: () => GlassSurfaceState;
  mount: (element: HTMLElement) => () => void;
  setOptions: (input: GlassSurfaceInput) => void;
  subscribe: (listener: Listener) => () => void;
};

const CANVAS_SELECTOR = ":scope > .glass-surface__canvas";

const EMPTY_SIZE: Size = {
  height: 0,
  width: 0,
};

function encodeMap({ canvas }: { canvas: HTMLCanvasElement }): string {
  return canvas.toDataURL();
}

function measureSize(element: HTMLElement, previous: Size): Size {
  const size = {
    height: element.offsetHeight,
    width: element.offsetWidth,
  };

  if (haveSameValues(size, previous)) {
    return previous;
  }

  return size;
}

export function createGlassSurfaceController(input: GlassSurfaceInput = {}): GlassSurfaceController {
  const listeners = new Set<Listener>();
  const shapeTracer = createShapeTracer(update);
  const drawMap = createDisplacementMapper();
  const encodeLatestMap = memoizeLatest(encodeMap);

  let options = resolveOptions(input);
  let element: HTMLElement | null = null;
  let renderer: WebglRenderer | null = null;
  let map: HTMLCanvasElement | null = null;
  let isSvgSupported = false;
  let hasWebglFailed = false;

  let state: GlassSurfaceState = {
    displacementMap: "",
    mode: "fallback",
    shape: shapeTracer.trace(EMPTY_SIZE).state,
    size: EMPTY_SIZE,
  };

  function getOptions(): GlassSurfaceOptions {
    return options;
  }

  function getState(): GlassSurfaceState {
    return state;
  }

  function getMap(): HTMLCanvasElement | null {
    return map;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function getMode(): GlassMode {
    return resolveMode({
      hasWebglFailed,
      isSvgSupported,
      options,
    });
  }

  function handleWebglFailure(): void {
    hasWebglFailed = true;

    update();
  }

  function createRenderer(surface: HTMLElement): WebglRenderer | null {
    const canvas = surface.querySelector<HTMLCanvasElement>(CANVAS_SELECTOR);

    if (canvas === null) {
      return null;
    }

    try {
      return createWebglRenderer({
        canvas,
        element: surface,
        onFailure: handleWebglFailure,
        readMap: getMap,
        readOptions: getOptions,
      });
    } catch {
      return null;
    }
  }

  function destroyRenderer(): void {
    renderer?.destroy();
    renderer = null;
  }

  function syncRenderer(surface: HTMLElement): GlassMode {
    const mode = getMode();

    if (mode !== "webgl") {
      destroyRenderer();

      return mode;
    }

    if (renderer !== null) {
      return mode;
    }

    renderer = createRenderer(surface);

    if (renderer !== null) {
      return mode;
    }

    hasWebglFailed = true;

    return getMode();
  }

  function resolveMap(mode: GlassMode, size: Size, field: ShapeField | null): HTMLCanvasElement | null {
    if (mode === "fallback") {
      return null;
    }

    if (isEmptySize(size)) {
      return map;
    }

    return drawMap(options, size, field);
  }

  function resolveMapUrl(mode: GlassMode): string {
    if (mode !== "svg") {
      return "";
    }

    if (map === null) {
      return "";
    }

    return encodeLatestMap({
      canvas: map,
    });
  }

  function refresh(): boolean {
    if (element === null) {
      return false;
    }

    const size = measureSize(element, state.size);
    const mode = syncRenderer(element);
    const shape = shapeTracer.trace(size);

    map = resolveMap(mode, size, shape.field);

    const next: GlassSurfaceState = {
      displacementMap: resolveMapUrl(mode),
      mode,
      shape: shape.state,
      size,
    };

    if (haveSameValues(state, next)) {
      return false;
    }

    state = next;

    return true;
  }

  function update(): void {
    if (refresh()) {
      notify();
    }
  }

  function setOptions(nextInput: GlassSurfaceInput): void {
    const nextOptions = resolveOptions(nextInput);

    if (haveSameValues(options, nextOptions)) {
      return;
    }

    options = nextOptions;

    shapeTracer.load(options.shape);
    refresh();
    notify();
  }

  function mount(target: HTMLElement): () => void {
    const resizeObserver = new ResizeObserver(update);

    element = target;
    isSvgSupported = supportsSvgBackdropFilter();

    resizeObserver.observe(target);
    shapeTracer.load(options.shape);
    update();

    return () => {
      resizeObserver.disconnect();
      destroyRenderer();

      element = null;
    };
  }

  return {
    getOptions,
    getState,
    mount,
    setOptions,
    subscribe,
  };
}
