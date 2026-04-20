import { useEffect, useRef } from 'react';
import { APP_LIST } from '../apps/registry';
import { useWindowManager } from '../state/WindowManager';

interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { open } = useWindowManager();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: globalThis.MouseEvent) => {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div className="start-menu" ref={menuRef} role="menu">
      <div className="start-menu-banner">
        <span className="start-menu-banner-text">
          Matt<strong>Ignaczak</strong>
        </span>
      </div>
      <ul className="start-menu-items">
        {APP_LIST.map((app) => (
          <li key={app.id}>
            <button
              role="menuitem"
              className="start-menu-item"
              onClick={() => {
                open(app);
                onClose();
              }}
            >
              <span className="start-menu-icon" aria-hidden>
                {app.icon}
              </span>
              <span>{app.title}</span>
            </button>
          </li>
        ))}
        <li className="start-menu-separator" role="separator" />
        <li>
          <a
            className="start-menu-item"
            href="https://github.com/mattignaczak"
            target="_blank"
            rel="noreferrer"
          >
            <span className="start-menu-icon" aria-hidden>
              🐙
            </span>
            <span>GitHub</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
