import { body, query, param } from "express-validator";

export const upsertRecordRules = [
  body("processId").isMongoId(),
  body("date").isString().isLength({ min: 8 }),
  body("shiftName").isString().isLength({ min: 1 }),
  body("rows").isArray({ min: 1 }),
  body("rows.*.timeRange").isString(),
  body("rows.*.target").optional().isNumeric(),
  body("rows.*.actual").optional().isNumeric()
];

export const getRecordRules = [
  query("processId").isMongoId(),
  query("date").isString(),
  query("shiftName").isString()
];

export const listRecordRules = [
  query("processId").optional().isMongoId(),
  query("dateFrom").optional().isString(),
  query("dateTo").optional().isString()
];

export const deleteRecordRules = [param("id").isMongoId()];
