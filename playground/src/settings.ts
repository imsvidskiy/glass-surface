import {
  type BlendMode,
  type ColorChannel,
  defaultOptions,
  type GlassRenderer,
  type GlassSurfaceOptions,
} from "@imsvidskiy/glass-surface";

export type BackdropName = "1" | "2" | "3";

export type Settings = GlassSurfaceOptions & {
  height: number;
  width: number;
};

export type NumericSetting = {
  [Name in keyof Settings]: Settings[Name] extends number ? Name : never;
}[keyof Settings];

export type SettingChangeHandler = <Name extends keyof Settings>(value: Settings[Name], name: Name) => void;

export type Slider = {
  label: string;
  maximum: number;
  minimum: number;
  name: NumericSetting;
  step: number;
  unit: string;
};

export type SliderSection = {
  sliders: Slider[];
  title: string;
};

export const BACKDROP_NAMES: BackdropName[] = [
  "1",
  "2",
  "3",
];

export const DEFAULT_BACKDROP_NAME: BackdropName = "2";

export const RENDERERS: GlassRenderer[] = [
  "auto",
  "svg",
  "webgl",
];

export const COLOR_CHANNELS: ColorChannel[] = [
  "R",
  "G",
  "B",
  "A",
];

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export const DEFAULT_SETTINGS: Settings = {
  ...defaultOptions,
  borderRadius: 28,
  height: 220,
  width: 360,
};

export const SLIDER_SECTIONS: SliderSection[] = [
  {
    sliders: [
      {
        label: "Width",
        maximum: 640,
        minimum: 60,
        name: "width",
        step: 1,
        unit: "px",
      },
      {
        label: "Height",
        maximum: 420,
        minimum: 40,
        name: "height",
        step: 1,
        unit: "px",
      },
      {
        label: "Border Radius",
        maximum: 210,
        minimum: 0,
        name: "borderRadius",
        step: 1,
        unit: "px",
      },
    ],
    title: "Size",
  },
  {
    sliders: [
      {
        label: "Distortion Scale",
        maximum: 400,
        minimum: -400,
        name: "distortionScale",
        step: 1,
        unit: "",
      },
      {
        label: "Border Width",
        maximum: 0.5,
        minimum: 0,
        name: "borderWidth",
        step: 0.01,
        unit: "",
      },
      {
        label: "Blur",
        maximum: 40,
        minimum: 0,
        name: "blur",
        step: 0.5,
        unit: "px",
      },
      {
        label: "Brightness",
        maximum: 100,
        minimum: 0,
        name: "brightness",
        step: 1,
        unit: "%",
      },
      {
        label: "Opacity",
        maximum: 1,
        minimum: 0,
        name: "opacity",
        step: 0.01,
        unit: "",
      },
      {
        label: "Displace",
        maximum: 10,
        minimum: 0,
        name: "displace",
        step: 0.1,
        unit: "",
      },
    ],
    title: "Refraction",
  },
  {
    sliders: [
      {
        label: "Red Offset",
        maximum: 60,
        minimum: -60,
        name: "redOffset",
        step: 1,
        unit: "",
      },
      {
        label: "Green Offset",
        maximum: 60,
        minimum: -60,
        name: "greenOffset",
        step: 1,
        unit: "",
      },
      {
        label: "Blue Offset",
        maximum: 60,
        minimum: -60,
        name: "blueOffset",
        step: 1,
        unit: "",
      },
    ],
    title: "Chromatic aberration",
  },
  {
    sliders: [
      {
        label: "Background Opacity",
        maximum: 1,
        minimum: 0,
        name: "backgroundOpacity",
        step: 0.01,
        unit: "",
      },
      {
        label: "Saturation",
        maximum: 3,
        minimum: 0,
        name: "saturation",
        step: 0.05,
        unit: "",
      },
    ],
    title: "Tint",
  },
];
