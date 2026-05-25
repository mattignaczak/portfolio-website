const generateName = (subProject: string, name: string, separator = '-'): string => {
  return ['portfolioWebsite', subProject, name].join(separator);
};

const getEnvVarAsNumber = (envVar: string | undefined, defaultValue: number) => {
  if (envVar !== undefined) {
    try {
      return Number(envVar);
    } catch (error) {
      console.log('error parsing', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

const getEnvVarAsBool = (envVar: string | undefined, defaultValue: boolean) => {
  if (envVar !== undefined) {
    try {
      switch (envVar.toLowerCase()) {
        case 'true':
          return true;
        case 'false':
          return false;
        default:
          console.log(`failed to parse value: ${envVar} as bool`);
          return defaultValue;
      }
    } catch (error) {
      console.log('error parsing', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export { getEnvVarAsBool, getEnvVarAsNumber, generateName };
