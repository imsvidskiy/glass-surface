import { defaultOptions } from "@svidskiy/glass-surface";
import type {
  BlendMode,
  ColorChannel,
  GlassRenderer,
  GlassSurfaceOptions,
} from "@svidskiy/glass-surface-react";

export type BackdropName = "1" | "2" | "3";

export type NumericSetting =
  | "width"
  | "height"
  | "borderRadius"
  | "distortionScale"
  | "borderWidth"
  | "blur"
  | "brightness"
  | "opacity"
  | "displace"
  | "redOffset"
  | "greenOffset"
  | "blueOffset"
  | "backgroundOpacity"
  | "saturation";

export type Settings = Pick<
  GlassSurfaceOptions,
  Exclude<NumericSetting, "width" | "height">
> & {
  height: number;
  mixBlendMode: BlendMode;
  refraction: boolean;
  renderer: GlassRenderer;
  width: number;
  xChannel: ColorChannel;
  yChannel: ColorChannel;
};

export interface SliderDefinition {
  key: NumericSetting;
  label: string;
  maximum: number;
  minimum: number;
  step: number;
  unit: string;
}

export interface Option<Value extends string> {
  label: string;
  value: Value;
}

export interface SliderSection {
  sliders: NumericSetting[];
  title: string;
}

export const SLIDER_SECTIONS: SliderSection[] = [
  { sliders: ["width", "height", "borderRadius"], title: "Size" },
  {
    sliders: [
      "distortionScale",
      "borderWidth",
      "blur",
      "brightness",
      "opacity",
      "displace",
    ],
    title: "Refraction",
  },
  {
    sliders: ["redOffset", "greenOffset", "blueOffset"],
    title: "Chromatic aberration",
  },
  { sliders: ["backgroundOpacity", "saturation"], title: "Tint" },
];

export const SLIDERS: SliderDefinition[] = [
  {
    key: "width",
    label: "Width",
    maximum: 640,
    minimum: 60,
    step: 1,
    unit: "px",
  },
  {
    key: "height",
    label: "Height",
    maximum: 420,
    minimum: 40,
    step: 1,
    unit: "px",
  },
  {
    key: "borderRadius",
    label: "Border Radius",
    maximum: 210,
    minimum: 0,
    step: 1,
    unit: "px",
  },
  {
    key: "distortionScale",
    label: "Distortion Scale",
    maximum: 400,
    minimum: -400,
    step: 1,
    unit: "",
  },
  {
    key: "borderWidth",
    label: "Border Width",
    maximum: 0.5,
    minimum: 0,
    step: 0.01,
    unit: "",
  },
  {
    key: "blur",
    label: "Blur",
    maximum: 40,
    minimum: 0,
    step: 0.5,
    unit: "px",
  },
  {
    key: "brightness",
    label: "Brightness",
    maximum: 100,
    minimum: 0,
    step: 1,
    unit: "%",
  },
  {
    key: "opacity",
    label: "Opacity",
    maximum: 1,
    minimum: 0,
    step: 0.01,
    unit: "",
  },
  {
    key: "displace",
    label: "Displace",
    maximum: 10,
    minimum: 0,
    step: 0.1,
    unit: "",
  },
  {
    key: "redOffset",
    label: "Red Offset",
    maximum: 60,
    minimum: -60,
    step: 1,
    unit: "",
  },
  {
    key: "greenOffset",
    label: "Green Offset",
    maximum: 60,
    minimum: -60,
    step: 1,
    unit: "",
  },
  {
    key: "blueOffset",
    label: "Blue Offset",
    maximum: 60,
    minimum: -60,
    step: 1,
    unit: "",
  },
  {
    key: "backgroundOpacity",
    label: "Background Opacity",
    maximum: 1,
    minimum: 0,
    step: 0.01,
    unit: "",
  },
  {
    key: "saturation",
    label: "Saturation",
    maximum: 3,
    minimum: 0,
    step: 0.05,
    unit: "",
  },
];

export const BACKDROP_OPTIONS: Option<BackdropName>[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
];

export const RENDERER_OPTIONS: Option<GlassRenderer>[] = [
  { label: "Auto", value: "auto" },
  { label: "SVG", value: "svg" },
  { label: "WebGL", value: "webgl" },
];

export const CHANNEL_OPTIONS: Option<ColorChannel>[] = [
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  { label: "B", value: "B" },
  { label: "A", value: "A" },
];

export const BLEND_MODE_OPTIONS: Option<BlendMode>[] = [
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
].map(function toOption(value) {
  return { label: value, value: value as BlendMode };
});

export const DEFAULT_SETTINGS: Settings = {
  ...defaultOptions,
  borderRadius: 28,
  displace: 2.5,
  height: 220,
  width: 360,
};

export function findSlider(key: NumericSetting): SliderDefinition {
  const slider = SLIDERS.find(function matchesKey(definition) {
    return definition.key === key;
  });

  if (!slider) {
    throw new Error(`Unknown slider: ${key}`);
  }

  return slider;
}

export function formatValue(value: number, slider: SliderDefinition): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(slider.step)));

  return `${value.toFixed(decimals)}${slider.unit}`;
}
