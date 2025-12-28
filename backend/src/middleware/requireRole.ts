/**
 * Role-based access control middleware
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ResponseHandler } from '../utils/response';

type UserRole = 'student' | 'admin' | 'moderator' | 'instructor' | 'editor';

/**
 * Middleware to require specific user roles
 * @param allowedRoles - Array of roles that are allowed access
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHandler.error(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    const userRole = req.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      return ResponseHandler.error(
        res, 
        'FORBIDDEN', 
        'You do not have permission to access this resource', 
        403
      );
    }

    next();
  };
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to require moderator or admin role
 */
export const requireModerator = requireRole(['admin', 'moderator']);

/**
 * Middleware to require instructor role or higher
 */
export const requireInstructor = requireRole(['admin', 'instructor']);
