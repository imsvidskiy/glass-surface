import { isEmptySize } from "../canvas";
import { createDisplacementMapper } from "../displacement/displacement-map";
import { haveSameValues, memoizeLatest } from "../memoize";
import { resolveOptions } from "../options";
import type { ShapeField } from "../shape/shape-field";
import { createShapeTracer } from "../shape/shape-tracer";
import type { GlassMode, GlassSurfaceInput, GlassSurfaceOptions, GlassSurfaceState, Size } from "../types";
import { createWebglRenderer, type WebglRenderer } from "../webgl/renderer";
import { supportsSvgBackdropFilter } from "./support";

type Listener = () => void;

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

  function shouldUseWebgl(): boolean {
    if (options.backdrop === null) {
      return false;
    }

    if (hasWebglFailed) {
      return false;
    }

    if (options.renderer === "auto") {
      return !isSvgSupported;
    }

    return options.renderer === "webgl";
  }

  function resolveMode(): GlassMode {
    if (!options.refraction) {
      return "fallback";
    }

    if (shouldUseWebgl()) {
      return "webgl";
    }

    if (isSvgSupported) {
      return "svg";
    }

    return "fallback";
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

  function handleWebglFailure(): void {
    hasWebglFailed = true;

    update();
  }

  function destroyRenderer(): void {
    renderer?.destroy();
    renderer = null;
  }

  function createRenderer(surface: HTMLElement): void {
    const canvas = surface.querySelector<HTMLCanvasElement>(CANVAS_SELECTOR);

    if (canvas === null) {
      handleWebglFailure();

      return;
    }

    try {
      renderer = createWebglRenderer({
        canvas,
        element: surface,
        onFailure: handleWebglFailure,
        readMap: getMap,
        readOptions: getOptions,
      });
    } catch {
      handleWebglFailure();
    }
  }

  function syncRenderer(): void {
    if (element === null) {
      destroyRenderer();

      return;
    }

    if (state.mode !== "webgl") {
      destroyRenderer();

      return;
    }

    if (renderer === null) {
      createRenderer(element);
    }
  }

  function refresh(): boolean {
    if (element === null) {
      return false;
    }

    const size = measureSize(element, state.size);
    const mode = resolveMode();
    const shape = shapeTracer.trace(size);

    map = resolveMap(mode, size, shape.field);

    const next: GlassSurfaceState = {
      displacementMap: resolveMapUrl(mode),
      mode,
      shape: shape.state,
      size,
    };

    const hasChanged = !haveSameValues(state, next);

    if (hasChanged) {
      state = next;
    }

    syncRenderer();

    return hasChanged;
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

      element = null;

      syncRenderer();
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
