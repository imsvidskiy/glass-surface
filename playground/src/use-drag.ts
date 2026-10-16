import {
  type PointerEvent,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";

export interface Position {
  x: number;
  y: number;
}

export interface Drag {
  handlePointerDown: (event: PointerEvent<HTMLElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLElement>) => void;
  handlePointerUp: (event: PointerEvent<HTMLElement>) => void;
  position: Position;
}

const CENTER: Position = { x: 0.5, y: 0.5 };

function clampUnit(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** Moves an element inside the stage; the position is the element's center as a fraction of the stage. */
export function useDrag(stageRef: RefObject<HTMLElement | null>): Drag {
  const [position, setPosition] = useState(CENTER);

  const grabOffset = useRef<Position | null>(null);

  const handlePointerDown = useCallback(function startDrag(
    event: PointerEvent<HTMLElement>
  ) {
    const bounds = event.currentTarget.getBoundingClientRect();

    event.currentTarget.setPointerCapture(event.pointerId);

    grabOffset.current = {
      x: event.clientX - (bounds.left + bounds.width / 2),
      y: event.clientY - (bounds.top + bounds.height / 2),
    };
  }, []);

  const handlePointerMove = useCallback(
    function drag(event: PointerEvent<HTMLElement>) {
      const offset = grabOffset.current;
      const stage = stageRef.current;

      if (offset === null || stage === null) {
        return;
      }

      const bounds = stage.getBoundingClientRect();

      setPosition({
        x: clampUnit((event.clientX - offset.x - bounds.left) / bounds.width),
        y: clampUnit((event.clientY - offset.y - bounds.top) / bounds.height),
      });
    },
    [stageRef]
  );

  const handlePointerUp = useCallback(function endDrag(
    event: PointerEvent<HTMLElement>
  ) {
    event.currentTarget.releasePointerCapture(event.pointerId);

    grabOffset.current = null;
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp, position };
}
