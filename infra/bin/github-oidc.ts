#!/usr/bin/env node
// Standalone app for the per-account GitHub OIDC bootstrap. Kept separate from
// bin/portfolio-website.ts so it doesn't import cdk-config (no site domain/cert
// needed) and so a normal `cdk deploy` never touches these IAM resources.
//
// Deploy once per account, with that account's admin credentials:
//   GITHUB_REPOSITORY=owner/portfolio-website GITHUB_ENVIRONMENT=sandbox \
//     npm run oidc:deploy -w infra
import * as cdk from 'aws-cdk-lib/core';
import { GithubOidcStack, GithubOidcStackProps } from '../lib/github-oidc-stack';

const app = new cdk.App();

const repo = process.env.GITHUB_REPOSITORY;
const githubEnvironment = process.env.GITHUB_ENVIRONMENT;

if (!repo) {
  throw new Error('GITHUB_REPOSITORY is required, e.g. "mattignaczak/portfolio-website".');
}

const allowedEnvironments: GithubOidcStackProps['githubEnvironment'][] = [
  'sandbox',
  'staging',
  'production',
];
if (!allowedEnvironments.includes(githubEnvironment as never)) {
  throw new Error(
    `GITHUB_ENVIRONMENT must be one of [${allowedEnvironments.join(', ')}] (got "${githubEnvironment ?? ''}"). ` +
      `This must match the GitHub Environment name used in the workflow, not DEPLOY_ENV.`,
  );
}

new GithubOidcStack(app, `GithubOidc-${githubEnvironment}`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  repo,
  githubEnvironment: githubEnvironment as GithubOidcStackProps['githubEnvironment'],
});
