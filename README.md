# portfolio-website

Full-stack TypeScript portfolio built with AWS CDK — includes the website frontend and API backend.

## Development

This project uses a [devcontainer](https://containers.dev) for a consistent development environment. Open in VS Code and select **Reopen in Container** when prompted.

### Prerequisites

- Docker
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- AWS credentials configured at `~/.aws` on your host machine

### What's included

| Tool | Purpose |
|------|---------|
| Node 24 + TypeScript | Runtime and language |
| pnpm | Package manager (via corepack) |
| AWS CLI | CDK deploys and AWS interaction |
| LocalStack | Local AWS emulation |
| Docker-in-Docker | Build and run container images locally |
| GitHub CLI | PR and release workflow |

## Commands

```bash
pnpm run build    # compile TypeScript
pnpm run watch    # watch mode
pnpm run test     # run jest tests
pnpm cdk deploy   # deploy to AWS
pnpm cdk diff     # diff against deployed stack
pnpm cdk synth    # emit CloudFormation template
```
