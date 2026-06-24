// Jest `setupFiles` entry — runs once before any test *module* is required, which
// matters here: cdk-config.ts throws at import time unless DEPLOY_ENV is a known
// environment. The stack module pulls in cdk-config transitively, so this env has
// to be in place before the test file's imports resolve.
process.env.DEPLOY_ENV = process.env.DEPLOY_ENV ?? 'test';

// Pin a synthetic account/region so template synthesis is deterministic and
// account-agnostic across laptops and CI runners. No credentials are used — these
// values only feed CDK's environment resolution, never an AWS API call.
process.env.CDK_DEFAULT_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT ?? '123456789012';
process.env.CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION ?? 'us-east-1';

// Stack config (cdk-config.ts) requires these at load time. They're non-secret
// and stage-specific, so supplying test-only values here keeps the suite fully
// self-contained — no .env file or real ACM cert needed to synth. The ARN must
// be a valid us-east-1 ACM ARN because cloudfront.Distribution validates the
// region at synth time.
process.env.SITE_DOMAIN_NAME = process.env.SITE_DOMAIN_NAME ?? 'test.example.com';
process.env.ACM_CERT_ARN =
  process.env.ACM_CERT_ARN ??
  'arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000';
