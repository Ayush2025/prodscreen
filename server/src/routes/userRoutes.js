import { Router } from "express";
import { body } from "express-validator";
import { listUsers } from "../controllers/factoryController.js";
import { createUser } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth, requireRole("super_admin", "factory_admin"));

router.get("/", listUsers);
router.post(
  "/",
  body("name").isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("role").isIn(["super_admin", "factory_admin", "supervisor", "operator"]),
  body("factoryIds").optional().isArray(),
  validate,
  createUser
);

export default router;
