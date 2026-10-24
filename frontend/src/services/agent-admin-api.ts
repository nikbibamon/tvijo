/**
 * Agent Admin API client
 * Generation: GEN-AGENTS-SEC-001
 *
 * Authenticated API calls for the Agent Control Panel.
 * Uses the same JWT keys as newsadmin-auth / newsadmin-api: access_token, refresh_token.
 */

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

async function tryRefreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return data.access || null;
  } catch {
    return null;
  }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  let token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const newToken = await tryRefreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

// ============================================================================
// Types
// ============================================================================

export interface PipelineStats {
  total_runs_24h: number;
  success_runs_24h: number;
  success_rate: number;
  total_signals_24h: number;
  total_decisions_24h: number;
  total_approved_24h: number;
  avg_duration_ms: number;
  last_run: PipelineRun | null;
}

export interface PipelineRun {
  id: number;
  status: string;
  total_signals: number;
  total_decisions: number;
  approved_decisions: number;
  duration_ms: number;
  started_at: string;
  completed_at: string | null;
  error_message: string;
}

export interface SecuritySummary {
  kill_switch_active: boolean;
  circuit_breaker_tripped: boolean;
  observer: {
    status: string;
    message?: string;
    last_run?: string;
    checks?: Record<string, unknown>;
  };
  events_24h: Record<string, number>;
  unresolved_count: number;
}

export interface SecurityEvent {
  id: number;
  severity: string;
  event_type: string;
  agent: string;
  action_attempted: string;
  action_allowed: boolean;
  details: Record<string, unknown>;
  telegram_sent: boolean;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface GuardrailConfig {
  id: number;
  key: string;
  value: unknown;
  description: string;
  is_active: boolean;
  updated_at: string;
}

export interface AdminOverview {
  pipeline: PipelineStats;
  security: SecuritySummary;
  recent_events: SecurityEvent[];
  recent_runs: PipelineRun[];
  guardrails: GuardrailConfig[];
}

// ============================================================================
// API Functions
// ============================================================================

export async function fetchOverview(): Promise<AdminOverview> {
  const res = await authFetch(`${API_BASE}/agents/admin/overview/`);
  if (!res.ok) throw new Error(`Overview failed: ${res.status}`);
  return res.json();
}

export async function toggleKillSwitch(action: 'activate' | 'deactivate' | 'toggle', reason?: string) {
  const res = await authFetch(`${API_BASE}/agents/admin/kill_switch/`, {
    method: 'POST',
    body: JSON.stringify({ action, reason }),
  });
  if (!res.ok) throw new Error(`Kill switch failed: ${res.status}`);
  return res.json();
}

export async function triggerPipeline() {
  const res = await authFetch(`${API_BASE}/agents/admin/run_pipeline/`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Pipeline trigger failed: ${res.status}`);
  return res.json();
}

export async function triggerObserver() {
  const res = await authFetch(`${API_BASE}/agents/admin/run_observer/`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Observer trigger failed: ${res.status}`);
  return res.json();
}

export async function updateGuardrail(key: string, value: unknown, is_active?: boolean) {
  const res = await authFetch(`${API_BASE}/agents/admin/guardrails/`, {
    method: 'PUT',
    body: JSON.stringify({ key, value, is_active }),
  });
  if (!res.ok) throw new Error(`Guardrail update failed: ${res.status}`);
  return res.json();
}

export async function resolveEvents(ids?: number[]) {
  const res = await authFetch(`${API_BASE}/agents/admin/resolve-events/`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`Resolve failed: ${res.status}`);
  return res.json();
}

export async function fetchSecurityEvents(params?: { severity?: string; hours?: number }) {
  const qs = new URLSearchParams();
  if (params?.severity) qs.set('severity', params.severity);
  if (params?.hours) qs.set('hours', String(params.hours));
  const res = await authFetch(`${API_BASE}/agents/security/?${qs.toString()}`);
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
  return res.json();
}

export async function sendAIChatMessage(
  message: string,
  context?: {
    pipelineStats?: {
      totalRuns24h: number;
      successRate: number;
      totalSignals: number;
      totalDecisions: number;
    };
    securityStatus?: {
      killSwitchActive: boolean;
      circuitBreakerTripped: boolean;
      unresolvedEvents: number;
    };
    recentEvents?: Array<{
      severity: string;
      eventType: string;
      agent: string;
    }>;
  },
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  const res = await authFetch(`${API_BASE}/agents/ai-chat/`, {
    method: 'POST',
    body: JSON.stringify({ message, context, history }),
  });
  if (!res.ok) throw new Error(`AI chat failed: ${res.status}`);
  return res.json() as Promise<{
    response: string;
    model: string;
    timestamp: string;
  }>;
}
