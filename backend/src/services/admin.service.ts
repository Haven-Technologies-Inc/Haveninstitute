/**
 * Admin Service
 * 
 * Handles admin operations including user management
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Session } from '../models/Session';
import emailService from './email.service';
import { logger } from '../utils/logger';

export interface CreateUserInput {
  email: string;
  fullName: string;
  role: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  password?: string;
  sendInvite?: boolean;
  subscriptionTier?: 'Free' | 'Pro' | 'Premium';
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  role?: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  subscriptionTier?: 'Free' | 'Pro' | 'Premium';
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  subscriptionTier?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AdminService {
  private readonly BCRYPT_ROUNDS = 12;

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedUsers> {
    const where: any = {};

    if (filters.search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${filters.search}%` } },
        { fullName: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.subscriptionTier) {
      where.subscriptionTier = filters.subscriptionTier;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });
  }

  /**
   * Create a new user (admin function)
   */
  async createUser(input: CreateUserInput): Promise<{ user: User; tempPassword?: string }> {
    // Check if email exists
    const existingUser = await User.findOne({ where: { email: input.email } });
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Generate temporary password if not provided
    const tempPassword = input.password || this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, this.BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role || 'student',
      subscriptionTier: input.subscriptionTier || 'Free',
      isActive: true,
      emailVerified: false,
      hasCompletedOnboarding: false
    });

    logger.info(`Admin created new user: ${input.email} with role ${input.role}`);

    // Send invite email if requested
    if (input.sendInvite !== false) {
      await this.sendInviteEmail(user, tempPassword);
    }

    // Return user without password hash
    const userJson = user.toJSON();
    delete userJson.passwordHash;

    return {
      user: userJson as User,
      tempPassword: input.password ? undefined : tempPassword
    };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check email uniqueness if changing email
    if (input.email && input.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: input.email } });
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }
    }

    await user.update(input);
    logger.info(`Admin updated user: ${userId}`);

    // Return user without password hash
    const userJson = user.toJSON();
    delete userJson.passwordHash;

    return userJson as User;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete all sessions first
    await Session.destroy({ where: { userId } });

    // Delete user
    await user.destroy();
    logger.info(`Admin deleted user: ${userId}`);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, sendEmail: boolean = true): Promise<string> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    await user.update({ passwordHash });

    // Invalidate all sessions
    await Session.destroy({ where: { userId } });

    logger.info(`Admin reset password for user: ${userId}`);

    if (sendEmail) {
      await this.sendPasswordResetNotification(user, newPassword);
    }

    return newPassword;
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });

    // If deactivating, invalidate all sessions
    if (!newStatus) {
      await Session.destroy({ where: { userId } });
    }

    logger.info(`Admin ${newStatus ? 'activated' : 'deactivated'} user: ${userId}`);

    const userJson = user.toJSON();
    delete userJson.passwordHash;

    return userJson as User;
  }

  /**
   * Resend invite email
   */
  async resendInvite(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new temp password
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, this.BCRYPT_ROUNDS);

    await user.update({ passwordHash, emailVerified: false });

    await this.sendInviteEmail(user, tempPassword);
    logger.info(`Admin resent invite to user: ${userId}`);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const verifiedUsers = await User.count({ where: { emailVerified: true } });
    
    const roleDistribution = await User.findAll({
      attributes: ['role', [User.sequelize!.fn('COUNT', '*'), 'count']],
      group: ['role'],
      raw: true
    });

    const subscriptionDistribution = await User.findAll({
      attributes: ['subscriptionTier', [User.sequelize!.fn('COUNT', '*'), 'count']],
      group: ['subscriptionTier'],
      raw: true
    });

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentSignups,
      roleDistribution,
      subscriptionDistribution
    };
  }

  /**
   * Generate temporary password
   */
  private generateTempPassword(): string {
    return crypto.randomBytes(4).toString('hex') + '!' + crypto.randomBytes(2).toString('hex').toUpperCase();
  }

  /**
   * Send invite email to new user
   */
  private async sendInviteEmail(user: User, tempPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL || 'https://havenstudy.com'}/login`;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Welcome to Haven Institute - Your Account Has Been Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Haven Institute!</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <p style="color: #1f2937; font-size: 16px;">Hi ${user.fullName},</p>
            <p style="color: #4b5563; line-height: 1.6;">
              An account has been created for you at Haven Institute. You can now access our NCLEX preparation platform.
            </p>
            
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Your Login Credentials</h3>
              <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="color: #4b5563; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
            </div>

            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ Please change your password after your first login for security.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you didn't expect this email, please contact our support team.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Haven Institute. All rights reserved.</p>
          </div>
        </div>
      `
    });

    logger.info(`Invite email sent to ${user.email}`);
  }

  /**
   * Send password reset notification
   */
  private async sendPasswordResetNotification(user: User, newPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL || 'https://havenstudy.com'}/login`;

    await emailService.sendEmail({
      to: user.email,
      subject: 'Haven Institute - Your Password Has Been Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <p style="color: #1f2937; font-size: 16px;">Hi ${user.fullName},</p>
            <p style="color: #4b5563; line-height: 1.6;">
              Your password has been reset by an administrator. Here are your new login credentials:
            </p>
            
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="color: #4b5563; margin: 5px 0;"><strong>New Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${newPassword}</code></p>
            </div>

            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ Please change your password after logging in for security.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Login Now
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Haven Institute. All rights reserved.</p>
          </div>
        </div>
      `
    });

    logger.info(`Password reset notification sent to ${user.email}`);
  }
}

export const adminService = new AdminService();
export default adminService;
