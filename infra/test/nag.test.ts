import { App, Aspects } from 'aws-cdk-lib/core';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { IConstruct } from 'constructs';
import { PortfolioWebsiteStack } from '../lib/portfolio-website-stack';

// Gate: synthesize the stack under the AwsSolutions ruleset and fail on any
// un-suppressed error. Every suppression below carries a written justification —
// that paper trail is the point of cdk-nag, not silencing the tool.
describe('cdk-nag AwsSolutions', () => {
  let errors: { id: string; entry: { data: string } }[];
  let warnings: { id: string; entry: { data: string } }[];

  beforeAll(() => {
    const app = new App();
    const stack = new PortfolioWebsiteStack(app, 'NagTestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });

    const child = (id: string): IConstruct => stack.node.findChild(id);
    // BucketDeployment's sync Lambda is a stack-level singleton, not a child of
    // the DeployWebsite construct — locate it by id prefix (robust to its hash).
    const byIdPrefix = (prefix: string): IConstruct =>
      stack.node.findAll().find((c) => c.node.id.startsWith(prefix)) as IConstruct;

    // Accepted-by-design for a low-traffic portfolio site: server/CDN access logs
    // and WAF/geo each add standing infrastructure (a logs bucket, a Web ACL) and
    // cost that isn't justified here. Documented, not ignored.
    NagSuppressions.addResourceSuppressions(child('mattignaczakXyzSiteBucket'), [
      {
        id: 'AwsSolutions-S1',
        reason:
          'Origin bucket is private and only reachable via CloudFront OAC; S3 server access logging would add a perpetual logs bucket not warranted for a portfolio site.',
      },
    ]);
    NagSuppressions.addResourceSuppressions(child('Distribution'), [
      {
        id: 'AwsSolutions-CFR3',
        reason:
          'CloudFront access logging omitted intentionally; standard CloudWatch metrics are sufficient for a portfolio and access logs add a logs bucket + cost.',
      },
      {
        id: 'AwsSolutions-CFR1',
        reason:
          'Static portfolio is intentionally globally accessible — no geo restriction required.',
      },
      {
        id: 'AwsSolutions-CFR2',
        reason:
          'No WAF: a static, read-only site with no forms/backend presents negligible application-layer attack surface.',
      },
    ]);

    // CDK-managed: the BucketDeployment custom resource (Lambda + role) that syncs
    // dist/ to S3 is owned by aws-cdk-lib. Its runtime and IAM are controlled by
    // the library and updated via CDK upgrades, not by this stack.
    NagSuppressions.addResourceSuppressions(
      byIdPrefix('Custom::CDKBucketDeployment'),
      [
        {
          id: 'AwsSolutions-L1',
          reason:
            'BucketDeployment custom-resource runtime is managed by aws-cdk-lib; bumped by upgrading the library.',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'AWSLambdaBasicExecutionRole is attached by the CDK-managed BucketDeployment custom resource.',
          appliesTo: [
            'Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        },
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'BucketDeployment requires read on the asset bucket, write on the destination bucket, and CloudFront CreateInvalidation (which only supports Resource:*). Scopes are set by aws-cdk-lib.',
          appliesTo: [
            'Action::s3:GetObject*',
            'Action::s3:GetBucket*',
            'Action::s3:List*',
            'Action::s3:DeleteObject*',
            'Action::s3:Abort*',
            { regex: '/^Resource::.*$/g' },
          ],
        },
      ],
      true, // applyToChildren: covers the generated ServiceRole + DefaultPolicy
    );

    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
    app.synth();

    const rule = Match.stringLikeRegexp('AwsSolutions-.*');
    errors = Annotations.fromStack(stack).findError('*', rule) as typeof errors;
    warnings = Annotations.fromStack(stack).findWarning('*', rule) as typeof warnings;

    if (errors.length > 0 || warnings.length > 0) {
      console.log(
        'UN-SUPPRESSED NAG FINDINGS:\n' +
          [...errors, ...warnings].map((e) => `  ${e.id} :: ${e.entry.data}`).join('\n'),
      );
    }
  });

  it('has no un-suppressed AwsSolutions errors', () => {
    expect(errors).toHaveLength(0);
  });
});
