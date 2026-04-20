import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppDefinition, AppId, WindowInstance } from '../types';

interface WindowState {
  windows: Record<AppId, WindowInstance>;
  focusOrder: AppId[];
}

type Action =
  | { type: 'open'; app: AppDefinition }
  | { type: 'close'; id: AppId }
  | { type: 'focus'; id: AppId }
  | { type: 'minimize'; id: AppId }
  | { type: 'toggle-minimize'; id: AppId }
  | { type: 'move'; id: AppId; position: { x: number; y: number } };

const initialState: WindowState = {
  windows: {} as Record<AppId, WindowInstance>,
  focusOrder: [],
};

function reducer(state: WindowState, action: Action): WindowState {
  switch (action.type) {
    case 'open': {
      const existing = state.windows[action.app.id];
      if (existing) {
        return {
          windows: { ...state.windows, [action.app.id]: { ...existing, minimized: false } },
          focusOrder: [...state.focusOrder.filter((x) => x !== action.app.id), action.app.id],
        };
      }
      const instance: WindowInstance = {
        id: action.app.id,
        minimized: false,
        position: action.app.defaultPosition,
        size: action.app.defaultSize,
      };
      return {
        windows: { ...state.windows, [action.app.id]: instance },
        focusOrder: [...state.focusOrder, action.app.id],
      };
    }
    case 'close': {
      const { [action.id]: _removed, ...rest } = state.windows;
      void _removed;
      return {
        windows: rest as Record<AppId, WindowInstance>,
        focusOrder: state.focusOrder.filter((x) => x !== action.id),
      };
    }
    case 'focus': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [action.id]: { ...win, minimized: false } },
        focusOrder: [...state.focusOrder.filter((x) => x !== action.id), action.id],
      };
    }
    case 'minimize': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [action.id]: { ...win, minimized: true } },
        focusOrder: state.focusOrder.filter((x) => x !== action.id),
      };
    }
    case 'toggle-minimize': {
      const win = state.windows[action.id];
      if (!win) return state;
      const topId = state.focusOrder[state.focusOrder.length - 1];
      if (win.minimized || topId !== action.id) {
        return {
          windows: { ...state.windows, [action.id]: { ...win, minimized: false } },
          focusOrder: [...state.focusOrder.filter((x) => x !== action.id), action.id],
        };
      }
      return {
        windows: { ...state.windows, [action.id]: { ...win, minimized: true } },
        focusOrder: state.focusOrder.filter((x) => x !== action.id),
      };
    }
    case 'move': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        ...state,
        windows: { ...state.windows, [action.id]: { ...win, position: action.position } },
      };
    }
  }
}

interface WindowManagerContextValue {
  state: WindowState;
  open: (app: AppDefinition) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMinimize: (id: AppId) => void;
  move: (id: AppId, position: { x: number; y: number }) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const open = useCallback((app: AppDefinition) => dispatch({ type: 'open', app }), []);
  const close = useCallback((id: AppId) => dispatch({ type: 'close', id }), []);
  const focus = useCallback((id: AppId) => dispatch({ type: 'focus', id }), []);
  const minimize = useCallback((id: AppId) => dispatch({ type: 'minimize', id }), []);
  const toggleMinimize = useCallback((id: AppId) => dispatch({ type: 'toggle-minimize', id }), []);
  const move = useCallback(
    (id: AppId, position: { x: number; y: number }) => dispatch({ type: 'move', id, position }),
    [],
  );

  const value = useMemo<WindowManagerContextValue>(
    () => ({ state, open, close, focus, minimize, toggleMinimize, move }),
    [state, open, close, focus, minimize, toggleMinimize, move],
  );

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerContextValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
  return ctx;
}
