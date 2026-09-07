import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PAGES } from './apps/registry';
import { Layout } from './components/Layout';
import { BlogPost } from './apps/BlogPost';
import { NotFound } from './apps/NotFound';

/**
 * The route tree, separate from the history provider so tests can mount it
 * under a `MemoryRouter` at any starting path. `App` supplies the real one.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {PAGES.map((page) => {
          const Page = page.component;
          return <Route key={page.id} path={page.path} element={<Page />} />;
        })}
        {/* Parameterized post route — not in PAGES (it isn't a nav link). */}
        <Route path="/blog/:slug" element={<BlogPost />} />
        {/* Catch-all. Reachable only because CloudFront rewrites unknown
              paths to index.html instead of letting S3 return 403. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
