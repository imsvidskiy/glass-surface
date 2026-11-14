import { type ChangeEvent, useCallback } from "react";

export type OptionControlProps<Name extends string, Value extends string> = {
  label: string;
  name: Name;
  onChange: (value: Value, name: Name) => void;
  options: readonly Value[];
  value: Value;
};

type OptionChange<Name extends string, Value extends string> = Pick<
  OptionControlProps<Name, Value>,
  "name" | "onChange" | "options"
>;

type OptionChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

export function useOptionChange<Name extends string, Value extends string>({
  name,
  onChange,
  options,
}: OptionChange<Name, Value>): OptionChangeHandler {
  return useCallback<OptionChangeHandler>(
    (event) => {
      const selected = options.find((option) => {
        return option === event.target.value;
      });

      if (selected === undefined) {
        return;
      }

      onChange(selected, name);
    },
    [
      name,
      onChange,
      options,
    ]
  );
}
