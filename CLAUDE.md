# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A retro Windows desktop experience built on AWS, intended to showcase modern AWS and TypeScript patterns for a job search portfolio. The UI simulates a Windows desktop where each "app" window is backed by real AWS infrastructure:

- **File Explorer** — S3-backed directory listing, each file is a portfolio project
- **Terminal** — WebSocket API Gateway + Lambda, sandboxed code execution (whitelisted commands only, no outbound network, tight timeout)
- **Browser window** — renders external content or a project demo

## Architecture

- `src/web` — React SPA (retro Windows desktop UI), hosted on S3 + CloudFront
- `src/api` — Lambda functions per app window, fronted by API Gateway (REST + WebSocket)
- `infra` — CDK defining all infrastructure: CloudFront distribution, S3 bucket, API Gateway, Lambdas

## Structure

```
infra/       # AWS CDK infrastructure (bin/, lib/, test/, cdk.json)
src/
  api/       # Backend API
  web/       # Frontend
```

npm workspaces — root `package.json` covers `infra` and `src/*`. Always run `npm install` from the root.

## Environment

Devcontainer (Node 24, Debian Trixie). `~/.aws` is bind-mounted so local AWS credentials are available automatically. dotenv-vault is installed globally via `postCreateCommand`.

## Commands

### Dependencies
```bash
npm install                   # run from root to install all workspaces
```

### Env vars
```bash
npm run env:pull              # pull from vault + symlink to workspaces
npm run env:push              # push .env to vault
npm run env:link              # symlink root .env to each workspace
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
