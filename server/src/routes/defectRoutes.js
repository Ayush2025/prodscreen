import { Router } from "express";
import { body, param, query } from "express-validator";
import { createDefectCode, createDefectEntry, listDefectCodes } from "../controllers/defectController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/defect-codes", query("factoryId").optional().isMongoId(), validate, listDefectCodes);
router.post(
  "/defect-codes",
  requireRole("super_admin", "factory_admin", "supervisor"),
  body("factoryId").optional({ nullable: true }).isMongoId(),
  body("code").isString().isLength({ min: 1 }),
  body("category").isIn(["quality", "delivery", "people", "machine", "material"]),
  body("description").isString().isLength({ min: 1 }),
  validate,
  createDefectCode
);
router.post(
  "/entries/:id/defects",
  requireRole("super_admin", "factory_admin", "supervisor", "operator"),
  param("id").isMongoId(),
  body("defectCodeId").isMongoId(),
  body("quantity").isNumeric(),
  body("countermeasure").optional().isString(),
  body("recovery").optional().isString(),
  validate,
  createDefectEntry
);

export default router;
