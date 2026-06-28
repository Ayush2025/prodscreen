import { Router } from "express";
import { body, param } from "express-validator";
import {
  cloneTemplateToFactory,
  createFactory,
  getFactoryConfig,
  listFactories,
  patchFactoryConfig
} from "../controllers/factoryController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/", listFactories);
router.post(
  "/",
  requireRole("super_admin", "factory_admin"),
  body("name").isString().isLength({ min: 2 }),
  body("code").isString().isLength({ min: 2 }),
  body("timezone").isString(),
  validate,
  createFactory
);

router.get("/:id/config", param("id").isMongoId(), validate, getFactoryConfig);
router.post(
  "/:id/config/clone-template/:templateId",
  requireRole("super_admin", "factory_admin"),
  param("id").isMongoId(),
  param("templateId").isMongoId(),
  validate,
  cloneTemplateToFactory
);
router.patch(
  "/:id/config",
  requireRole("super_admin", "factory_admin"),
  param("id").isMongoId(),
  validate,
  patchFactoryConfig
);

export default router;
