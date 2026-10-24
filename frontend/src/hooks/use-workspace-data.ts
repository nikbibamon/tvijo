/**
 * Small dependency-free data hook for workspace screens (ТЗ §8):
 * skeleton while loading, recoverable error with retry, honest empty state.
 *
 * Accepts an async fetcher (from workspaceApi). Parallel calls are handled by
 * the caller firing multiple hooks independently (React 18 starts them
 * concurrently); no serial waterfalls.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { PortalApiError } from '@/lib/portal-auth-fetch';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  /**
   * Machine-readable reason when the backend gave one (e.g.
   * `budget_exceeded`). A cap and an outage need different words and a
   * different call to action; the message string alone cannot tell them apart.
   */
  errorCode: string | null;
  reload: () => void;
};

export function useWorkspaceData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = JSON.stringify(deps);

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    fetcherRef.current()
      .then((result) => {
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Request failed');
          setErrorCode(err instanceof PortalApiError ? err.code : null);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  useEffect(() => run(), [run, depsKey]);

  return { data, loading, error, errorCode, reload: run };
}

/** True when the payload's primary list is empty → drives empty state. */
export function isEmptyList(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}
