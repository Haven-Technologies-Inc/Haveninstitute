import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { SettingsService } from '../services/settings.service';
import { ResponseHandler } from '../utils/response';

const settingsService = new SettingsService();

export class SettingsController {
  // Get user settings
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const settings = await settingsService.getSettings(userId);
      return ResponseHandler.success(res, settings);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const preferences = req.body;
      const settings = await settingsService.updateNotificationPreferences(userId, preferences);
      return ResponseHandler.success(res, settings);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update study preferences
  static async updateStudyPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const preferences = req.body;
      const settings = await settingsService.updateStudyPreferences(userId, preferences);
      return ResponseHandler.success(res, settings);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update display preferences
  static async updateDisplayPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const preferences = req.body;
      const settings = await settingsService.updateDisplayPreferences(userId, preferences);
      return ResponseHandler.success(res, settings);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const privacy = req.body;
      const settings = await settingsService.updatePrivacySettings(userId, privacy);
      return ResponseHandler.success(res, settings);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get user profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const profile = await settingsService.getProfile(userId);
      return ResponseHandler.success(res, profile);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update user profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const updates = req.body;
      const profile = await settingsService.updateProfile(userId, updates);
      return ResponseHandler.success(res, profile);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Change password
  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Current and new passwords required', 400);
      }

      await settingsService.changePassword(userId, currentPassword, newPassword);
      return ResponseHandler.success(res, { message: 'Password updated successfully' });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        return ResponseHandler.error(res, 'AUTH_ERROR', error.message, 401);
      }
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update email
  static async updateEmail(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { newEmail, password } = req.body;

      if (!newEmail || !password) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Email and password required', 400);
      }

      await settingsService.updateEmail(userId, newEmail, password);
      return ResponseHandler.success(res, { message: 'Email updated successfully' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get active sessions
  static async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const sessions = await settingsService.getSessions(userId);
      return ResponseHandler.success(res, sessions);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Revoke session
  static async revokeSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId } = req.params;

      await settingsService.revokeSession(userId, sessionId);
      return ResponseHandler.success(res, { message: 'Session revoked' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Revoke all sessions except current
  static async revokeAllSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const currentToken = req.headers.authorization?.split(' ')[1];

      await settingsService.revokeAllSessions(userId, currentToken);
      return ResponseHandler.success(res, { message: 'All other sessions revoked' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Enable 2FA
  static async enable2FA(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const result = await settingsService.enable2FA(userId);
      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Verify and activate 2FA
  static async verify2FA(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { token } = req.body;

      if (!token) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Token required', 400);
      }

      const success = await settingsService.verify2FA(userId, token);
      if (!success) {
        return ResponseHandler.error(res, 'AUTH_ERROR', 'Invalid token', 401);
      }

      return ResponseHandler.success(res, { message: '2FA enabled successfully' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Disable 2FA
  static async disable2FA(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { password } = req.body;

      if (!password) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password required', 400);
      }

      await settingsService.disable2FA(userId, password);
      return ResponseHandler.success(res, { message: '2FA disabled' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Export user data (GDPR)
  static async exportData(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const data = await settingsService.exportUserData(userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=user-data-export.json');
      return res.send(JSON.stringify(data, null, 2));
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Delete account
  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { password, confirmation } = req.body;

      if (!password || confirmation !== 'DELETE') {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Password and confirmation required', 400);
      }

      await settingsService.deleteAccount(userId, password);
      return ResponseHandler.success(res, { message: 'Account deleted' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }
}
