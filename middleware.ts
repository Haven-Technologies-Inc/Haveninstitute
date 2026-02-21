import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes - require admin role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Dashboard routes - require authentication (handled by withAuth)
    // Onboarding check - redirect if not completed
    if (
      !pathname.startsWith('/onboarding') &&
      !pathname.startsWith('/api') &&
      token &&
      !token.hasCompletedOnboarding &&
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/practice') ||
        pathname.startsWith('/study') ||
        pathname.startsWith('/progress') ||
        pathname.startsWith('/community') ||
        pathname.startsWith('/account'))
    ) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/verify-email') ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/nclex-rn') ||
          pathname.startsWith('/nclex-pn') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/api/stripe/webhooks') ||
          pathname.startsWith('/api/account') ||
          (pathname === '/api/admin/plans' && req.method === 'GET')
        ) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
