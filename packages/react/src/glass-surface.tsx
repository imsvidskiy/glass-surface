import {
  createGlassSurfaceController,
  describeFilter,
  type GlassSurfaceInput,
  getSurfaceClasses,
  getSurfaceProperties,
  resolveOptions,
  toFilterId,
} from "@imsvidskiy/glass-surface";
import { clsx } from "clsx";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { SurfaceFilter } from "./surface-filter";

export type GlassSurfaceElement = "div" | "span";

export type GlassSurfaceProps = GlassSurfaceInput & {
  children?: ReactNode | undefined;
  className?: string | undefined;
  element?: GlassSurfaceElement | undefined;
  height?: CSSProperties["height"] | undefined;
  style?: CSSProperties | undefined;
  width?: CSSProperties["width"] | undefined;
};

export function GlassSurface({
  children,
  className,
  element: Element = "div",
  height = 80,
  style,
  width = 200,
  ...input
}: GlassSurfaceProps): ReactNode {
  const [controller] = useState(() => {
    return createGlassSurfaceController(input);
  });

  const filterId = toFilterId(useId());
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);

  const options = resolveOptions(input);

  const surfaceClassName = clsx(getSurfaceClasses(state), className);

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
      <SurfaceFilter description={describeFilter(filterId, options, state)} />

      <canvas className="glass-surface__canvas" />

      <span aria-hidden="true" className="glass-surface__frame" />

      <span aria-hidden="true" className="glass-surface__glow" />

      <span aria-hidden="true" className="glass-surface__line" />

      <Element className="glass-surface__content">{children}</Element>
    </Element>
  );
}
