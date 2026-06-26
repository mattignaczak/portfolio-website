// Deployment runbook (per-account bootstrap, GitHub wiring): see ./GITHUB_OIDC.md
import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GithubOidcStackProps extends cdk.StackProps {
  /** "owner/repo", e.g. mattignaczak/portfolio-website. */
  readonly repo: string;
  /** GitHub Environment name this role is allowed to deploy from. */
  readonly githubEnvironment: 'sandbox' | 'staging' | 'prod';
  /** CDK bootstrap qualifier; override only if you bootstrapped with a custom one. */
  readonly cdkQualifier?: string;
}

const GITHUB_OIDC_URL = 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_AUDIENCE = 'sts.amazonaws.com';

/**
 * One per AWS account. Creates the GitHub Actions OIDC provider and a single
 * deploy role whose trust is locked to this repo's `githubEnvironment`. The role
 * holds no service permissions itself — it may only assume the CDK bootstrap
 * roles, which is all `cdk deploy` needs.
 *
 * Deploy once per account with that account's admin credentials, e.g.:
 *   GITHUB_REPOSITORY=owner/portfolio-website GITHUB_ENVIRONMENT=sandbox \
 *     npm run oidc:deploy -w infra
 */
export class GithubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const qualifier = props.cdkQualifier ?? 'hnb659fds';

    // Modern CDK no longer needs an explicit thumbprint — AWS validates the
    // GitHub OIDC endpoint via its trusted CA. Only one provider per URL per
    // account is allowed; if the account already has one, import it instead with
    // iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(...).
    const provider = new iam.OpenIdConnectProvider(this, 'GithubOidcProvider', {
      url: GITHUB_OIDC_URL,
      clientIds: [GITHUB_OIDC_AUDIENCE],
    });

    // The full subject this repo's GitHub Environment presents in its OIDC token.
    const subject = `repo:${props.repo}:environment:${props.githubEnvironment}`;

    const trustConditions = buildTrustConditions(subject);

    const role = new iam.Role(this, 'GithubDeployRole', {
      roleName: `portfolio-website-gha-${props.githubEnvironment}`,
      description: `GitHub Actions deploy role for the ${props.githubEnvironment} environment`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.OpenIdConnectPrincipal(provider, trustConditions),
    });

    // Least privilege: the role can only assume the CDK bootstrap roles
    // (deploy / file-publishing / image-publishing / lookup) in this account.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'AssumeCdkBootstrapRoles',
        actions: ['sts:AssumeRole'],
        resources: [`arn:${this.partition}:iam::${this.account}:role/cdk-${qualifier}-*`],
      }),
    );

    new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: role.roleArn,
      description:
        'Set this as the AWS_DEPLOY_ROLE_ARN variable on the matching GitHub Environment.',
    });
  }
}

/**
 * Build the IAM trust-policy conditions for the GitHub OIDC principal.
 *
 * @param subject the exact `sub` claim the allowed GitHub Environment presents,
 *   e.g. "repo:owner/portfolio-website:environment:sandbox"
 */
function buildTrustConditions(subject: string): iam.Conditions {
  const issuerHost = GITHUB_OIDC_URL.replace('https://', '');
  return {
    // Exact-match both claims: the token must be minted for AWS STS (aud) AND
    // come from this repo's specific GitHub Environment (sub). StringEquals (not
    // StringLike) leaves no wildcard room — no other repo/branch/env can assume
    // this role.
    StringEquals: {
      [`${issuerHost}:aud`]: GITHUB_OIDC_AUDIENCE,
      [`${issuerHost}:sub`]: subject,
    },
  };
}
