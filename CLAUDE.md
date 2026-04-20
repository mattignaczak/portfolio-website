# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack TypeScript portfolio website and API built with AWS CDK. Intended to showcase modern AWS and TypeScript patterns for a job search portfolio.

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
