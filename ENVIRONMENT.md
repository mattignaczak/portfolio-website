# Environment & Secrets (dotenvx)

This project manages environment variables with [dotenvx](https://dotenvx.com).
Each environment has its own **encrypted** file that is committed to git; the
private keys that decrypt them are **never** committed.

```
.env.dev        # committed — values are ciphertext (DEPLOY_ENV=dev, …)
.env.staging    # committed — ciphertext
.env.prod       # committed — ciphertext
.env.test       # committed — ciphertext
.env.example    # committed — plaintext template, no real values
.env.keys       # GITIGNORED — the private keys (DOTENV_PRIVATE_KEY_*)
```

Valid environments are defined in `infra/cdk-config.ts`: `prod | staging | dev | test`.
Each `.env.<environment>` sets `DEPLOY_ENV` to its own name, which `cdk-config.ts`
reads to select the deployment target.

## How it works

- `dotenvx encrypt` encrypts each value with a per-file public key (stored at the
  top of the file) and writes the matching private key to `.env.keys`.
- A committed `.env.prod` therefore only ever contains `encrypted:…` values — safe
  to push, even to a public repo.
- To **read** the values, dotenvx needs the private key, which it finds either in
  `.env.keys` (local) or in a `DOTENV_PRIVATE_KEY_<ENV>` environment variable (CI).
- Nothing imports dotenv in code anymore. Env vars are injected at the CLI layer by
  the `dotenvx run -f …` wrappers in `package.json`, so they propagate to the CDK
  child process automatically.

## Daily commands

```bash
npm run synth            # cdk synth using .env.dev
npm run diff:prod        # cdk diff against prod
npm run deploy:dev       # build web + cdk deploy (dev)
npm run deploy:staging
npm run deploy:prod
```

Each wrapper is `dotenvx run -f .env.<env> -- npm run <cdk command>`.

## Editing values / adding a secret

1. Decrypt the file you want to edit (needs `.env.keys`):
   ```bash
   npm run env:decrypt           # decrypts all .env.<env> files in place
   ```
2. Edit the plaintext value(s) in e.g. `.env.prod`.
3. Re-encrypt before committing:
   ```bash
   npm run env:encrypt
   ```

You can also append a new key while encrypted — dotenvx will encrypt just that key
on the next `npm run env:encrypt`. The husky pre-commit hook runs
`dotenvx ext precommit`, which **blocks the commit** if any `.env` value would land
in git as plaintext.

> Never feed a decrypted secret into a CDK construct prop as a literal — it would be
> baked into the CloudFormation template. For runtime secrets use AWS Secrets Manager
> / SSM SecureString and reference them in the stack instead.

## Setting up on another laptop

1. Clone the repo and `npm install`.
2. Get the private keys. Either:
   - copy `.env.keys` from your password manager into the repo root, **or**
   - export the keys as shell env vars (`DOTENV_PRIVATE_KEY_PROD=…`, etc.).
3. That's it — `npm run deploy:prod` (or any wrapper) will decrypt and run.

`.env.keys` is the only thing you must transfer out-of-band. Store it in your
password manager (1Password, etc.), not in git, not in chat, not in email.

## GitHub Actions / CI

Store each environment's private key as a GitHub Actions **secret**
(`DOTENV_PRIVATE_KEY_PROD`, `DOTENV_PRIVATE_KEY_STAGING`, …). dotenvx picks it up
from the environment automatically — no `.env.keys` file needed in CI.

```yaml
# .github/workflows/deploy.yml (sketch)
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write      # for AWS OIDC (no long-lived keys)
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
      - run: npm run deploy:prod
        env:
          DOTENV_PRIVATE_KEY_PROD: ${{ secrets.DOTENV_PRIVATE_KEY_PROD }}
```

Pair this with an IAM role that trusts GitHub's OIDC provider so CI never holds
long-lived AWS credentials.
