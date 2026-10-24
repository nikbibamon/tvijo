'use client';

/**
 * AI Budget Page — token spending, cost control, model breakdown.
 * Generation: GEN-OPS-001
 */

import { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tvijo.com';

interface BudgetData {
  name: string;
  status: string;
  details: string;
  today_cost_usd: number;
  month_cost_usd: number;
  today_tokens: number;
}

export default function BudgetPage() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // The shared admin auth provider stores the JWT under access_token.
      // Keep the legacy key as a fallback for already logged-in sessions.
      const token = localStorage.getItem('access_token') || localStorage.getItem('newsadmin_access');
      const res = await fetch(`${API_BASE}/api/v1/ops/budget/`, {
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
    const interval = setInterval(load, 30000);
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

  const monthBudgetLimit = 50; // USD
  const usagePct = Math.min(100, (data.month_cost_usd / monthBudgetLimit) * 100);
  const barColor = usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">AI Budget</h1>
        <p className="text-sm text-gray-500 mt-0.5">Token spending and cost control</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] rounded-xl border border-white/5 p-6">
          <div className="text-xs text-gray-500 mb-1">Today&apos;s Spend</div>
          <div className="text-3xl font-bold text-cyan-400">${data.today_cost_usd.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">{data.today_tokens.toLocaleString()} tokens</div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-white/5 p-6">
          <div className="text-xs text-gray-500 mb-1">Monthly Spend</div>
          <div className="text-3xl font-bold text-white">${data.month_cost_usd.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">of ${monthBudgetLimit} budget</div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-white/5 p-6">
          <div className="text-xs text-gray-500 mb-1">Budget Usage</div>
          <div className="text-3xl font-bold text-white">{usagePct.toFixed(0)}%</div>
          <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      </div>

      {/* Limits info */}
      <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Token Limits by Rank</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Monthly Limit</th>
                <th className="pb-2 pr-4">Token Rate</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-white/[0.03]">
                <td className="py-2.5 pr-4 font-medium text-white">Novice</td>
                <td className="py-2.5 pr-4">50,000</td>
                <td className="py-2.5 pr-4 text-yellow-400">30%</td>
                <td className="py-2.5">New users, basic access</td>
              </tr>
              <tr className="border-b border-white/[0.03]">
                <td className="py-2.5 pr-4 font-medium text-white">Contributor</td>
                <td className="py-2.5 pr-4">100,000</td>
                <td className="py-2.5 pr-4 text-cyan-400">50%</td>
                <td className="py-2.5">Active contributors</td>
              </tr>
              <tr className="border-b border-white/[0.03]">
                <td className="py-2.5 pr-4 font-medium text-white">Expert</td>
                <td className="py-2.5 pr-4">250,000</td>
                <td className="py-2.5 pr-4 text-green-400">70%</td>
                <td className="py-2.5">Proven quality contributions</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-white">Master</td>
                <td className="py-2.5 pr-4">500,000</td>
                <td className="py-2.5 pr-4 text-purple-400">90%</td>
                <td className="py-2.5">Top contributors, mentors</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost breakdown note */}
      <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Model Pricing Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
          <div className="flex justify-between p-2 bg-white/[0.02] rounded-lg">
            <span>Claude 3.5 Sonnet</span>
            <span className="text-white">$3 / $15 per 1M tokens</span>
          </div>
          <div className="flex justify-between p-2 bg-white/[0.02] rounded-lg">
            <span>Claude 3 Haiku</span>
            <span className="text-white">$0.25 / $1.25 per 1M tokens</span>
          </div>
          <div className="flex justify-between p-2 bg-white/[0.02] rounded-lg">
            <span>GPT-4o</span>
            <span className="text-white">$5 / $15 per 1M tokens</span>
          </div>
          <div className="flex justify-between p-2 bg-white/[0.02] rounded-lg">
            <span>GPT-4o mini</span>
            <span className="text-white">$0.15 / $0.60 per 1M tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
