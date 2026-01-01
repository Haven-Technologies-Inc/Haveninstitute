import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Security validation for JWT secrets
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

function validateJWTSecret(secret: string, secretName: string): string {
  if (!secret) {
    throw new Error(`${secretName} environment variable is required`);
  }
  
  if (isProduction && secret.length < 32) {
    throw new Error(`${secretName} must be at least 32 characters in production`);
  }
  
  if (isProduction && (
    secret.includes('change_in_production') || 
    secret.includes('your_') || 
    secret.includes('super_secret') ||
    secret.includes('example')
  )) {
    throw new Error(`${secretName} appears to be a default/development secret. Use a secure, randomly generated secret in production`);
  }
  
  return secret;
}

// Generate secure secrets for development if not provided
function generateSecureSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

const jwtSecret = process.env.JWT_SECRET || (isDevelopment ? generateSecureSecret() : '');
const refreshSecret = process.env.JWT_REFRESH_SECRET || (isDevelopment ? generateSecureSecret() : '');

// Validate secrets
const validatedJWTSecret = validateJWTSecret(jwtSecret, 'JWT_SECRET');
const validatedRefreshSecret = validateJWTSecret(refreshSecret, 'JWT_REFRESH_SECRET');

export const jwtConfig = {
  secret: validatedJWTSecret,
  refreshSecret: validatedRefreshSecret,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: 'HS256' as const,
  issuer: 'haven-institute',
  audience: 'haven-institute-api',
  // Enhanced security settings
  clockTolerance: 30, // 30 seconds clock skew tolerance
  maxAge: '7d', // Maximum age for tokens
  notBefore: '0s' // Token is valid immediately
};

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
  jti?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  aud?: string;
}

// JWT validation utilities
export const jwtUtils = {
  // Validate token format and structure
  validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Basic JWT structure validation
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      return header.alg === 'HS256' && payload.iss === 'haven-institute';
    } catch {
      return false;
    }
  },
  
  // Check if token is expired
  isTokenExpired(payload: JWTPayload): boolean {
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  },
  
  // Check if token was issued before not-before claim
  isTokenTooEarly(payload: JWTPayload): boolean {
    if (!payload.nbf) return false;
    return Date.now() < payload.nbf * 1000;
  },
  
  // Generate secure random JTI for token revocation
  generateJTI(): string {
    return crypto.randomBytes(16).toString('hex');
  }
};

// Security warnings for development
if (isDevelopment) {
  console.log('🔧 Development mode: Using auto-generated JWT secrets');
  console.log('⚠️  WARNING: Do NOT use these secrets in production!');
}
