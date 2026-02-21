'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useUser() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const getDashboardPath = useCallback(() => {
    if (!user) return '/login';
    if (!user.hasCompletedOnboarding) return '/onboarding';
    if (isAdmin) return '/admin';
    return '/dashboard';
  }, [user, isAdmin]);

  const redirectToDashboard = useCallback(() => {
    router.push(getDashboardPath());
  }, [router, getDashboardPath]);

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    isAdmin,
    isStudent,
    getDashboardPath,
    redirectToDashboard,
    updateSession: update,
  };
}
