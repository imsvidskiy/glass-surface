import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  useCallback,
} from "react";
import { formatValue, type Option, type SliderDefinition } from "./settings";

interface SliderControlProps {
  onChange: (key: SliderDefinition["key"], value: number) => void;
  slider: SliderDefinition;
  value: number;
}

interface ChoiceControlProps<Value extends string> {
  label: string;
  onChange: (value: Value) => void;
  options: Option<Value>[];
  value: Value;
}

interface ToggleControlProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function SliderControl(props: SliderControlProps): ReactNode {
  const { slider, value, onChange } = props;

  const fill =
    ((value - slider.minimum) / (slider.maximum - slider.minimum)) * 100;

  const handleChange = useCallback(
    function updateValue(event: ChangeEvent<HTMLInputElement>) {
      onChange(slider.key, event.target.valueAsNumber);
    },
    [onChange, slider.key]
  );

  return (
    <label
      className="row row--slider"
      style={{ "--fill": `${fill}%` } as CSSProperties}
    >
      <span className="row__label">{slider.label}</span>

      <span className="row__value">{formatValue(value, slider)}</span>

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

export function SegmentedControl<Value extends string>(
  props: ChoiceControlProps<Value> & { className?: string }
): ReactNode {
  const { label, options, value, onChange, className = "row" } = props;

  const handleChange = useCallback(
    function selectOption(event: ChangeEvent<HTMLInputElement>) {
      onChange(event.target.value as Value);
    },
    [onChange]
  );

  return (
    <fieldset className={`${className} segmented`}>
      <legend className="row__label segmented__legend">{label}</legend>

      <span className="segmented__options">
        {options.map(function renderOption(option) {
          return (
            <label className="segmented__option" key={option.value}>
              <input
                checked={option.value === value}
                className="segmented__input"
                name={label}
                onChange={handleChange}
                type="radio"
                value={option.value}
              />

              {option.label}
            </label>
          );
        })}
      </span>
    </fieldset>
  );
}

export function SelectControl<Value extends string>(
  props: ChoiceControlProps<Value>
): ReactNode {
  const { label, options, value, onChange } = props;

  const handleChange = useCallback(
    function selectOption(event: ChangeEvent<HTMLSelectElement>) {
      onChange(event.target.value as Value);
    },
    [onChange]
  );

  return (
    <label className="row row--select">
      <span className="row__label">{label}</span>

      <select className="row__select" onChange={handleChange} value={value}>
        {options.map(function renderOption(option) {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function ToggleControl(props: ToggleControlProps): ReactNode {
  const { label, checked, onChange } = props;

  const handleChange = useCallback(
    function updateChecked(event: ChangeEvent<HTMLInputElement>) {
      onChange(event.target.checked);
    },
    [onChange]
  );

  return (
    <label className="row row--toggle">
      <span className="row__label">{label}</span>

      <input
        aria-checked={checked}
        checked={checked}
        className="row__switch"
        onChange={handleChange}
        role="switch"
        type="checkbox"
      />
    </label>
  );
}
