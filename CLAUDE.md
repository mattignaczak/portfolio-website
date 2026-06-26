# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal portfolio site for a software-developer job search, built on AWS to
showcase modern AWS + TypeScript patterns. The site itself is a conventional
**multi-page portfolio** (About / Projects / Blog / Resume / Contact) styled with
**neobrutalism.dev** components — a terminal/dev-minimalist look: thick borders,
hard offset shadows, a blue accent, and JetBrains Mono throughout, with a
light/dark mode toggle.

> History: this started as a "retro Windows desktop" concept (98.css, draggable
> windows, taskbar). That was **scrapped** on 2026-06-23 in favor of the
> neobrutalism multi-page site. If you find any 98.css / WindowManager / desktop
> references, they are stale.

## Architecture

- `src/web` — React 19 SPA (Vite, react-router-dom, Tailwind v4, neobrutalism/shadcn UI), hosted on S3 + CloudFront. Includes a build-time **markdown blog** (no backend) and a centralized **content/copy layer** for all user-facing strings.
- `src/api` — placeholder for a planned Lambda backend (e.g. contact-form handler); **currently empty**
- `infra` — CDK defining all infrastructure: CloudFront distribution, S3 bucket (and API Gateway + Lambdas when the backend lands)

## Configuration & DNS

Stage-varying config (domain, cert ARN) is **not hardcoded** in the stack — it flows
in from `.env.<environment>` files through `infra/cdk-config.ts`, which reads
`process.env` (populated by the `set -a; . ./.env.<env>` deploy scripts). Add new
stage-specific values via `cdk-config.ts`'s `requireEnv(name)` helper, which fails
fast at synth if the var is missing.

Route 53 hosted zones and ACM certificates are **created and managed manually,
outside the CDK app** — the stack references the cert by ARN (`ACM_CERT_ARN`) and
never creates DNS or cert resources. This keeps long-lived, account-level resources
safe from `cdk destroy`. Key rules:

- One hosted zone + cert per environment: prod = `mattignaczak.xyz` (apex), staging
  = `staging.mattignaczak.xyz`, sandbox = `sandbox.mattignaczak.xyz`.
- ACM certs **must** be issued in `us-east-1` (CloudFront requirement) and cover both
  the domain and its `www.` alias.
- Subdomain hosted zones require an `NS` delegation record in the apex
  `mattignaczak.xyz` zone, or they resolve nowhere.

CI/CD authenticates to AWS via GitHub OIDC (no static keys) — one deploy role per
account, bootstrapped by a standalone CDK app. See
`infra/lib/GITHUB_OIDC.md` for the per-account deploy runbook and GitHub wiring.

See `ENVIRONMENT.md` for the full DNS/TLS setup and env-var workflow.

## CI/CD pipeline

`.github/workflows/ci-cd.yml` runs on every push and PR. It has one **test** job
(no AWS access) followed by **stage-gated deploy** jobs that assume the OIDC role
via the `.github/actions/deploy-cdk` composite action:

- `test` → `npm ci`, `build:web` (also type-checks the frontend), `format:check`,
  `lint`, `tsc --noEmit` in `infra`, then `npm test -w infra` (synth-only
  assertions + the **cdk-nag** security gate; `test/setup.ts` injects test-only
  `DEPLOY_ENV`/domain/cert values, so no secrets are needed).
- **push** → deploy **sandbox**; **pull_request** → deploy **staging**;
  **push to `main`** → deploy **prod**, gated behind the `production` GitHub
  Environment's required-reviewer rule (the manual promotion gate).
- Deploys never auto-cancel (`cancel-in-progress: false`) and are serialized
  per-environment — cancelling mid-deploy can strand CloudFormation in
  `UPDATE_IN_PROGRESS`. Stage config (`SITE_DOMAIN_NAME`, `ACM_CERT_ARN`,
  `AWS_DEPLOY_ROLE_ARN`) comes from GitHub Environment **vars**, not secrets.
- Dependency bumps are automated via `.github/dependabot.yml`.

## Structure

