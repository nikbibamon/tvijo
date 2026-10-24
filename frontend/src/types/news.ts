/**
 * Public News Types
 * Generation: GEN-NEWS-004
 *
 * TypeScript interfaces matching Django apps/news/ models and API responses.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

export type ArticleCategory = 'crypto' | 'finance' | 'market' | 'markets' | '';
export type SentimentLabel = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
export type TrendPeriod = 'hourly' | 'daily' | 'weekly';
export type ApiProvider = 'newsapi' | 'gnews' | 'rss' | 'reddit' | 'custom';

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  crypto: { label: 'Crypto', color: '#8B5CF6', bg: 'bg-violet-500/10' },
  finance: { label: 'Finance', color: '#3B82F6', bg: 'bg-blue-500/10' },
  market: { label: 'Markets', color: '#10B981', bg: 'bg-emerald-500/10' },
  markets: { label: 'Markets', color: '#10B981', bg: 'bg-emerald-500/10' },
};

export const SENTIMENT_CONFIG: Record<SentimentLabel, { label: string; color: string; icon: string }> = {
  very_bullish: { label: 'Very Bullish', color: '#22C55E', icon: '🟢' },
  bullish: { label: 'Bullish', color: '#4ADE80', icon: '🟩' },
  neutral: { label: 'Neutral', color: '#9CA3AF', icon: '⚪' },
  bearish: { label: 'Bearish', color: '#F87171', icon: '🟧' },
  very_bearish: { label: 'Very Bearish', color: '#EF4444', icon: '🔴' },
};

// ============================================================================
// Models
// ============================================================================

export interface NewsSource {
  id: number;
  name: string;
  slug: string;
  api_provider: ApiProvider;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  url: string;
  image_url: string;
  source: number | null;
  source_name: string;
  author: string;
  published_at: string;
  fetched_at: string;
  category: ArticleCategory;
  language: string;
  country: string;
  symbols: number[];
  symbol_keywords: string[];
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  created_at: string;
  updated_at: string;
}

export interface SentimentAnalysis {
  id: number;
  article: number;
  article_title: string;
  symbol: number | null;
  symbol_name: string | null;
  overall_sentiment: string;
  sentiment_label: SentimentLabel;
  positive_score: string;
  negative_score: string;
  neutral_score: string;
  analysis_method: string;
  confidence: string;
  analyzed_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrendingTopic {
  id: number;
  keyword: string;
  symbol: number | null;
  symbol_name: string | null;
  mention_count: number;
  sentiment_score: string;
  trend_period: TrendPeriod;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ArticleFilters {
  category?: ArticleCategory;
  language?: string;
  is_featured?: boolean;
  source?: number;
  days?: number;
  symbol?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface TrendingFilters {
  period?: TrendPeriod;
  limit?: number;
}

// ============================================================================
// Social Engagement
// ============================================================================

export interface EngagementData {
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  view_count: number;
  user_liked: boolean;
  user_bookmarked: boolean;
}

export interface ArticleCommentData {
  id: number;
  article: number;
  user: number;
  user_email: string;
  user_name: string;
  parent: number | null;
  content: string;
  is_edited: boolean;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}
