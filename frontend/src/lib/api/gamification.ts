/**
 * Gamification API client.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * API functions for gamification features.
 */

import { apiClient } from './client';
import type {
  UserStats,
  Badge,
  UserBadge,
  UserActivity,
  LeaderboardResponse,
  TrackActivityRequest,
  ActivityResult,
  StreakResult,
} from '@/types/gamification';

const GAMIFICATION_BASE = '/gamification';

/**
 * Get current user's gamification stats.
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>(`${GAMIFICATION_BASE}/stats/`);
  return response.data;
}

/**
 * Get all available badges.
 */
export async function getAllBadges(): Promise<Badge[]> {
  const response = await apiClient.get<Badge[]>(`${GAMIFICATION_BASE}/badges/`);
  return response.data;
}

/**
 * Get user's earned badges.
 */
export async function getUserBadges(): Promise<UserBadge[]> {
  const response = await apiClient.get<UserBadge[]>(`${GAMIFICATION_BASE}/badges/my/`);
  return response.data;
}

/**
 * Get user's activity history.
 */
export async function getUserActivities(limit = 20): Promise<UserActivity[]> {
  const response = await apiClient.get<UserActivity[]>(
    `${GAMIFICATION_BASE}/activities/`,
    { params: { limit } }
  );
  return response.data;
}

/**
 * Track a new activity and award XP.
 */
export async function trackActivity(data: TrackActivityRequest): Promise<ActivityResult> {
  const response = await apiClient.post<ActivityResult>(
    `${GAMIFICATION_BASE}/activities/track/`,
    data
  );
  return response.data;
}

/**
 * Get leaderboard.
 */
export async function getLeaderboard(
  period: 'all' | 'monthly' | 'weekly' | 'daily' = 'all',
  limit = 100
): Promise<LeaderboardResponse> {
  const response = await apiClient.get<LeaderboardResponse>(
    `${GAMIFICATION_BASE}/leaderboard/`,
    { params: { period, limit } }
  );
  return response.data;
}

/**
 * Update daily streak.
 */
export async function updateStreak(): Promise<StreakResult> {
  const response = await apiClient.post<StreakResult>(`${GAMIFICATION_BASE}/streak/`);
  return response.data;
}

