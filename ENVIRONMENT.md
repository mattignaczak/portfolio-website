# Environment & Secrets

Environment variables live in per-environment files **at the repo root** that are
**local only and gitignored**. The repo commits only `.env.example` as documentation.
There is a **single** copy per environment — `infra/` does not keep its own; CDK reads
the root file (see "How env vars reach CDK" below).

```
.env.sandbox    # gitignored, local only  (REPO ROOT — the only copy)
.env.staging    # gitignored, local only
.env.prod       # gitignored, local only
.env.test       # gitignored, local only
.env.example    # COMMITTED — template, no real values
```

Valid environments are defined in `infra/cdk-config.ts`: `prod | staging | sandbox | test`.
Each `.env.<environment>` sets `DEPLOY_ENV` to its own name, which `cdk-config.ts`
reads to select the deployment target.

## How env vars reach CDK

`cdk` spawns its own Node process, so `node --env-file` on the parent wouldn't
propagate. There are two supported entry points, and `cdk-config.ts` is written to
work with both:

**1. Root npm scripts (the usual path).** They **export** the file into the shell
environment, which child processes (cdk → ts-node → `cdk-config.ts`) inherit:

```json
"deploy:prod": "set -a; . ./.env.prod; set +a; npm run deploy"
```

`set -a` marks every variable defined next for export; `. ./.env.prod` sources the
file; `set +a` turns that off again.

**2. Running `cdk` directly from `infra/`.** Set just `DEPLOY_ENV` and invoke cdk:

```bash
DEPLOY_ENV=sandbox npx cdk deploy      # from infra/
```

`cdk-config.ts` then `dotenv`-loads the **root** `../.env.<DEPLOY_ENV>` to pull in
`SITE_DOMAIN_NAME` / `ACM_CERT_ARN` — so there's no need for a duplicate `infra/.env`.
`DEPLOY_ENV` is the one variable you must supply; everything else comes from the file.
`dotenv` never overrides a variable already set, so path #1's exported values always
win and the two paths never conflict.

> Note: path #1 uses POSIX shell (`.`/`set -a`), so it runs on macOS/Linux. On Windows
> use WSL or Git Bash, or use path #2 (`DEPLOY_ENV=… npx cdk …`).

## Daily commands

```bash
npm run synth            # cdk synth using .env.sandbox
npm run diff:prod        # cdk diff against prod
npm run deploy:sandbox   # build web + cdk deploy (sandbox)
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

## DNS & TLS (manual prerequisites)

Route 53 hosted zones and ACM certificates are **created and managed manually,
outside this CDK app**. The stack consumes them by reference only — it looks the
certificate up by ARN (`ACM_CERT_ARN`) and never creates a hosted zone, record,
or cert. This is deliberate: hosted zones and public certs are long-lived,
account-level resources whose accidental replacement (e.g. a `cdk destroy`) would
drop DNS or force domain re-validation. Keeping them out of the stack means a
torn-down environment can be rebuilt without re-issuing certs or re-delegating DNS.

Per environment you must provision, by hand, before `cdk deploy`:

1. **A Route 53 hosted zone** for the environment's domain (`SITE_DOMAIN_NAME`):
   - prod → `mattignaczak.xyz` (the apex / top-level domain itself)
   - staging → `staging.mattignaczak.xyz`
   - sandbox → `sandbox.mattignaczak.xyz`
2. **An ACM certificate** covering that domain **and** its `www.` alias (e.g.
   `staging.mattignaczak.xyz` + `www.staging.mattignaczak.xyz`), validated via DNS.
   - It **must** be issued in `us-east-1` — CloudFront only reads certificates from
     that region, regardless of where anything else lives.
   - Put its ARN in the matching `.env.<environment>` as `ACM_CERT_ARN`.

### NS delegation to the top-level domain

The subdomain hosted zones (`staging.…`, `sandbox.…`) are only reachable if the
**top-level domain delegates to them**. When you create a subdomain hosted zone,
Route 53 assigns it four `NS` nameservers. Copy those into an `NS` record **in the
apex `mattignaczak.xyz` hosted zone**, named for the subdomain:

```
# In the mattignaczak.xyz hosted zone:
staging.mattignaczak.xyz.   NS   ns-aaa.awsdns-xx.com.  ns-bbb.awsdns-yy.net.  ...
sandbox.mattignaczak.xyz.   NS   ns-ccc.awsdns-zz.org.  ns-ddd.awsdns-ww.co.uk. ...
```

Without this delegation record, the subdomain resolves nowhere even though its
hosted zone and cert exist. The apex zone itself (`mattignaczak.xyz`) is delegated
one level up at the **registrar**, whose nameservers must point at the apex hosted
zone's four `NS` records.

## Setting up on another laptop

Because the real `.env.*` files are gitignored, a fresh clone has only `.env.example`.
Recreate the env files:

```bash
git clone <repo> && cd portfolio-website && npm install
cp .env.example .env.sandbox    # then set DEPLOY_ENV=sandbox (+ any other values)
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
