/**
 * The public sample run shown on `/{locale}/demo`.
 *
 * Backend: `apps/contracts/sample.py`, served by `GET /contracts/sample/`
 * without authentication. The fixture is built in memory from unsaved model
 * instances, so the request reads no database row and starts no work.
 *
 * Fetched on the server so the page renders its result with JavaScript
 * disabled, and revalidated hourly because the payload is immutable — a
 * visitor should never wait on our API to see the example.
 */

const SAMPLE_TTL_SECONDS = 3600;

function serverBase(): string {
  const configured =
    process.env.DJANGO_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://api.tvijo.com/api/v1'
      : 'http://localhost:8000/api/v1');
  const trimmed = configured.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

export interface SampleSource {
  ref: string;
  kind: string;
  version: string;
  snapshot: string;
}

export interface SampleAcceptanceCheck {
  rule: string;
  passed: boolean;
  evidence: Record<string, unknown>;
  checked_at: string | null;
}

export interface SampleStep {
  state: string;
  note: string;
}

export interface PublicSample {
  sample: boolean;
  sample_id: string;
  workflow: string;
  notice: string;
  contract: {
    id: string;
    contract_hash: string;
    status: string;
    goal: string;
    expected_result: string;
    budget: {
      max_usd: string | number | null;
      max_tokens: number | null;
      max_minutes: number | null;
      max_steps: number | null;
    };
    payload: Record<string, unknown>;
  };
  run: {
    id: string;
    run_no: number;
    status: string;
    binding: { provider?: string; model?: string; execution_owner?: string };
    cost_usd: string;
    tokens: number | null;
    steps: number | null;
    started_at: string | null;
    finished_at: string | null;
  };
  acceptance: {
    acceptance: SampleAcceptanceCheck[];
    passed: number;
    total: number;
  };
  evidence: Array<{ pack_hash: string; object_key: string }>;
  reservation: { held_usd: string; settled_usd: string; state: string };
  cost_basis: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    input_usd_per_million: string;
    output_usd_per_million: string;
    input_usd: string;
    output_usd: string;
    total_usd: string;
  };
  sources: SampleSource[];
  output: string;
  steps: SampleStep[];
}

/** Returns the sample, or null when the API did not answer. */
export async function fetchPublicSample(): Promise<PublicSample | null> {
  try {
    const response = await fetch(`${serverBase()}/contracts/sample/`, {
      next: { revalidate: SAMPLE_TTL_SECONDS },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as PublicSample;
    // A payload that does not declare itself a sample is not one we may show
    // as one: fail closed rather than render live-looking numbers.
    return body && body.sample === true ? body : null;
  } catch {
    return null;
  }
}
