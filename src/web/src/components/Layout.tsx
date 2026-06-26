import { Link, NavLink, Outlet } from 'react-router-dom';
import { Envelope, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';
import { PAGES } from '../apps/registry';
import { content, format } from '../content';
import { ThemeToggle } from './ThemeToggle';
import { AnimatedBackground } from './AnimatedBackground';
import { cn } from '@/lib/utils';

const SOCIALS = [
  { ...content.socials.github, Icon: GithubLogo },
  { ...content.socials.linkedin, Icon: LinkedinLogo },
  { ...content.socials.email, Icon: Envelope },
];

export function Layout() {
  return (
    <div className="relative min-h-screen text-foreground">
      <AnimatedBackground />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:py-12">
        {/* Sidebar — its own panel so text stays legible over the animated bg. */}
        <aside className="space-y-5 rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow lg:sticky lg:top-12 lg:h-fit lg:w-56 lg:shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/avatar.png"
              alt={content.site.name}
              className="size-11 shrink-0 rounded-base border-2 border-border"
            />
            <div className="min-w-0">
              <Link to="/" className="font-heading text-lg leading-tight">
                {content.site.name}
              </Link>
              <p className="mt-0.5 font-mono text-sm text-foreground/60">{content.site.role}</p>
            </div>
          </div>

          <nav>
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {PAGES.map((page) => (
                <li key={page.id}>
                  <NavLink
                    to={page.path}
                    end={page.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-base border-2 px-3 py-1.5 text-sm font-base whitespace-nowrap transition-all lg:w-full',
                        isActive
                          ? 'border-border bg-main text-main-foreground shadow-shadow'
                          : 'border-transparent text-foreground/80 hover:border-border hover:bg-secondary-background hover:text-foreground',
                      )
                    }
                  >
                    {page.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-base border-2 border-border bg-secondary-background p-2 text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                >
                  <Icon weight="bold" className="size-4" />
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>

          <p className="hidden font-mono text-xs text-foreground/50 lg:block">
            {format(content.footer.rights, { year: new Date().getFullYear() })}
          </p>
        </aside>

        {/* Main content — a bordered "page on a table" with a faint grid. */}
        <main className="min-w-0 flex-1">
          <div className="grid-bg rounded-base border-4 border-border bg-secondary-background shadow-shadow">
            <div className="px-5 py-8 sm:px-10 sm:py-12">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
