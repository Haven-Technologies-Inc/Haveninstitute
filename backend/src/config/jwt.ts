import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_change_in_production',
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
