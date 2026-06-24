// Env vars are sourced from .env.<environment> by the deploy:* / synth scripts in
// the root package.json (set -a; . ./.env.<env>) and inherited by this process,
// so there is no dotenv dependency or import here.
import { version } from './package.json';

const availableEnvironments = ['prod', 'staging', 'dev', 'test'];
const currentEnvironment: string = (process.env.DEPLOY_ENV ?? '').toLowerCase();
if (!availableEnvironments.includes(currentEnvironment)) {
  throw new Error(
    `DEPLOY_ENV must be one of [${availableEnvironments.join(', ')}] (got "${process.env.DEPLOY_ENV ?? ''}"). ` +
      `Run through an env-aware script, e.g. \`npm run deploy:dev\` / \`npm run synth\`, ` +
      `which source the matching .env.<environment> file.`,
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
