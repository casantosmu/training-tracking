import { startPostgres, stopPostgres } from "./db/postgres.js";
import { startSever, stopServer } from "./http/server.js";
import { listenToCloseEvents } from "./lib/events.js";
import { logger } from "./lib/logger.js";

const startup = async () => {
  await startPostgres();
  await startSever();
  logger.info("Startup successfully");
};

const shutdown = async () => {
  await stopServer();
  await stopPostgres();
  logger.info("Shutdown successfully");
};

await startup();

listenToCloseEvents(async () => {
  await shutdown();
});
