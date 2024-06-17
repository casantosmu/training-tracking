import { logger } from "../../lib/logger.js";
import { EVENT_NAMES, events } from "../../lib/events.js";
import { HttpError } from "../http-error.js";
import { HTTP_STATUS } from "../http-status.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const logLevel = statusCode >= 500 ? "error" : "warn";
  logger[logLevel]("Error handler", error);

  res.sendStatus(statusCode);

  const isUnexpectedError = !(error instanceof HttpError);
  if (isUnexpectedError) {
    events.emit(EVENT_NAMES.SYSTEM_SHUTDOWN, error);
  }
};
