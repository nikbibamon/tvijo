/**
 * Gamification types.
 * Generation: GEN-GAMIFICATION-001 (Phase 5.5)
 * 
 * TypeScript types matching Django API response structure.
 */

export type BadgeTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  xp_reward: number;
  requirements: Record<string, number>;
  is_active: boolean;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  earned_at: string;
}

export interface XPProgress {
  xp_current_level: number;
  xp_needed: number;
  xp_to_next_level: number;
  progress_percent: number;
}

export interface UserLevel {
  level: number;
  experience: number;
  experience_to_next_level: number;
  level_title: string;
  xp_progress: XPProgress;
  total_activities: number;
  articles_read: number;
  comments_posted: number;
  shares_made: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface UserActivity {
  id: number;
  activity_type: string;
  xp_earned: number;
  related_object_type: string;
  related_object_id: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserStats {
  level: number;
  experience: number;
  level_title: string;
  xp_progress: XPProgress;
  total_activities: number;
  articles_read: number;
  comments_posted: number;
  shares_made: number;
  current_streak: number;
  longest_streak: number;
  badges: UserBadge[];
  recent_activities: UserActivity[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  level: number;
  experience: number;
  badge_count: number;
}

export interface LeaderboardResponse {
  period: 'all' | 'monthly' | 'weekly' | 'daily';
  entries: LeaderboardEntry[];
  user_rank: number | null;
  total_entries: number;
}

export interface TrackActivityRequest {
  activity_type: string;
  related_object_type?: string;
  related_object_id?: number;
  metadata?: Record<string, any>;
}

export interface ActivityResult {
  leveled_up: boolean;
  old_level: number;
  new_level: number;
  xp_earned: number;
  new_badges: Badge[];
  activity_id: number;
}

export interface StreakResult {
  old_streak: number;
  new_streak: number;
  streak_continued: boolean;
  xp_awarded: number;
}

