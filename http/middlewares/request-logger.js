import { logger } from "../../lib/logger.js";

export const requestLogger = () => (req, res, next) => {
  const start = Date.now();

  res.on("close", () => {
    let logLevel = "info";
    if (res.statusCode >= 500) {
      logLevel = "error";
    } else if (res.statusCode >= 400) {
      logLevel = "warn";
    }

    logger[logLevel]("Request completed", {
      request: {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        headers: req.headers,
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
      },
      response: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
      },
      responseTime: Date.now() - start,
    });
  });

  next();
};
