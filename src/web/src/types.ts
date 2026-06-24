import type { ComponentType } from 'react';

export type PageId = 'about' | 'projects' | 'resume' | 'contact';

export interface PageDefinition {
  id: PageId;
  title: string;
  path: string;
  component: ComponentType;
}
