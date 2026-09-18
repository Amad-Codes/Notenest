import { Router } from "express";
import { aiController } from "./ai.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { aiLimiter } from "../../middleware/rateLimiter.middleware";
import { aiRequestSchema } from "./ai.validation";

const router = Router();

router.post("/", requireAuth, aiLimiter, validate(aiRequestSchema), aiController.process);

export default router;
