import { body, param } from "express-validator";

export const processRules = [
  body("name").isString().isLength({ min: 2 }),
  body("description").optional().isString(),
  body("active").optional().isBoolean()
];

export const shiftRules = [
  body("shifts").isArray({ min: 1, max: 3 }),
  body("shifts.*.name").isString().isLength({ min: 1 }),
  body("shifts.*.start").isString().isLength({ min: 4 }),
  body("shifts.*.end").isString().isLength({ min: 4 })
];

export const templateRules = [
  body("name").isString().isLength({ min: 2 }),
  body("columns").isArray(),
  body("columns.*.key").isString().isLength({ min: 1 }),
  body("columns.*.label").isString().isLength({ min: 1 }),
  body("columns.*.type").isIn(["numeric", "text", "dropdown", "time-range"])
];

export const userRoleRules = [
  param("id").isMongoId(),
  body("role").isIn(["admin", "supervisor", "operator", "viewer"])
];
