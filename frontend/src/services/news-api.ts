/**
 * Public News API Client
 * Generation: GEN-NEWS-004
 *
 * Typed fetch client for /api/v1/news/ endpoints.
 */

import type {
  NewsArticle,
  NewsSource,
  SentimentAnalysis,
  TrendingTopic,
  PaginatedResponse,
  ArticleFilters,
  TrendingFilters,
  EngagementData,
  ArticleCommentData,
} from '@/types/news';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ============================================================================
// Helpers
// ============================================================================

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ============================================================================
// Articles
// ============================================================================

export const articlesApi = {
  list(filters: ArticleFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    const q = buildQuery(filters as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/news/articles/${q}`);
  },

  get(id: number): Promise<NewsArticle> {
    return apiFetch(`/news/articles/${id}/`);
  },

  incrementView(id: number): Promise<{ view_count: number }> {
    return apiFetch(`/news/articles/${id}/increment_view/`, { method: 'POST' });
  },

  engagement(id: number): Promise<EngagementData> {
    return apiFetch(`/news/articles/${id}/engagement/`);
  },

  like(id: number, token: string): Promise<{ liked: boolean; like_count: number }> {
    return apiFetch(`/news/articles/${id}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  },

  unlike(id: number, token: string): Promise<{ liked: boolean; like_count: number }> {
    return apiFetch(`/news/articles/${id}/unlike/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  },

  bookmark(id: number, token: string): Promise<{ bookmarked: boolean; bookmark_count: number }> {
    return apiFetch(`/news/articles/${id}/bookmark/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  },

  unbookmark(id: number, token: string): Promise<{ bookmarked: boolean; bookmark_count: number }> {
    return apiFetch(`/news/articles/${id}/unbookmark/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  },

  comments(id: number): Promise<ArticleCommentData[]> {
    return apiFetch(`/news/articles/${id}/comments/`);
  },

  addComment(id: number, content: string, token: string, parentId?: number): Promise<ArticleCommentData> {
    return apiFetch(`/news/articles/${id}/add_comment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  },
};

// ============================================================================
// Trending
// ============================================================================

export const trendingApi = {
  list(filters: TrendingFilters = {}): Promise<TrendingTopic[]> {
    const q = buildQuery(filters as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/news/trending/${q}`);
  },
};

// ============================================================================
// Sources
// ============================================================================

export const sourcesApi = {
  list(): Promise<PaginatedResponse<NewsSource>> {
    return apiFetch('/news/sources/');
  },
};

// ============================================================================
// Sentiment
// ============================================================================

export const sentimentApi = {
  list(): Promise<PaginatedResponse<SentimentAnalysis>> {
    return apiFetch('/news/sentiment/');
  },

  bySymbol(symbol: string): Promise<SentimentAnalysis[]> {
    return apiFetch(`/news/sentiment/by_symbol/?symbol=${encodeURIComponent(symbol)}`);
  },
};
