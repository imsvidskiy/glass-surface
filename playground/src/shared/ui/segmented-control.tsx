import "./control.css";
import "./segmented-control.css";
import type { ReactNode } from "react";
import { useId } from "react";
import type { OptionControlProps } from "@/shared/lib/use-option-change";
import { useOptionChange } from "@/shared/lib/use-option-change";

type SegmentedControlProps<Name extends string, Value extends string> = OptionControlProps<Name, Value>;

export function SegmentedControl<Name extends string, Value extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: SegmentedControlProps<Name, Value>): ReactNode {
  const labelId = useId();

  const handleChange = useOptionChange({
    name,
    onChange,
    options,
  });

  return (
    <div aria-labelledby={labelId} className="control segmented-control" role="radiogroup">
      <span className="control__label" id={labelId}>
        {label}
      </span>

      <span className="segmented-control__options">
        {options.map((option) => {
          return (
            <label className="segmented-control__option" key={option}>
              <input
                checked={option === value}
                className="segmented-control__input"
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
    </div>
  );
}
