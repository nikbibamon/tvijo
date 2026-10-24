/**
 * TypeScript types for News Intelligence Admin Panel
 * Generation: GEN-NEWS-003
 * Maps to Django models in apps/newsanalyzer/
 */

// ============================================================================
// Enums & Constants
// ============================================================================

export type SourceType = 'rss' | 'newsapi' | 'gnews' | 'twitter' | 'telegram';

export type AuthorityTier = 1 | 2 | 3 | 4 | 5;

export type Topic =
  | 'politics'
  | 'war'
  | 'economy'
  | 'crypto'
  | 'global'
  | 'technology'
  | 'energy'
  | 'sanctions'
  | 'markets';

export type EventStatus = 'new' | 'growing' | 'trending' | 'peak' | 'fading' | 'archived';

export type EditorStatus =
  | 'unreviewed'
  | 'reviewed'
  | 'assigned'
  | 'in_progress'
  | 'published'
  | 'dismissed';

export type AlertType = 'breaking' | 'spike' | 'competitor' | 'high_viral' | 'viral_topic';

export type NotificationChannel = 'telegram' | 'email' | 'webhook' | 'slack' | 'push';

// ============================================================================
// Topic styling config (matches Figma design tokens)
// ============================================================================

export const TOPIC_CONFIG: Record<Topic, { label: string; color: string; bgColor: string }> = {
  politics: { label: 'Politics', color: '#F97316', bgColor: 'bg-orange-500/20' },
  war: { label: 'War', color: '#EF4444', bgColor: 'bg-red-500/20' },
  economy: { label: 'Economy', color: '#3B82F6', bgColor: 'bg-blue-500/20' },
  crypto: { label: 'Crypto', color: '#8B5CF6', bgColor: 'bg-purple-500/20' },
  global: { label: 'Global', color: '#10B981', bgColor: 'bg-emerald-500/20' },
  technology: { label: 'Technology', color: '#06B6D4', bgColor: 'bg-cyan-500/20' },
  energy: { label: 'Energy', color: '#EAB308', bgColor: 'bg-yellow-500/20' },
  sanctions: { label: 'Sanctions', color: '#F43F5E', bgColor: 'bg-rose-500/20' },
  markets: { label: 'Markets', color: '#14B8A6', bgColor: 'bg-teal-500/20' },
};

// ============================================================================
// API Response Models
// ============================================================================

export interface MonitoredSource {
  id: number;
  name: string;
  slug: string;
  source_type: SourceType;
  authority_tier: AuthorityTier;
  authority_score: number;
  config: Record<string, unknown>;
  category: string;
  language: string;
  region: string;
  keywords: string[];
  poll_interval_seconds: number;
  priority: number;
  is_active: boolean;
  is_competitor: boolean;
  last_checked_at: string | null;
  last_item_id: string;
  error_count: number;
  last_error: string;
  created_at: string;
  updated_at: string;
}

export interface RawNewsItem {
  id: number;
  title: string;
  content: string;
  url: string;
  image_url: string;
  author: string;
  source: number | null;
  source_display: string;
  source_name: string;
  source_type: string;
  published_at: string;
  detected_at: string;
  language: string;
  raw_data: Record<string, unknown>;
  engagement: Record<string, unknown>;
  is_forwarded: boolean;
  forward_source: string;
  region: string;
  is_processed: boolean;
  is_duplicate: boolean;
  duplicate_of: number | null;
  topic: Topic | '';
  topic_confidence: number;
  sub_topics: string[];
  importance_score: number;
  viral_probability: number;
  emotional_intensity: number;
  event: number | null;
  created_at: string;
  updated_at: string;
}

export interface NewsEvent {
  id: number;
  title: string;
  summary: string;
  topic: Topic;
  sub_topics: string[];
  region: string;
  importance_score: number;
  viral_probability: number;
  trend_score: number;
  spike_ratio: number;
  source_count: number;
  items_count: number;
  first_detected_at: string;
  last_updated_at: string;
  status: EventStatus;
  editor_status: EditorStatus;
  assigned_to_id: string | null;
  assigned_to_username: string | null;
  is_pinned: boolean;
  related_symbols: number[];
  related_article: number | null;
  title_embedding: number[];
  created_at: string;
  updated_at: string;
}

export interface NewsEventListItem {
  id: number;
  title: string;
  topic: Topic;
  region: string;
  importance_score: number;
  viral_probability: number;
  trend_score: number;
  source_count: number;
  items_count: number;
  first_detected_at: string;
  status: EventStatus;
  editor_status: EditorStatus;
  is_pinned: boolean;
}

