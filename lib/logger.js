import pino from "pino";
import { config } from "./config.js";
import { context } from "./context.js";

const pinoLogger = pino({
  level: config.logger.level,
  mixin() {
    return { ...context.getStore() };
  },
  formatters: {
    level(label) {
      // Log levels as labels instead of numbers
      return { level: label };
    },
  },
  messageKey: "message",
  errorKey: "error",
});

const logFn = (level) => (message, metadata) => {
  if (metadata instanceof Error) {
    pinoLogger[level]({ error: metadata }, message);
  } else if (metadata) {
    pinoLogger[level]({ metadata }, message);
  } else {
    pinoLogger[level](message);
  }
};

export const logger = {
  debug: logFn("debug"),
  info: logFn("info"),
  warn: logFn("warn"),
  error: logFn("error"),
};
