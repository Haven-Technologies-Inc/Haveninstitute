import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class ResponseHandler {
  static success<T>(res: Response, data: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
      }
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    limit: number,
    offset: number
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
    return res.status(200).json(response);
  }
}

export const errorCodes = {
  // Authentication errors (AUTH)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  AUTH_USER_NOT_FOUND: 'AUTH_004',
  AUTH_EMAIL_EXISTS: 'AUTH_005',

  // Validation errors (VAL)
  VAL_INVALID_INPUT: 'VAL_001',
  VAL_MISSING_REQUIRED_FIELD: 'VAL_002',
  VAL_INVALID_FORMAT: 'VAL_003',

  // Database errors (DB)
  DB_QUERY_ERROR: 'DB_001',
  DB_NOT_FOUND: 'DB_002',
  DB_DUPLICATE_ENTRY: 'DB_003',

  // Payment errors (PAY)
  PAY_STRIPE_ERROR: 'PAY_001',
  PAY_SUBSCRIPTION_EXISTS: 'PAY_002',
  PAY_INSUFFICIENT_FUNDS: 'PAY_003',

  // System errors (SYS)
  SYS_INTERNAL_ERROR: 'SYS_001',
  SYS_NOT_IMPLEMENTED: 'SYS_002',
  SYS_SERVICE_UNAVAILABLE: 'SYS_003'
};
