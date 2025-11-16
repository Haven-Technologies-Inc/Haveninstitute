import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ResponseHandler, errorCodes } from '../utils/response';

export interface HttpError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error(`Error: ${error.message}`, {
    method: req.method,
    path: req.path,
    error: error.stack
  });

  // Determine status code
  const statusCode = error.status || 500;
  const errorCode = error.code || errorCodes.SYS_INTERNAL_ERROR;

  // Send error response
  ResponseHandler.error(
    res,
    errorCode,
    error.message || 'Internal server error',
    statusCode,
    process.env.NODE_ENV === 'development' ? error.stack : undefined
  );
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  ResponseHandler.error(
    res,
    errorCodes.DB_NOT_FOUND,
    `Route ${req.method} ${req.path} not found`,
    404
  );
}
