import { NavLink, Outlet } from 'react-router-dom';
import { PAGES } from '../apps/registry';
import { cn } from '@/lib/utils';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <span className="font-semibold">Matt Ignaczak</span>
          <ul className="flex items-center gap-1">
            {PAGES.map((page) => (
              <li key={page.id}>
                <NavLink
                  to={page.path}
                  end={page.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground',
                      isActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground',
                    )
                  }
                >
                  {page.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
