import { expect, test } from "bun:test";
import { approximateCumulativeNormal, clamp } from "../../src/lib/math";

test("clamp keeps a value inside the range", () => {
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(-5, 0, 10)).toBe(0);
  expect(clamp(15, 0, 10)).toBe(10);
});

test("approximateCumulativeNormal rises from 0 through 0.5 to 1", () => {
  expect(approximateCumulativeNormal(0)).toBe(0.5);
  expect(approximateCumulativeNormal(-8)).toBeLessThan(0.001);
  expect(approximateCumulativeNormal(8)).toBeGreaterThan(0.999);
  expect(approximateCumulativeNormal(1)).toBeCloseTo(0.8413, 1);
});
