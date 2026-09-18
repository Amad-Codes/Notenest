import { NextFunction, Request, Response } from "express";

/**
 * Wraps an async Express route handler so that any rejected promise
 * (e.g. a thrown ApiError, or an unexpected DB error) is automatically
 * forwarded to `next()` and handled by the central error middleware,
 * instead of crashing the process or requiring a try/catch in every route.
 */
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler =
  (handler: AsyncRouteHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
