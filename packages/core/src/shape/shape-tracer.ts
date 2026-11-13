import { getPixelRatio, isEmptySize } from "../canvas";
import { memoizeLatest } from "../memoize";
import type { ShapeState, Size } from "../types";
import { measureShape, type ShapeField } from "./shape-field";
import { createGlowMask, createLineMask } from "./shape-masks";

type ShapeLoad =
  | {
      source: null;
      status: "idle";
    }
  | {
      source: string;
      status: "failed";
    }
  | {
      source: string;
      status: "loading";
    }
  | {
      image: HTMLImageElement;
      source: string;
      status: "loaded";
    };

type OutlineInput = Size & {
  image: HTMLImageElement;
  pixelRatio: number;
};

export type ShapeTrace = {
  field: ShapeField | null;
  state: ShapeState;
};

export type ShapeTracer = {
  load: (source: string | null) => void;
  trace: (size: Size) => ShapeTrace;
};

const CELL_BUDGET = 400_000;

const NO_SHAPE: ShapeTrace = {
  field: null,
  state: {
    status: "none",
  },
};

const LOADING_SHAPE: ShapeTrace = {
  field: null,
  state: {
    status: "loading",
  },
};

const FAILED_SHAPE: ShapeTrace = {
  field: null,
  state: {
    status: "failed",
  },
};

const PENDING_TRACES: Record<Exclude<ShapeLoad["status"], "loaded">, ShapeTrace> = {
  failed: FAILED_SHAPE,
  idle: NO_SHAPE,
  loading: LOADING_SHAPE,
};

function loadImage(source: string): Promise<HTMLImageElement | null> {
  const image = new Image();

  image.crossOrigin = "anonymous";
  image.decoding = "async";

  return new Promise((resolve) => {
    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      resolve(null);
    };

    image.src = source;
  });
}

function settleLoad(source: string, image: HTMLImageElement | null): ShapeLoad {
  if (image === null) {
    return {
      source,
      status: "failed",
    };
  }

  return {
    image,
    source,
    status: "loaded",
  };
}

function traceOutline({ height, image, pixelRatio, width }: OutlineInput): ShapeTrace {
  const size = {
    height,
    width,
  };

  const cellsPerPixel = Math.min(pixelRatio, Math.sqrt(CELL_BUDGET / (width * height)));

  try {
    const field = measureShape(image, size, cellsPerPixel);

    return {
      field,
      state: {
        outline: {
          box: field.box,
          glowMask: createGlowMask(field),
          lineMask: createLineMask(field),
          source: image.src,
        },
        status: "ready",
      },
    };
  } catch {
    return FAILED_SHAPE;
  }
}

export function createShapeTracer(onLoad: () => void): ShapeTracer {
  const traceLatest = memoizeLatest(traceOutline);

  let current: ShapeLoad = {
    source: null,
    status: "idle",
  };

  async function load(input: string | null): Promise<void> {
    const source = input === "" ? null : input;

    if (source === current.source) {
      return;
    }

    if (source === null) {
      current = {
        source,
        status: "idle",
      };

      return;
    }

    current = {
      source,
      status: "loading",
    };

    const image = await loadImage(source);

    if (source !== current.source) {
      return;
    }

    current = settleLoad(source, image);

    onLoad();
  }

  function trace(size: Size): ShapeTrace {
    if (current.status !== "loaded") {
      return PENDING_TRACES[current.status];
    }

    if (isEmptySize(size)) {
      return LOADING_SHAPE;
    }

    return traceLatest({
      height: size.height,
      image: current.image,
      pixelRatio: getPixelRatio(),
      width: size.width,
    });
  }

  return {
    load,
    trace,
  };
}
