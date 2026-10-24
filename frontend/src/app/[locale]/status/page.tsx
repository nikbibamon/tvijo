'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { parseLocale } from '@/i18n/config';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface HealthCheck {
  name: string;
  status: string;
  details: string;
}

interface HealthData {
  status: string;
  timestamp: string;
  checks?: HealthCheck[];
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500 animate-pulse',
  };
  return <div className={`h-2.5 w-2.5 rounded-full ${colors[status] || 'bg-gray-500'}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status === 'ok' ? 'Operational' : status === 'warning' ? 'Degraded' : status === 'critical' ? 'Major Outage' : status}
    </span>
  );
}

function getLocale(pathname: string | null) {
  return parseLocale(pathname);
}

export default function StatusPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);

  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try detailed endpoint first (staff only)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('newsadmin_access') : null;
      const detailedRes = token
        ? await fetch(`${API_BASE}/ops/health/detailed/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : null;

      if (detailedRes && detailedRes.ok) {
        const json = await detailedRes.json();
        setData(json);
        return;
      }

      // Fallback to public health endpoint
      const res = await fetch(`${API_BASE}/ops/health/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Unable to load status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const statusEmoji: Record<string, string> = { ok: '✅', warning: '⚠️', critical: '🔴' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            System Status
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tvijo Platform Status
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
            Real-time health of Tvijo services and infrastructure.
          </p>
        </div>

        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {error && !data && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <div className="mb-2 text-2xl">🔴</div>
            <p className="font-semibold text-red-400">Unable to fetch status</p>
            <p className="mt-1 text-sm text-red-300/70">{error}</p>
            <button
              onClick={load}
              className="mt-4 inline-flex items-center rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Overall status card */}
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-center gap-3">
                <StatusDot status={data.status} />
                <StatusBadge status={data.status} />
              </div>
              <p className="text-sm text-gray-400">
                Last updated: {new Date(data.timestamp).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                {' · '}Auto-refreshes every 30s
              </p>
              <button
                onClick={load}
                className="mt-4 inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Refresh now
              </button>
            </div>

            {/* Detailed checks (only visible to staff when detailed data is present) */}
            {data.checks && data.checks.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {data.checks.map((check) => (
                  <div
                    key={check.name}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:border-white/15"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold capitalize text-white">
                        {check.name.replace(/_/g, ' ')}
                      </h3>
                      <StatusDot status={check.status} />
                    </div>
                    <p className="text-xs leading-relaxed text-gray-400">{check.details}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Public minimal view hint */}
            {!data.checks && (
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  Detailed check data is available to authorized staff members.
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="mt-2 inline-block text-emerald-400 underline underline-offset-2 transition hover:text-emerald-300"
                >
                  Staff login
                </Link>
              </div>
            )}
          </>
        )}

        {/* Incident history placeholder / contact */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="mb-2 text-sm font-semibold text-white">Need help?</h2>
          <p className="text-xs leading-relaxed text-gray-400">
            If you are experiencing issues not reflected here, please contact support via{' '}
            <a
              href="https://t.me/bibamon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline underline-offset-2 transition hover:text-emerald-300"
            >
              Telegram @bibamon
            </a>
            {' '}or check the{' '}
            <Link href={`/${locale}/faq`} className="text-emerald-400 underline underline-offset-2 transition hover:text-emerald-300">
              FAQ
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
