/**
 * Universal entity engagement API (comments + likes) for directory entities.
 * Backend: apps/directory EntityEngagementViewSet at /api/v1/directory/engagement/.
 * Targets are identified by (target_type, target_id) — e.g. ('fund', slug) or ('company', slug).
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');
const BASE = `${API_BASE}/directory/engagement`;

export type EntityTargetType = 'company' | 'fund';

export interface EntityComment {
  id: string;
  target_type: EntityTargetType;
  target_id: string;
  author_name: string;
  body: string;
  parent: string | null;
  like_count: number;
  replies: EntityComment[];
  created_at: string;
}

export interface EntitySummary {
  target_type: EntityTargetType;
  target_id: string;
  like_count: number;
  comment_count: number;
  user_liked: boolean;
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchEntitySummary(
  targetType: EntityTargetType,
  targetId: string,
): Promise<EntitySummary | null> {
  try {
    const q = new URLSearchParams({ target_type: targetType, target_id: targetId });
    const res = await fetch(`${BASE}/summary/?${q}`, { headers: { ...authHeaders() } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchEntityComments(
  targetType: EntityTargetType,
  targetId: string,
): Promise<EntityComment[]> {
  try {
    const q = new URLSearchParams({ target_type: targetType, target_id: targetId });
    const res = await fetch(`${BASE}/comments/?${q}`, { headers: { ...authHeaders() } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function addEntityComment(data: {
  target_type: EntityTargetType;
  target_id: string;
  body: string;
  parent?: string | null;
}): Promise<EntityComment | { __unauth: true } | null> {
  try {
    const res = await fetch(`${BASE}/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (res.status === 401) return { __unauth: true };
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function toggleEntityLike(
  targetType: EntityTargetType,
  targetId: string,
): Promise<{ liked: boolean; like_count: number } | { __unauth: true } | null> {
  try {
    const res = await fetch(`${BASE}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ target_type: targetType, target_id: targetId }),
    });
    if (res.status === 401) return { __unauth: true };
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
