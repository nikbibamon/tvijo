/**
 * Knowledge Base API Client
 * Generation: GEN-KB-001
 */

import type {
  KBCategory,
  KBArticleListItem,
  KBArticleDetail,
  KBArticleFilters,
} from '@/types/knowledge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

// Only send a lang param the backend serves translations for; others fall back to the base language.
const SUPPORTED_LANGS = ['en', 'ru', 'uk'];
function langParam(lang?: string): string | undefined {
  return lang && SUPPORTED_LANGS.includes(lang) ? lang : undefined;
}

/** Append lang to an existing path (which may already have a query string). */
function withLang(path: string, lang?: string): string {
  const l = langParam(lang);
  if (!l) return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${encodeURIComponent(l)}`;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    // Admin/content operations require "latest" data (no stale bundle_id / linked_bundles for 5 min).
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`KB API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const kbCategoriesApi = {
  list(sort?: 'custom' | 'name' | 'article_count' | 'newest' | 'oldest', lang?: string): Promise<KBCategory[]> {
    const q = sort ? `?sort=${encodeURIComponent(sort)}` : '';
    return apiFetch(withLang(`/knowledge/categories/${q}`, lang));
  },

  get(slug: string, lang?: string): Promise<KBCategory> {
    return apiFetch(withLang(`/knowledge/categories/${slug}/`, lang));
  },
};

export const kbArticlesApi = {
  list(filters: KBArticleFilters = {}, lang?: string): Promise<KBArticleListItem[]> {
    const q = buildQuery(filters as Record<string, string | number | boolean | undefined>);
    return apiFetch(withLang(`/knowledge/articles/${q}`, lang));
  },

  get(slug: string, lang?: string): Promise<KBArticleDetail> {
    return apiFetch(withLang(`/knowledge/articles/${slug}/`, lang));
  },

  siblings(slug: string, lang?: string): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
    return apiFetch(withLang(`/knowledge/articles/${slug}/siblings/`, lang));
  },

  featured(lang?: string): Promise<KBArticleListItem[]> {
    return apiFetch(withLang('/knowledge/articles/featured/', lang));
  },

  recent(limit = 10, lang?: string): Promise<KBArticleListItem[]> {
    return apiFetch(withLang(`/knowledge/articles/recent/?limit=${limit}`, lang));
  },

  popular(limit = 10, lang?: string): Promise<KBArticleListItem[]> {
    return apiFetch(withLang(`/knowledge/articles/popular/?limit=${limit}`, lang));
  },

  forMe(role?: string, traderLevel?: string, limit = 20, lang?: string): Promise<KBArticleListItem[]> {
    const q = buildQuery({ role, trader_level: traderLevel, limit });
    return apiFetch(withLang(`/knowledge/articles/for-me/${q}`, lang));
  },

  async toggleLike(slug: string, nick?: string): Promise<{ liked: boolean; like_count: number }> {
    const res = await fetch(`${API_BASE}/knowledge/articles/${slug}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick: nick || '' }),
    });
    if (!res.ok) throw new Error(`Like failed: ${res.status}`);
    return res.json();
  },

  async likeStatus(slug: string, nick?: string): Promise<{ liked: boolean; like_count: number }> {
    const q = nick ? `?nick=${encodeURIComponent(nick)}` : '';
    return apiFetch(`/knowledge/articles/${slug}/like-status/${q}`);
  },

  async getComments(slug: string): Promise<KBComment[]> {
    return apiFetch(`/knowledge/articles/${slug}/comments/`);
  },

  async addComment(slug: string, body: string, nick?: string, parentId?: string): Promise<KBComment> {
    const res = await fetch(`${API_BASE}/knowledge/articles/${slug}/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, nick: nick || '', parent: parentId || null }),
    });
    if (!res.ok) throw new Error(`Comment failed: ${res.status}`);
    return res.json();
  },
};

export interface KBComment {
  id: string;
  article: string;
  nick: string;
  body: string;
  parent: string | null;
  author_name: string;
  is_pinned: boolean;
  like_count: number;
  replies: KBComment[];
  created_at: string;
}
