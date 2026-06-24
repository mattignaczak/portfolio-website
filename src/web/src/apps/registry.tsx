import type { PageDefinition } from '../types';
import { About } from './About';
import { Projects } from './Projects';
import { Resume } from './Resume';
import { Contact } from './Contact';

export const PAGES: PageDefinition[] = [
  { id: 'about', title: 'About', path: '/', component: About },
  { id: 'projects', title: 'Projects', path: '/projects', component: Projects },
  { id: 'resume', title: 'Resume', path: '/resume', component: Resume },
  { id: 'contact', title: 'Contact', path: '/contact', component: Contact },
];
