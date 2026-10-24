/**
 * Current portal user — fetched from /api/v1/auth/me/ using the JWT in localStorage.
 *
 * Used by collaborative UIs (DecMap bundles, BubbleMap) to decide whether the
 * logged-in viewer can edit a resource (owner match OR staff).
 */

import { getAccessToken } from './auth';

// Keep aligned with login/profile/portal-auth-fetch (NEXT_PUBLIC_API_URL).
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

export interface CurrentUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

let cache: { at: number; user: CurrentUser | null } | null = null;
const CACHE_TTL_MS = 60_000;

export async function fetchCurrentUser(
  opts: { force?: boolean } = {},
): Promise<CurrentUser | null> {
  if (typeof window === 'undefined') return null;

  const token = getAccessToken();
  if (!token) return null;

  if (!opts.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.user;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      cache = { at: Date.now(), user: null };
      return null;
    }
    const user = (await res.json()) as CurrentUser;
    cache = { at: Date.now(), user };
    return user;
  } catch {
    return null;
  }
}

export function clearCurrentUserCache(): void {
  cache = null;
}
