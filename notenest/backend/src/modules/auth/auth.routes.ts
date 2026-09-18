import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimiter.middleware";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
