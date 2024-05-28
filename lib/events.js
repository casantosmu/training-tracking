import EventEmitter from "node:events";
import { logger } from "./logger.js";

export const EVENT_NAMES = {
  SYSTEM: { SHUTDOWN: "SYSTEM_SHUTDOWN" },
};

export const events = new EventEmitter();

const CLOSE_TIMEOUT_MS = 10 * 1000;

export const listenToCloseEvents = (shutdownFn) => {
  const onSignal = async (signal, error = null) => {
    if (error) {
      logger.error("Closing with error", error);
    } else {
      logger.info(`${signal} received, closing...`);
    }

    const timeout = setTimeout(() => {
      logger.error(`${signal} event timed out. Exiting abruptly..`);
      process.exit(1);
    }, CLOSE_TIMEOUT_MS);

    try {
      await shutdownFn();
      clearTimeout(timeout);
      process.exit(error ? 1 : 0);
    } catch (error) {
      logger.error(error.message, error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => {
    onSignal("SIGTERM");
  });
  process.on("SIGINT", () => {
    onSignal("SIGINT");
  });

  process.on("uncaughtException", (error) => {
    onSignal("uncaughtException", error);
  });
  process.on("unhandledRejection", (error) => {
    onSignal("unhandledRejection", error);
  });

  events.on(EVENT_NAMES.SYSTEM.SHUTDOWN, () => {
    onSignal(EVENT_NAMES.SYSTEM.SHUTDOWN);
  });
};
