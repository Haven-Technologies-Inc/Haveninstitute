import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required.' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token.' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Your email has already been verified.' },
        { status: 200 }
      );
    }

    // Mark the user's email as verified and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    // Send welcome email now that the user is verified (non-blocking)
    sendWelcomeEmail(user.email, user.fullName).catch((error) => {
      console.error('[VerifyEmail] Failed to send welcome email:', error);
    });

    // Redirect to a success page or return JSON
    const appUrl = process.env.NEXTAUTH_URL ?? 'https://haveninstitute.com';
    return NextResponse.redirect(
      `${appUrl}/auth/login?verified=true`,
      { status: 302 }
    );
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
