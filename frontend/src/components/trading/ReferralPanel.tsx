'use client';

/**
 * Referral Panel — Dashboard for referral program stats and management
 * Generation: GEN-TRADING-005
 */

import { useState, useEffect, useCallback } from 'react';
import { getReferralStats, applyReferralCode } from '@/services/trading-api';
import type { ReferralStats } from '@/services/trading-api';

export default function ReferralPanel() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [applyMsg, setApplyMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const data = await getReferralStats();
    if (data) setStats(data);
    setLoading(false);
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleApply = useCallback(async () => {
    if (!code.trim()) return;
    setApplyMsg('');
    const res = await applyReferralCode(code.trim());
    if (res) {
      setApplyMsg(res.message);
      setCode('');
      loadStats();
    } else {
      setApplyMsg('Invalid code or you already have a referrer.');
    }
  }, [code, loadStats]);

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="text-center text-gray-400 animate-pulse py-8">Loading referral data...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="text-center text-gray-400 py-8">Unable to load referral data. Please try again later.</div>
      </div>
    );
  }

  const earnings = parseFloat(stats.total_earnings);
  const pending = parseFloat(stats.pending_rewards);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Referral Program</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Earn 25% from every subscription through your referral link
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">{stats.total_referrals}</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Referrals</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">${earnings.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Total Earned</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-blue-400">${pending.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Pending</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">25%</div>
          <div className="text-[10px] text-gray-500 uppercase mt-1">Commission</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="text-xs text-amber-400 font-medium mb-2">Your Referral Link</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={stats.referral_link}
            className="flex-1 bg-slate-900/60 border border-slate-700 text-white text-sm rounded-lg p-2.5 font-mono"
          />
          <button
            onClick={() => handleCopy(stats.referral_link)}
            className="px-4 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-400 transition-all"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Code: <strong className="text-amber-400 font-mono">{stats.referral_code}</strong></span>
          <button
            onClick={() => handleCopy(stats.referral_code)}
            className="text-amber-500/70 hover:text-amber-400 transition-colors"
          >
            Copy code
          </button>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
        <div className="text-xs text-gray-400 font-medium mb-3">Earnings Calculator</div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-gray-500 mb-1">Starter Sale</div>
            <div className="text-white font-bold">$12.25/mo</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-gray-500 mb-1">Pro Sale</div>
            <div className="text-white font-bold">$37.25/mo</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-gray-500 mb-1">Lifetime Sale</div>
            <div className="text-amber-400 font-bold">$1,250</div>
          </div>
        </div>
      </div>

      {/* Referred Users */}
      {stats.referred_users.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2">Your Referrals ({stats.referred_users.length})</h3>
          <div className="space-y-1.5">
            {stats.referred_users.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-lg text-xs">
                <span className="text-gray-300 font-mono">{u.email}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700/50 text-gray-400 rounded-full text-[10px] uppercase">{u.tier}</span>
                  <span className="text-gray-600">{new Date(u.joined).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward History */}
      {stats.rewards.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2">Reward History</h3>
          <div className="space-y-1.5">
            {stats.rewards.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-700/30 rounded-lg text-xs">
                <div>
                  <span className="text-gray-300">{r.referred_email}</span>
                  {r.description && <span className="text-gray-600 ml-2">{r.description}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">${parseFloat(r.amount_usd).toFixed(2)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    r.is_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {r.is_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Referral Code */}
      <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
        <div className="text-xs text-gray-400 font-medium mb-2">Have a referral code?</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            maxLength={16}
            className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 font-mono uppercase"
          />
          <button
            onClick={handleApply}
            disabled={!code.trim()}
            className="px-4 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-400 transition-all disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {applyMsg && (
          <div className="text-xs text-gray-400 mt-2">{applyMsg}</div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center text-xs text-gray-600">
        Rewards are paid in USDT. Contact <a href="https://t.me/bibamon" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">@bibamon</a> for payout requests.
      </div>
    </div>
  );
}
