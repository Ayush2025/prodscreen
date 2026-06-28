import { Router } from "express";
import { body, param, query } from "express-validator";
import { getFactoryEntries, patchEntry, upsertFactoryEntry } from "../controllers/entryController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/factories/:id/entries",
  param("id").isMongoId(),
  query("processId").isMongoId(),
  query("date").isString(),
  query("shiftName").isString(),
  validate,
  getFactoryEntries
);

router.post(
  "/factories/:id/entries",
  requireRole("super_admin", "factory_admin", "supervisor", "operator"),
  param("id").isMongoId(),
  body("processId").isMongoId(),
  body("shiftName").isString(),
  body("date").isString(),
  body("hourBucket.start").isString(),
  body("hourBucket.end").isString(),
  body("values").isObject(),
  validate,
  upsertFactoryEntry
);

router.patch(
  "/entries/:id",
  requireRole("super_admin", "factory_admin", "supervisor", "operator"),
  param("id").isMongoId(),
  body("values").optional().isObject(),
  body("source").optional().isIn(["manual", "hardware", "erp_sync"]),
  validate,
  patchEntry
);

export default router;
