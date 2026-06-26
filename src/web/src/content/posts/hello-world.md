---
title: Building a Static Blog on S3 + CloudFront
date: 2026-06-24
description: How this blog publishes with nothing but a git commit — no backend, no database, no CMS.
tags: [aws, react, vite]
draft: false
---

This site has no backend. So how does a blog post get "published"? The trick is
that **a committed markdown file _is_ the database**.

## Build-time content

Vite's `import.meta.glob` resolves at build time, inlining every post as a string:

```ts
const RAW = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
```

There's no runtime fetch — the bundle ships with the posts baked in, and
CloudFront serves them as static assets.

## Why plain markdown

A few reasons it beats a CMS for a personal site:

- **Version control is the audit log** — every edit is a diff.
- **No moving parts** to break, secure, or pay for.
- Posts are just text, so they outlive any tool.

> The best backend is the one you don't have to run.

| Concern        | CMS            | Markdown in git |
| -------------- | -------------- | --------------- |
| Hosting cost   | Server / DB    | Pennies on S3   |
| Publish flow   | Admin UI       | `git push`      |

That's the whole pipeline. Write, commit, deploy.
