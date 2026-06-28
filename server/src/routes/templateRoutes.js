import { Router } from "express";
import { body } from "express-validator";
import {
  createShiftTemplate,
  createTableTemplate,
  listShiftTemplates,
  listTableTemplates
} from "../controllers/templateController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/tables", listTableTemplates);
router.post(
  "/tables",
  requireRole("super_admin"),
  body("name").isString().isLength({ min: 2 }),
  body("columns").isArray({ min: 1 }),
  validate,
  createTableTemplate
);

router.get("/shifts", listShiftTemplates);
router.post(
  "/shifts",
  requireRole("super_admin"),
  body("name").isString().isLength({ min: 2 }),
  body("shifts").isArray({ min: 1, max: 3 }),
  validate,
  createShiftTemplate
);

export default router;
