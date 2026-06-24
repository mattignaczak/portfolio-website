// Env vars are sourced from .env.<environment> by the deploy:* / synth scripts in
// the root package.json (set -a; . ./.env.<env>) and inherited by this process,
// so there is no dotenv dependency or import here.
import { version } from './package.json';
// import { Duration } from "aws-cdk-lib";
// import {generateName, getEnvVarAsBool, getEnvVarAsNumber } from "@infra";

const availableEnvironments = ['prod', 'staging', 'dev', 'test'];
const currentEnvironment: string = (process.env.DEPLOY_ENV ?? '').toLowerCase();
if (!availableEnvironments.includes(currentEnvironment)) {
  throw new Error(
    `DEPLOY_ENV must be one of [${availableEnvironments.join(', ')}] (got "${process.env.DEPLOY_ENV ?? ''}"). ` +
      `Run through an env-aware script, e.g. \`npm run deploy:dev\` / \`npm run synth\`, ` +
      `which source the matching .env.<environment> file.`,
  );
}

export default {
  version,
  environment: currentEnvironment,
  observability: {},
  api: {},
  website: {
    acmCertArn:
      'arn:aws:acm:us-east-1:325056425651:certificate/0d673c7e-22fa-4a9b-9bea-7ebbe327c55d',
  },
};
