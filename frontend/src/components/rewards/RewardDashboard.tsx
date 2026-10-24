'use client';

/**
 * RewardDashboard — user reward profile card with rank, score, tokens.
 */

import { useEffect, useState } from 'react';
import type { UserRewardProfile, Rank } from '@/services/decmap-api';
import { fetchRewardProfile } from '@/services/decmap-api';

const RANK_META: Record<Rank, { emoji: string; color: string; bg: string; border: string }> = {
  novice:      { emoji: '🌱', color: 'text-slate-300',  bg: 'bg-slate-800/60',   border: 'border-slate-700/50' },
  contributor: { emoji: '⭐', color: 'text-sky-300',    bg: 'bg-sky-500/10',     border: 'border-sky-500/25' },
  expert:      { emoji: '🔥', color: 'text-amber-300',  bg: 'bg-amber-500/10',   border: 'border-amber-500/25' },
  master:      { emoji: '👑', color: 'text-purple-300', bg: 'bg-purple-500/10',  border: 'border-purple-500/25' },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-white tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

export default function RewardDashboard({ locale = 'en' }: { locale?: string }) {
  const [profile, setProfile] = useState<UserRewardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const ru = locale === 'ru';

  useEffect(() => {
    fetchRewardProfile().then(p => { setProfile(p); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
        <div className="h-4 w-60 bg-slate-800/60 rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 text-center text-sm text-slate-500">
        {ru ? 'Войдите, чтобы видеть награды' : 'Sign in to see your rewards'}
      </div>
    );
  }

  const rm = RANK_META[profile.rank];

  return (
    <div className={`rounded-2xl border ${rm.border} ${rm.bg} p-5 shadow-lg shadow-black/20`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{rm.emoji}</span>
        <div>
          <p className={`text-sm font-bold ${rm.color} capitalize`}>{profile.rank}</p>
          <p className="text-xs text-slate-500">@{profile.username}</p>
        </div>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
          {ru ? 'Рейт' : 'Rate'}: {profile.token_rate}x
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-slate-800/60">
        <Stat label={ru ? 'Очки' : 'Score'} value={profile.contribution_score} />
        <Stat label={ru ? 'Заработано' : 'Earned'} value={parseFloat(profile.total_earned_tokens).toFixed(2)} />
        <Stat label={ru ? 'Потрачено' : 'Spent'} value={parseFloat(profile.total_spent_tokens).toFixed(2)} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>{ru ? 'Месячный лимит' : 'Monthly limit'}: {profile.monthly_token_limit.toLocaleString()}</span>
        <span className={profile.is_active ? 'text-emerald-400' : 'text-red-400'}>
          {profile.is_active ? (ru ? 'Активен' : 'Active') : (ru ? 'Заблок.' : 'Blocked')}
        </span>
      </div>
    </div>
  );
}
