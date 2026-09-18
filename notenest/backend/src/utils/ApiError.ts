/**
 * A typed application error carrying an HTTP status code.
 *
 * Throwing `new ApiError(404, "Note not found")` anywhere in a controller
 * or service lets the central error middleware translate it into a
 * consistent JSON response, instead of every route hand-rolling its own
 * `res.status(...).json(...)` error branch.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static internal(message = "Something went wrong") {
    return new ApiError(500, message);
  }
}
