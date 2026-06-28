import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", result.array()));
  }
  return next();
};
