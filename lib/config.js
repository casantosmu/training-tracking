const getEnv = (name, defaultValue) => {
  const value = process.env[name];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? `${defaultValue}`;
};

const getEnvInt = (name, defaultValue) => {
  const value = getEnv(name, defaultValue);
  const intValue = Number.parseInt(value);
  if (Number.isNaN(intValue)) {
    throw new Error(`Invalid integer for environment variable: ${name}`);
  }
  return intValue;
};

const getEnvEnum = (name, allowedValues, defaultValue) => {
  const value = getEnv(name, defaultValue);
  if (!allowedValues.includes(value)) {
    throw new Error(
      `Invalid value for environment variable: ${name}. Allowed values are: ${allowedValues.join(", ")}`,
    );
  }
  return value;
};

const LOG_LEVELS = ["error", "warn", "info", "debug", "silent"];

export const config = {
  server: {
    port: getEnvInt("SERVER_PORT", 3000),
  },
  logger: {
    level: getEnvEnum("LOG_LEVEL", LOG_LEVELS, "info"),
  },
  postgres: {
    host: getEnv("POSTGRES_HOST"),
    port: getEnvInt("POSTGRES_PORT"),
    user: getEnv("POSTGRES_USER"),
    password: getEnv("POSTGRES_PASSWORD"),
    database: getEnv("POSTGRES_DB"),
  },
};
