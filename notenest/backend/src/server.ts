import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 NoteNest API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

/** Closes the HTTP server and database connection cleanly. */
async function shutdown(signal: string) {
  logger.info(`${signal} received: shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Shutdown complete.");
    process.exit(0);
  });

  // Force-exit if shutdown hangs for too long.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Surface truly unexpected failures instead of letting the process hang
// in a broken state.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
  process.exit(1);
});
