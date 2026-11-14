import "./control.css";
import "./slider-control.css";

import { type ChangeEvent, type CSSProperties, type ReactNode, useCallback } from "react";

type SliderControlProps<Name extends string> = {
  label: string;
  maximum: number;
  minimum: number;
  name: Name;
  onChange: (value: number, name: Name) => void;
  step: number;
  unit: string;
  value: number;
};

type SliderControlStyle = CSSProperties & {
  "--fill": string;
};

function formatValue(value: number, step: number, unit: string): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));

  return `${value.toFixed(decimals)}${unit}`;
}

export function SliderControl<Name extends string>({
  label,
  maximum,
  minimum,
  name,
  onChange,
  step,
  unit,
  value,
}: SliderControlProps<Name>): ReactNode {
  const style: SliderControlStyle = {
    "--fill": `${((value - minimum) / (maximum - minimum)) * 100}%`,
  };

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.valueAsNumber, name);
    },
    [
      name,
      onChange,
    ]
  );

  return (
    <label className="control slider-control" style={style}>
      <span className="control__label">{label}</span>

      <span className="slider-control__value">{formatValue(value, step, unit)}</span>

      <input
        className="slider-control__range"
        max={maximum}
        min={minimum}
        name={name}
        onChange={handleChange}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}
