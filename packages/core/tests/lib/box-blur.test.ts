import { expect, test } from "bun:test";
import { boxBlur } from "../../src/lib/box-blur";

const COLUMNS = 9;
const ROWS = 7;

test("boxBlur leaves a flat grid flat", () => {
  const grid = new Float32Array(COLUMNS * ROWS).fill(3);

  boxBlur(grid, COLUMNS, ROWS, 2);

  for (const value of grid) {
    expect(value).toBeCloseTo(3, 5);
  }
});

test("boxBlur spreads a peak evenly around its cell", () => {
  const grid = new Float32Array(COLUMNS * ROWS);
  const center = 3 * COLUMNS + 4;

  grid[center] = 1;

  boxBlur(grid, COLUMNS, ROWS, 1);

  expect(grid[center]).toBeLessThan(1);
  expect(grid[center]).toBeGreaterThan(grid[center - 1]);
  expect(grid[center - 1]).toBeCloseTo(grid[center + 1], 6);
  expect(grid[center - COLUMNS]).toBeCloseTo(grid[center + COLUMNS], 6);
  expect(grid[center - 1]).toBeCloseTo(grid[center - COLUMNS], 6);
});
