import { Router } from "express";
import {
  createProcess,
  getShiftConfig,
  listProcesses,
  listTemplates,
  listUsers,
  updateProcess,
  updateUserRole,
  upsertShiftConfig,
  upsertTemplate
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { processRules, shiftRules, templateRules, userRoleRules } from "../validators/adminValidators.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/processes", listProcesses);
router.post("/processes", processRules, validate, createProcess);
router.patch("/processes/:id", processRules, validate, updateProcess);
router.get("/shift-config", getShiftConfig);
router.put("/shift-config", shiftRules, validate, upsertShiftConfig);
router.get("/templates", listTemplates);
router.put("/templates", templateRules, validate, upsertTemplate);
router.get("/users", listUsers);
router.patch("/users/:id/role", userRoleRules, validate, updateUserRole);

export default router;
