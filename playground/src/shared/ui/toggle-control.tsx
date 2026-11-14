import "./control.css";
import "./toggle-control.css";

import { type ChangeEvent, type ReactNode, useCallback } from "react";

type ToggleControlProps<Name extends string> = {
  isChecked: boolean;
  label: string;
  name: Name;
  onChange: (isChecked: boolean, name: Name) => void;
};

export function ToggleControl<Name extends string>({
  isChecked,
  label,
  name,
  onChange,
}: ToggleControlProps<Name>): ReactNode {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked, name);
    },
    [
      name,
      onChange,
    ]
  );

  return (
    <label className="control">
      <span className="control__label">{label}</span>

      <input
        aria-checked={isChecked}
        checked={isChecked}
        className="toggle-control__switch"
        name={name}
        onChange={handleChange}
        role="switch"
        type="checkbox"
      />
    </label>
  );
}
