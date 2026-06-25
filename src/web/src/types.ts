import type { ComponentType } from 'react';

export type PageId = 'about' | 'projects' | 'blog' | 'resume' | 'contact';

export interface PageDefinition {
  id: PageId;
  title: string;
  path: string;
  component: ComponentType;
}
