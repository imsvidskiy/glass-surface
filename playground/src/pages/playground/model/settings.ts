import { defaultOptions, type GlassSurfaceOptions } from "@imsvidskiy/glass-surface";

export type Settings = GlassSurfaceOptions & {
  height: number;
  width: number;
};

export type NumericSetting = {
  [Name in keyof Settings]: Settings[Name] extends number ? Name : never;
}[keyof Settings];

export type SettingChangeHandler = <Name extends keyof Settings>(value: Settings[Name], name: Name) => void;

export const BACKDROP_NAMES = [
  "1",
  "2",
  "3",
] as const;

export type BackdropName = (typeof BACKDROP_NAMES)[number];

export const DEFAULT_BACKDROP_NAME: BackdropName = "2";

export const DEFAULT_SETTINGS: Settings = {
  ...defaultOptions,
  borderRadius: 28,
  height: 220,
  width: 360,
};
