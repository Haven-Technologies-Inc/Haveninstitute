import dotenv from 'dotenv';

dotenv.config();

// Security check: Warn if using default secrets in production
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_change_in_production';

if (isProduction && (jwtSecret.includes('change_in_production') || refreshSecret.includes('change_in_production'))) {
  console.error('⚠️  SECURITY WARNING: Using default JWT secrets in production! Set JWT_SECRET and JWT_REFRESH_SECRET environment variables.');
  process.exit(1);
}

export const jwtConfig = {
  secret: jwtSecret,
  refreshSecret: refreshSecret,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: 'HS256' as const,
  issuer: 'haven-institute',
  audience: 'haven-institute-api'
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  subscription: 'Free' | 'Pro' | 'Premium';
  iat?: number;
  exp?: number;
}
