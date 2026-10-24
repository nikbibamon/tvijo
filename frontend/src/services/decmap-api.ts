/**
 * Decision Map API client.
 * Generation: GEN-DECMAP-001
 * 
 * Connects to Django API /api/v1/decmap/
 * Falls back to localStorage if API is unavailable.
 */

// Prefer NEXT_PUBLIC_API_URL (used by every other service); keep the legacy
// NEXT_PUBLIC_DJANGO_API_URL as a fallback so existing envs keep working.
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_DJANGO_API_URL ||
  '/api/v1'
).replace(/\/+$/, '');
const DECMAP_API = `${API_BASE}/decmap`;

// ============================================================
// Types
// ============================================================

export interface DecMapCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  task_count: number;
}

export interface ContentSection {
  id: string;
  title: string;
  body: string;
  section_type: 'text' | 'list' | 'code' | 'quote' | 'highlight';
  order: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  order: number;
  vote_count: number;
}

export interface UserChoice {
  id: string;
  option: string;
  option_label: string;
  option_icon: string;
  nickname: string;
  notes: string;
  created_at: string;
}

export interface DecMapTaskList {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'archived';
  category_name: string;
  category_icon: string;
  author_nick: string;
  section_count: number;
  option_count: number;
  choice_count: number;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecMapTaskDetail {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'archived';
  category: DecMapCategory;
  author_nick: string;
  sections: ContentSection[];
  options: DecisionOption[];
  choices: UserChoice[];
  generated_prompt: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BubbleMapVersionMeta {
  id: string;
  label: string;
  notes?: string;
  created_at: string;
}

export interface BubbleMap {
  id: string;
  name: string;
  slug: string;
  description: string;
  template: string;
  owner_nick: string;
  nodes_json: any[];
  links_json: any[];
  is_public: boolean;
  node_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  /** Снимки графа (одна карта в БД — много версий) */
  versions?: BubbleMapVersionMeta[];
  readonly_snapshot?: boolean;
  active_version?: BubbleMapVersionMeta | null;
}

export interface DecMapStats {
  active_tasks: number;
  resolved_tasks: number;
  total_choices: number;
}

// ============================================================
// API Helpers
// ============================================================

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Portal JWT — backend maps BubbleMap.owner to this user (see BubbleMapViewSet). */
function decmapAuthHeaders(base?: HeadersInit): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (base && typeof base === 'object' && !(base instanceof Headers)) {
    Object.assign(h, base as Record<string, string>);
  }
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('access_token');
    if (t) h.Authorization = `Bearer ${t}`;
  }
  return h;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: decmapAuthHeaders(options?.headers as HeadersInit),
    });
    if (!res.ok) {
      console.warn(`DecMap API ${res.status}: ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('DecMap API unavailable:', err);
    return null;
  }
}

async function apiFetchList<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      headers: decmapAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Handle both paginated {results:[]} and plain array responses
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch {
    return [];
  }
}

// ============================================================
// Tasks API
// ============================================================

export async function fetchTasks(
  nick: string,
  status?: string
): Promise<DecMapTaskList[]> {
  const params = new URLSearchParams({ nick });
  if (status) params.set('status', status);
  return apiFetchList<DecMapTaskList>(`${DECMAP_API}/tasks/?${params}`);
}

export async function fetchTask(
  slug: string,
  nick: string
): Promise<DecMapTaskDetail | null> {
  return apiFetch<DecMapTaskDetail>(
    `${DECMAP_API}/tasks/${slug}/?nick=${encodeURIComponent(nick)}`
  );
}

export async function makeChoice(
  slug: string,
  optionId: string,
  nickname: string,
  notes: string
): Promise<UserChoice | null> {
  return apiFetch<UserChoice>(`${DECMAP_API}/tasks/${slug}/choose/`, {
    method: 'POST',
    body: JSON.stringify({ option: optionId, nickname, notes }),
  });
}

export async function generatePrompt(
  slug: string,
  nickname: string
): Promise<{ prompt: string; task_status: string; resolved_at: string } | null> {
  return apiFetch(`${DECMAP_API}/tasks/${slug}/generate/`, {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  });
}

export async function fetchStats(nick: string): Promise<DecMapStats | null> {
  return apiFetch<DecMapStats>(`${DECMAP_API}/tasks/stats/?nick=${encodeURIComponent(nick)}`);
}

// ============================================================
// Categories API
// ============================================================

export async function fetchCategories(): Promise<DecMapCategory[]> {
  return apiFetchList<DecMapCategory>(`${DECMAP_API}/categories/`);
}

// ============================================================
// BubbleMap API
// ============================================================

export async function fetchBubbleMaps(nick: string): Promise<BubbleMap[]> {
  return apiFetchList<BubbleMap>(`${DECMAP_API}/bubbles/?nick=${encodeURIComponent(nick)}`);
}

/**
 * Detail fetch. Pass `nick` (same as owner_nick) so private maps resolve — backend
 * filters queryset to public OR owner_nick=nick; without nick, only public maps work.
 */
export async function fetchBubbleMap(
  id: string,
  nick?: string,
  opts?: { version?: string | null }
): Promise<BubbleMap | null> {
  const params = new URLSearchParams();
  if (nick) params.set('nick', nick);
  if (opts?.version) params.set('version', opts.version);
  const q = params.toString() ? `?${params}` : '';
  return apiFetch<BubbleMap>(`${DECMAP_API}/bubbles/${id}/${q}`);
}

export async function saveBubbleMapVersion(
  id: string,
  body: { label?: string; notes?: string },
  nick?: string
): Promise<BubbleMapVersionMeta | null> {
  const q = nick ? `?nick=${encodeURIComponent(nick)}` : '';
  return apiFetch<BubbleMapVersionMeta>(`${DECMAP_API}/bubbles/${id}/save_version/${q}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createBubbleMap(data: {
  name: string;
  description?: string;
  template?: string;
  owner_nick: string;
  nodes_json?: any[];
  links_json?: any[];
}): Promise<BubbleMap | null> {
  return apiFetch<BubbleMap>(`${DECMAP_API}/bubbles/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBubbleNodes(
  id: string,
  nodes: any[],
  links: any[],
  nick?: string
): Promise<{ status: string } | null> {
  const q = nick ? `?nick=${encodeURIComponent(nick)}` : '';
  return apiFetch(`${DECMAP_API}/bubbles/${id}/update_nodes/${q}`, {
    method: 'POST',
    body: JSON.stringify({ nodes, links }),
  });
}

export async function fetchPublicBubbles(): Promise<BubbleMap[]> {
  return apiFetchList<BubbleMap>(`${DECMAP_API}/bubbles/public/`);
}

export async function fetchBubbleTemplates(): Promise<{ id: string; label: string }[]> {
  return apiFetchList<{ id: string; label: string }>(`${DECMAP_API}/bubbles/templates/`);
}

// ============================================================
// DecMapBundle API (Decision OS / django-wire — /bundles)
// ============================================================

export type LlmContextMode = 'minimal' | 'cag' | 'full_map' | 'rag';
export type LlmHallucinationPolicy =
  | 'none'
  | 'template_fallback'
  | 'flag_unverified'
  | 'require_moderation';

export interface DecMapBundle extends BubbleMap {
  /** UUID of the owning user (null for orphaned bundles). Added 2026-04-20 for collab UI. */
  owner?: string | null;
  llm_context_mode?: LlmContextMode;
  llm_max_prompt_nodes?: number | null;
  llm_max_context_chars?: number | null;
  llm_temperature?: string | null;
  llm_top_p?: string | null;
  llm_max_output_tokens?: number | null;
  llm_rag_enabled?: boolean;
  llm_hallucination_policy?: LlmHallucinationPolicy;
  llm_token_budget_per_day?: number | null;
  kb_article_slug?: string | null;
  kb_article_category_slug?: string | null;
}

export async function fetchBundles(nick: string): Promise<DecMapBundle[]> {
  return apiFetchList<DecMapBundle>(`${DECMAP_API}/bundles/?nick=${encodeURIComponent(nick)}`);
}

export async function fetchBundle(
  id: string,
  nick?: string,
  opts?: { version?: string | null }
): Promise<DecMapBundle | null> {
  const params = new URLSearchParams();
  if (nick) params.set('nick', nick);
  if (opts?.version) params.set('version', opts.version);
  const q = params.toString() ? `?${params}` : '';
  return apiFetch<DecMapBundle>(`${DECMAP_API}/bundles/${id}/${q}`);
}

export async function fetchBundleBySlug(slug: string): Promise<DecMapBundle | null> {
  return apiFetch<DecMapBundle>(`${DECMAP_API}/bundles/by-slug/${encodeURIComponent(slug)}/`);
}

export async function saveBundleVersion(
  id: string,
  body: { label?: string; notes?: string },
  nick?: string
): Promise<BubbleMapVersionMeta | null> {
  const q = nick ? `?nick=${encodeURIComponent(nick)}` : '';
  return apiFetch<BubbleMapVersionMeta>(`${DECMAP_API}/bundles/${id}/save_version/${q}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createBundle(data: {
  name: string;
  description?: string;
  template?: string;
  owner_nick: string;
  nodes_json?: any[];
  links_json?: any[];
  is_public?: boolean;
  is_published?: boolean;
  llm_context_mode?: LlmContextMode;
  llm_max_prompt_nodes?: number | null;
  llm_rag_enabled?: boolean;
  llm_hallucination_policy?: LlmHallucinationPolicy;
}): Promise<DecMapBundle | null> {
  return apiFetch<DecMapBundle>(`${DECMAP_API}/bundles/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBundleNodes(
  id: string,
  nodes: any[],
  links: any[],
  nick?: string
): Promise<{ status: string } | null> {
  const q = nick ? `?nick=${encodeURIComponent(nick)}` : '';
  return apiFetch(`${DECMAP_API}/bundles/${id}/update_nodes/${q}`, {
    method: 'POST',
    body: JSON.stringify({ nodes, links }),
  });
}

export async function fetchPublicBundles(): Promise<DecMapBundle[]> {
  return apiFetchList<DecMapBundle>(`${DECMAP_API}/bundles/public/`);
}

export async function fetchBundleTemplates(): Promise<{ id: string; label: string }[]> {
  return apiFetchList<{ id: string; label: string }>(`${DECMAP_API}/bundles/templates/`);
}

// ============================================================
// Decision Center — cross-bundle activity feed (forum)
// ============================================================

export interface DecmapActivity {
  kind: 'comment' | 'vote';
  id: string;
  bundle_id: string;
  bundle_name: string;
  bundle_slug: string;
  node_id: string;
  username: string;
  text: string;
  vote_type: 'approve' | 'reject' | 'discuss' | null;
  created_at: string;
}

/** Recent comments + votes across all public bundles (public, no auth). */
export async function fetchDecmapActivity(limit = 30): Promise<DecmapActivity[]> {
  return apiFetchList<DecmapActivity>(
    `${DECMAP_API}/social/comments/activity/?limit=${limit}`,
  );
}

export interface CommunityStats {
  members: number;
  decisions: number;
  maps: number;
  comments: number;
  votes: number;
  discussions: number;
}

/** Headline engagement numbers for the Decision Center (public, no auth). */
export async function fetchCommunityStats(): Promise<CommunityStats | null> {
  return apiFetch<CommunityStats>(`${DECMAP_API}/social/comments/community-stats/`);
}

// ============================================================
// Reward System API
// ============================================================

export type Rank = 'novice' | 'contributor' | 'expert' | 'master';

export interface UserRewardProfile {
  id: string;
  username: string;
  rank: Rank;
  total_earned_tokens: string;
  total_spent_tokens: string;
  contribution_score: number;
  token_rate: string;
  monthly_token_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  username: string;
  rank: Rank;
  contribution_score: number;
  total_earned_tokens: string;
}

export type ContributionType = 'suggestion' | 'edit' | 'vote' | 'comment' | 'review';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface NodeContribution {
  id: string;
  bundle: string;
  bundle_name: string;
  username: string;
  contribution_type: ContributionType;
  description?: string;
  node_id: string;
  status: ContributionStatus;
  quality_score: number;
  tokens_spent: string;
  user_reward: string;
  created_at: string;
  updated_at?: string;
  approved_by_username?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface NodeVote {
  id: string;
  bundle: string;
  node_id: string;
  username: string;
  vote_type: 'approve' | 'reject' | 'discuss';
  weight: string;
  created_at: string;
}

export interface NodeComment {
  id: string;
  bundle: string;
  node_id: string;
  username: string;
  text: string;
  parent_comment: string | null;
  is_confirmed: boolean;
  replies: NodeComment[];
  created_at: string;
}

export async function fetchRewardProfile(): Promise<UserRewardProfile | null> {
  return apiFetch<UserRewardProfile>(`${DECMAP_API}/rewards/profile/`);
}

export async function fetchLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  return apiFetchList<LeaderboardEntry>(`${DECMAP_API}/rewards/leaderboard/?limit=${limit}`);
}

export async function fetchContributions(): Promise<NodeContribution[]> {
  return apiFetchList<NodeContribution>(`${DECMAP_API}/rewards/contributions/`);
}

export async function createContribution(data: {
  bundle: string;
  contribution_type: ContributionType;
  description?: string;
  node_id?: string;
}): Promise<NodeContribution | null> {
  return apiFetch<NodeContribution>(`${DECMAP_API}/rewards/contributions/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchNodeVotes(bundleId: string, nodeId?: string): Promise<NodeVote[]> {
  const params = new URLSearchParams({ bundle: bundleId });
  if (nodeId) params.set('node_id', nodeId);
  return apiFetchList<NodeVote>(`${DECMAP_API}/social/votes/?${params}`);
}

export async function castNodeVote(data: {
  bundle: string;
  node_id: string;
  vote_type: 'approve' | 'reject' | 'discuss';
}): Promise<NodeVote | null> {
  return apiFetch<NodeVote>(`${DECMAP_API}/social/votes/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchNodeComments(bundleId: string, nodeId?: string): Promise<NodeComment[]> {
  const params = new URLSearchParams({ bundle: bundleId });
  if (nodeId) params.set('node_id', nodeId);
  return apiFetchList<NodeComment>(`${DECMAP_API}/social/comments/?${params}`);
}

export async function createNodeComment(data: {
  bundle: string;
  node_id: string;
  text: string;
  parent_comment?: string | null;
}): Promise<NodeComment | null> {
  return apiFetch<NodeComment>(`${DECMAP_API}/social/comments/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
