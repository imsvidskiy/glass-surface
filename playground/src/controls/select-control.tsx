import { type ChangeEvent, type ReactNode, useCallback } from "react";
import { findOption } from "./find-option";

type SelectControlProps<Name extends string, Value extends string> = {
  label: string;
  name: Name;
  onChange: (value: Value, name: Name) => void;
  options: readonly Value[];
  value: Value;
};

export function SelectControl<Name extends string, Value extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: SelectControlProps<Name, Value>): ReactNode {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
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
    <label className="row">
      <span className="row__label">{label}</span>

      <select className="row__select" name={name} onChange={handleChange} value={value}>
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </label>
  );
}
