/**
 * Badges Grid component.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * Displays user's earned badges and available badges.
 */

'use client';

import { motion } from 'framer-motion';
import type { Badge, UserBadge } from '@/types/gamification';

interface BadgesGridProps {
  userBadges: UserBadge[];
  allBadges?: Badge[];
  showLocked?: boolean;
}

const tierColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const tierBorders = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

export function BadgesGrid({ 
  userBadges, 
  allBadges = [],
  showLocked = true 
}: BadgesGridProps) {
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge.id));
  
  const earnedBadges = userBadges.map(ub => ({
    ...ub.badge,
    earned_at: ub.earned_at,
    isEarned: true,
  }));
  
  const lockedBadges = showLocked
    ? allBadges
        .filter(badge => !earnedBadgeIds.has(badge.id))
        .map(badge => ({ ...badge, isEarned: false }))
    : [];
  
  const displayBadges = [...earnedBadges, ...lockedBadges];

  if (displayBadges.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="mb-4 text-6xl">🏆</div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          No Badges Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete activities to earn your first badge!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Badges ({earnedBadges.length}/{displayBadges.length})
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayBadges.map((badge, index) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge & { isEarned: boolean; earned_at?: string };
  index: number;
}

function BadgeCard({ badge, index }: BadgeCardProps) {
  const { isEarned, icon, name, tier, description, xp_reward } = badge;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative"
    >
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 p-4 transition-all
          ${isEarned 
            ? `${tierBorders[tier]} bg-gradient-to-br ${tierColors[tier]}/10 hover:scale-105` 
            : 'border-gray-300 bg-gray-100 opacity-50 grayscale dark:border-gray-700 dark:bg-gray-900'
          }
        `}
      >
        {/* Badge Icon */}
        <div className="mb-2 text-center text-4xl">
          {isEarned ? icon : '🔒'}
        </div>

        {/* Badge Name */}
        <h4 className={`
          text-center text-sm font-bold
          ${isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'}
        `}>
          {name}
        </h4>

        {/* Tier Badge */}
        <div className={`
          mt-2 text-center text-xs font-semibold uppercase
          ${isEarned 
            ? `bg-gradient-to-r ${tierColors[tier]} bg-clip-text text-transparent` 
            : 'text-gray-400'
          }
        `}>
          {tier}
        </div>

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-sm text-white shadow-xl group-hover:block dark:bg-gray-700">
          <div className="mb-1 font-bold">{name}</div>
          <div className="mb-2 text-xs text-gray-300">{description}</div>
          <div className="flex items-center justify-between text-xs">
            <span className="capitalize text-gray-400">{tier}</span>
            <span className="font-semibold text-yellow-400">+{xp_reward} XP</span>
          </div>
          {isEarned && badge.earned_at && (
            <div className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">
              Earned {new Date(badge.earned_at).toLocaleDateString()}
            </div>
          )}
          
          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      </div>
    </motion.div>
  );
}

