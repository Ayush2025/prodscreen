import { body } from "express-validator";

export const loginRules = [body("email").isEmail(), body("password").isString().isLength({ min: 8 })];
