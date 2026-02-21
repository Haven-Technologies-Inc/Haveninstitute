import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Always return the same response regardless of whether the user exists
    // to prevent email enumeration attacks
    const successResponse = NextResponse.json(
      {
        success: true,
        message:
          'If an account with that email exists, we have sent a password reset link. Please check your inbox.',
      },
      { status: 200 }
    );

    // Look up the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      // Do not reveal that the user does not exist
      return successResponse;
    }

    // Generate reset token and set 1-hour expiry
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email (non-blocking)
    sendPasswordResetEmail(user.email, resetToken).catch((error) => {
      console.error('[ForgotPassword] Failed to send reset email:', error);
    });

    return successResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
