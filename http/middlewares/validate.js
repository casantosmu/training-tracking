import { ajv } from "../../lib/validation.js";
import { HttpError } from "../http-error.js";
import { HTTP_STATUS } from "../http-status.js";

class ValidationError extends HttpError {
  constructor(errors) {
    super(HTTP_STATUS.BAD_REQUEST, "Validation error");
    this.validationErrors = errors;
  }
}

export const validate = (schemas) => {
  const validations = {};

  if (schemas.params) {
    validations.params = ajv.compile(schemas.params);
  }
  if (schemas.body) {
    validations.body = ajv.compile(schemas.body);
  }
  if (schemas.query) {
    validations.query = ajv.compile(schemas.query);
  }

  return (req, res, next) => {
    const errors = [];

    for (const key of Object.keys(validations)) {
      const validation = validations[key];
      const isValid = validation(req[key]);
      if (!isValid) {
        errors.push(
          ...validation.errors.map((error) => {
            return { source: key, ...error };
          }),
        );
      }
    }

    if (errors.length > 0) {
      next(new ValidationError(errors));
      return;
    }

    next();
  };
};
