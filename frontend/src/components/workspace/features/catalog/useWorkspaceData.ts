'use client';

/**
 * Data sources for the dashboard and the catalog.
 *
 * Two rules this file exists to enforce:
 *
 * 1. One request per surface. The dashboard fetches `/workspace/dashboard/`
 *    (account state + next action + catalog); the catalog page fetches
 *    `/workspace/catalog/`. Nothing fetches both.
 * 2. A stale response can never overwrite a fresh one. Every load carries a
 *    sequence number and late arrivals are dropped.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { workspaceApi } from '@/lib/workspace-api';
import type { SkillPacksResponse, SolutionCatalog, WorkspaceDashboard } from '@/types/workspace';

export type Loadable<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

function useSequencedLoad<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  enabled: boolean,
): Loadable<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    // React StrictMode intentionally mounts, cleans up, then mounts effects
    // again in development. Reset the ref on every effect setup so the
    // second request is allowed to publish its result instead of leaving the
    // workspace on a permanent skeleton.
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;
    const ticket = (sequence.current += 1);
    setError('');
    try {
      const next = await fetcher();
      // Drop a response that a newer request has already superseded, and any
      // response that arrives after unmount.
      if (!mounted.current || ticket !== sequence.current) return;
      setData(next);
    } catch (err) {
      if (!mounted.current || ticket !== sequence.current) return;
      setError(err instanceof Error ? err.message : 'load failed');
    } finally {
      // `loading` is only ever true until the first payload lands; a refetch
      // keeps the current screen instead of flashing a skeleton.
      if (mounted.current && ticket === sequence.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, reload: load };
}

/** The dashboard's single request. */
export function useDashboard(locale: Locale): Loadable<WorkspaceDashboard> {
  return useSequencedLoad(
    () => workspaceApi.dashboard(locale), [locale], true);
}

/** The catalog page's single request. `enabled` is false when a parent
 *  already supplied the catalog (dashboard), so nothing is fetched twice. */
export function useCatalog(
  locale: Locale, enabled = true,
): Loadable<SolutionCatalog> {
  return useSequencedLoad(
    () => workspaceApi.catalog(locale), [locale], enabled);
}

/** The skill-pack storefront's single catalogue request. */
export function useSkillPacks(locale: Locale): Loadable<SkillPacksResponse> {
  return useSequencedLoad(() => workspaceApi.skillPacks(), [locale], true);
}
