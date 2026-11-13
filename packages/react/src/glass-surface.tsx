import {
  createGlassSurfaceController,
  describeFilter,
  type FilterDescription,
  type FilterPrimitive,
  type GlassSurfaceInput,
  getSurfaceClasses,
  getSurfaceProperties,
  resolveOptions,
  toFilterId,
} from "@imsvidskiy/glass-surface";
import {
  type CSSProperties,
  createElement,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

export type GlassSurfaceElement = "div" | "span";

export type GlassSurfaceProps = GlassSurfaceInput & {
  children?: ReactNode | undefined;
  className?: string | undefined;
  element?: GlassSurfaceElement | undefined;
  height?: CSSProperties["height"] | undefined;
  style?: CSSProperties | undefined;
  width?: CSSProperties["width"] | undefined;
};

function renderPrimitive({ attributes, result, tag }: FilterPrimitive): ReactNode {
  return createElement(tag, {
    key: result,
    result,
    ...attributes,
  });
}

function renderFilter(filter: FilterDescription | null): ReactNode {
  if (filter === null) {
    return null;
  }

  return (
    <svg aria-hidden="true" className="glass-surface__filter">
      <filter {...filter.attributes}>{filter.primitives.map(renderPrimitive)}</filter>
    </svg>
  );
}

export function GlassSurface({
  children,
  className,
  element: Element = "div",
  height = 80,
  style,
  width = 200,
  ...input
}: GlassSurfaceProps): ReactNode {
  const filterId = toFilterId(useId());

  const [controller] = useState(() => {
    return createGlassSurfaceController(input);
  });

  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);

  const options = resolveOptions(input);
  const filter = describeFilter(filterId, options, state);

  const surfaceClassName = [
    ...getSurfaceClasses(state),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const surfaceStyle: CSSProperties = {
    ...style,
    height,
    width,
    ...getSurfaceProperties(filterId, options, state),
  };

  const handleSurface = useCallback(
    (surface: HTMLElement | null) => {
      if (surface === null) {
        return;
      }

      return controller.mount(surface);
    },
    [
      controller,
    ]
  );

  useLayoutEffect(() => {
    controller.setOptions(input);
  });

  return (
    <Element className={surfaceClassName} ref={handleSurface} style={surfaceStyle}>
      {renderFilter(filter)}

      <canvas className="glass-surface__canvas" />

      <span aria-hidden="true" className="glass-surface__frame" />

      <span aria-hidden="true" className="glass-surface__glow" />

      <span aria-hidden="true" className="glass-surface__line" />

      <Element className="glass-surface__content">{children}</Element>
    </Element>
  );
}