export interface KeywordSpike {
  id: number;
  keyword: string;
  spike_ratio: number;
  spike_percentage: number;
  current_rate: number;
  baseline_rate: number;
  detected_at: string;
  window_minutes: number;
  event: number | null;
  source_count: number;
  score: number;
  alert_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertPreference {
  id: number;
  editor_id: string;
  editor_username: string;
  channel: NotificationChannel;
  min_importance: number;
  min_trend_score: number;
  min_viral_probability: number;
  topics: string[];
  regions: string[];
  alert_types: string[];
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  max_alerts_per_hour: number;
  telegram_chat_id: string;
  email_address: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: number;
  event: number;
  event_title: string;
  alert_type: AlertType;
  channel: string;
  recipient_id: string;
  sent_at: string;
  success: boolean;
  error_message: string;
  is_read: boolean;
  is_dismissed: boolean;
  keyword: string;
  trend_score: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelSnapshot {
  id: number;
  source: number;
  source_name: string;
  source_type: SourceType;
  date: string;
  subscribers: number;
  subscribers_delta: number;
  avg_views: number;
  avg_forwards: number;
  avg_comments: number;
  engagement_rate: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Stats & Analytics Types
// ============================================================================

export interface DetectionLatencyStats {
  avg_latency_seconds: number;
  p50_latency_seconds: number;
  p95_latency_seconds: number;
  avg_pipeline_ms: number;
  count: number;
  last_detection: {
    title: string;
    source_name: string;
    detected_at: string;
    processed_at: string;
    latency_seconds: number;
    pipeline_ms: number;
    topic: string;
    importance_score: number;
  } | null;
}

export interface PipelinePerformance {
  count: number;
  avg_total_ms: number;
  steps: {
    dedup_ms: number;
    classify_ms: number;
    importance_ms: number;
    viral_ms: number;
    cluster_ms: number;
    keyword_ms: number;
    bridge_ms: number;
  };
}

export interface SourcePerformanceItem {
  source_name: string;
  source_type: string;
  articles: number;
  avg_latency_seconds: number;
  avg_pipeline_ms: number;
  avg_importance: number;
  duplicates: number;
  bridged: number;
}

export interface VolumeTimelineItem {
  hour: string;
  total: number;
  unique: number;
  bridged: number;
  avg_pipeline_ms: number;
}

export interface SourceActivityItem {
  hour: string;
  source_type: SourceType;
  count: number;
}

export interface TopicEngagement {
  topic: Topic;
  count: number;
  avg_importance: number;
  avg_viral: number;
}

export interface SourceEngagement {
  source_name: string;
  count: number;
  avg_importance: number;
  avg_viral: number;
}

export interface DashboardSummary {
  total_events_24h: number;
  breaking_events: number;
  unread_alerts: number;
  active_sources: number;
  trending_topics: Array<{
    keyword: string;
    spike_ratio: number;
    current_rate: number;
    source_count: number;
    score: number;
  }>;
}

// ============================================================================
// Competitor Types
// ============================================================================

export interface CompetitorPublication {
  id: number;
  title: string;
  source_name: string;
  topic: Topic | '';
  published_at: string;
  detected_at: string;
  delay_seconds: number;
  delay_display: string;
}

export interface SpeedComparison {
  source_name: string;
  source_type: SourceType;
  avg_delay_seconds: number;
  avg_delay_minutes: number;
  publications_count: number;
}

export interface TopActiveCompetitor {
  source_name: string;
  source_type: SourceType;
  publications: number;
  avg_speed_minutes: number;
  avg_reach: number;
}

export interface FastestGrowingChannel {
  source_name: string;
  source_type: SourceType;
  subscribers: number;
  growth_24h: number;
  growth_7d: number;
  avg_views: number;
  engagement_rate: number;
  trend: Array<{ date: string; subscribers: number }>;
  is_growing: boolean;
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// Sidebar Navigation
// ============================================================================

export interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export const NEWS_ADMIN_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/newsadmin', icon: 'LayoutDashboard' },
  { name: 'News Hunter', href: '/newsadmin/news-hunter', icon: 'Search' },
  { name: 'Trend Detector', href: '/newsadmin/trend-detector', icon: 'TrendingUp' },
  { name: 'Competitor Tracker', href: '/newsadmin/competitor-tracker', icon: 'Users' },
  { name: 'Engagement Analyzer', href: '/newsadmin/engagement', icon: 'BarChart3' },
  { name: 'Source Management', href: '/newsadmin/sources', icon: 'Database' },
  { name: 'Alert Center', href: '/newsadmin/alerts', icon: 'Bell' },
  { name: 'Settings', href: '/newsadmin/settings', icon: 'Settings' },
];
