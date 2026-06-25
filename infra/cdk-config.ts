// Stage config lives in the repo-root .env.<DEPLOY_ENV> file — a single source of
// truth, no duplicate copy inside infra/. Two ways it reaches this process:
//   1. The root `deploy:* / synth` scripts export it (set -a; . ./.env.<env>) before
//      invoking cdk, so it's already in process.env.
//   2. Running cdk directly from infra/ (e.g. `DEPLOY_ENV=sandbox npx cdk deploy`):
//      the dotenv load below reads ../.env.<DEPLOY_ENV> to fill in the rest.
// DEPLOY_ENV is the one variable you must set to pick the file. dotenv never
// overrides an already-set var, so path #1's exported values always win.
import path from 'path';
import dotenv from 'dotenv';
import { version } from './package.json';

if (process.env.DEPLOY_ENV) {
  dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.DEPLOY_ENV}`) });
}

const availableEnvironments = ['prod', 'staging', 'sandbox', 'test'];
const currentEnvironment: string = (process.env.DEPLOY_ENV ?? '').toLowerCase();
if (!availableEnvironments.includes(currentEnvironment)) {
  throw new Error(
    `DEPLOY_ENV must be one of [${availableEnvironments.join(', ')}] (got "${process.env.DEPLOY_ENV ?? ''}"). ` +
      `Set it on the command line (e.g. \`DEPLOY_ENV=sandbox npx cdk deploy\`) or run a ` +
      `root script (\`npm run deploy:sandbox\`) that sources the matching .env.<environment> file.`,
  );
}

/**
 * Read a required, stage-specific env var. Returns the trimmed value, or fails
 * fast (before any CloudFormation is synthesized) when it is missing/blank.
 */
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required env var "${name}" for the "${currentEnvironment}" environment. ` +
        `Set it in .env.${currentEnvironment} (see .env.example)`,
    );
  }
  return value;
}

const domainName = requireEnv('SITE_DOMAIN_NAME');

export default {
  version,
  environment: currentEnvironment,
  observability: {},
  api: {},
  website: {
    domainName,
    // Both the apex and its www. subdomain are served by one distribution.
    domainNames: [`www.${domainName}`, domainName],
    acmCertArn: requireEnv('ACM_CERT_ARN'),
  },
};
