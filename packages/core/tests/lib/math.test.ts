import { expect, test } from "bun:test";
import { approximateNormalCdf, clamp } from "../../src/lib/math";

test("clamp keeps a value inside the range", () => {
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(-5, 0, 10)).toBe(0);
  expect(clamp(15, 0, 10)).toBe(10);
});

test("approximateNormalCdf rises from 0 through 0.5 to 1", () => {
  expect(approximateNormalCdf(0)).toBe(0.5);
  expect(approximateNormalCdf(-8)).toBeLessThan(0.001);
  expect(approximateNormalCdf(8)).toBeGreaterThan(0.999);
  expect(approximateNormalCdf(1)).toBeCloseTo(0.8413, 1);
});
