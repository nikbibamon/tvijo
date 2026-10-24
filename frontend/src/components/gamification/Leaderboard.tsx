/**
 * Leaderboard component.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * Displays top users by XP/level.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/types/gamification';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userRank?: number | null;
  currentUserId?: number;
}

type Period = 'all' | 'monthly' | 'weekly' | 'daily';

const periodLabels: Record<Period, string> = {
  all: 'All Time',
  monthly: 'This Month',
  weekly: 'This Week',
  daily: 'Today',
};

export function Leaderboard({ 
  entries, 
  userRank,
  currentUserId 
}: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          🏆 Leaderboard
        </h3>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(Object.keys(periodLabels) as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`
                rounded-lg px-3 py-1 text-sm font-medium transition-colors
                ${selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>

      {/* User's Rank */}
      {userRank && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Your Rank
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              #{userRank}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No entries yet for this period
          </div>
        ) : (
          entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.user_id}
              entry={entry}
              index={index}
              isCurrentUser={entry.user_id === currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}

function LeaderboardRow({ entry, index, isCurrentUser }: LeaderboardRowProps) {
  const { rank, username, level, experience, badge_count, avatar_url } = entry;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`
        flex items-center gap-4 rounded-lg p-4 transition-all
        ${isCurrentUser
          ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30'
          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
        }
      `}
    >
      {/* Rank */}
      <div className="flex w-16 items-center justify-center">
        {rank <= 3 ? (
          <div className={`
            flex h-12 w-12 items-center justify-center rounded-full
            bg-gradient-to-br ${getRankColor(rank)} text-2xl shadow-lg
          `}>
            {getRankIcon(rank)}
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
            #{rank}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
        {avatar_url ? (
          <img src={avatar_url} alt={username} className="h-full w-full object-cover" />
        ) : (
          username.charAt(0).toUpperCase()
        )}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900 dark:text-white">
            {username}
          </h4>
          {isCurrentUser && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Level {level}</span>
          <span>•</span>
          <span>{experience.toLocaleString()} XP</span>
          {badge_count > 0 && (
            <>
              <span>•</span>
              <span>🏆 {badge_count}</span>
            </>
          )}
        </div>
      </div>

      {/* Level Badge */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-lg">
        {level}
      </div>
    </motion.div>
  );
}

