import Ajv from "ajv";
import addFormats from "ajv-formats";

export const ajv = new Ajv({
  removeAdditional: true,
  coerceTypes: true,
  allErrors: true,
});
addFormats(ajv);
