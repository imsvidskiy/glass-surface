import {
  createGlassSurfaceController,
  describeFilter,
  FILTER_REGION,
  type GlassSurfaceInput,
  getSurfaceClasses,
  getSurfaceOverrides,
  getSurfaceProperties,
  resolveOptions,
  toFilterId,
  toStyleObject,
} from "@svidskiy/glass-surface";
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

export interface GlassSurfaceProps extends GlassSurfaceInput {
  children?: ReactNode;
  className?: string;
  element?: GlassSurfaceElement;
  height?: CSSProperties["height"];
  style?: CSSProperties;
  width?: CSSProperties["width"];
}

export function GlassSurface(props: GlassSurfaceProps): ReactNode {
  const {
    children,
    width = 200,
    height = 80,
    className,
    element: Element = "div",
    style,
    ...input
  } = props;

  const filterId = toFilterId(useId());

  const [controller] = useState(function createController() {
    return createGlassSurfaceController(input);
  });

  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  );

  const attach = useCallback(
    function mountSurface(surface: HTMLElement | null) {
      if (!surface) {
        return;
      }

      return controller.mount(surface);
    },
    [controller]
  );

  useLayoutEffect(function syncOptions() {
    controller.setOptions(input);
  });

  const options = resolveOptions(input);
  const primitives = describeFilter(options, state.displacementMap);

  const surfaceClassName = [...getSurfaceClasses(state), className]
    .filter(Boolean)
    .join(" ");

  const surfaceStyle = {
    ...style,
    height,
    width,
    ...getSurfaceProperties(filterId, options, state),
    ...toStyleObject(getSurfaceOverrides(options, state)),
  } as CSSProperties;

  return (
    <Element className={surfaceClassName} ref={attach} style={surfaceStyle}>
      <svg aria-hidden="true" className="glass-surface__filter">
        <filter id={filterId} {...FILTER_REGION}>
          {primitives.map(({ tag, result, attributes }) =>
            createElement(tag, { key: result, result, ...attributes })
          )}
        </filter>
      </svg>

      <canvas className="glass-surface__canvas" />

      <span aria-hidden="true" className="glass-surface__frame" />

      <span aria-hidden="true" className="glass-surface__glow" />

      <span aria-hidden="true" className="glass-surface__line" />

      <Element className="glass-surface__content">{children}</Element>
    </Element>
  );
}
