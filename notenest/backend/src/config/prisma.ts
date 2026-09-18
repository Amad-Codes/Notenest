/**
 * A single, shared Prisma Client instance.
 *
 * Instantiating PrismaClient more than once (e.g. inside a hot-reloaded
 * dev server) can exhaust database connections, so we create it exactly
 * once here and import this instance everywhere else in the app.
 */
import { PrismaClient } from "@prisma/client";
import { isProduction } from "./env";

export const prisma = new PrismaClient({
  log: isProduction ? ["error", "warn"] : ["error", "warn"],
});
