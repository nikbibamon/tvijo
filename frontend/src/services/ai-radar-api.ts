import { PortalApiError, portalApiFetch } from '@/lib/portal-auth-fetch';

const API_BASE = (
  process.env.NEXT_PUBLIC_DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '/api/v1'
).replace(/\/+$/, '');

export type AIRadarSourceStatus = {
  available: boolean;
  stale: boolean;
  as_of: string | null;
  items: number;
};

export type AIRadarModel = {
  rank: number;
  id: string;
  name: string;
  total_tokens: number;
  date: string;
  context_length: number | null;
  input_per_million_usd: number | null;
  output_per_million_usd: number | null;
  capabilities: string[];
};

export type AIRadarApp = {
  rank: number | null;
  id: number | string | null;
  name: string;
  total_requests: number | null;
  total_tokens: number;
};

export type AIRadarOverview = {
  status: 'live' | 'catalog_only' | 'empty';
  as_of: string | null;
  source_status: Record<string, AIRadarSourceStatus>;
  attribution: {
    label: string;
    url: string;
    license: string;
  };
  trending_models: AIRadarModel[];
  trending_apps: AIRadarApp[];
  new_models: Array<{
    id: string;
    name: string;
    created: number | string | null;
    context_length: number | null;
    input_per_million_usd: number | null;
    output_per_million_usd: number | null;
    capabilities: string[];
  }>;
  benchmarks: Array<{
    id: string;
    name: string;
    source: string;
    scores: Record<string, number>;
  }>;
  task_classifications: Array<{
    tag?: string;
    display_name?: string;
    macro_category?: string;
    usage_share?: number;
    token_share?: number;
    models?: Array<{ id: string; tag_usage_share?: number; tag_token_share?: number }>;
  }>;
  events: Array<{
    type: string;
    entity_id: string;
    entity_name: string;
    title: string;
    summary: string;
    event_at: string;
    source_url: string;
    after: Record<string, unknown>;
  }>;
};

const FETCH_TIMEOUT_MS = 6000;

export async function fetchAIRadar(signal?: AbortSignal): Promise<AIRadarOverview> {
  let finalSignal = signal;
  if (typeof AbortSignal.timeout === 'function' && typeof AbortSignal.any === 'function') {
    const signals = [AbortSignal.timeout(FETCH_TIMEOUT_MS)];
    if (signal) signals.push(signal);
    finalSignal = AbortSignal.any(signals);
  }

  const response = await fetch(`${API_BASE}/ai-radar/overview/`, {
    headers: { Accept: 'application/json' },
    signal: finalSignal,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`AI radar API returned ${response.status}`);
  return response.json() as Promise<AIRadarOverview>;
}


export type AIRadarEconomics = {
  as_of: string | null;
  source_status?: Record<string, { available: boolean; as_of: string | null; stale: boolean }>;
  market: {
    source: string;
    ranking_date: string | null;
    ranking_metric: string;
    attribution_url: string;
    models: Array<{
      id: string;
      name: string;
      rank: number | null;
      total_tokens: number | null;
      period_date: string | null;
      input_per_million_usd: number | null;
      output_per_million_usd: number | null;
      scores: Record<string, number | undefined>;
      score_source: string | null;
      price_as_of: string | null;
    }>;
  };
  internal: {
    window_days: number;
    as_of: string | null;
    models: Array<{
      id: string;
      calls: number;
      input_tokens: number;
      output_tokens: number;
      known_cost_usd: number | null;
      cost_by_source_usd: { provider: number | null; estimated: number | null };
      unknown_cost_calls: number;
      success_rate: number | null;
    }>;
    totals: { calls: number; known_cost_usd: number | null; unknown_cost_calls: number };
  };
  methodology: Record<string, unknown>;
};

export type AIRadarBudgetPlan = {
  status: 'calculated' | 'unpriced' | 'stale_price' | 'zero_price';
  price_stale?: boolean;
  model_id: string;
  budget_usd: number;
  unit_cost_usd: number | null;
  affordable_tasks: number | null;
  unused_usd: number | null;
  scenarios: Array<{ budget_usd: number; affordable_tasks: number | null; unused_usd: number | null }>;
  price_as_of: string | null;
  caveats: string[];
};

async function adminRadarRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await portalApiFetch<T>(path, { ...init, cache: 'no-store' });
  } catch (error) {
    if (error instanceof PortalApiError && (error.status === 401 || error.status === 403)) {
      throw new Error('Admin sign-in required');
    }
    throw error;
  }
}

export function fetchAIRadarEconomics(): Promise<AIRadarEconomics> {
  return adminRadarRequest<AIRadarEconomics>('/ai-radar/benchmarks/?window_days=30');
}

export function fetchAIRadarBudgetPlan(
  input: { model_id: string; budget_usd: number; input_tokens_per_task: number; output_tokens_per_task: number },
): Promise<AIRadarBudgetPlan> {
  return adminRadarRequest<AIRadarBudgetPlan>('/ai-radar/budget-plan/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
