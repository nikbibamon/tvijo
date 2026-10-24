const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface AnalyticsMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral' | string;
  benchmark?: number;
}

export interface AnalyticsTable {
  headers: string[];
  rows: Array<Array<string | number | null>>;
  types: string[];
}

export interface AnalyticsOutput {
  plotly_spec: Record<string, unknown>;
  data_table: AnalyticsTable;
  key_metrics: AnalyticsMetric[];
  insights: string[];
  json_ld: Record<string, unknown>;
  static_image_b64: string;
  script_slug: string;
  generated_at: string;
  data_freshness: string;
  cache_ttl_seconds: number;
}

export interface AnalyticsScriptInfo {
  slug: string;
  name: string;
  description: string;
  category: string;
  data_sources: string[];
  requires_live_data: boolean;
  cache_ttl: number;
}

type FetchOptions = {
  method?: string;
  body?: string;
  cache?: 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload';
};

async function apiFetch<T>(path: string, init?: FetchOptions): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Analytics API ${res.status}: ${text.slice(0, 220)}`);
  }
  return res.json();
}

export const kbAnalyticsApi = {
  listScripts(): Promise<AnalyticsScriptInfo[]> {
    return apiFetch('/knowledge/analytics/scripts/');
  },

  getScript(slug: string): Promise<AnalyticsScriptInfo> {
    return apiFetch(`/knowledge/analytics/scripts/${encodeURIComponent(slug)}/`);
  },

  runScript(slug: string, params: Record<string, unknown>): Promise<AnalyticsOutput> {
    return apiFetch(`/knowledge/analytics/scripts/${encodeURIComponent(slug)}/run/`, {
      method: 'POST',
      body: JSON.stringify(params),
      cache: 'no-store',
    });
  },
};

export function runAnalyticsScript(slug: string, params: Record<string, unknown>): Promise<AnalyticsOutput> {
  return kbAnalyticsApi.runScript(slug, params);
}
