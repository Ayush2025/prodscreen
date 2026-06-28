import { Router } from "express";
import { body } from "express-validator";
import { queryAnalytics } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.post(
  "/query",
  body("factoryId").isMongoId(),
  body("dateRange.from").optional().isString(),
  body("dateRange.to").optional().isString(),
  body("processIds").optional().isArray(),
  validate,
  queryAnalytics
);

export default router;
