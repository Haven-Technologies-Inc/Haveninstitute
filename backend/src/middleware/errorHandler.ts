import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class APIError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

export const errorHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  // Handle API errors
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
  }

  // Default error response
  const statusCode = 'statusCode' in error ? (error as any).statusCode : 500;

  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

// ============================================================================
// PRISMA ERROR HANDLER
// ============================================================================

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError, res: Response) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        error: 'Conflict',
        message: `A record with this ${field} already exists`,
        field,
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        error: 'Not Found',
        message: 'Record not found',
      });

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Referenced record does not exist',
      });

    case 'P2014':
      // Required relation violation
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Required relation missing',
      });

    case 'P2000':
      // Value too long for column type
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Input value is too long',
      });

    case 'P2001':
      // Record does not exist
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested record does not exist',
      });

    case 'P2011':
      // Null constraint violation
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Required field is missing',
      });

    default:
      return res.status(500).json({
        error: 'Database Error',
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'A database error occurred',
        code: error.code,
      });
  }
};

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

/**
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// NOT FOUND ERROR
// ============================================================================

export const notFound = (resourceName: string = 'Resource') => {
  throw new APIError(`${resourceName} not found`, 404);
};

// ============================================================================
// VALIDATION ERROR
// ============================================================================

export const validationError = (message: string) => {
  throw new APIError(message, 400);
};

// ============================================================================
// UNAUTHORIZED ERROR
// ============================================================================

export const unauthorized = (message: string = 'Unauthorized') => {
  throw new APIError(message, 401);
};

// ============================================================================
// FORBIDDEN ERROR
// ============================================================================

export const forbidden = (message: string = 'Forbidden') => {
  throw new APIError(message, 403);
};
