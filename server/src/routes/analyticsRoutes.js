import { Router } from "express";
import { getInsights, getSummary } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { listRecordRules } from "../validators/productionValidators.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.get("/summary", listRecordRules, validate, getSummary);
router.get("/insights", listRecordRules, validate, getInsights);

export default router;
