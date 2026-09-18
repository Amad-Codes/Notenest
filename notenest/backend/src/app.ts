import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env, isProduction } from "./config/env";
import { logger } from "./config/logger";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import notesRoutes from "./modules/notes/notes.routes";
import aiRoutes from "./modules/ai/ai.routes";
import { UPLOADS_DIR } from "./modules/uploads/upload.service";

const app = express();

// --- Security & parsing middleware -----------------------------------
// crossOriginResourcePolicy is relaxed so the frontend (a different
// origin in dev) can load images served from /uploads below.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Serves locally-stored attachment files (only used when Cloudinary isn't
// configured — see modules/uploads/upload.service.ts).
app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));

// HTTP request logging piped through winston, skipped during tests.
app.use(
  morgan(isProduction ? "combined" : "dev", {
    stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
  })
);

// --- Health check -------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "NoteNest API is healthy", uptime: process.uptime() });
});

// --- Routes ---------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai", aiRoutes);

// --- 404 + centralized error handling (must be registered last) --------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
