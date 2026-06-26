import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PAGES } from './apps/registry';
import { Layout } from './components/Layout';
import { BlogPost } from './apps/BlogPost';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {PAGES.map((page) => {
            const Page = page.component;
            return <Route key={page.id} path={page.path} element={<Page />} />;
          })}
          {/* Parameterized post route — not in PAGES (it isn't a nav link). */}
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
