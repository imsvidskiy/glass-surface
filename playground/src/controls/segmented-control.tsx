import { type ChangeEvent, type ReactNode, useCallback } from "react";
import { findOption } from "./find-option";

type SegmentedControlProps<Name extends string, Value extends string> = {
  label: string;
  name: Name;
  onChange: (value: Value, name: Name) => void;
  options: readonly Value[];
  value: Value;
};

export function SegmentedControl<Name extends string, Value extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: SegmentedControlProps<Name, Value>): ReactNode {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const option = findOption(options, event.target.value);

      if (option === undefined) {
        return;
      }

      onChange(option, name);
    },
    [
      name,
      onChange,
      options,
    ]
  );

  return (
    <fieldset className="row">
      <legend className="row__label segmented__legend">{label}</legend>

      <span className="segmented__options">
        {options.map((option) => {
          return (
            <label className="segmented__option" key={option}>
              <input
                checked={option === value}
                className="segmented__input"
                name={name}
                onChange={handleChange}
                type="radio"
                value={option}
              />

              {option}
            </label>
          );
        })}
      </span>
    </fieldset>
  );
}
