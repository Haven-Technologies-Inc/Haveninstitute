import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import authService from '../services/auth.service';
import { AccountLockoutService } from '../services/accountLockout.service';
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
      const { email } = req.body;
      const deviceInfo = getDeviceInfo(req);

      // Check if account is locked before attempting login
      const lockoutStatus = await AccountLockoutService.isAccountLocked(email);
      
      if (lockoutStatus.isLocked) {
        return ResponseHandler.error(
          res,
          'ACCOUNT_LOCKED',
          `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockoutStatus.remainingTime} minutes.`,
          429,
          {
            lockoutUntil: lockoutStatus.lockoutUntil,
            remainingMinutes: lockoutStatus.remainingTime
          }
        );
      }

      try {
        const result = await authService.login(req.body, deviceInfo);
        
        // Record successful login
        await AccountLockoutService.recordSuccessfulAttempt(
          email, 
          result.user.id, 
          deviceInfo.ipAddress, 
          deviceInfo.userAgent
        );
        
        ResponseHandler.success(res, result);
      } catch (loginError: any) {
        // Record failed attempt
        await AccountLockoutService.recordFailedAttempt(
          email, 
          deviceInfo.ipAddress, 
          deviceInfo.userAgent
        );
        
        // Check if this failed attempt triggered a lockout
        const newLockoutStatus = await AccountLockoutService.isAccountLocked(email);
        
        if (newLockoutStatus.isLocked) {
          return ResponseHandler.error(
            res,
            'ACCOUNT_LOCKED',
            `Too many failed login attempts. Account locked for ${newLockoutStatus.remainingTime} minutes.`,
            429,
            {
              lockoutUntil: newLockoutStatus.lockoutUntil,
              remainingMinutes: newLockoutStatus.remainingTime,
              attempts: AccountLockoutService.getConfig().maxAttempts
            }
          );
        }
        
        throw loginError;
      }
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

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.updateProfile(req.userId!, req.body);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.updatePreferences(req.userId!, req.body);
      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
