import { isEmptySize, type Rectangle, type Size } from "../lib/geometry";
import { memoizeLatest } from "../lib/memoize";
import { getPixelRatio } from "../lib/pixel-ratio";
import { measureShape, type ShapeField } from "./shape-field";
import { createGlowMask, createLineMask } from "./shape-masks";

type ShapeLoad =
  | {
      image: HTMLImageElement;
      source: string;
      status: "loaded";
    }
  | {
      source: null;
      status: "none";
    }
  | {
      source: string;
      status: "failed" | "loading";
    };

type OutlineInput = Size & {
  image: HTMLImageElement;
  pixelRatio: number;
};

export type ShapeOutline = {
  box: Rectangle;
  glowMask: string;
  lineMask: string;
  source: string;
};

export type ShapeState =
  | {
      readonly status: "failed";
    }
  | {
      readonly status: "loading";
    }
  | {
      readonly status: "none";
    }
  | {
      readonly outline: ShapeOutline;
      readonly status: "ready";
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

const OUTLINELESS_TRACES: Record<Exclude<ShapeLoad["status"], "loaded">, ShapeTrace> = {
  failed: {
    field: null,
    state: {
      status: "failed",
    },
  },
  loading: {
    field: null,
    state: {
      status: "loading",
    },
  },
  none: {
    field: null,
    state: {
      status: "none",
    },
  },
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
    return OUTLINELESS_TRACES.failed;
  }
}

export function createShapeTracer(onLoad: () => void): ShapeTracer {
  const traceLatest = memoizeLatest(traceOutline);

  let current: ShapeLoad = {
    source: null,
    status: "none",
  };

  async function load(input: string | null): Promise<void> {
    const source = input === "" ? null : input;

    if (source === current.source) {
      return;
    }

    if (source === null) {
      current = {
        source,
        status: "none",
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
      return OUTLINELESS_TRACES[current.status];
    }

    if (isEmptySize(size)) {
      return OUTLINELESS_TRACES.loading;
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
