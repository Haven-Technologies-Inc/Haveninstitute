import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import authService from '../services/auth.service';
import { ResponseHandler } from '../utils/response';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      ResponseHandler.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // In a real implementation, you would invalidate the token here
      // For now, just return success
      ResponseHandler.success(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ResponseHandler.success(res, req.user?.toJSON());
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
