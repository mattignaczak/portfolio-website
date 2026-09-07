import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatPostDate, getAllPosts, getPostBySlug, parsePost } from './posts';

/**
 * Two layers, because they fail differently.
 *
 * `parsePost` is exercised against fixtures: its error paths throw at *build*
 * time, so a bad post breaks `vite build`, not the browser — the fastest way to
 * find that out is here rather than in CI.
 *
 * `getAllPosts` is exercised against the real corpus in `content/posts/`, which
 * is what actually ships. Assertions are invariants rather than exact counts, so
 * publishing a post doesn't turn the suite red.
 */

const VALID = `---
title: A Post
date: 2026-01-15
description: Something short.
tags: [aws, testing]
draft: false
---

Body text here.`;

describe('parsePost', () => {
  it('reads frontmatter and derives the slug from the filename', () => {
    const post = parsePost('../content/posts/a-post.md', VALID);

    expect(post.slug).toBe('a-post');
    expect(post.title).toBe('A Post');
    expect(post.description).toBe('Something short.');
    expect(post.tags).toEqual(['aws', 'testing']);
    expect(post.draft).toBe(false);
    expect(post.body.trim()).toBe('Body text here.');
  });

  it('normalizes an unquoted date back to an ISO string', () => {
    // js-yaml parses a bare YYYY-MM-DD into a Date. Left alone it would
    // serialize as a full timestamp and break the `date <= today` comparison
    // that drives scheduled publishing.
    expect(parsePost('x/a.md', VALID).date).toBe('2026-01-15');
    expect(typeof parsePost('x/a.md', VALID).date).toBe('string');
  });

  it('defaults optional frontmatter fields', () => {
    const minimal = parsePost('x/b.md', '---\ntitle: Bare\n---\n\nWords.');

    expect(minimal.description).toBe('');
    expect(minimal.tags).toEqual([]);
    expect(minimal.draft).toBe(false);
    expect(minimal.date).toBe('');
  });

  it('throws when the frontmatter block is missing', () => {
    // Fails the build rather than shipping a post with no title or date.
    expect(() => parsePost('x/c.md', 'Just a body, no fence.')).toThrow(/frontmatter/);
  });

  it('throws when the title is missing', () => {
    expect(() => parsePost('x/d.md', '---\ndate: 2026-01-01\n---\n\nBody.')).toThrow(/title/);
  });

  it('estimates read time at ~200 wpm, never below one minute', () => {
    const long = `---\ntitle: Long\n---\n\n${'word '.repeat(1000)}`;
    expect(parsePost('x/e.md', long).readingMinutes).toBe(5);

    // A near-empty post must still read as "1 min", not "0 min".
    expect(parsePost('x/f.md', '---\ntitle: Tiny\n---\n\nHi.').readingMinutes).toBe(1);
  });
});

describe('getAllPosts', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns posts from the real content directory', () => {
    // Guards the Vite `import.meta.glob` wiring: if the glob path ever drifts,
    // it silently resolves to nothing and the blog renders empty.
    expect(getAllPosts().length).toBeGreaterThan(0);
  });

  it('gives every post the fields the blog templates read', () => {
    for (const post of getAllPosts()) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
    }
  });

  it('sorts newest first', () => {
    const dates = getAllPosts().map((post) => post.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('excludes drafts', () => {
    expect(getAllPosts().every((post) => !post.draft)).toBe(true);
  });

  it('hides a post until its date arrives', () => {
    // Commit-ahead scheduling: a future-dated post stays out of the index until
    // the day it is dated. Freeze the clock just before the newest post.
    const newest = getAllPosts()[0];
    expect(newest).toBeDefined();

    const dayBefore = new Date(`${newest!.date}T00:00:00Z`);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);

    vi.useFakeTimers();
    vi.setSystemTime(dayBefore);

    expect(getAllPosts().some((post) => post.slug === newest!.slug)).toBe(false);
  });

  it('returns a fresh array so callers cannot mutate the module cache', () => {
    const first = getAllPosts();
    first.length = 0;

    expect(getAllPosts().length).toBeGreaterThan(0);
  });
});

describe('getPostBySlug', () => {
  it('finds a post that exists', () => {
    const slug = getAllPosts()[0]?.slug;
    expect(slug).toBeDefined();
    expect(getPostBySlug(slug!)?.slug).toBe(slug);
  });

  it('returns undefined for an unknown slug', () => {
    // Drives the "Post not found" branch of the /blog/:slug route.
    expect(getPostBySlug('no-such-post')).toBeUndefined();
  });
});

describe('formatPostDate', () => {
  it('renders an ISO date in the blog display format', () => {
    expect(formatPostDate('2026-06-24')).toBe('Jun 24, 2026');
  });

  it('parses as local time, not UTC', () => {
    // `new Date('2026-06-24')` is UTC midnight and renders as the 23rd in any
    // negative-offset timezone. The `T00:00:00` suffix is what prevents that.
    expect(formatPostDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('returns an empty string for a post with no date', () => {
    expect(formatPostDate('')).toBe('');
  });
});
