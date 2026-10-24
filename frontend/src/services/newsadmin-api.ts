/**
 * API Client for News Intelligence Admin Panel
 * Generation: GEN-NEWS-003
 * Base: /api/v1/newsanalyzer/
 */

import { parseLocale } from '@/i18n/config';
import type {
  MonitoredSource,
  RawNewsItem,
  NewsEvent,
  NewsEventListItem,
  KeywordSpike,
  AlertPreference,
  AlertHistory,
  ChannelSnapshot,
  DetectionLatencyStats,
  PipelinePerformance,
  SourcePerformanceItem,
  VolumeTimelineItem,
  SourceActivityItem,
  TopicEngagement,
  SourceEngagement,
  DashboardSummary,
  CompetitorPublication,
  SpeedComparison,
  TopActiveCompetitor,
  FastestGrowingChannel,
  PaginatedResponse,
} from '@/types/newsadmin';

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
const BASE = `${API_BASE}/newsanalyzer`;

// ============================================================================
// Helpers
// ============================================================================

async function tryRefreshToken(): Promise<string | null> {
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
    localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // On 401, attempt one token refresh then retry
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const locale = parseLocale(window.location.pathname);
      window.location.href = `/${locale}/newsadmin/login`;
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error ${res.status}`);
  }

  return res.json();
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

// ============================================================================
// Sources (CRUD)
// ============================================================================

export const sourcesApi = {
  list: (params?: { source_type?: string; is_active?: boolean; search?: string }) =>
    fetchWithAuth<PaginatedResponse<MonitoredSource>>(`${BASE}/sources/${buildQuery(params || {})}`),

  get: (id: number) =>
    fetchWithAuth<MonitoredSource>(`${BASE}/sources/${id}/`),

  create: (data: Partial<MonitoredSource>) =>
    fetchWithAuth<MonitoredSource>(`${BASE}/sources/`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<MonitoredSource>) =>
    fetchWithAuth<MonitoredSource>(`${BASE}/sources/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) =>
    fetchWithAuth<void>(`${BASE}/sources/${id}/`, { method: 'DELETE' }),
};

// ============================================================================
// News Items
// ============================================================================

export const itemsApi = {
  list: (params?: {
    topic?: string;
    source_type?: string;
    is_processed?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }) =>
    fetchWithAuth<PaginatedResponse<RawNewsItem>>(`${BASE}/items/${buildQuery(params || {})}`),

  get: (id: number) =>
    fetchWithAuth<RawNewsItem>(`${BASE}/items/${id}/`),
};

// ============================================================================
// Events
// ============================================================================

export const eventsApi = {
  list: (params?: {
    status?: string;
    editor_status?: string;
    topic?: string;
    region?: string;
    is_pinned?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }) =>
    fetchWithAuth<PaginatedResponse<NewsEventListItem>>(`${BASE}/events/${buildQuery(params || {})}`),

  get: (id: number) =>
    fetchWithAuth<NewsEvent>(`${BASE}/events/${id}/`),

  trending: (params?: { hours?: number; min_score?: number }) =>
    fetchWithAuth<NewsEventListItem[]>(`${BASE}/events/trending/${buildQuery(params || {})}`),

  breaking: (params?: { minutes?: number; min_importance?: number }) =>
    fetchWithAuth<NewsEventListItem[]>(`${BASE}/events/breaking/${buildQuery(params || {})}`),

  review: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/events/${id}/review/`, { method: 'POST' }),

  assign: (id: number, userId: string) =>
    fetchWithAuth<{ status: string }>(`${BASE}/events/${id}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  dismiss: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/events/${id}/dismiss/`, { method: 'POST' }),

  pin: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/events/${id}/pin/`, { method: 'POST' }),

  unpin: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/events/${id}/unpin/`, { method: 'POST' }),
};

// ============================================================================
// Keyword Spikes
// ============================================================================

export const spikesApi = {
  list: (params?: { keyword?: string; ordering?: string; page?: number }) =>
    fetchWithAuth<PaginatedResponse<KeywordSpike>>(`${BASE}/spikes/${buildQuery(params || {})}`),

  recent: (params?: { hours?: number; min_ratio?: number }) =>
    fetchWithAuth<KeywordSpike[]>(`${BASE}/spikes/recent/${buildQuery(params || {})}`),
};

// ============================================================================
// Alert Preferences (Settings)
// ============================================================================

export const preferencesApi = {
  list: () =>
    fetchWithAuth<PaginatedResponse<AlertPreference>>(`${BASE}/preferences/`),

  get: (id: number) =>
    fetchWithAuth<AlertPreference>(`${BASE}/preferences/${id}/`),

  create: (data: Partial<AlertPreference>) =>
    fetchWithAuth<AlertPreference>(`${BASE}/preferences/`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<AlertPreference>) =>
    fetchWithAuth<AlertPreference>(`${BASE}/preferences/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) =>
    fetchWithAuth<void>(`${BASE}/preferences/${id}/`, { method: 'DELETE' }),
};

