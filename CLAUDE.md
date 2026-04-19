# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack TypeScript portfolio website and API built with AWS CDK. Intended to showcase modern AWS and TypeScript patterns for a job search portfolio.

## Environment

Development is done inside a devcontainer (Node 24, Debian Trixie). Features included:
- AWS CLI — for CDK deploys and AWS interaction
- Docker-in-Docker — for building/running container images locally
- GitHub CLI
- LocalStack CLI — for local AWS emulation without incurring costs

`~/.aws` is bind-mounted into the container so local AWS credentials are available automatically.

pnpm is the package manager, enabled via corepack.

## Commands

Commands will be added here once the CDK project is scaffolded.
