import { useEffect, useState } from 'react';
import { APPS } from '../apps/registry';
import { useWindowManager } from '../state/WindowManager';
import type { AppId } from '../types';

interface TaskbarProps {
  onStartClick: () => void;
  startOpen: boolean;
}

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Taskbar({ onStartClick, startOpen }: TaskbarProps) {
  const { state, toggleMinimize } = useWindowManager();
  const time = useClock();

  const orderedIds = Object.keys(state.windows) as AppId[];
  const topId = state.focusOrder[state.focusOrder.length - 1];

  return (
    <footer className="taskbar" role="navigation" aria-label="Taskbar">
      <button
        className={`start-button${startOpen ? ' active' : ''}`}
        onClick={onStartClick}
        aria-haspopup="menu"
        aria-expanded={startOpen}
      >
        <span className="start-icon" aria-hidden>
          ▣
        </span>
        Start
      </button>
      <div className="taskbar-divider" aria-hidden />
      <div className="taskbar-windows">
        {orderedIds.map((id) => {
          const win = state.windows[id];
          if (!win) return null;
          const app = APPS[id];
          const isActive = !win.minimized && topId === id;
          return (
            <button
              key={id}
              className={`taskbar-window${isActive ? ' active' : ''}`}
              onClick={() => toggleMinimize(id)}
              aria-pressed={isActive}
            >
              <span className="taskbar-window-icon" aria-hidden>
                {app.icon}
              </span>
              <span className="taskbar-window-title">{app.title}</span>
            </button>
          );
        })}
      </div>
      <div className="system-tray" role="status" aria-label="Clock">
        {time}
      </div>
    </footer>
  );
}
