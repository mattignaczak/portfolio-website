import { useCallback, useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragOptions {
  position: Position;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
}

export function useDrag({ position, onDragStart, onDragEnd }: UseDragOptions) {
  const [local, setLocal] = useState<Position>(position);
  const [dragging, setDragging] = useState(false);
  const originRef = useRef<{ mouse: Position; element: Position } | null>(null);

  useEffect(() => {
    if (!dragging) setLocal(position);
  }, [position, dragging]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      originRef.current = {
        mouse: { x: event.clientX, y: event.clientY },
        element: local,
      };
      setDragging(true);
      onDragStart?.();
    },
    [local, onDragStart],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragging || !originRef.current) return;
      const dx = event.clientX - originRef.current.mouse.x;
      const dy = event.clientY - originRef.current.mouse.y;
      setLocal({
        x: originRef.current.element.x + dx,
        y: originRef.current.element.y + dy,
      });
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragging) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDragging(false);
      onDragEnd?.(local);
      originRef.current = null;
    },
    [dragging, local, onDragEnd],
  );

  return { position: local, dragging, dragHandlers: { onPointerDown, onPointerMove, onPointerUp } };
}
