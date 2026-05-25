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
  website: {},
};
