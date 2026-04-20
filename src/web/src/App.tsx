import { useState } from 'react';
import { APPS } from './apps/registry';
import { Desktop } from './components/Desktop';
import { StartMenu } from './components/StartMenu';
import { Taskbar } from './components/Taskbar';
import { Window } from './components/Window';
import { useWindowManager, WindowManagerProvider } from './state/WindowManager';

function Shell() {
  const { state, close, focus, minimize, move } = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);

  const visibleIds = state.focusOrder.filter((id) => {
    const win = state.windows[id];
    return win && !win.minimized;
  });

  return (
    <div className="desktop">
      <Desktop />

      {visibleIds.map((id, index) => {
        const win = state.windows[id];
        if (!win) return null;
        const app = APPS[id];
        return (
          <Window
            key={id}
            title={app.title}
            position={win.position}
            size={win.size}
            zIndex={100 + index}
            onFocus={() => focus(id)}
            onClose={() => close(id)}
            onMinimize={() => minimize(id)}
            onDragStop={(pos) => move(id, pos)}
          >
            {app.render()}
          </Window>
        );
      })}

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}

      <Taskbar onStartClick={() => setStartOpen((v) => !v)} startOpen={startOpen} />
    </div>
  );
}

export function App() {
  return (
    <WindowManagerProvider>
      <Shell />
    </WindowManagerProvider>
  );
}
