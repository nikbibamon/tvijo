/**
 * MindMap API client
 * Generation: GEN-KB-MINDMAP-001
 */

/** Align with decmap-api / portal (same JWT for KB mindmap writes). */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status}`);
  }

  return response.json();
}

export const kbMindmapApi = {
  // Graph
  getGraph: () => fetchWithAuth('/knowledge/mindmap/nodes/graph/'),
  
  // Nodes
  getNodes: () => fetchWithAuth('/knowledge/mindmap/nodes/'),
  getNode: (id: string) => fetchWithAuth(`/knowledge/mindmap/nodes/${id}/`),
  createNode: (data: any) => fetchWithAuth('/knowledge/mindmap/nodes/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Edges
  getEdges: () => fetchWithAuth('/knowledge/mindmap/edges/'),
  createEdge: (data: any) => fetchWithAuth('/knowledge/mindmap/edges/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Suggestions
  getSuggestions: () => fetchWithAuth('/knowledge/mindmap/suggestions/'),
  createSuggestion: (data: any) => fetchWithAuth('/knowledge/mindmap/suggestions/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approveSuggestion: (id: string) => fetchWithAuth(`/knowledge/mindmap/suggestions/${id}/approve/`, {
    method: 'POST',
  }),
  rejectSuggestion: (id: string, reason?: string) => fetchWithAuth(`/knowledge/mindmap/suggestions/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};
