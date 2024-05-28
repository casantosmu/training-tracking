import http from "node:http";
import { config } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { app } from "./app.js";

const { port } = config.server;

const server = http.createServer(app);

export const startSever = () =>
  new Promise((resolve, reject) => {
    logger.info("Starting server...");
    server.listen(port);
    server.once("listening", () => {
      logger.info(`Server listening on port ${port}`);
      resolve();
    });
    server.once("error", (error) => {
      reject(new Error("Error during server start", { cause: error }));
    });
  });

export const stopServer = () =>
  new Promise((resolve, reject) => {
    logger.info("Stopping server...");
    server.close((error) => {
      if (error) {
        reject(new Error("Error during server stop", { cause: error }));
        return;
      }
      logger.info("Server stopped successfully");
      resolve();
    });
  });
