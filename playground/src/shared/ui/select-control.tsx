import "./control.css";
import "./select-control.css";

import type { ReactNode } from "react";
import type { OptionControlProps } from "@/shared/lib/use-option-change";
import { useOptionChange } from "@/shared/lib/use-option-change";

type SelectControlProps<Name extends string, Value extends string> = OptionControlProps<Name, Value>;

export function SelectControl<Name extends string, Value extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: SelectControlProps<Name, Value>): ReactNode {
  const handleChange = useOptionChange({
    name,
    onChange,
    options,
  });

  return (
    <label className="control select-control">
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
