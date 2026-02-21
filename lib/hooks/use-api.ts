'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useApi<T = any>(options?: UseApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (url: string, fetchOptions?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json', ...fetchOptions?.headers },
          ...fetchOptions,
        });

        const json: ApiResponse<T> = await res.json();

        if (!json.success) {
          const errMsg = json.error ?? 'Something went wrong';
          setError(errMsg);
          options?.onError?.(errMsg);
          toast.error(errMsg);
          return null;
        }

        setData(json.data ?? null);
        options?.onSuccess?.(json.data!);
        if (options?.successMessage) toast.success(options.successMessage);
        return json.data ?? null;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Network error';
        setError(errMsg);
        options?.onError?.(errMsg);
        toast.error(errMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const get = useCallback((url: string) => execute(url), [execute]);

  const post = useCallback(
    (url: string, body: any) =>
      execute(url, { method: 'POST', body: JSON.stringify(body) }),
    [execute]
  );

  const patch = useCallback(
    (url: string, body: any) =>
      execute(url, { method: 'PATCH', body: JSON.stringify(body) }),
    [execute]
  );

  const del = useCallback(
    (url: string) => execute(url, { method: 'DELETE' }),
    [execute]
  );

  return { data, loading, error, get, post, patch, del, execute };
}
