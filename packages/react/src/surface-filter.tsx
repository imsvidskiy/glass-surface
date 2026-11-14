import type { FilterDescription, FilterPrimitive } from "@imsvidskiy/glass-surface";
import { createElement, type ReactNode } from "react";

type SurfaceFilterProps = {
  description: FilterDescription | null;
};

function renderPrimitive({ attributes, result, tag }: FilterPrimitive): ReactNode {
  return createElement(tag, {
    key: result,
    result,
    ...attributes,
  });
}

export function SurfaceFilter({ description }: SurfaceFilterProps): ReactNode {
  if (description === null) {
    return null;
  }

  return (
    <svg aria-hidden="true" className="glass-surface__filter">
      <filter {...description.attributes}>{description.primitives.map(renderPrimitive)}</filter>
    </svg>
  );
}
