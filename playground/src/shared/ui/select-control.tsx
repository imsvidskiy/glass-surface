import "./control.css";
import "./select-control.css";

import { type ChangeEvent, type ReactNode, useCallback } from "react";
import { findOption } from "@/shared/lib/find-option";

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
    <label className="control">
      <span className="control__label">{label}</span>

      <select className="select-control__select" name={name} onChange={handleChange} value={value}>
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
