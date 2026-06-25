import type { PageDefinition } from '../types';
import { content } from '../content';
import { About } from './About';
import { Projects } from './Projects';
import { Blog } from './Blog';
import { Resume } from './Resume';
import { Contact } from './Contact';

/**
 * Nav + static routes, in display order. The blog's *detail* route
 * (`/blog/:slug`) is parameterized, so it can't live here — it's wired
 * directly in `App.tsx`. This list stays the source of truth for nav links.
 */
export const PAGES: PageDefinition[] = [
  { id: 'about', title: content.nav.about, path: '/', component: About },
  { id: 'projects', title: content.nav.projects, path: '/projects', component: Projects },
  { id: 'blog', title: content.nav.blog, path: '/blog', component: Blog },
  { id: 'resume', title: content.nav.resume, path: '/resume', component: Resume },
  { id: 'contact', title: content.nav.contact, path: '/contact', component: Contact },
];
