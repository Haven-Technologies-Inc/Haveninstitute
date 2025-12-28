/**
 * Security Rate Limiting Middleware
 * 
 * Stricter rate limiting for sensitive endpoints like auth, MFA, OAuth
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Auth endpoints - login, register, password reset
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'), // 5 attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP + email for more precise limiting
    const email = req.body?.email || '';
    return `auth:${req.ip}:${email}`;
  },
  skip: (req: Request) => {
    // Skip for successful requests (handled after)
    return false;
  },
});

// MFA verification - strict limits to prevent TOTP guessing
export const mfaRateLimiter = rateLimit({
  windowMs: parseInt(process.env.MFA_RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
  max: parseInt(process.env.MFA_RATE_LIMIT_MAX_REQUESTS || '5'), // 5 attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many MFA verification attempts. Please try again in 5 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req as any).userId || req.ip;
    return `mfa:${userId}`;
  },
});

// OAuth endpoints
export const oauthRateLimiter = rateLimit({
  windowMs: parseInt(process.env.OAUTH_RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
  max: parseInt(process.env.OAUTH_RATE_LIMIT_MAX_REQUESTS || '10'), // 10 attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many OAuth requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password change/reset - very strict
export const passwordRateLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many password change attempts. Please try again in 1 hour.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId || req.ip;
    return `password:${userId}`;
  },
});

// Security endpoints - login history, sessions
export const securityRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account deletion - extremely strict
export const accountDeletionRateLimiter = rateLimit({
  windowMs: 86400000, // 24 hours
  max: 1, // 1 attempt per day
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Account deletion can only be attempted once per day.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId || req.ip;
    return `delete:${userId}`;
  },
});

export default {
  authRateLimiter,
  mfaRateLimiter,
  oauthRateLimiter,
  passwordRateLimiter,
  securityRateLimiter,
  accountDeletionRateLimiter,
};
