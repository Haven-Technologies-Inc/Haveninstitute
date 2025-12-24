import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import authService from '../services/auth.service';
import { ResponseHandler } from '../utils/response';

// Helper functions
const getDeviceInfo = (req: AuthRequest) => ({
  ipAddress: req.ip || req.socket.remoteAddress,
  userAgent: req.headers['user-agent']
});

const getTokenFromHeader = (req: AuthRequest): string => {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
};

export class AuthController {
  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      ResponseHandler.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const deviceInfo = getDeviceInfo(req);
      const result = await authService.login(req.body, deviceInfo);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const deviceInfo = getDeviceInfo(req);
      const result = await authService.refreshToken(refreshToken, deviceInfo);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = getTokenFromHeader(req);
      const result = await authService.logout(req.userId!, token);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  logoutAllDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.logoutAllDevices(req.userId!);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      ResponseHandler.success(res, req.user?.toJSON());
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(req.body);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.changePassword(req.userId!, req.body);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resendVerificationEmail(req.userId!);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getActiveSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessions = await authService.getActiveSessions(req.userId!);
      ResponseHandler.success(res, { sessions });
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const result = await authService.revokeSession(req.userId!, sessionId);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
