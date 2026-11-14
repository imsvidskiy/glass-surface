import { expect, test } from "bun:test";
import { isEmptySize, scaleSize } from "../../src/lib/geometry";

test("isEmptySize is true when a side is zero", () => {
  expect(
    isEmptySize({
      height: 0,
      width: 120,
    })
  ).toBe(true);

  expect(
    isEmptySize({
      height: 80,
      width: 120,
    })
  ).toBe(false);
});

test("scaleSize rounds to whole pixels", () => {
  const size = scaleSize(
    {
      height: 81,
      width: 201,
    },
    1.5
  );

  expect(size).toEqual({
    height: 122,
    width: 302,
  });
});

test("scaleSize never returns an empty size", () => {
  const size = scaleSize(
    {
      height: 2,
      width: 300,
    },
    0.1
  );

  expect(size).toEqual({
    height: 1,
    width: 30,
  });
});
