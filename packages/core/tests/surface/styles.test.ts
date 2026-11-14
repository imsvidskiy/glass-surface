import { expect, test } from "bun:test";
import { defaultOptions } from "../../src/options";
import type { ShapeState } from "../../src/shape/shape-tracer";
import type { GlassSurfaceState } from "../../src/surface/controller";
import { getSurfaceClasses, getSurfaceProperties, toFilterId } from "../../src/surface/styles";

const READY_SHAPE: ShapeState = {
  outline: {
    box: {
      height: 60,
      width: 120,
      x: 40,
      y: 10,
    },
    glowMask: "data:image/png;base64,glow",
    lineMask: "data:image/png;base64,line",
    source: 'https://example.com/a "star".svg',
  },
  status: "ready",
};

function createState(mode: GlassSurfaceState["mode"], shape: ShapeState): GlassSurfaceState {
  return {
    displacementMap: "",
    mode,
    shape,
    size: {
      height: 80,
      width: 200,
    },
  };
}

test("toFilterId keeps only the characters an id reference accepts", () => {
  expect(toFilterId("7")).toBe("glass-surface-7");
  expect(toFilterId(":r1:")).toBe("glass-surface-r1");
  expect(toFilterId("a b#c")).toBe("glass-surface-abc");
});

test("getSurfaceClasses names the mode", () => {
  const state = createState("webgl", {
    status: "none",
  });

  expect(getSurfaceClasses(state)).toEqual([
    "glass-surface",
    "glass-surface--webgl",
  ]);
});

test("getSurfaceClasses hides the surface while its shape loads", () => {
  const state = createState("svg", {
    status: "loading",
  });

  expect(getSurfaceClasses(state)).toEqual([
    "glass-surface",
    "glass-surface--svg",
    "glass-surface--pending",
  ]);
});

test("getSurfaceClasses marks a surface with a traced shape", () => {
  const state = createState("fallback", READY_SHAPE);

  expect(getSurfaceClasses(state)).toEqual([
    "glass-surface",
    "glass-surface--fallback",
    "glass-surface--shaped",
  ]);
});

test("getSurfaceProperties carries the options that the stylesheet reads", () => {
  const options = {
    ...defaultOptions,
    backgroundOpacity: 0.25,
    borderRadius: 32,
    saturation: 1.4,
  };

  const state = createState("svg", {
    status: "failed",
  });

  expect(getSurfaceProperties("glass-surface-7", options, state)).toEqual({
    "--glass-filter": "url(#glass-surface-7)",
    "--glass-frost": "0.25",
    "--glass-radius": "32px",
    "--glass-saturation": "1.4",
  });
});

test("getSurfaceProperties adds the masks of a traced shape", () => {
  const properties = getSurfaceProperties("glass-surface-7", defaultOptions, createState("svg", READY_SHAPE));

  expect(properties).toMatchObject({
    "--glass-glow": 'url("data:image/png;base64,glow")',
    "--glass-line": 'url("data:image/png;base64,line")',
    "--glass-shape": 'url("https://example.com/a %22star%22.svg") 40px 10px / 120px 60px no-repeat',
  });
});
