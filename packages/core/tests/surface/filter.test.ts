import { expect, test } from "bun:test";
import { defaultOptions } from "../../src/options";
import type { GlassSurfaceState } from "../../src/surface/controller";
import { describeFilter } from "../../src/surface/filter";

const STATE: GlassSurfaceState = {
  displacementMap: "data:image/png;base64,map",
  mode: "svg",
  shape: {
    status: "none",
  },
  size: {
    height: 80,
    width: 200,
  },
};

test("describeFilter returns null outside the SVG mode", () => {
  const state: GlassSurfaceState = {
    ...STATE,
    mode: "webgl",
  };

  expect(describeFilter("glass", defaultOptions, state)).toBeNull();
});

test("describeFilter pads the filter region by the reach of the blur", () => {
  const options = {
    ...defaultOptions,
    displace: 2,
  };

  const filter = describeFilter("glass", options, STATE);

  expect(filter?.attributes).toEqual({
    filterUnits: "userSpaceOnUse",
    height: 92,
    id: "glass",
    width: 212,
    x: -6,
    y: -6,
  });
});

test("describeFilter stretches the displacement map over the surface", () => {
  const filter = describeFilter("glass", defaultOptions, STATE);

  expect(filter?.primitives[0]).toEqual({
    attributes: {
      height: 80,
      href: "data:image/png;base64,map",
      preserveAspectRatio: "none",
      width: 200,
      x: 0,
      y: 0,
    },
    result: "map",
    tag: "feImage",
  });
});

test("describeFilter displaces every color channel by its own scale", () => {
  const options = {
    ...defaultOptions,
    blueOffset: 30,
    distortionScale: -100,
    greenOffset: 20,
    redOffset: 10,
    xChannel: "B",
    yChannel: "A",
  } as const;

  const filter = describeFilter("glass", options, STATE);

  const displacements = filter?.primitives.filter((primitive) => {
    return primitive.tag === "feDisplacementMap";
  });

  expect(displacements).toEqual([
    {
      attributes: {
        in: "SourceGraphic",
        in2: "map",
        scale: -90,
        xChannelSelector: "B",
        yChannelSelector: "A",
      },
      result: "red-displaced",
      tag: "feDisplacementMap",
    },
    {
      attributes: {
        in: "SourceGraphic",
        in2: "map",
        scale: -80,
        xChannelSelector: "B",
        yChannelSelector: "A",
      },
      result: "green-displaced",
      tag: "feDisplacementMap",
    },
    {
      attributes: {
        in: "SourceGraphic",
        in2: "map",
        scale: -70,
        xChannelSelector: "B",
        yChannelSelector: "A",
      },
      result: "blue-displaced",
      tag: "feDisplacementMap",
    },
  ]);
});

test("describeFilter names every primitive once and ends with the blur", () => {
  const filter = describeFilter("glass", defaultOptions, STATE);

  const results = filter?.primitives.map((primitive) => {
    return primitive.result;
  });

  expect(results).toEqual([
    "map",
    "red-displaced",
    "red",
    "green-displaced",
    "green",
    "blue-displaced",
    "blue",
    "red-green",
    "refracted",
    "output",
  ]);
});
