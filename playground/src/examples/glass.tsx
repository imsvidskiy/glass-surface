import { GlassSurface } from "@svidskiy/glass-surface-react";
import type { CSSProperties, ReactNode } from "react";

interface GlassProps {
  children?: ReactNode;
  className?: string;
  height: number;
  radius?: number;
  tint?: number;
  width: CSSProperties["width"];
}

const ICON_TINT = 0.22;
const DISPLACE = 2.5;

/** The glass every example uses: SVG refraction of the live DOM behind it, or frost where that's unavailable. */
export function Glass(props: GlassProps): ReactNode {
  const {
    children,
    className = "glass",
    height,
    radius = height / 2,
    tint = ICON_TINT,
    width,
  } = props;

  return (
    <GlassSurface
      backgroundOpacity={tint}
      blur={8}
      borderRadius={radius}
      className={className}
      displace={DISPLACE}
      distortionScale={-90}
      height={height}
      width={width}
    >
      {children}
    </GlassSurface>
  );
}
