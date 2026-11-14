import { expect, test } from "bun:test";
import { type GlassSurfaceInput, resolveOptions } from "../../src/options";
import { resolveMode } from "../../src/surface/mode";

type Support = {
  hasWebglFailed?: boolean;
  isSvgSupported: boolean;
};

const BACKDROP = {
  current: null,
};

function resolve(input: GlassSurfaceInput, { hasWebglFailed = false, isSvgSupported }: Support): string {
  return resolveMode({
    hasWebglFailed,
    isSvgSupported,
    options: resolveOptions(input),
  });
}

test("auto prefers the SVG filter where it works", () => {
  const input = {
    backdrop: BACKDROP,
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolve(input, support)).toBe("svg");
});

test("auto uses WebGL for a backdrop where the SVG filter does not work", () => {
  const input = {
    backdrop: BACKDROP,
  };

  const support = {
    isSvgSupported: false,
  };

  expect(resolve(input, support)).toBe("webgl");
});

test("a surface without a backdrop never uses WebGL", () => {
  const input: GlassSurfaceInput = {
    renderer: "webgl",
  };

  expect(
    resolve(input, {
      isSvgSupported: true,
    })
  ).toBe("svg");

  expect(
    resolve(input, {
      isSvgSupported: false,
    })
  ).toBe("fallback");
});

test("the webgl renderer wins over the SVG filter when a backdrop is given", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "webgl",
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolve(input, support)).toBe("webgl");
});

test("the svg renderer falls back where the SVG filter does not work", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "svg",
  };

  const support = {
    isSvgSupported: false,
  };

  expect(resolve(input, support)).toBe("fallback");
});

test("a failed WebGL renderer gives way to the SVG filter or the fallback", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "webgl",
  };

  expect(
    resolve(input, {
      hasWebglFailed: true,
      isSvgSupported: true,
    })
  ).toBe("svg");

  expect(
    resolve(input, {
      hasWebglFailed: true,
      isSvgSupported: false,
    })
  ).toBe("fallback");
});

test("a surface without refraction is always the fallback", () => {
  const input = {
    backdrop: BACKDROP,
    refraction: false,
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolve(input, support)).toBe("fallback");
});
