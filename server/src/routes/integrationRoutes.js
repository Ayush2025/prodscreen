import { Router } from "express";
import { body, query } from "express-validator";
import { ingestHardwareEvent, listHardwareEvents } from "../controllers/integrationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.post(
  "/hardware/events",
  requireRole("admin", "supervisor", "operator"),
  body("sourceType").isIn(["barcode", "rfid", "camera", "photoeye", "sensor"]),
  body("eventType").isString(),
  validate,
  ingestHardwareEvent
);
router.get(
  "/hardware/events",
  query("processId").optional().isMongoId(),
  query("sourceType").optional().isIn(["barcode", "rfid", "camera", "photoeye", "sensor"]),
  validate,
  listHardwareEvents
);

export default router;
