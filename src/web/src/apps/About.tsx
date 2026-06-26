import { Link, NavLink } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { content } from '../content';
import { formatPostDate, getAllPosts } from '@/lib/posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const { about } = content;

export function About() {
  const latestPost = getAllPosts()[0];

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <span className="inline-block rounded-base border-2 border-border bg-main px-3 py-1 font-heading text-sm text-main-foreground shadow-shadow">
          {about.eyebrow}
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl">{about.heading}</h1>
        <p className="max-w-xl text-lg">{about.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <NavLink to="/projects">
              {about.ctaProjects}
              <ArrowRight weight="bold" />
            </NavLink>
          </Button>
          <Button asChild variant="neutral">
            <NavLink to="/contact">{about.ctaContact}</NavLink>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="bg-secondary-background">
          <CardHeader>
            <CardTitle>{about.currently.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {about.currently.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-secondary-background">
          <CardHeader>
            <CardTitle>{about.latestPost.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {latestPost ? (
              <div className="space-y-3">
                <Button
                  asChild
                  className="h-auto w-full justify-between whitespace-normal py-3 text-left"
                >
                  <Link to={`/blog/${latestPost.slug}`}>
                    {latestPost.title}
                    <ArrowRight weight="bold" />
                  </Link>
                </Button>
                <p className="font-mono text-xs text-foreground/60">
                  {formatPostDate(latestPost.date)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-foreground/70">{about.latestPost.empty}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
