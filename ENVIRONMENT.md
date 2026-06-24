# Environment & Secrets

Environment variables live in per-environment files that are **local only and
gitignored**. The repo commits only `.env.example` as documentation. No env-management
dependency is used — the npm scripts source the right file before running CDK, and
Node 22 / GitHub Actions handle the rest.

```
.env.dev        # gitignored, local only
.env.staging    # gitignored, local only
.env.prod       # gitignored, local only
.env.test       # gitignored, local only
.env.example    # COMMITTED — template, no real values
```

Valid environments are defined in `infra/cdk-config.ts`: `prod | staging | dev | test`.
Each `.env.<environment>` sets `DEPLOY_ENV` to its own name, which `cdk-config.ts`
reads to select the deployment target.

## How env vars reach CDK

`cdk` spawns its own Node process, so `node --env-file` on the parent wouldn't
propagate. Instead the npm scripts **export** the file into the shell environment,
which child processes (cdk → ts-node → `cdk-config.ts`) inherit:

```json
"deploy:prod": "set -a; . ./.env.prod; set +a; npm run deploy"
```

`set -a` marks every variable defined next for export; `. ./.env.prod` sources the
file; `set +a` turns that off again. No code imports anything — `cdk-config.ts` just
reads `process.env.DEPLOY_ENV`.

> Note: this uses POSIX shell (`.`/`set -a`), so it runs on macOS/Linux. On Windows
> use WSL or Git Bash.

## Daily commands

```bash
npm run synth            # cdk synth using .env.dev
npm run diff:prod        # cdk diff against prod
npm run deploy:dev       # build web + cdk deploy (dev)
npm run deploy:staging
npm run deploy:prod
```

## Adding a variable

1. Add it to `.env.example` (with an empty/example value) so it's documented.
2. Add the real value to each `.env.<environment>` that needs it.
3. Use it in code via `process.env.MY_VAR`.

**Secrets do not belong in these files for anything you'd deploy from CI.** They're
fine locally, but the moment a secret needs to exist in CI or production, use one of:

- **GitHub Actions secrets** — for values CI needs at deploy time (see below).
- **AWS SSM Parameter Store / Secrets Manager** — for values the running app needs.
  Reference them in the CDK stack so they never touch git or `.env`:
  ```ts
  ssm.StringParameter.valueForStringParameter(this, '/portfolio/prod/some-key');
  ```

Also remember: anything read via `process.env` in `cdk-config.ts` is baked into the
synthesized CloudFormation template. Keep that to non-secret config only.

## Setting up on another laptop

Because the real `.env.*` files are gitignored, a fresh clone has only `.env.example`.
Recreate the env files:

```bash
git clone <repo> && cd portfolio-website && npm install
cp .env.example .env.dev    # then set DEPLOY_ENV=dev (+ any other values)
# repeat for .env.staging / .env.prod / .env.test as needed
```

If/when these files hold real values you want to carry between machines, store them
in your password manager (1Password secure note, etc.) and paste them in — never
commit them, never send them over chat/email.

## GitHub Actions / CI

CI does not use the `.env.*` files at all. Set values directly in the workflow:
non-secret config via repository **variables**, secrets via repository **secrets**.

```yaml
# .github/workflows/deploy.yml (sketch)
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write      # AWS OIDC — no long-lived AWS keys
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<acct>:role/<deploy-role>
          aws-region: us-east-1
      - run: npm run deploy        # not deploy:prod — env comes from CI, not a file
        env:
          DEPLOY_ENV: prod
          # SOME_SECRET: ${{ secrets.SOME_SECRET }}
```

Pair this with an IAM role that trusts GitHub's OIDC provider so CI holds no
long-lived AWS credentials.