```
infra/       # AWS CDK infrastructure (bin/, lib/, test/, cdk.json)
src/
  api/       # Backend API
  web/       # Frontend
```

npm workspaces — root `package.json` covers `infra` and `src/*`. Always run `npm install` from the root.

## Environment

Devcontainer (Node 24, Debian Trixie). `~/.aws` is bind-mounted so local AWS credentials are available automatically.

Per-environment config lives in `.env.<environment>` files (`sandbox`, `staging`, `prod`, `test`) that are **local only and gitignored** — only `.env.example` is committed, as a template. No env-management dependency is used; the deploy/synth npm scripts source the right file into the shell before running CDK. See `ENVIRONMENT.md` for the full workflow.

## Commands

### Dependencies
```bash
npm install                   # run from root to install all workspaces
```

### Env vars
Each deploy/synth script sources its `.env.<environment>` file into the shell
(`set -a; . ./.env.<env>; set +a`) so the child CDK process inherits the vars.
```bash
npm run synth                 # cdk synth using .env.sandbox
npm run diff:prod             # cdk diff against prod
npm run deploy:sandbox        # build web + cdk deploy (sandbox)
npm run deploy:staging        # deploy (staging)
npm run deploy:prod           # deploy (prod)
```

### Web (run from src/web/)
```bash
npm run dev                   # Vite dev server (http://127.0.0.1:5173)
npm run build                 # tsc --noEmit && vite build → dist/
npm run typecheck             # tsc --noEmit only
npm run preview               # serve the production build locally
```

### Linting and formatting (run from root)
```bash
npm run lint                  # ESLint across all workspaces
npm run lint:fix              # ESLint with --fix
npm run format:check          # Prettier check across all workspaces
npm run format                # Prettier write across all workspaces
```

ESLint config lives in `infra/eslint.config.mjs` (flat config, `recommendedTypeChecked`). Pre-commit hook runs lint-staged on staged `**/*.ts` files via Husky.

### CDK (run from infra/)
```bash
npm run build                 # compile TypeScript
npm test                      # jest tests
npx cdk synth                 # emit CloudFormation template
npx cdk diff                  # diff against deployed stack
npx cdk deploy                # deploy to AWS
npx cdk deploy --hotswap      # fast deploy for Lambda/ECS changes
npx cdk bootstrap             # one-time account bootstrap (first deploy only)
```

## Frontend (src/web)

- **Stack:** React 19 + Vite, `react-router-dom` for routing, Tailwind v4, and
  **neobrutalism.dev** components (a shadcn-compatible registry).
- **Routing:** nav pages are registered in `src/apps/registry.tsx` (`PAGES` array:
  `{ id, title, path, component }`, with `title` pulled from `content.nav.*`).
  `App.tsx` maps `PAGES` to `<Route>`s under a shared `Layout`; `Layout.tsx`
  renders the nav + footer + `<Outlet/>`. To add a nav page: create the component
  under `src/apps/`, then add one entry to `PAGES`. The parameterized blog-detail
  route (`/blog/:slug`, rendered by `BlogPost`) is **not** in `PAGES` — it isn't a
  nav link, so it's wired directly in `App.tsx`.
- **Content & copy:** every user-facing string lives in `src/web/src/content/en.ts`
  (`site`, `nav`, `socials`, `footer`, per-page blocks), re-exported as `content`
  from `src/content/index.ts`. This is the single source of truth — edit copy
  there, not inline in components (e.g. `Layout.tsx`'s `SOCIALS` just attaches
  icons to `content.socials`). It's plain typed objects, no i18n lib yet: the
  `Content` type is derived from `en`, so a future `fr.ts` must satisfy the same
  shape or the build fails. Dynamic strings use `{token}` placeholders resolved by
  `format()` (e.g. the footer year) — never template-literal interpolation, so word
  order stays translatable.
