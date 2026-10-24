'use client';

/**
 * NewsAdmin Auth Context — JWT token management for the admin panel.
 * Generation: GEN-NEWS-009
 *
 * Uses Django SimpleJWT endpoints:
 *   POST /api/v1/auth/login/   → {access, refresh, ...user}
 *   POST /api/v1/auth/refresh/ → {access}
 *   POST /api/v1/auth/logout/  → blacklist refresh
 *   GET  /api/v1/auth/me/      → user profile
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';

const API_BASE =
  process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Token helpers (localStorage)
// ---------------------------------------------------------------------------

function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NewsAdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // ----- Refresh access token -----
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const { refresh } = getTokens();
    if (!refresh) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        clearTokens();
        return null;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      // If server rotates refresh tokens, store the new one
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      return data.access;
    } catch {
      clearTokens();
      return null;
    }
  }, []);

  // ----- Fetch current user (/auth/me/) -----
  const fetchMe = useCallback(
    async (accessToken: string): Promise<AdminUser | null> => {
      try {
        const res = await fetch(`${API_BASE}/auth/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.status === 401) {
          // Try refresh once
          const newToken = await refreshAccessToken();
          if (!newToken) return null;
          const retry = await fetch(`${API_BASE}/auth/me/`, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          if (!retry.ok) return null;
          return retry.json();
        }

        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    [refreshAccessToken],
  );

  // ----- Init: check stored tokens on mount -----
  useEffect(() => {
    async function init() {
      const { access } = getTokens();
      if (!access) {
        setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
        return;
      }

      const user = await fetchMe(access);
      if (user) {
        setState({ user, isLoading: false, isAuthenticated: true, error: null });
      } else {
        clearTokens();
        setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    }
    init();
  }, [fetchMe]);

  // ----- Login -----
  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const res = await fetch(`${API_BASE}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg =
            errData.detail ||
            errData.non_field_errors?.[0] ||
            'Invalid email or password';
          setState((s) => ({ ...s, isLoading: false, error: msg }));
          return;
        }

        const data = await res.json();

        if (!data.access || !data.refresh) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: 'Invalid response from server',
          }));
          return;
        }

        setTokens(data.access, data.refresh);

        const user: AdminUser = {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: data.full_name,
          is_staff: data.is_staff,
          is_superuser: data.is_superuser,
        };

        setState({ user, isLoading: false, isAuthenticated: true, error: null });

        // Redirect to newsadmin dashboard
        const locale = parseLocale(pathname);
        router.push(`/${locale}/newsadmin`);
      } catch (err) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Network error — check your connection',
        }));
      }
    },
    [router, pathname],
  );

  // ----- Logout -----
  const logout = useCallback(async () => {
    const { refresh } = getTokens();
    const { access } = getTokens();

    // Best-effort blacklist
    if (refresh && access) {
      try {
        await fetch(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ refresh }),
        });
      } catch {
        // ignore
      }
    }

    clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });

    const locale = parseLocale(pathname);
    router.push(`/${locale}/newsadmin/login`);
  }, [router, pathname]);

  // ----- Auto-refresh (every 12 minutes for 15-min tokens) -----
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(
      () => {
        refreshAccessToken();
      },
      12 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [state.isAuthenticated, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNewsAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useNewsAdminAuth must be used within NewsAdminAuthProvider');
  }
  return ctx;
}
