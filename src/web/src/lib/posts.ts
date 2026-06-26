import { load as parseYaml } from 'js-yaml';

/**
 * A single blog post, parsed from a markdown file in `src/content/posts/`.
 *
 * Publishing is git-based: drop a `*.md` file in that folder, commit, deploy.
 * Vite inlines every post at build time (see `RAW` below) — there is no runtime
 * fetch and no backend.
 */
export interface Post {
  slug: string;
  title: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  description: string;
  tags: string[];
  /** Drafts are authored in-repo but hidden from the published list. */
  draft: boolean;
  /** Markdown body with the frontmatter block stripped. */
  body: string;
  /** Rough read-time estimate, in minutes (≈200 wpm). */
  readingMinutes: number;
}

/** Shape of the YAML frontmatter block. All fields optional until validated. */
interface Frontmatter {
  title?: string;
  date?: string | Date;
  description?: string;
  tags?: string[];
  draft?: boolean;
}

/**
 * Eagerly import the raw text of every post. `import.meta.glob` is Vite-only:
 * the glob is resolved at build time, so each match is bundled as a string and
 * a missing file simply isn't in the map.
 */
const RAW = import.meta.glob<string>('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** `---\n<yaml>\n---\n<body>` — captures the frontmatter and the body. */
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const WORDS_PER_MINUTE = 200;

function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '');
}

/** js-yaml turns an unquoted `YYYY-MM-DD` into a Date; normalize back to ISO. */
function normalizeDate(value: string | Date | undefined): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ?? '';
}

function parsePost(path: string, raw: string): Post {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    throw new Error(`Post "${path}" is missing a \`---\` frontmatter block.`);
  }
  const frontmatter = match[1] ?? '';
  const body = match[2] ?? '';
  const meta = (parseYaml(frontmatter) ?? {}) as Frontmatter;
  const slug = slugFromPath(path);

  if (!meta.title) {
    throw new Error(`Post "${path}" is missing a \`title\` in its frontmatter.`);
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: meta.title,
    date: normalizeDate(meta.date),
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    draft: meta.draft ?? false,
    body,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
  };
}

/** Every post in the repo, in arbitrary order (drafts included). */
const ALL_POSTS: Post[] = Object.entries(RAW).map(([path, raw]) => parsePost(path, raw));

/**
 * The posts to show on the blog index: published, newest first.
 *
 * "Published" excludes drafts and future-dated posts — a post dated in the
 * future stays hidden until that day, which gives this static site simple
 * scheduling (commit early; it appears on its date). Returns a fresh array so
 * the module-level `ALL_POSTS` is never mutated.
 */
export function getAllPosts(): Post[] {
  const today = new Date().toISOString().slice(0, 10);
  return ALL_POSTS.filter((post) => !post.draft && post.date <= today).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/** Look up one post by slug (used by the `/blog/:slug` route). */
export function getPostBySlug(slug: string): Post | undefined {
  return ALL_POSTS.find((post) => post.slug === slug);
}

/** Format an ISO date for display, e.g. `Jun 24, 2026`. */
export function formatPostDate(iso: string): string {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
