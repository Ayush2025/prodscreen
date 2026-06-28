import { Router } from "express";
import {
  deleteRecord,
  getRecord,
  listRecords,
  upsertRecord
} from "../controllers/productionController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  deleteRecordRules,
  getRecordRules,
  listRecordRules,
  upsertRecordRules
} from "../validators/productionValidators.js";

const router = Router();

router.use(requireAuth);
router.put(
  "/records",
  requireRole("admin", "supervisor", "operator"),
  upsertRecordRules,
  validate,
  upsertRecord
);
router.get("/records/single", getRecordRules, validate, getRecord);
router.get("/records", listRecordRules, validate, listRecords);
router.delete("/records/:id", requireRole("admin", "supervisor"), deleteRecordRules, validate, deleteRecord);

export default router;
