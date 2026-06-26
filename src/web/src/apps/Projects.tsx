import { useState, type ComponentType, type KeyboardEvent } from 'react';
import { AppleLogo, Globe, GooglePlayLogo, type IconProps } from '@phosphor-icons/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { content } from '../content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const { projects } = content;

// Maps a link's `kind` (from the content dictionary) to its icon.
const LINK_ICON: Record<'website' | 'appstore' | 'playstore', ComponentType<IconProps>> = {
  website: Globe,
  appstore: AppleLogo,
  playstore: GooglePlayLogo,
};

// Image-panel backgrounds, one per project (by order). The PLACE alarm is white, so
// it gets a dark slate to pop; the dark eSight devices sit on bold accent colors.
const PANELS = ['bg-[#1f2937]', 'bg-chart-4', 'bg-chart-5', 'bg-chart-2'];
const panelFor = (i: number) => PANELS[i % PANELS.length] ?? 'bg-secondary-background';

type Project = (typeof projects.items)[number];

function StoreLinks({ links }: { links: Project['links'] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = LINK_ICON[link.kind];
        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-main px-3 py-1.5 text-sm font-base text-main-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
          >
            <Icon weight="bold" className="size-4" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

// App icons are square; device renders are wide. Tile the icon like an app, contain the rest.
function ProjectImage({
  project,
  panel,
  large,
}: {
  project: Project;
  panel: string;
  large?: boolean;
}) {
  const isIcon = project.image.includes('companion');
  return (
    <div
      className={cn(
        'flex items-center justify-center border-b-2 border-border',
        panel,
        large ? 'h-56 p-8' : 'h-52 p-6',
      )}
    >
      <img
        src={project.image}
        alt={project.imageAlt}
        loading="lazy"
        className={cn(
          'object-contain [filter:drop-shadow(4px_4px_0_rgba(0,0,0,0.3))]',
          isIcon ? 'aspect-square h-full rounded-2xl border-2 border-border' : 'max-h-full w-auto',
        )}
      />
    </div>
  );
}

export function Projects() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const active = activeIdx == null ? null : projects.items[activeIdx];

  // Keyboard parity for the clickable cards (mouse onClick already opens the modal).
  function handleCardKey(event: KeyboardEvent<HTMLDivElement>, index: number) {
    // TODO(human): when event.key is 'Enter' or ' ' (Space), call setActiveIdx(index)
    // to open the modal, and event.preventDefault() so Space doesn't scroll the page.
    void event;
    void index;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl">{projects.heading}</h1>

      <div className="grid gap-6">
        {projects.items.map((project, i) => (
          <Card
            key={project.name}
            role="button"
            tabIndex={0}
            aria-label={`${project.name} — view details`}
            onClick={() => setActiveIdx(i)}
            onKeyDown={(e) => handleCardKey(e, i)}
            className="cursor-pointer overflow-hidden bg-secondary-background transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none focus-visible:outline-none focus-visible:translate-x-boxShadowX focus-visible:translate-y-boxShadowY focus-visible:shadow-none"
          >
            {project.image ? <ProjectImage project={project} panel={panelFor(i)} /> : null}

            <CardHeader>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li key={t}>
                    <Badge variant="neutral">{t}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={active != null} onOpenChange={(open) => !open && setActiveIdx(null)}>
        <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0">
          {active ? (
            <>
              {active.image ? (
                <ProjectImage project={active} panel={panelFor(activeIdx ?? 0)} large />
              ) : null}
              <div className="space-y-5 p-6">
                <DialogHeader>
                  <DialogTitle>{active.name}</DialogTitle>
                  <DialogDescription>{active.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm [&_a]:underline [&_li]:mt-1 [&_strong]:font-heading [&_ul]:list-disc [&_ul]:pl-5">
                  <Markdown remarkPlugins={[remarkGfm]}>{active.details}</Markdown>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {active.tech.map((t) => (
                    <li key={t}>
                      <Badge variant="neutral">{t}</Badge>
                    </li>
                  ))}
                </ul>

                <StoreLinks links={active.links} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
