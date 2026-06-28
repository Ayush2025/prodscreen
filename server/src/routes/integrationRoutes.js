import { Router } from "express";
import { body, query } from "express-validator";
import { ingestHardwareEvent, listHardwareEvents } from "../controllers/integrationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.post(
  "/hardware/events",
  requireRole("super_admin", "factory_admin", "supervisor", "operator"),
  body("factoryId").isMongoId(),
  body("cellId").isString(),
  body("deviceType").isIn(["barcode", "rfid", "camera", "photoeye", "sensor"]),
  body("interpretedAs").isIn(["part_in", "part_out", "defect_flag", "unknown"]),
  body("timestamp").isISO8601(),
  validate,
  ingestHardwareEvent
);
router.get(
  "/hardware/events",
  query("factoryId").optional().isMongoId(),
  query("processed").optional().isBoolean(),
  validate,
  listHardwareEvents
);

export default router;
