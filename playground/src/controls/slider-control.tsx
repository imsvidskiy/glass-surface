import { type ChangeEvent, type CSSProperties, type ReactNode, useCallback } from "react";
import type { NumericSetting, Slider } from "../settings";

type SliderControlProps = {
  onChange: (value: number, name: NumericSetting) => void;
  slider: Slider;
  value: number;
};

type SliderStyle = CSSProperties & {
  "--fill": string;
};

function formatFill(slider: Slider, value: number): string {
  const fraction = (value - slider.minimum) / (slider.maximum - slider.minimum);

  return `${fraction * 100}%`;
}

function formatValue(slider: Slider, value: number): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(slider.step)));

  return `${value.toFixed(decimals)}${slider.unit}`;
}

export function SliderControl({ onChange, slider, value }: SliderControlProps): ReactNode {
  const style: SliderStyle = {
    "--fill": formatFill(slider, value),
  };

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.valueAsNumber, slider.name);
    },
    [
      onChange,
      slider.name,
    ]
  );

  return (
    <label className="row row--slider" style={style}>
      <span className="row__label">{slider.label}</span>

      <span className="row__value">{formatValue(slider, value)}</span>

      <input
        className="row__range"
        max={slider.maximum}
        min={slider.minimum}
        onChange={handleChange}
        step={slider.step}
        type="range"
        value={value}
      />
    </label>
  );
}
