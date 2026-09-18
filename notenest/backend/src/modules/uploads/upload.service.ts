import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const isCloudinaryEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  logger.info("📎 Attachment storage: Cloudinary");
} else {
  logger.info("📎 Attachment storage: local disk (uploads/) — set CLOUDINARY_* env vars to use Cloudinary instead");
}

export interface StoredFile {
  url: string;
  publicId: string | null;
  storage: "local" | "cloudinary";
}

/**
 * Persists an uploaded file to its final destination. Multer has already
 * written the file to a temp path on local disk (see upload.middleware.ts);
 * this either uploads it to Cloudinary and removes the temp copy, or simply
 * treats the temp copy as the permanent local file.
 */
export async function storeFile(file: Express.Multer.File): Promise<StoredFile> {
  if (isCloudinaryEnabled) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "notenest",
      resource_type: "auto", // let Cloudinary detect image vs raw (pdf/doc)
    });
    await fs.unlink(file.path).catch(() => {
      // Non-fatal: a stray temp file is a minor cleanup issue, not a request failure.
    });
    return { url: result.secure_url, publicId: result.public_id, storage: "cloudinary" };
  }

  return { url: `/uploads/${file.filename}`, publicId: null, storage: "local" };
}

/** Removes a previously stored file from whichever backend holds it. */
export async function deleteStoredFile(file: {
  url: string;
  publicId: string | null;
  storage: string;
}): Promise<void> {
  if (file.storage === "cloudinary" && file.publicId) {
    await cloudinary.uploader.destroy(file.publicId).catch((err) => {
      logger.error("Failed to delete Cloudinary asset", err);
    });
    return;
  }

  const localPath = path.join(UPLOADS_DIR, path.basename(file.url));
  await fs.unlink(localPath).catch(() => {
    // File may already be gone - deleting an attachment record shouldn't fail because of it.
  });
}
