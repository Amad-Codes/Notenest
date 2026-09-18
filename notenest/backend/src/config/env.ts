/**
 * Centralized, validated access to environment variables.
 *
 * Loading env vars through a single validated module (rather than reading
 * `process.env.X` all over the codebase) means the app fails fast on boot
 * with a clear error if something required is missing, instead of crashing
 * deep inside a request handler at 2am in production.
 */
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET should be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  // Optional: file attachments fall back to local disk storage when these
  // are not set. All three must be set for Cloudinary to activate.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Optional: the AI Assistant falls back to a local heuristic provider
  // (no external calls) when this is not set.
  OPENAI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print a readable summary of what's missing/invalid, then exit.
  // This is far more useful than letting the app boot in a broken state.
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
