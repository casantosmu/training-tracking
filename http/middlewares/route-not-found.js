import { HttpError } from "../http-error.js";
import { HTTP_STATUS } from "../http-status.js";

export const routeNotFound = (req, res, next) => {
  next(
    new HttpError(HTTP_STATUS.NOT_FOUND, `${req.method} ${req.url} not found`),
  );
};
