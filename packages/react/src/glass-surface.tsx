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

export interface GlassSurfaceProps extends GlassSurfaceInput {
  children?: ReactNode;
  className?: string;
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
    function mountSurface(element: HTMLDivElement | null) {
      if (!element) {
        return;
      }

      return controller.mount(element);
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
    <div className={surfaceClassName} ref={attach} style={surfaceStyle}>
      <svg aria-hidden="true" className="glass-surface__filter">
        <filter id={filterId} {...FILTER_REGION}>
          {primitives.map(({ tag, result, attributes }) =>
            createElement(tag, { key: result, result, ...attributes })
          )}
        </filter>
      </svg>

      <canvas className="glass-surface__canvas" />

      <span aria-hidden="true" className="glass-surface__frame" />

      <span aria-hidden="true" className="glass-surface__sheen" />

      <span aria-hidden="true" className="glass-surface__rim" />

      <span aria-hidden="true" className="glass-surface__glow" />

      <span aria-hidden="true" className="glass-surface__line" />

      <div className="glass-surface__content">{children}</div>
    </div>
  );
}
