import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// Skip rate limiting for admin users and admin routes
const skipAdmin = (req: Request): boolean => {
  // Skip admin routes entirely
  if (req.path.includes('/admin') || req.path.includes('/generate')) {
    return true;
  }
  // Skip if user is admin (check from auth middleware)
  const user = (req as any).user;
  if (user && (user.role === 'admin' || user.role === 'instructor')) {
    return true;
  }
  return false;
};

export const apiLimiter = rateLimit({
  windowMs,
  max,
  skip: skipAdmin,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// AI Tutor rate limiter - only applies to student AI tutor usage
export const aiTutorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute for students
  skip: skipAdmin, // Admins/instructors skip this
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please wait a moment before trying again.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many failed authentication attempts, please try again later'
    }
  }
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to this endpoint, please try again later'
    }
  }
});
