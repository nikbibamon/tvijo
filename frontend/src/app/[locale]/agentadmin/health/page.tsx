'use client';

/**
 * System Health Page — PM2, DB, Redis, Celery, AI budget at a glance.
 * Generation: GEN-OPS-001
 */

import { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tvijo.com';

interface ProcessInfo {
  name: string;
  status: string;
  uptime_ms: number;
  restarts: number;
  memory_mb: number;
  cpu: number;
}

interface HealthCheck {
  name: string;
  status: string;
  details: string;
  processes?: ProcessInfo[];
  today_cost_usd?: number;
  month_cost_usd?: number;
  today_tokens?: number;
}

interface HealthData {
  status: string;
  timestamp: string;
  checks: HealthCheck[];
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500 animate-pulse',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-500'}`} />;
}

function formatUptime(ms: number): string {
  const now = Date.now();
  const diff = now - ms;
  if (diff < 0) {
    const totalSec = ms / 1000;
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // The shared admin auth provider stores the JWT under access_token.
      // Keep the legacy key as a fallback for already logged-in sessions.
      const token = localStorage.getItem('access_token') || localStorage.getItem('newsadmin_access');
      const res = await fetch(`${API_BASE}/api/v1/ops/health/detailed/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statusEmoji: Record<string, string> = { ok: '✅', warning: '⚠️', critical: '🔴' };
  const pm2Check = data.checks.find(c => c.name === 'pm2');
  const otherChecks = data.checks.filter(c => c.name !== 'pm2');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {statusEmoji[data.status] || '❓'} System Health
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Auto-refreshes every 15s &middot; {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} className="px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-sm rounded-lg hover:bg-cyan-600/30 transition-colors">
          Refresh
        </button>
      </div>

      {/* Service checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherChecks.map((check) => (
          <div key={check.name} className="bg-[#111827] rounded-xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white capitalize">
                {check.name.replace(/_/g, ' ')}
              </h3>
              <StatusDot status={check.status} />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{check.details}</p>
            {check.name === 'ai_budget' && (
              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-gray-500">Today</div>
                  <div className="text-sm font-bold text-cyan-400">${check.today_cost_usd?.toFixed(2) ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">This Month</div>
                  <div className="text-sm font-bold text-white">${check.month_cost_usd?.toFixed(2) ?? '—'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PM2 Processes */}
      {pm2Check && pm2Check.processes && (
        <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">PM2 Processes</h2>
            <StatusDot status={pm2Check.status} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Memory</th>
                  <th className="pb-2 pr-4">CPU</th>
                  <th className="pb-2 pr-4">Restarts</th>
                </tr>
              </thead>
              <tbody>
                {pm2Check.processes.map((p) => (
                  <tr key={p.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 font-medium text-white">{p.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'online'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">{p.memory_mb} MB</td>
                    <td className="py-2.5 pr-4 text-gray-400">{p.cpu}%</td>
                    <td className="py-2.5 pr-4">
                      <span className={p.restarts > 50 ? 'text-yellow-400' : 'text-gray-400'}>
                        {p.restarts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