// ============================================================================
// Alerts (Alert Center)
// ============================================================================

export const alertsApi = {
  list: (params?: {
    alert_type?: string;
    is_read?: boolean;
    is_dismissed?: boolean;
    ordering?: string;
    page?: number;
  }) =>
    fetchWithAuth<PaginatedResponse<AlertHistory>>(`${BASE}/alerts/${buildQuery(params || {})}`),

  markRead: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/alerts/${id}/mark_read/`, { method: 'POST' }),

  markAllRead: () =>
    fetchWithAuth<{ status: string; count: number }>(`${BASE}/alerts/mark_all_read/`, { method: 'POST' }),

  dismiss: (id: number) =>
    fetchWithAuth<{ status: string }>(`${BASE}/alerts/${id}/dismiss/`, { method: 'POST' }),
};

// ============================================================================
// Channel Snapshots
// ============================================================================

export const snapshotsApi = {
  list: (params?: { source?: number; source__is_competitor?: boolean; ordering?: string }) =>
    fetchWithAuth<PaginatedResponse<ChannelSnapshot>>(`${BASE}/snapshots/${buildQuery(params || {})}`),
};

// ============================================================================
// Stats (Dashboard)
// ============================================================================

export const statsApi = {
  detectionLatency: (params?: { hours?: number }) =>
    fetchWithAuth<DetectionLatencyStats>(`${BASE}/stats/detection_latency/${buildQuery(params || {})}`),

  pipelinePerformance: (params?: { hours?: number }) =>
    fetchWithAuth<PipelinePerformance>(`${BASE}/stats/pipeline_performance/${buildQuery(params || {})}`),

  sourcePerformance: (params?: { days?: number }) =>
    fetchWithAuth<SourcePerformanceItem[]>(`${BASE}/stats/source_performance/${buildQuery(params || {})}`),

  volumeTimeline: (params?: { hours?: number }) =>
    fetchWithAuth<VolumeTimelineItem[]>(`${BASE}/stats/volume_timeline/${buildQuery(params || {})}`),

  sourceActivity: (params?: { hours?: number }) =>
    fetchWithAuth<SourceActivityItem[]>(`${BASE}/stats/source_activity/${buildQuery(params || {})}`),

  engagementByTopic: (params?: { days?: number }) =>
    fetchWithAuth<TopicEngagement[]>(`${BASE}/stats/engagement_by_topic/${buildQuery(params || {})}`),

  engagementBySource: (params?: { days?: number }) =>
    fetchWithAuth<SourceEngagement[]>(`${BASE}/stats/engagement_by_source/${buildQuery(params || {})}`),

  dashboardSummary: () =>
    fetchWithAuth<DashboardSummary>(`${BASE}/stats/dashboard_summary/`),
};

// ============================================================================
// Competitors
// ============================================================================

export const competitorsApi = {
  publications: (params?: { hours?: number }) =>
    fetchWithAuth<CompetitorPublication[]>(`${BASE}/competitors/publications/${buildQuery(params || {})}`),

  speedComparison: (params?: { days?: number }) =>
    fetchWithAuth<SpeedComparison[]>(`${BASE}/competitors/speed_comparison/${buildQuery(params || {})}`),

  topActive: (params?: { days?: number }) =>
    fetchWithAuth<TopActiveCompetitor[]>(`${BASE}/competitors/top_active/${buildQuery(params || {})}`),

  fastestGrowing: () =>
    fetchWithAuth<FastestGrowingChannel[]>(`${BASE}/competitors/fastest_growing/`),
};
