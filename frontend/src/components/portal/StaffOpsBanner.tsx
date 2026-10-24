'use client';

/**
 * Staff-only ops strip: polls /api/v1/agents/ops-banner/ (IsAdminUser).
 * GEN-OPS-BANNER-001
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { portalApiFetch } from '@/lib/portal-auth-fetch';

const POLL_MS = 45_000;

export interface OpsBannerPayload {
  level: 'ok' | 'warning' | 'critical';
  message: string;
  kill_switch_active: boolean;
  circuit_breaker_tripped: boolean;
  observer_status: string;
  events_24h: { critical: number; emergency: number; warning: number };
  unresolved_total: number;
}

export default function StaffOpsBanner() {
  const pathname = usePathname() || '';
  const locale = parseLocale(pathname);
  const [staff, setStaff] = useState<boolean | null>(null);
  const [data, setData] = useState<OpsBannerPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const checkStaff = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setStaff(false);
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    fetch(`${base}/auth/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) {
          setStaff(false);
          return;
        }
        setStaff(!!(u.is_staff || u.is_superuser));
      })
      .catch(() => setStaff(false));
  }, []);

  const loadBanner = useCallback(() => {
    if (!staff) return;
    portalApiFetch<OpsBannerPayload>('/agents/ops-banner/')
      .then((d) => {
        setData(d);
        setErr(null);
        setLoaded(true);
      })
      .catch((e) => {
        if (e instanceof Error && e.message === 'Unauthorized') {
          setStaff(false);
          setErr(null);
          setData(null);
          setLoaded(false);
          return;
        }
        setErr('ops');
        setData(null);
        setLoaded(true);
      });
  }, [staff]);

  useEffect(() => {
    checkStaff();
  }, [checkStaff, pathname]);

  useEffect(() => {
    if (!staff) {
      setLoaded(false);
      setData(null);
      setErr(null);
    }
  }, [staff]);

  useEffect(() => {
    if (!staff) return;
    loadBanner();
    const t = setInterval(loadBanner, POLL_MS);
    return () => clearInterval(t);
  }, [staff, loadBanner]);

  if (staff !== true) return null;

  if (!loaded) return null;

  if (err || !data) {
    return (
      <div className="bg-zinc-800/90 border-b border-white/10 text-center py-1.5 px-3 text-[11px] text-zinc-400">
        Ops banner unavailable (check API or network)
      </div>
    );
  }

  if (data.level === 'ok') return null;

  const bg =
    data.level === 'critical'
      ? 'bg-red-950/95 border-red-500/40 text-red-100'
      : 'bg-amber-950/90 border-amber-500/35 text-amber-100';

  return (
    <div className={`border-b text-center py-2 px-3 text-xs ${bg}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="font-semibold">
          {data.level === 'critical' ? 'Critical' : 'Warning'}: {data.message}
        </span>
        <Link
          href={`/${locale}/agentadmin`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium"
        >
          Open Agent Control →
        </Link>
      </div>
    </div>
  );
}
