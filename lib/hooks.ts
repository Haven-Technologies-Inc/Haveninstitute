'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to get the current user from the session with typed properties.
 */
export function useUser() {
  const { data: session, status, update } = useSession();

  const user = session?.user
    ? {
        id: (session.user as any).id as string,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        image: session.user.image ?? null,
        role: ((session.user as any).role as string) ?? 'student',
        subscriptionTier:
          ((session.user as any).subscriptionTier as string) ?? 'Free',
        hasCompletedOnboarding:
          ((session.user as any).hasCompletedOnboarding as boolean) ?? false,
      }
    : null;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'admin',
    isPro: user?.subscriptionTier === 'Pro' || user?.subscriptionTier === 'Premium',
    isPremium: user?.subscriptionTier === 'Premium',
    updateSession: update,
  };
}

/**
 * Hook for fetching data from an API endpoint with loading/error states.
 */
export function useFetch<T>(url: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Request failed (${res.status})`);
      }
      const json = await res.json();
      setData(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData, setData };
}

/**
 * Hook for polling an API endpoint at a given interval.
 */
export function usePolling<T>(
  url: string | null,
  intervalMs: number = 3000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchData = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json.data ?? json);
      }
    } catch {
      // Silently fail on poll errors
    }
  }, [url]);

  useEffect(() => {
    if (!enabled || !url) return;

    fetchData(); // Initial fetch
    intervalRef.current = setInterval(fetchData, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, intervalMs, enabled, url]);

  return { data, setData };
}

/**
 * Hook for debounced values.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for detecting mobile viewport.
 */
export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
