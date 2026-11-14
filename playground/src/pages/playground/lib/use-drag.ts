import { type PointerEvent, type RefObject, useCallback, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

type Drag = {
  handlePointerDown: (event: PointerEvent<HTMLElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLElement>) => void;
  handlePointerUp: (event: PointerEvent<HTMLElement>) => void;
  position: Position;
};

const CENTER: Position = {
  x: 0.5,
  y: 0.5,
};

function clampFraction(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function useDrag(stageRef: RefObject<HTMLElement | null>): Drag {
  const [position, setPosition] = useState(CENTER);

  const grabOffsetRef = useRef<Position | null>(null);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    event.currentTarget.setPointerCapture(event.pointerId);

    grabOffsetRef.current = {
      x: event.clientX - (bounds.left + bounds.width / 2),
      y: event.clientY - (bounds.top + bounds.height / 2),
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const grabOffset = grabOffsetRef.current;
      const stage = stageRef.current;

      if (grabOffset === null) {
        return;
      }

      if (stage === null) {
        return;
      }

      const bounds = stage.getBoundingClientRect();

      setPosition({
        x: clampFraction((event.clientX - grabOffset.x - bounds.left) / bounds.width),
        y: clampFraction((event.clientY - grabOffset.y - bounds.top) / bounds.height),
      });
    },
    [
      stageRef,
    ]
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);

    grabOffsetRef.current = null;
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    position,
  };
}
