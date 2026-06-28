import { Router } from "express";
import { body } from "express-validator";
import { createColumnDefinition, listColumnDefinitions } from "../controllers/templateController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", listColumnDefinitions);
router.post(
  "/",
  requireRole("super_admin"),
  body("key").isString().isLength({ min: 2 }),
  body("label").isString().isLength({ min: 2 }),
  body("dataType").isIn(["number", "text", "dropdown", "computed"]),
  validate,
  createColumnDefinition
);

export default router;
