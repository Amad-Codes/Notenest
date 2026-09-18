import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import { isProduction } from "../config/env";

/** Catches requests to routes that don't exist and forwards a 404. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

/**
 * Single place where every error in the app is turned into a JSON
 * response. Handles our own ApiError, known Prisma errors (e.g. unique
 * constraint violations), Zod is handled upstream, and falls back to a
 * generic 500 for anything unexpected — never leaking a stack trace to
 * the client in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database request error";
    }
  } else if (err instanceof Error) {
    message = isProduction ? message : err.message;
  }

  // Always log the real error server-side, even if we hide it from the client.
  logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, {
    error: err instanceof Error ? err.stack : err,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
