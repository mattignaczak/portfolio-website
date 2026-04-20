# portfolio-website

Full-stack TypeScript portfolio built with AWS CDK — includes the website frontend and API backend.

## Quick Start

### Prerequisites

- Docker
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- AWS credentials configured at `~/.aws` on your host machine

### Getting started

1. Clone the repo and open in VS Code
2. Select **Reopen in Container** when prompted
3. Install dependencies:
   ```bash
   npm install
   ```
4. Bootstrap CDK into your AWS account (first time only):
   ```bash
   cd infra && npx cdk bootstrap
   ```

## Project Structure

```
infra/       # AWS CDK infrastructure
src/
  api/       # Backend API
  web/       # Frontend
```

## Commands

### Root

```bash
npm install           # install all workspace dependencies
npm run env:pull      # pull .env from vault and link to workspaces
npm run env:push      # push .env to vault
npm run env:link      # symlink root .env into each workspace
```

### Infrastructure (`cd infra`)

```bash
npm run build         # compile TypeScript
npm run watch         # watch mode
npm test              # run jest tests
npx cdk synth         # emit CloudFormation template
npx cdk diff          # diff against deployed stack
npx cdk deploy        # deploy all stacks to AWS
npx cdk deploy --hotswap  # fast deploy for Lambda/ECS changes
```

## Devcontainer

This project uses a [devcontainer](https://containers.dev) for a consistent development environment.

| Tool | Purpose |
|------|---------|
| Node 24 + TypeScript | Runtime and language |
| npm | Package manager |
| AWS CLI | CDK deploys and AWS interaction |
| LocalStack | Local AWS emulation |
| Docker-in-Docker | Build and run container images locally |
| GitHub CLI | PR and release workflow |
