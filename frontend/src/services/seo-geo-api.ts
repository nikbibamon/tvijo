/**
 * SEO/GEO audit and public domain catalogue.
 * Backend: bibamoney-backend/apps/aiscan (spec 2026-08-seo-geo-scanner-public-catalog §4.9).
 *
 * Two callers with different needs: the browser posts a scan and polls it
 * through the same-origin rewrite, while catalogue pages render on the server
 * and need an absolute URL. `serverBase()` resolves that without leaking a
 * build-time value into the client bundle.
 */

const CLIENT_BASE = (process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1').replace(/\/+$/, '');

function serverBase(): string {
  const configured =
    process.env.DJANGO_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://api.tvijo.com/api/v1' : 'http://localhost:8000/api/v1');
  const trimmed = configured.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

export type ScanStatus = 'queued' | 'running' | 'ok' | 'partial' | 'failed' | 'blocked' | 'cancelled';

export interface CrawlerDecision {
  token: string;
  vendor: string;
  intent: 'ai_search' | 'user_retrieval' | 'training' | 'search';
  allowed: boolean;
  matched_rule: string;
  matched_agent: string;
}

export interface AuditFinding {
  code: string;
  category: 'seo' | 'geo';
  status: 'pass' | 'warn' | 'fail' | 'info' | 'unknown' | 'not_applicable';
  severity: string;
  confidence: string;
  title: string;
  detail: string;
  evidence: string[];
  page_url: string;
}

export interface SeoGeoScan {
  id: string;
  host: string;
  normalized_url: string;
  final_url: string;
  status: ScanStatus;
  stage: string;
  error_code: string;
  http_status: number | null;
  duration_ms: number;
  seo_score: number | null;
  geo_score: number | null;
  overall_score: number | null;
  grade: string;
  coverage: number;
  counts: Record<string, Record<string, number>>;
  summary: Record<string, any>;
  robots_matrix: CrawlerDecision[];
  pages_scanned: number;
  ruleset_version: string;
  crawler_registry_version: string;
  created_at: string;
  profile_slug?: string;
}

export interface DomainProfileSummary {
  host: string;
  slug: string;
  display_name: string;
  seo_score: number | null;
  geo_score: number | null;
  exposure_score: number | null;
  overall_score: number | null;
  grade: string;
  coverage: number;
  verification_status: string;
  last_scanned_at: string | null;
  is_stale: boolean;
}

export interface DomainProfileDetail extends DomainProfileSummary {
  homepage_url: string;
  registrable_domain: string;
  publication_status: string;
  ruleset_version: string;
  first_scanned_at: string | null;
  findings: AuditFinding[];
  scan: SeoGeoScan | null;
  history: Array<{
    id: string;
    created_at: string;
    seo_score: number | null;
    geo_score: number | null;
    overall_score: number | null;
    grade: string;
    coverage: number;
  }>;
}

export interface CatalogPage {
  count: number;
  offset: number;
  page_size: number;
  ordering: string;
  results: DomainProfileSummary[];
  ranking_enabled: boolean;
}

/** Browser: queue an audit. Returns the scan id to poll — never an ETA. */
export async function queueSeoGeoScan(url: string, locale?: string) {
  const res = await fetch(`${CLIENT_BASE}/aiscan/seo-geo/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, locale }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false as const, error: body?.error || 'request_failed', detail: body?.detail || '' };
  }
  return { ok: true as const, ...body };
}

export async function getSeoGeoScan(id: string): Promise<SeoGeoScan | null> {
  const res = await fetch(`${CLIENT_BASE}/aiscan/seo-geo/${id}/`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

/** Server: the catalogue list. Revalidated, and never fatal for the page. */
export async function fetchCatalog(params: Record<string, string | number | undefined> = {},
                                   revalidate = 300): Promise<CatalogPage | null> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  try {
    const res = await fetch(`${serverBase()}/aiscan/domains/?${query.toString()}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchDomainProfile(slug: string,
                                         revalidate = 300): Promise<DomainProfileDetail | null> {
  try {
    const res = await fetch(`${serverBase()}/aiscan/domains/${encodeURIComponent(slug)}/`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCatalogStats(revalidate = 900) {
  try {
    const res = await fetch(`${serverBase()}/aiscan/catalog/stats/`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json() as Promise<{
      listed_domains: number;
      scans_completed: number;
      gate_rate: number;
      ranking_enabled: boolean;
    }>;
  } catch {
    return null;
  }
}

export async function submitDispute(slug: string, kind: 'correction' | 'removal' | 'personal',
                                    reason: string, contactEmail?: string) {
  const res = await fetch(`${CLIENT_BASE}/aiscan/domains/${encodeURIComponent(slug)}/disputes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, reason, contact_email: contactEmail }),
  });
  return res.ok;
}

export function scoreTone(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'text-slate-500';
  if (score >= 90) return 'text-emerald-300';
  if (score >= 78) return 'text-teal-300';
  if (score >= 62) return 'text-amber-300';
  if (score >= 45) return 'text-orange-300';
  return 'text-rose-300';
}
