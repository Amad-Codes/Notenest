import { NextFunction, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../../utils/ApiError";
import { UPLOADS_DIR } from "./upload.service";

// Ensure the local uploads directory exists before multer tries to write to it.
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Images, PDFs, and common document formats. Anything else is rejected
// before it touches disk - this is the "secure upload handling" boundary.
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    // A random filename prevents path traversal / collisions / leaking the
    // original filename structure; the human-readable name is kept
    // separately in the database (Attachment.fileName).
    const safeExt = path.extname(file.originalname).slice(0, 10);
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const uploadSingleFile = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
}).single("file");

/**
 * Wraps multer's callback-style middleware so upload errors (file too
 * large, rejected type, etc.) flow through our normal ApiError -> error
 * middleware pipeline instead of multer's own default error format.
 */
export function uploadMiddleware(req: Request, _res: Response, next: NextFunction) {
  uploadSingleFile(req, _res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          ApiError.badRequest(`File is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`)
        );
      }
      return next(ApiError.badRequest(err.message));
    }
    if (err instanceof Error) {
      return next(ApiError.badRequest(err.message));
    }
    next();
  });
}
