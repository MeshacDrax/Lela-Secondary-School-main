import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const error = err instanceof ApiError ? err : new ApiError(500, "Unexpected server error");

  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(error.status).json({
    error: {
      message: error.message,
      details: error.details ?? null
    }
  });
}
