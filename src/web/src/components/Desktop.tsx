import { useState } from 'react';
import { APP_LIST } from '../apps/registry';
import { useWindowManager } from '../state/WindowManager';
import type { AppId } from '../types';

export function Desktop() {
  const { open } = useWindowManager();
  const [selected, setSelected] = useState<AppId | null>(null);

  return (
    <div
      className="desktop-icons"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {APP_LIST.map((app) => {
        const isSelected = selected === app.id;
        return (
          <button
            key={app.id}
            className={`desktop-icon${isSelected ? ' selected' : ''}`}
            onClick={() => setSelected(app.id)}
            onDoubleClick={() => open(app)}
            aria-label={`Open ${app.title}`}
          >
            <span className="desktop-icon-image" aria-hidden>
              {app.icon}
            </span>
            <span className="desktop-icon-label">{app.title}</span>
          </button>
        );
      })}
    </div>
  );
}
