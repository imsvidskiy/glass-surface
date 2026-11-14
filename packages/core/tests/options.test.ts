import { expect, test } from "bun:test";
import { defaultOptions, resolveOptions } from "../src/options";

test("resolveOptions returns the defaults for an empty input", () => {
  expect(resolveOptions({})).toEqual(defaultOptions);
});

test("resolveOptions keeps the given options", () => {
  const options = resolveOptions({
    borderRadius: 32,
    shape: "/star.svg",
  });

  expect(options.borderRadius).toBe(32);
  expect(options.shape).toBe("/star.svg");
  expect(options.blur).toBe(defaultOptions.blur);
});

test("resolveOptions treats undefined as not given", () => {
  const options = resolveOptions({
    blur: undefined,
  });

  expect(options.blur).toBe(defaultOptions.blur);
});

test("resolveOptions keeps null", () => {
  const options = resolveOptions({
    backdrop: null,
    shape: null,
  });

  expect(options.backdrop).toBeNull();
  expect(options.shape).toBeNull();
});
