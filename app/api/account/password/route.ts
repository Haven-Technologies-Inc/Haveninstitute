import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';
import { sendNotification, renderEmailTemplate } from '@/lib/notifications';

// ---------------------------------------------------------------------------
// POST /api/account/password
// Change the authenticated user's password.
// Body: { currentPassword, newPassword, confirmPassword }
// ---------------------------------------------------------------------------

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 12;
const PASSWORD_HISTORY_CHECK = 5; // number of previous passwords to check

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await request.json();

    const { currentPassword, newPassword, confirmPassword } = body;

    // --- Validation ---
    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(
        'Current password, new password, and confirmation are required'
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponse('New password and confirmation do not match');
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return errorResponse(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }

    // Check password strength (at least one uppercase, one lowercase, one digit)
    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return errorResponse(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    if (currentPassword === newPassword) {
      return errorResponse(
        'New password must be different from the current password'
      );
    }

    // --- Fetch current user ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        fullName: true,
        authProvider: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Users who signed up via OAuth may not have a password
    if (!user.passwordHash) {
      return errorResponse(
        'Password change is not available for accounts using social login. Please use your identity provider to manage your password.',
        400
      );
    }

    // --- Verify current password ---
    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // --- Check password history ---
    const recentPasswords = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PASSWORD_HISTORY_CHECK,
      select: { passwordHash: true },
    });

    for (const prev of recentPasswords) {
      const isReused = await bcrypt.compare(newPassword, prev.passwordHash);
      if (isReused) {
        return errorResponse(
          `You cannot reuse any of your last ${PASSWORD_HISTORY_CHECK} passwords`
        );
      }
    }

    // --- Hash and store ---
    const newHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.$transaction([
      // Update user's password
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      }),
      // Store in password history
      prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: newHash,
        },
      }),
    ]);

    // --- Send security notification ---
    const emailData = renderEmailTemplate('password_changed', {
      userName: user.fullName,
      date: new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    });

    await sendNotification({
      userId,
      type: 'security',
      title: 'Password Changed',
      message:
        'Your password was successfully changed. If you did not make this change, please contact support immediately.',
      actionUrl: '/account/settings',
      sendEmail: true,
    });

    return successResponse({
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
