import crypto from "node:crypto";
import { context } from "../../lib/context.js";

const REQUEST_ID_HEADER = "x-request-id";

export const requestId = () => (req, res, next) => {
  const requestId = req.headers[REQUEST_ID_HEADER] ?? crypto.randomUUID();

  res.setHeader(REQUEST_ID_HEADER, requestId);

  const currentContext = context.getStore();

  if (currentContext) {
    currentContext.requestId = requestId;
    next();
    return;
  }

  context.run({ requestId }, next);
};
