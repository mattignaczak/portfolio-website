import type { ReactNode } from 'react';

export type AppId = 'about' | 'projects' | 'contact' | 'resume';

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  render: () => ReactNode;
}

export interface WindowInstance {
  id: AppId;
  minimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
