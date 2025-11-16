import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { jwtConfig, JWTPayload } from '../config/jwt';
import { errorCodes } from '../utils/response';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  nclexType?: 'RN' | 'PN';
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw {
        status: 400,
        code: errorCodes.AUTH_EMAIL_EXISTS,
        message: 'Email already registered'
      };
    }

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash: data.password, // Will be hashed by hook
      fullName: data.fullName,
      nclexType: data.nclexType,
      goals: data.nclexType ? [`Pass NCLEX-${data.nclexType}`] : []
    } as any);

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async login(data: LoginData) {
    // Find user
    const user = await User.findOne({
      where: {
        email: data.email,
        isActive: true
      }
    });

    if (!user) {
      throw {
        status: 401,
        code: errorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValid = await user.comparePassword(data.password);
    if (!isValid) {
      throw {
        status: 401,
        code: errorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      };
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { userId: string };

      // Get user
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw {
        status: 401,
        code: errorCodes.AUTH_TOKEN_EXPIRED,
        message: 'Invalid or expired refresh token'
      };
    }
  }

  private async generateTokens(user: User) {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      subscription: user.subscriptionTier as any
    };

    // Generate access token
    const token = jwt.sign(
      payload,
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtConfig.refreshSecret,
      {
        expiresIn: jwtConfig.refreshExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );

    return { token, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export default new AuthService();
