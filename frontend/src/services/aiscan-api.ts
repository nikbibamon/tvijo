/**
 * External AI Exposure Check client — GEN-AISCAN-001.
 * Backend: apps/aiscan (spec: specs/2026-08-external-ai-exposure-check.md).
 *
 * Finding titles/details arrive in English from the API by design (spec §4.4);
 * everything around them is localized from src/i18n.
 */

const API_BASE = (process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1').replace(/\/+$/, '');
const BASE = `${API_BASE}/aiscan`;

export type FindingStatus = 'fail' | 'warn' | 'pass' | 'info' | 'unknown';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanBlock = 'exposure' | 'privacy' | 'ai_client' | 'governance' | 'code_access';

export type Finding = {
  code: string;
  block: ScanBlock;
  status: FindingStatus;
  severity: FindingSeverity;
  title: string;
  detail: string;
  evidence: string[];
  weight: number;
  confidence: 'high' | 'medium' | 'low';
};

export type BlockSummary = {
  block: ScanBlock;
  counts: Partial<Record<FindingStatus, number>>;
  checks: number;
  /** null for code_access: nothing there is checkable from a URL. */
  score: number | null;
};

export type ExposureReport = {
  id: string;
  url: string;
  host: string;
  final_url: string;
  status: 'ok' | 'failed' | 'blocked';
  error_code: string;
  http_status: number | null;
  duration_ms: number;
  score: number;
  grade: string;
  counts: Partial<Record<FindingStatus, number>>;
  blocks: BlockSummary[];
  findings: Finding[];
  created_at: string;
};

export type ScanError = { error: string; detail?: string };

export async function runScan(url: string, locale?: string): Promise<ExposureReport | ScanError> {
  try {
    const res = await fetch(`${BASE}/scan/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, locale }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: body?.error || `http_${res.status}`, detail: body?.detail };
    }
    return body as ExposureReport;
  } catch {
    return { error: 'network_error' };
  }
}

export async function getScan(id: string): Promise<ExposureReport | null> {
  try {
    const res = await fetch(`${BASE}/scan/${id}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as ExposureReport;
  } catch {
    return null;
  }
}

/** Fitness link (spec §3): this report turned into a control-review request. */
export async function markReviewRequested(id: string): Promise<void> {
  try {
    await fetch(`${BASE}/scan/${id}/review/`, { method: 'POST' });
  } catch {
    /* best effort — the lead itself is already stored by /trading/leads/ */
  }
}

export function isScanError(value: ExposureReport | ScanError | null): value is ScanError {
  return !!value && 'error' in value;
}
