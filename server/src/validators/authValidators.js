import { body } from "express-validator";

export const registerRules = [
  body("name").isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["admin", "supervisor", "operator", "viewer"])
];

export const loginRules = [body("email").isEmail(), body("password").isString().isLength({ min: 8 })];
