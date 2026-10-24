/**
 * SEO Content Pipeline API client (staff-only).
 * Backend: /api/v1/seo/plans/ and /api/v1/seo/drafts/ (GEN-SEO-001).
 *
 * Not to be confused with `seo-api.ts` which wraps Google Search Console
 * analytics.
 */

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
const SEO_API = `${API_BASE}/seo`;

export interface SeoPlan {
  id: string;
  slug: string;
  title: string;
  angle: string;
  target_keyword: string;
  secondary_keywords: string[];
  topic: string | null;
  keyword: string | null;
  category: string | null;
  audience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  target_word_count: number;
  status: 'planned' | 'queued' | 'drafting' | 'ready' | 'published' | 'archived';
  priority: number;
  scheduled_at: string | null;
  preferred_provider: string;
  preferred_model: string;
  requested_by: string | null;
  notes: string;
  drafts_count: number;
  latest_draft_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoDraft {
  id: string;
  plan: string;
  plan_slug: string;
  plan_title: string;
  status:
    | 'pending'
    | 'generating'
    | 'ready'
    | 'approved'
    | 'rejected'
    | 'failed'
    | 'published';
  title: string;
  excerpt: string;
  content_md: string;
  meta_title: string;
  meta_description: string;
  outline: string[];
  provider: string;
  model_name: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost_usd: string;
  latency_ms: number;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string;
  error_message: string;
  published_article_id: string | null;
  created_at: string;
  updated_at: string;
}

function authHeaders(extra?: HeadersInit): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (extra && typeof extra === 'object' && !(extra instanceof Headers)) {
    Object.assign(h, extra as Record<string, string>);
  }
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('access_token');
    if (t) h.Authorization = `Bearer ${t}`;
  }
  return h;
}

async function req<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; detail?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: authHeaders(init.headers),
    });
    const body = await res.text();
    const parsed = body ? (() => { try { return JSON.parse(body); } catch { return body; } })() : null;
    if (!res.ok) {
      const detail =
        parsed && typeof parsed === 'object' && 'detail' in parsed
          ? (parsed as { detail: string }).detail
          : typeof parsed === 'string'
            ? parsed
            : `HTTP ${res.status}`;
      return { ok: false, status: res.status, detail };
    }
    return { ok: true, data: parsed as T };
  } catch (err) {
    return { ok: false, status: 0, detail: (err as Error).message };
  }
}

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results: unknown }).results;
    if (Array.isArray(r)) return r as T[];
  }
  return [];
}

export async function fetchSeoPlans(): Promise<SeoPlan[]> {
  const r = await req<unknown>(`${SEO_API}/plans/`);
  return r.ok ? unwrapList<SeoPlan>(r.data) : [];
}

export async function createSeoPlan(payload: {
  title: string;
  angle?: string;
  target_keyword?: string;
  secondary_keywords?: string[];
  audience?: SeoPlan['audience'];
  language?: string;
  target_word_count?: number;
  priority?: number;
  preferred_provider?: string;
  preferred_model?: string;
  notes?: string;
}): Promise<SeoPlan | null> {
  const r = await req<SeoPlan>(`${SEO_API}/plans/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return r.ok ? r.data : null;
}

export async function generateDraftForPlan(planId: string): Promise<SeoDraft | null> {
  const r = await req<SeoDraft>(
    `${SEO_API}/plans/${planId}/generate_draft/`,
    { method: 'POST' },
  );
  return r.ok ? r.data : null;
}

export async function fetchSeoDrafts(opts?: {
  plan?: string;
  status?: string;
}): Promise<SeoDraft[]> {
  const qs = new URLSearchParams();
  if (opts?.plan) qs.set('plan', opts.plan);
  if (opts?.status) qs.set('status', opts.status);
  const suffix = qs.toString() ? `?${qs}` : '';
  const r = await req<unknown>(`${SEO_API}/drafts/${suffix}`);
  return r.ok ? unwrapList<SeoDraft>(r.data) : [];
}

export async function fetchSeoDraft(draftId: string): Promise<SeoDraft | null> {
  const r = await req<SeoDraft>(`${SEO_API}/drafts/${draftId}/`);
  return r.ok ? r.data : null;
}

export async function approveDraft(
  draftId: string,
  notes = '',
): Promise<SeoDraft | null> {
  const r = await req<SeoDraft>(`${SEO_API}/drafts/${draftId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
  return r.ok ? r.data : null;
}

export async function rejectDraft(
  draftId: string,
  notes = '',
): Promise<SeoDraft | null> {
  const r = await req<SeoDraft>(`${SEO_API}/drafts/${draftId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
  return r.ok ? r.data : null;
}

export async function publishDraft(
  draftId: string,
): Promise<{ ok: true; draft: SeoDraft } | { ok: false; detail: string }> {
  const r = await req<SeoDraft>(`${SEO_API}/drafts/${draftId}/publish/`, {
    method: 'POST',
  });
  if (r.ok) return { ok: true, draft: r.data };
  return { ok: false, detail: r.detail || `HTTP ${r.status}` };
}
