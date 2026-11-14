import { expect, test } from "bun:test";
import { haveSameValues, memoizeLatest } from "../../src/lib/memoize";

type Input = {
  height: number;
  width: number;
};

test("haveSameValues compares the values of every key", () => {
  const size = {
    height: 80,
    width: 200,
  };

  expect(
    haveSameValues(size, {
      height: 80,
      width: 200,
    })
  ).toBe(true);

  expect(
    haveSameValues(size, {
      height: 81,
      width: 200,
    })
  ).toBe(false);
});

test("haveSameValues compares references, not contents", () => {
  const first = {
    size: {
      height: 80,
    },
  };

  const second = {
    size: {
      height: 80,
    },
  };

  expect(haveSameValues(first, second)).toBe(false);
  expect(haveSameValues(first, first)).toBe(true);
});

test("memoizeLatest reuses the output while the input keeps its values", () => {
  let calls = 0;

  const measure = memoizeLatest(({ height, width }: Input) => {
    calls += 1;

    return {
      area: height * width,
    };
  });

  const first = measure({
    height: 2,
    width: 3,
  });

  const second = measure({
    height: 2,
    width: 3,
  });

  expect(second).toBe(first);
  expect(calls).toBe(1);
});

test("memoizeLatest remembers only the latest input", () => {
  let calls = 0;

  const measure = memoizeLatest(({ height, width }: Input) => {
    calls += 1;

    return height * width;
  });

  const small = {
    height: 2,
    width: 3,
  };

  const large = {
    height: 4,
    width: 5,
  };

  expect(measure(small)).toBe(6);
  expect(measure(large)).toBe(20);
  expect(measure(small)).toBe(6);
  expect(calls).toBe(3);
});
