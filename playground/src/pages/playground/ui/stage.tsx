import "./stage.css";

import { GlassSurface } from "@imsvidskiy/glass-surface-react";
import { type CSSProperties, type ReactNode, useRef } from "react";
import { useDrag } from "../lib/use-drag";
import type { BackdropName, Settings } from "../model/settings";

type StageProps = {
  backdropName: BackdropName;
  settings: Settings;
};

const BACKDROP_HEIGHT = 1200;
const BACKDROP_WIDTH = 1920;

export function Stage({ backdropName, settings }: StageProps): ReactNode {
  const backdropRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { handlePointerDown, handlePointerMove, handlePointerUp, position } = useDrag(stageRef);

  const handleStyle: CSSProperties = {
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
  };

  return (
    <div className="stage" ref={stageRef}>
      <img
        alt=""
        className="stage__backdrop"
        height={BACKDROP_HEIGHT}
        ref={backdropRef}
        src={`/backdrops/${backdropName}.webp`}
        width={BACKDROP_WIDTH}
      />

      <div
        className="stage__handle"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={handleStyle}
      >
        <GlassSurface {...settings} backdrop={backdropRef} />
      </div>
    </div>
  );
}
