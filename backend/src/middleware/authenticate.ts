import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { jwtConfig, JWTPayload } from '../config/jwt';
import { ResponseHandler, errorCodes } from '../utils/response';

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
  userSubscription?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_INVALID_CREDENTIALS,
        'No token provided',
        401
      );
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret) as JWTPayload;

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_USER_NOT_FOUND,
        'Invalid token or user not found',
        401
      );
      return;
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.userSubscription = user.subscriptionTier;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_TOKEN_EXPIRED,
        'Token has expired',
        401
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid token',
        401
      );
    } else {
      ResponseHandler.error(
        res,
        errorCodes.SYS_INTERNAL_ERROR,
        'Authentication error',
        500,
        error
      );
    }
  }
}

export function authorizeRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
        'Insufficient permissions',
        403
      );
      return;
    }
    next();
  };
}

export function requireSubscription(tiers: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userSubscription || !tiers.includes(req.userSubscription)) {
      ResponseHandler.error(
        res,
        errorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
        'This feature requires a Pro or Premium subscription',
        403
      );
      return;
    }
    next();
  };
}
