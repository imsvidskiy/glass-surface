import { expect, test } from "bun:test";
import { squaredDistanceTransform, UNREACHED } from "../../src/lib/distance-transform";

const COLUMNS = 8;
const ROWS = 6;

const SEEDS = [
  {
    column: 1,
    row: 1,
  },
  {
    column: 6,
    row: 4,
  },
  {
    column: 3,
    row: 5,
  },
];

function measureNearestSeed(column: number, row: number): number {
  const distances = SEEDS.map((seed) => {
    return (seed.column - column) ** 2 + (seed.row - row) ** 2;
  });

  return Math.min(...distances);
}

test("squaredDistanceTransform measures the squared distance to the nearest seed", () => {
  const grid = new Float32Array(COLUMNS * ROWS).fill(UNREACHED);

  for (const seed of SEEDS) {
    grid[seed.row * COLUMNS + seed.column] = 0;
  }

  squaredDistanceTransform(grid, COLUMNS, ROWS);

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      expect(grid[row * COLUMNS + column]).toBe(measureNearestSeed(column, row));
    }
  }
});
