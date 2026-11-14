import { expect, test } from "bun:test";
import { fitObject } from "../../src/webgl/object-fit";

const BOUNDS = {
  height: 100,
  width: 400,
  x: 10,
  y: 20,
};

const WIDE = {
  height: 100,
  width: 200,
};

const SMALL = {
  height: 50,
  width: 100,
};

test("fitObject stretches the object for fill", () => {
  const box = fitObject(BOUNDS, WIDE, {
    objectFit: "fill",
    objectPosition: "50% 50%",
  });

  expect(box).toEqual(BOUNDS);
});

test("fitObject stretches an object without a natural size", () => {
  const natural = {
    height: 0,
    width: 0,
  };

  const box = fitObject(BOUNDS, natural, {
    objectFit: "cover",
    objectPosition: "50% 50%",
  });

  expect(box).toEqual(BOUNDS);
});

test("fitObject covers the bounds and centers the overflow", () => {
  const box = fitObject(BOUNDS, WIDE, {
    objectFit: "cover",
    objectPosition: "50% 50%",
  });

  expect(box).toEqual({
    height: 200,
    width: 400,
    x: 10,
    y: -30,
  });
});

test("fitObject contains the object inside the bounds", () => {
  const box = fitObject(BOUNDS, WIDE, {
    objectFit: "contain",
    objectPosition: "50% 50%",
  });

  expect(box).toEqual({
    height: 100,
    width: 200,
    x: 110,
    y: 20,
  });
});

test("fitObject keeps the natural size for none", () => {
  const box = fitObject(BOUNDS, SMALL, {
    objectFit: "none",
    objectPosition: "0% 100%",
  });

  expect(box).toEqual({
    height: 50,
    width: 100,
    x: 10,
    y: 70,
  });
});

test("fitObject never scales up for scale-down", () => {
  const style = {
    objectFit: "scale-down",
    objectPosition: "50% 50%",
  };

  expect(fitObject(BOUNDS, SMALL, style)).toEqual({
    height: 50,
    width: 100,
    x: 160,
    y: 45,
  });

  expect(fitObject(BOUNDS, WIDE, style)).toEqual({
    height: 100,
    width: 200,
    x: 110,
    y: 20,
  });
});

test("fitObject places the object by a length", () => {
  const box = fitObject(BOUNDS, SMALL, {
    objectFit: "none",
    objectPosition: "24px 8px",
  });

  expect(box).toEqual({
    height: 50,
    width: 100,
    x: 34,
    y: 28,
  });
});
