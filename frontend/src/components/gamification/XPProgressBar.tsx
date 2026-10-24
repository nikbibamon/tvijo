/**
 * XP Progress Bar component.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * Displays user's level, XP, and progress to next level.
 */

'use client';

import { motion } from 'framer-motion';
import type { UserLevel } from '@/types/gamification';

interface XPProgressBarProps {
  userLevel: UserLevel;
  showDetails?: boolean;
  compact?: boolean;
}

export function XPProgressBar({ 
  userLevel, 
  showDetails = true,
  compact = false 
}: XPProgressBarProps) {
  const { level, level_title, xp_progress, current_streak } = userLevel;
  const { xp_current_level, xp_needed, progress_percent } = xp_progress;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-lg">
            {level}
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              Level {level}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {level_title}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress_percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl font-bold text-white shadow-lg">
            {level}
          </div>
          
          {/* Level Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Level {level}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {level_title}
            </p>
          </div>
        </div>

        {/* Streak */}
        {current_streak > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 dark:bg-orange-900/30">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {current_streak}
              </div>
              <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                day streak
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {xp_current_level.toLocaleString()} / {xp_needed.toLocaleString()} XP
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {progress_percent}%
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress_percent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: 'easeInOut' 
            }}
          />
        </div>

        {showDetails && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {xp_progress.xp_to_next_level.toLocaleString()} XP to next level
          </p>
        )}
      </div>
    </div>
  );
}

