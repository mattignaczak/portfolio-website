import type { MouseEvent, ReactNode } from 'react';
import { useDrag } from '../hooks/useDrag';

interface WindowProps {
  title: string;
  children: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
}

export function Window({
  title,
  children,
  position,
  size,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  onDragStop,
}: WindowProps) {
  const { position: livePosition, dragHandlers } = useDrag({
    position,
    onDragStart: onFocus,
    onDragEnd: onDragStop,
  });

  const stopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="window window-wrapper"
      style={{
        width: size.width,
        height: size.height,
        zIndex,
        transform: `translate(${livePosition.x}px, ${livePosition.y}px)`,
      }}
      onMouseDown={onFocus}
      role="dialog"
      aria-label={title}
    >
      <div className="title-bar" {...dragHandlers}>
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button
            aria-label="Minimize"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={stopPropagation}
            onClick={onMinimize}
          />
          <button
            aria-label="Maximize"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={stopPropagation}
            disabled
          />
          <button
            aria-label="Close"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={stopPropagation}
            onClick={onClose}
          />
        </div>
      </div>
      <div className="window-body window-body-scroll">{children}</div>
    </div>
  );
}
