/**
 * Changelog API service
 * 
 * Provides functions to fetch changelog data from the backend API.
 * Replaces hardcoded changelog data with dynamic data from database.
 */

import { fetchAPI } from './api';

export interface ChangelogEntry {
  id: number;
  version: string;
  date: string;
  entry_type: 'major' | 'minor' | 'patch' | 'feature' | 'improvement' | 'bugfix' | 'security' | 'migration' | 'other';
  type_display: string;
  title: string;
  description: string;
  changes: string[];
  source: string;
  source_app?: string;
  is_highlighted: boolean;
  created_at: string;
}

export interface ChangelogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChangelogEntry[];
}

export interface ChangelogStats {
  total_entries: number;
  by_type: Record<string, number>;
  by_source: Record<string, number>;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
}

export interface ChangelogType {
  value: string;
  label: string;
}

/**
 * Fetch changelog entries with optional filtering
 */
export async function fetchChangelog(params?: {
  type?: string;
  app?: string;
  version?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<ChangelogResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.type) queryParams.set('type', params.type);
  if (params?.app) queryParams.set('app', params.app);
  if (params?.version) queryParams.set('version', params.version);
  if (params?.date_from) queryParams.set('date_from', params.date_from);
  if (params?.date_to) queryParams.set('date_to', params.date_to);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.page_size) queryParams.set('page_size', params.page_size.toString());
  
  const query = queryParams.toString();
  return fetchAPI<ChangelogResponse>(`/api/v1/changelog/entries/${query ? `?${query}` : ''}`);
}

/**
 * Fetch changelog entries grouped by version
 */
export async function fetchChangelogGrouped(groupBy: 'version' | 'date' = 'version', limit?: number): Promise<{
  groups: Array<{
    key: string;
    date: string | null;
    entries: ChangelogEntry[];
  }>;
}> {
  const params = new URLSearchParams();
  params.set('group_by', groupBy);
  if (limit) params.set('limit', limit.toString());
  
  return fetchAPI(`/api/v1/changelog/entries/grouped/?${params.toString()}`);
}

/**
 * Fetch changelog statistics
 */
export async function fetchChangelogStats(): Promise<ChangelogStats> {
  return fetchAPI<ChangelogStats>('/api/v1/changelog/entries/stats/');
}

/**
 * Fetch available entry types
 */
export async function fetchChangelogTypes(): Promise<{ types: ChangelogType[] }> {
  return fetchAPI<{ types: ChangelogType[] }>('/api/v1/changelog/entries/types/');
}

/**
 * Fetch all versions
 */
export async function fetchChangelogVersions(): Promise<{ versions: Array<{ version: string; count: number }> }> {
  return fetchAPI<{ versions: Array<{ version: string; count: number }> }>('/api/v1/changelog/entries/versions/');
}

/**
 * Map entry type to display color
 */
export function getEntryTypeColor(type: string): string {
  switch (type) {
    case 'major':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'minor':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'patch':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'feature':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'improvement':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'bugfix':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'security':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'migration':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

/**
 * Map entry type to display label
 */
export function getEntryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    major: 'Major Release',
    minor: 'Minor Release',
    patch: 'Patch',
    feature: 'Feature',
    improvement: 'Improvement',
    bugfix: 'Bug Fix',
    security: 'Security',
    api: 'API',
    model: 'Database',
    migration: 'Migration',
    docs: 'Docs',
    other: 'Other',
  };
  return labels[type] || type;
}

/**
 * Group entries by date (for timeline view)
 */
export function groupEntriesByDate(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();
  
  for (const entry of entries) {
    const date = entry.date;
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(entry);
  }
  
  return new Map([...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

/**
 * Group entries by version
 */
export function groupEntriesByVersion(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();
  
  for (const entry of entries) {
    const version = entry.version || 'Unversioned';
    if (!groups.has(version)) {
      groups.set(version, []);
    }
    groups.get(version)!.push(entry);
  }
  
  return new Map([...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}
