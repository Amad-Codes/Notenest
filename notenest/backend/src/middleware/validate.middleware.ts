import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates `req.body` / `req.query` / `req.params` against a Zod schema
 * before the request reaches the controller. On failure, responds with a
 * 400 and a field-by-field breakdown of what was wrong — far more useful
 * to a frontend than a generic "bad request".
 */
export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      // Re-assign so defaults/coercions applied by the schema (e.g. a
      // default `view=active`) are visible to the controller too.
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest("Validation failed", err.flatten().fieldErrors));
      }
      next(err);
    }
  };
