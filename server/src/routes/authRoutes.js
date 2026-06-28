import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { loginRules } from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
