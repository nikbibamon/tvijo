'use client';

/**
 * Leaderboard — top contributors ranked by contribution_score.
 */

import { useEffect, useState } from 'react';
import type { LeaderboardEntry, Rank } from '@/services/decmap-api';
import { fetchLeaderboard } from '@/services/decmap-api';

const RANK_EMOJI: Record<Rank, string> = {
  novice: '🌱',
  contributor: '⭐',
  expert: '🔥',
  master: '👑',
};

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ locale = 'en', limit = 20 }: { locale?: string; limit?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const ru = locale === 'ru';

  useEffect(() => {
    fetchLeaderboard(limit).then(data => { setEntries(data); setLoading(false); });
  }, [limit]);

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900/60 to-slate-900/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/60">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-lg">🏆</span>
          {ru ? 'Лидерборд' : 'Leaderboard'}
        </h3>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          {ru ? 'Пока нет участников' : 'No contributors yet'}
        </div>
      ) : (
        <ul className="divide-y divide-slate-800/40">
          {entries.map((entry, i) => (
            <li
              key={entry.username}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 transition-colors"
            >
              <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-500">
                {i < 3 ? MEDAL[i] : i + 1}
              </span>
              <span className="text-base">{RANK_EMOJI[entry.rank]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">@{entry.username}</p>
                <p className="text-[10px] text-slate-500 capitalize">{entry.rank}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white tabular-nums">{entry.contribution_score}</p>
                <p className="text-[10px] text-slate-500">
                  {parseFloat(entry.total_earned_tokens).toFixed(1)} {ru ? 'ток.' : 'tok.'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
