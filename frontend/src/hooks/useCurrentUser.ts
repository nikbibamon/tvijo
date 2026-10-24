'use client';

/**
 * Current portal user for navigation/account UI.
 * Single source of truth for "am I logged in + who am I" in client components.
 * Re-fetches /auth/me/ on the `tvijo-auth-changed` event (login/logout).
 */

import { useEffect, useState, useCallback } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

export interface PortalUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export function useCurrentUser(): {
  user: PortalUser | null;
  loading: boolean;
  refresh: () => void;
} {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/auth/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u: PortalUser | null) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('tvijo-auth-changed', load);
    return () => window.removeEventListener('tvijo-auth-changed', load);
  }, [load]);

  return { user, loading, refresh: load };
}
