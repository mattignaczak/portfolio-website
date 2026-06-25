import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import path from 'path';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import cdkConfig from '../cdk-config';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PortfolioWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Stack-level tags cascade to every taggable resource (bucket, distribution,
    // deployment). Stage comes from cdk-config so each environment is labelled
    // correctly for cost allocation and resource filtering in the console.
    const tags = cdk.Tags.of(this);
    tags.add('Project', 'portfolio-website');
    tags.add('Environment', cdkConfig.environment);
    tags.add('ManagedBy', 'cdk');
    // TODO(human): add any further org-convention tags (e.g. Owner, CostCenter)

    const siteBucket = new s3.Bucket(this, 'mattignaczakXyzSiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Deny any non-TLS request via an aws:SecureTransport bucket policy
      // (satisfies cdk-nag AwsSolutions-S10). CloudFront already talks to the
      // origin over HTTPS; this closes off plaintext access to the bucket itself.
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // The cert and its Route 53 hosted zone are provisioned manually, outside
    // this stack — see "DNS & TLS" in ENVIRONMENT.md. We only reference by ARN.
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      cdkConfig.website.acmCertArn,
    );
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      domainNames: cdkConfig.website.domainNames,
      certificate,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../src/web/dist'))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
