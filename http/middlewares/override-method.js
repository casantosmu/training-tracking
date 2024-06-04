import { logger } from "../../lib/logger.js";

const QUERY_KEY = "_method";

export const overrideMethod = () => (req, res, next) => {
  if (req.method !== "POST") {
    next();
    return;
  }

  const method = req.body[QUERY_KEY];

  if (method) {
    delete req.body[QUERY_KEY];
    req.method = method;
    logger.debug(`Method overridden to ${method}`);
  }

  next();
};
