import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PAGES } from './apps/registry';
import { Layout } from './components/Layout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {PAGES.map((page) => {
            const Page = page.component;
            return <Route key={page.id} path={page.path} element={<Page />} />;
          })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
