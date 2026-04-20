import type { AppDefinition, AppId } from '../types';
import { About } from './About';
import { Projects } from './Projects';
import { Contact } from './Contact';
import { Resume } from './Resume';

export const APPS: Record<AppId, AppDefinition> = {
  about: {
    id: 'about',
    title: 'About Me',
    icon: '📄',
    defaultSize: { width: 480, height: 360 },
    defaultPosition: { x: 80, y: 60 },
    render: () => <About />,
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    icon: '💾',
    defaultSize: { width: 520, height: 400 },
    defaultPosition: { x: 180, y: 120 },
    render: () => <Projects />,
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    icon: '✉️',
    defaultSize: { width: 400, height: 420 },
    defaultPosition: { x: 280, y: 180 },
    render: () => <Contact />,
  },
  resume: {
    id: 'resume',
    title: 'Resume',
    icon: '📋',
    defaultSize: { width: 480, height: 460 },
    defaultPosition: { x: 380, y: 80 },
    render: () => <Resume />,
  },
};

export const APP_LIST: AppDefinition[] = Object.values(APPS);