- **Blog:** a backend-less, git-based blog. Posts are markdown files in
  `src/web/src/content/posts/*.md` with YAML frontmatter
  (`title`, `date`, `description`, `tags`, `draft`). `src/lib/posts.ts` inlines them
  at build time via Vite's `import.meta.glob('…/*.md', { query: '?raw', eager: true })`
  — there is no runtime fetch. Publishing = drop a `.md` file, commit, deploy.
  `draft: true` and **future-dated** posts are hidden from the index, which gives
  simple commit-ahead scheduling (a post appears on its `date`). Read-time is
  estimated at ~200 wpm. A post missing frontmatter or a `title` throws at build.
- **UI components** live in `src/components/ui/` and come from the neobrutalism
  registry. Add more with the shadcn CLI — **do not hand-write them**:
  ```bash
  npx shadcn@latest add https://www.neobrutalism.dev/r/<name>.json --overwrite
  ```
  `cn()` (clsx + tailwind-merge) lives in `src/lib/utils.ts`.
- **Theming:** the design tokens live in `src/web/src/index.css` — neobrutalism
  CSS variables in `:root` / `.dark`, mapped to Tailwind utilities via
  `@theme inline`. Style with theme tokens (`bg-main`, `text-foreground`,
  `text-main-foreground`, `border-border`, `shadow-shadow`, `bg-secondary-background`,
  `rounded-base`), **never hardcoded colors**. The signature neobrutalism press
  effect is `shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none`.
- **Tailwind v4 is CSS-first:** there is no `tailwind.config.js`. `@import 'tailwindcss';`
  at the top of `index.css` is required (it's also what tooling uses to detect Tailwind).
- **Dark mode:** toggled by adding/removing `.dark` on `<html>`. `ThemeToggle.tsx`
  flips the class and persists to `localStorage`; an inline script in `index.html`
  applies the stored/preferred theme **before first paint** to avoid a flash. Don't
  add a second source of truth.
- **`@/` path alias** (`@/* → src/*`) must stay in sync in **both**
  `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`) — TS uses one
  for type-checking, Vite the other for bundling.

## Conventions & best practices

- **Always `npm install` from the root** (npm workspaces hoists deps).
- **Before committing**, run `npm run lint` and `npm run format:check` from root,
  and `npm run typecheck -w web`. The web/infra tsconfigs are strict
  (`noUnusedLocals` + `noUnusedParameters`), so unused vars/params are **hard
  errors**, not warnings — finish or remove placeholder code before it lands.
- **Don't leave `TODO(human)` stubs in committed code** — an empty stub with an
  unused parameter will fail typecheck and lint.
- **Infra build artifacts:** `npm run build -w infra` (`tsc`) emits `.js`/`.d.ts`
  next to the source (they're gitignored, and tests run via ts-jest with no
  emit). If a build leaves them behind, they'll trip `format:check`; remove them
  (`git clean -fdX` in `infra/`) rather than formatting them.
- **Security — GitHub OIDC:** the deploy-role trust policy
  (`infra/lib/github-oidc-stack.ts`) must pin **both** the `aud` and the `sub`
  claim with `StringEquals` (exact match, no wildcards) so only this repo's
  specific GitHub Environment can assume the role.
- **Copy, socials, and profile links** are centralized in
  `src/web/src/content/en.ts` (`socials`, `site`, …) — `Layout.tsx` only attaches
  icons to `content.socials`. The resume download expects a file at
  `src/web/public/resume.pdf` (served at `/resume.pdf`); update it from the LaTeX
  source in the separate `resume-builder` project, never by hand-editing the PDF.
- **Security — cdk-nag:** `infra/test/nag.test.ts` runs cdk-nag against the synth'd
  stack as a CI gate. New infra must pass it (or carry a justified, narrowly-scoped
  suppression) — don't loosen the rules to make a deploy go green.
- **Supply-chain cooldown:** `.npmrc` sets `min-release-age=7` (needs npm ≥ 11), so
  `npm install <pkg>`/`npm update` won't resolve a version published < 7 days ago.
  `npm ci` installs the lockfile verbatim and is unaffected. If a brand-new release
  won't resolve, that's the cooldown, not a broken dep.
