/**
 * Gamification Dashboard Page.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * User's gamification stats, badges, and leaderboard.
 */

import { Suspense } from 'react';
import { getUserStats, getAllBadges, getLeaderboard } from '@/lib/api/gamification';
import { XPProgressBar, BadgesGrid, Leaderboard } from '@/components/gamification';

export const metadata = {
  title: 'Gamification - Tvijo',
  description: 'Your progress, badges, and leaderboard ranking',
};

export default async function GamificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
        🎮 Your Progress
      </h1>

      <div className="space-y-8">
        {/* XP Progress */}
        <Suspense fallback={<XPProgressSkeleton />}>
          <XPProgressSection />
        </Suspense>

        {/* Badges */}
        <Suspense fallback={<BadgesSkeleton />}>
          <BadgesSection />
        </Suspense>

        {/* Leaderboard */}
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardSection />
        </Suspense>
      </div>
    </div>
  );
}

async function XPProgressSection() {
  try {
    const stats = await getUserStats();
    return <XPProgressBar userLevel={stats} showDetails />;
  } catch (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-900 dark:bg-red-900/20 dark:text-red-100">
        Failed to load XP progress. Please try again later.
      </div>
    );
  }
}

async function BadgesSection() {
  try {
    const [stats, allBadges] = await Promise.all([
      getUserStats(),
      getAllBadges(),
    ]);
    
    return (
      <BadgesGrid
        userBadges={stats.badges}
        allBadges={allBadges}
        showLocked
      />
    );
  } catch (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-900 dark:bg-red-900/20 dark:text-red-100">
        Failed to load badges. Please try again later.
      </div>
    );
  }
}

async function LeaderboardSection() {
  try {
    const [leaderboard, stats] = await Promise.all([
      getLeaderboard('all', 100),
      getUserStats(),
    ]);
    
    return (
      <Leaderboard
        entries={leaderboard.entries}
        userRank={leaderboard.user_rank}
        currentUserId={undefined} // Will be set from auth context
      />
    );
  } catch (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-900 dark:bg-red-900/20 dark:text-red-100">
        Failed to load leaderboard. Please try again later.
      </div>
    );
  }
}

// Skeleton loaders
function XPProgressSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="mt-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

