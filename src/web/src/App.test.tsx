import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { PAGES } from './apps/registry';
import { getAllPosts } from './lib/posts';
import { content } from './content';

/**
 * Deep-link smoke tests: mount the real route tree at a given URL and assert the
 * page renders.
 *
 * This is the client half of the bug that started this work. CloudFront's
 * rewrite (infra/lib/cloudfront/spa-routing.ts) gets a hard request for
 * `/resume` as far as `index.html`; from there it is react-router's job to
 * resolve the path. These tests cover that second half — including the `*`
 * fallback, which was unreachable before the rewrite existed and so had never
 * rendered in production.
 */

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('deep links into nav routes', () => {
  it.each(PAGES.map((page) => [page.path, page.id]))('renders a page at %s (%s)', (path) => {
    renderAt(path);

    // Every page component owns exactly one h1. Asserting structure rather
    // than copy keeps this suite from breaking on every content edit.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders the shared layout nav on a deep link, not just on /', () => {
    renderAt('/resume');

    for (const page of PAGES) {
      expect(screen.getByRole('link', { name: page.title })).toBeDefined();
    }
  });
});

describe('the parameterized post route', () => {
  it('renders a real post by slug', () => {
    const post = getAllPosts()[0];
    expect(post).toBeDefined();

    renderAt(`/blog/${post!.slug}`);

    expect(screen.getByRole('heading', { level: 1, name: post!.title })).toBeDefined();
  });

  it('shows a not-found message for an unknown slug', () => {
    // A published URL whose post was later renamed or unpublished.
    renderAt('/blog/no-such-post');

    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeDefined();
  });
});

describe('the catch-all route', () => {
  it('renders the 404 page for an unknown path', () => {
    renderAt('/definitely-not-a-page');

    expect(screen.getByRole('heading', { level: 1, name: content.notFound.heading })).toBeDefined();
  });

  it('offers a way back to a real page', () => {
    // A 404 with no exit is how you lose a visitor who mistyped a URL.
    renderAt('/definitely-not-a-page');

    expect(screen.getByRole('link', { name: content.notFound.backHome })).toBeDefined();
  });
});
