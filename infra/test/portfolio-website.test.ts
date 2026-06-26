import * as fs from 'fs';
import * as path from 'path';
import { App } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PortfolioWebsiteStack } from '../lib/portfolio-website-stack';

// The web bundle is staged as a CDK asset by the BucketDeployment construct at
// synth time. We deliberately synth the *real* graph (rather than stubbing the
// asset), so the directory must exist — CI builds it via `npm run build:web`.
const WEB_DIST = path.join(__dirname, '../../src/web/dist');

/**
 * Synthesize the stack to a CloudFormation Template for assertions.
 *
 * No AWS account, credentials, or deploy involved — this is a pure function of
 * the stack's TypeScript, which is what makes the suite idempotent and CI-safe.
 * `new App()` reads the feature-flag `context` from cdk.json (jest's cwd is the
 * infra root), so the template matches what `cdk deploy` would produce.
 */
function synthTemplate(): Template {
  if (!fs.existsSync(WEB_DIST)) {
    throw new Error(
      `Web bundle not found at ${WEB_DIST}. Run \`npm run build:web\` before the ` +
        `infra tests — the BucketDeployment construct stages it as an asset at synth time.`,
    );
  }

  const app = new App();
  const stack = new PortfolioWebsiteStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
  return Template.fromStack(stack);
}

describe('static-site S3 bucket', () => {
  it('blocks all public access', () => {
    const template = synthTemplate();

    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it('is the only bucket in the stack and is set to auto-clean on destroy', () => {
    const template = synthTemplate();

    // The asset-staging bucket lives in the bootstrap stack, not here, so the
    // site bucket should be the single bucket this stack owns.
    template.resourceCountIs('AWS::S3::Bucket', 1);

    // removalPolicy DESTROY + autoDeleteObjects => CDK tags the bucket and wires
    // a custom resource that empties it. Assert the tag so the policy can't
    // silently regress to RETAIN and leave orphaned buckets on teardown.
    template.hasResourceProperties('AWS::S3::Bucket', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'aws-cdk:auto-delete-objects', Value: 'true' }),
      ]),
    });
  });
});

describe('CloudFront distribution', () => {
  // Mirrors the test-only env wired up in test/setup.ts. Asserting against these
  // proves the env -> cdk-config -> template wiring end to end.
  const APEX = 'test.example.com';
  const CERT_ARN =
    'arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000';

  it('redirects viewers to HTTPS and serves index.html as the root', () => {
    const template = synthTemplate();

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
        }),
      }),
    });
  });

  it('is aliased to the apex and www. domains from config', () => {
    const template = synthTemplate();

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: Match.arrayWith([`www.${APEX}`, APEX]),
      }),
    });
  });

  it('binds the ACM certificate provided via config', () => {
    const template = synthTemplate();

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        ViewerCertificate: Match.objectLike({ AcmCertificateArn: CERT_ARN }),
      }),
    });
  });

  it('uses an Origin Access Control fronting the private bucket', () => {
    const template = synthTemplate();

    // OAC is the modern replacement for OAI — its presence is what lets the
    // bucket stay fully private while CloudFront still reads from it.
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
  });
});
