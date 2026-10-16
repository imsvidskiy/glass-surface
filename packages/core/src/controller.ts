import { createRectangleMap } from "./displacement/rectangle-map";
import { resolveOptions } from "./options";
import { measureShape, type ShapeField } from "./shape/shape-field";
import {
  createGlowMask,
  createLineMask,
  createShapeMap,
  type ShapeMapInput,
} from "./shape/shape-maps";
import { supportsSvgBackdropFilter } from "./support";
import type {
  GlassMode,
  GlassSurfaceInput,
  GlassSurfaceOptions,
  GlassSurfaceState,
  ShapeState,
  Size,
} from "./types";
import {
  getPixelRatio,
  haveSameValues,
  isEmptySize,
  loadImage,
} from "./utilities";
import {
  createWebglRenderer,
  type RendererSettings,
  type WebglRenderer,
} from "./webgl/renderer";

const CANVAS_SELECTOR = ":scope > .glass-surface__canvas";

const SHAPE_CELL_BUDGET = 400_000;

const NO_SHAPE: ShapeState = { status: "none" };
const LOADING_SHAPE: ShapeState = { status: "loading" };
const FAILED_SHAPE: ShapeState = { status: "failed" };

type ShapeLoad =
  | { status: "idle"; source: null }
  | { status: "loading"; source: string }
  | { status: "failed"; source: string }
  | { status: "loaded"; source: string; image: HTMLImageElement };

interface TracedShape {
  field: ShapeField;
  key: string;
  state: ShapeState;
}

interface CachedMap {
  key: string;
  url: string;
}

export interface GlassSurfaceController {
  getOptions: () => Readonly<GlassSurfaceOptions>;
  getState: () => GlassSurfaceState;

  /** Attaches the controller to a rendered surface and returns the detach function. */
  mount: (element: HTMLElement) => () => void;
  setOptions: (input: GlassSurfaceInput) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createGlassSurfaceController(
  input: GlassSurfaceInput = {}
): GlassSurfaceController {
  const listeners = new Set<() => void>();

  let options = resolveOptions(input);
  let shapeLoad: ShapeLoad = { source: null, status: "idle" };

  let state: GlassSurfaceState = {
    displacementMap: "",
    mode: "fallback",
    shape: options.shape ? LOADING_SHAPE : NO_SHAPE,
  };

  let element: HTMLElement | null = null;
  let renderer: WebglRenderer | null = null;
  let tracedShape: TracedShape | null = null;
  let shapeMap: CachedMap | null = null;
  let svgSupported = false;
  let webglFailed = false;

  function getState(): GlassSurfaceState {
    return state;
  }

  function getOptions(): Readonly<GlassSurfaceOptions> {
    return options;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function readSettings(): RendererSettings {
    return { ...options, displacementMap: state.displacementMap };
  }

  function resolveMode(): GlassMode {
    if (!options.refraction) {
      return "fallback";
    }

    const webglAvailable = options.backdrop !== null && !webglFailed;

    if (webglAvailable && options.renderer !== "svg") {
      return "webgl";
    }

    if (svgSupported) {
      return "svg";
    }

    return "fallback";
  }

  function resolveShapeState(traced: TracedShape | null): ShapeState {
    if (traced) {
      return traced.state;
    }

    switch (shapeLoad.status) {
      case "idle": {
        return NO_SHAPE;
      }

      case "loading": {
        return LOADING_SHAPE;
      }

      default: {
        return FAILED_SHAPE;
      }
    }
  }

  function traceShape(size: Size): TracedShape | null {
    if (shapeLoad.status !== "loaded" || isEmptySize(size)) {
      return null;
    }

    const { source, image } = shapeLoad;

    const scale = Math.min(
      getPixelRatio(),
      Math.sqrt(SHAPE_CELL_BUDGET / (size.width * size.height))
    );
    const key = [source, size.width, size.height, scale].join("|");

    if (tracedShape?.key === key) {
      return tracedShape;
    }

    try {
      const field = measureShape(image, size, scale);

      const outline = {
        box: field.box,
        glowMask: createGlowMask(field),
        lineMask: createLineMask(field),
        source: image.src,
      };

      tracedShape = { field, key, state: { outline, status: "ready" } };
    } catch {
      tracedShape = null;
    }

    return tracedShape;
  }

  function createDisplacementMap(
    size: Size,
    traced: TracedShape | null
  ): string {
    if (isEmptySize(size)) {
      return state.displacementMap;
    }

    if (!traced) {
      return createRectangleMap({ ...options, ...size });
    }

    const mapInput: ShapeMapInput = {
      centerBrightness: options.brightness / 100,
      centerOpacity: options.opacity,
      edgeWidth: Math.min(size.width, size.height) * options.borderWidth * 0.5,
      softness: Math.max(options.blur, 0.5),
    };

    const key = [traced.key, ...Object.values(mapInput)].join("|");

    if (shapeMap?.key === key) {
      return shapeMap.url;
    }

    shapeMap = { key, url: createShapeMap(traced.field, mapInput) };

    return shapeMap.url;
  }

  function destroyRenderer(): void {
    renderer?.destroy();
    renderer = null;
  }

  function handleWebglFailure(): void {
    webglFailed = true;
    update();
  }

  function syncRenderer(): void {
    if (element === null || state.mode !== "webgl") {
      destroyRenderer();

      return;
    }

    if (renderer !== null) {
      return;
    }

    const canvas = element.querySelector<HTMLCanvasElement>(CANVAS_SELECTOR);

    if (canvas === null) {
      handleWebglFailure();

      return;
    }

    try {
      renderer = createWebglRenderer({
        canvas,
        element,
        onFailure: handleWebglFailure,
        readSettings,
      });
    } catch {
      handleWebglFailure();
    }
  }

  function update(): void {
    if (element === null) {
      return;
    }

    const size = { height: element.offsetHeight, width: element.offsetWidth };
    const traced = traceShape(size);

    const next: GlassSurfaceState = {
      displacementMap: createDisplacementMap(size, traced),
      mode: resolveMode(),
      shape: resolveShapeState(traced),
    };

    if (!haveSameValues(state, next)) {
      state = next;
    }

    syncRenderer();
    notify();
  }

  async function loadShape(): Promise<void> {
    const source = options.shape;

    if (source === shapeLoad.source) {
      return;
    }

    if (!source) {
      shapeLoad = { source: null, status: "idle" };

      return;
    }

    shapeLoad = { source, status: "loading" };

    const image = await loadImage(source).catch(function ignoreFailure() {
      return null;
    });

    if (source !== shapeLoad.source) {
      return;
    }

    shapeLoad = image
      ? { image, source, status: "loaded" }
      : { source, status: "failed" };

    update();
  }

  function setOptions(nextInput: GlassSurfaceInput): void {
    const nextOptions = resolveOptions(nextInput);

    if (haveSameValues(options, nextOptions)) {
      return;
    }

    options = nextOptions;

    loadShape();
    update();
  }

  function mount(target: HTMLElement): () => void {
    element = target;
    svgSupported = supportsSvgBackdropFilter();

    const resizeObserver = new ResizeObserver(update);

    resizeObserver.observe(target);

    loadShape();
    update();

    return function unmount() {
      resizeObserver.disconnect();
      element = null;
      syncRenderer();
    };
  }

  return { getOptions, getState, mount, setOptions, subscribe };
}
