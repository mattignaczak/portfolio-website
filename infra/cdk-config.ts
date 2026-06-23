import 'dotenv/config';
import { version } from './package.json';
// import { Duration } from "aws-cdk-lib";
// import {generateName, getEnvVarAsBool, getEnvVarAsNumber } from "@infra";

const currentEnvironment: string = process.env.DEPLOY_ENV
  ? process.env.DEPLOY_ENV.toLowerCase()
  : 'default';
const availableEnvironments = ['prod', 'staging', 'dev', 'test'];
if (!availableEnvironments.includes(currentEnvironment)) {
  throw new Error(
    `You must specify the environment variable DEPLOY_ENV. possible values ${availableEnvironments.toString()}`,
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
