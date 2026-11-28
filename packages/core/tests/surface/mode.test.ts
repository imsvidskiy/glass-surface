import { expect, test } from "bun:test";
import type { GlassSurfaceInput } from "../../src/options";
import { resolveOptions } from "../../src/options";
import type { GlassMode } from "../../src/surface/mode";
import { resolveMode } from "../../src/surface/mode";

type Support = {
  hasWebglFailed?: boolean;
  isSvgSupported: boolean;
};

const BACKDROP = {
  current: null,
};

function resolveInput(input: GlassSurfaceInput, { hasWebglFailed = false, isSvgSupported }: Support): GlassMode {
  return resolveMode({
    hasWebglFailed,
    isSvgSupported,
    options: resolveOptions(input),
  });
}

test("resolveMode picks the SVG filter for auto where it works", () => {
  const input = {
    backdrop: BACKDROP,
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolveInput(input, support)).toBe("svg");
});

test("resolveMode picks WebGL for auto with a backdrop where the SVG filter does not work", () => {
  const input = {
    backdrop: BACKDROP,
  };

  const support = {
    isSvgSupported: false,
  };

  expect(resolveInput(input, support)).toBe("webgl");
});

test("resolveMode never picks WebGL without a backdrop", () => {
  const input: GlassSurfaceInput = {
    renderer: "webgl",
  };

  expect(
    resolveInput(input, {
      isSvgSupported: true,
    })
  ).toBe("svg");

  expect(
    resolveInput(input, {
      isSvgSupported: false,
    })
  ).toBe("fallback");
});

test("resolveMode picks WebGL over the SVG filter for webgl with a backdrop", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "webgl",
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolveInput(input, support)).toBe("webgl");
});

test("resolveMode picks the fallback for svg where the SVG filter does not work", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "svg",
  };

  const support = {
    isSvgSupported: false,
  };

  expect(resolveInput(input, support)).toBe("fallback");
});

test("resolveMode gives up WebGL after it failed", () => {
  const input: GlassSurfaceInput = {
    backdrop: BACKDROP,
    renderer: "webgl",
  };

  expect(
    resolveInput(input, {
      hasWebglFailed: true,
      isSvgSupported: true,
    })
  ).toBe("svg");

  expect(
    resolveInput(input, {
      hasWebglFailed: true,
      isSvgSupported: false,
    })
  ).toBe("fallback");
});

test("resolveMode picks the fallback without refraction", () => {
  const input = {
    backdrop: BACKDROP,
    refraction: false,
  };

  const support = {
    isSvgSupported: true,
  };

  expect(resolveInput(input, support)).toBe("fallback");
});
