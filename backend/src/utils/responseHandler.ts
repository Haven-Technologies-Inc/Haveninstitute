import { Response } from 'express';

export class ResponseHandler {
  static success(res: Response, data: any, message?: string) {
    res.status(200).json({
      success: true,
      data,
      message,
    });
  }

  static error(res: Response, code: string, message: string, statusCode: number = 500) {
    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }

  static created(res: Response, data: any, message?: string) {
    res.status(201).json({
      success: true,
      data,
      message,
    });
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    this.error(res, 'NOT_FOUND', message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    this.error(res, 'UNAUTHORIZED', message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    this.error(res, 'FORBIDDEN', message, 403);
  }

  static badRequest(res: Response, message: string = 'Bad request') {
    this.error(res, 'BAD_REQUEST', message, 400);
  }

  static serverError(res: Response, message: string = 'Internal server error') {
    this.error(res, 'SERVER_ERROR', message, 500);
  }
}
