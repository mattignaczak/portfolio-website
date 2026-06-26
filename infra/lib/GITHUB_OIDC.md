# GitHub OIDC deploy roles

Bootstraps the trust that lets the CI/CD pipeline (`.github/workflows/ci-cd.yml`)
deploy to AWS **without long-lived access keys**. Defined by:

- `lib/github-oidc-stack.ts` — the stack (OIDC provider + one deploy role)
- `bin/github-oidc.ts` — standalone app entry (kept separate from the site app so
  it doesn't need `cdk-config` / a domain + cert just to provision a role)

Deploy it **once per AWS account**, by hand, with that account's admin
credentials. It is not part of the normal `cdk deploy` and CI never touches it.

## How it works

GitHub mints a short-lived OIDC token for each deploy job. Because every deploy
job sets `environment:`, the token's `sub` claim is
`repo:<owner>/<repo>:environment:<name>`. The role's trust policy exact-matches
that `sub` plus the `aud` (`sts.amazonaws.com`), so **only this repo's specific
environment** can assume the role — not a fork, not another branch, not another
repo hitting the same provider.

The role itself holds no service permissions. Its only policy is `sts:AssumeRole`
onto the account's `cdk-<qualifier>-*` bootstrap roles, so its effective power is
exactly "whatever CDK is allowed to do" — managed once, in the bootstrap.

## Environment ↔ account map

| GitHub Environment | `DEPLOY_ENV` | Domain                     | AWS account |
| ------------------ | ------------ | -------------------------- | ----------- |
| `sandbox`          | `sandbox`    | `sandbox.mattignaczak.xyz` | sandbox     |
| `staging`          | `staging`    | `staging.mattignaczak.xyz` | staging     |
| `prod`       | `prod`       | `mattignaczak.xyz`         | prod        |

> `GITHUB_ENVIRONMENT` below is the **GitHub Environment name** (left column), not
> `DEPLOY_ENV`.

## Prerequisites (per account)

1. The account is `cdk bootstrap`-ed (default qualifier `hnb659fds`). If you used a
   custom qualifier, pass it via the `cdkQualifier` prop.
2. You hold admin credentials for that account (this provisions IAM).
3. The matching GitHub Environment (`sandbox` / `staging` / `prod`) exists in
   repo **Settings → Environments**. Add a **required reviewer** to `prod` —
   that is the manual promotion gate.

## Deploy

Authenticate to the target account, then from `infra/`:

```bash
# Sandbox account
GITHUB_REPOSITORY=<owner>/portfolio-website GITHUB_ENVIRONMENT=sandbox \
  CDK_DEFAULT_REGION=us-east-1 npm run oidc:deploy

# Staging account (switch credentials first)
GITHUB_REPOSITORY=<owner>/portfolio-website GITHUB_ENVIRONMENT=staging \
  CDK_DEFAULT_REGION=us-east-1 npm run oidc:deploy

# Prod account (switch credentials first)
GITHUB_REPOSITORY=<owner>/portfolio-website GITHUB_ENVIRONMENT=prod \
  CDK_DEFAULT_REGION=us-east-1 npm run oidc:deploy
```

Preview the rendered trust policy without deploying:

```bash
GITHUB_REPOSITORY=<owner>/portfolio-website GITHUB_ENVIRONMENT=sandbox npm run oidc:synth
```

## Wire the output into GitHub

Each deploy prints a `DeployRoleArn` output (role name
`portfolio-website-gha-<environment>`). For each environment, copy that ARN into:

**Settings → Environments → `<environment>` → Variables →** `AWS_DEPLOY_ROLE_ARN`

That is what `vars.AWS_DEPLOY_ROLE_ARN` resolves to in the workflow. Also set the
per-environment `SITE_DOMAIN_NAME` and `ACM_CERT_ARN` variables there.

## Gotchas

- **One OIDC provider per account.** `OpenIdConnectProvider` creates
  `token.actions.githubusercontent.com`. If the account already has one (from
  another stack/project), this deploy fails — import it instead with
  `iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(...)` and pass it in.
- **Region.** IAM is global, but the stack still needs a region; we use
  `us-east-1` for consistency with the CloudFront cert. The assume-role policy
  globs `cdk-<qualifier>-*`, so it covers the bootstrap roles in any region.
- **Updating trust** (e.g. renaming the repo or an environment): edit the stack and
  re-run `oidc:deploy` for the affected account. The role ARN is stable, so GitHub
  needs no change.
- **Teardown:** `cdk --app "npx ts-node --prefer-ts-exts bin/github-oidc.ts" destroy`
  with that account's credentials. Removes the role and provider; do this only if
  you're retiring CI for the account.
