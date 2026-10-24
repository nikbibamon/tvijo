/**
 * Portal JWT fetch — same base URL as login/profile (`NEXT_PUBLIC_API_URL` || `/api/v1`).
 * On 401, refreshes access token once (single-flight) and retries.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

/**
 * An API failure that kept its HTTP status and machine-readable `code`.
 *
 * A budget cap and an outage are different things and the UI has to say which,
 * but a plain `Error` throws that away and every surface renders both as the
 * same red box. Extends `Error`, so existing `instanceof Error` handling and
 * `.message` reads keep working unchanged.
 */
export class PortalApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'PortalApiError';
    this.status = status;
    this.code = code;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return null;
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = (await res.json()) as { access: string; refresh?: string };
      localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      return data.access;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function portalApiResponse(path: string, init?: RequestInit): Promise<Response> {
  let access = localStorage.getItem('access_token');
  if (!access) throw new PortalApiError('No auth', 401);

  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${p}`;
  const method = (init?.method ?? 'GET').toUpperCase();
  const hasJsonBody =
    init?.body != null &&
    init.body !== '' &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const request = (token: string) => {
    const extra = (init?.headers as Record<string, string> | undefined) || {};
    const headers: Record<string, string> = {
      ...extra,
      Authorization: `Bearer ${token}`,
    };
    const ct = headers['Content-Type'] ?? headers['content-type'];
    if (hasJsonBody && !ct) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, {
      ...init,
      method,
      headers,
    });
  };

  let res = await request(access);
  if (res.status === 401) {
    const next = await refreshAccessToken();
    if (!next) throw new PortalApiError('Unauthorized', 401);
    res = await request(next);
  }
  if (res.status === 401) throw new PortalApiError('Unauthorized', 401);
  if (!res.ok) {
    let msg = `API ${res.status}`;
    let code: string | null = null;
    try {
      const errBody = (await res.json()) as {
        detail?: unknown;
        error?: unknown;
        code?: unknown;
      };
      if (typeof errBody?.detail === 'string') msg = errBody.detail;
      else if (errBody?.detail != null) msg = JSON.stringify(errBody.detail);
      else if (typeof errBody?.error === 'string') msg = errBody.error;
      if (typeof errBody?.code === 'string') code = errBody.code;
    } catch {
      /* keep msg */
    }
    throw new PortalApiError(msg, res.status, code);
  }
  return res;
}

export async function portalApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await portalApiResponse(path, init);
  return response.json() as Promise<T>;
}

export type PortalApiDownload = {
  blob: Blob;
  filename: string;
};

/** Authenticated binary download with the same single-flight JWT refresh. */
export async function portalApiDownload(
  path: string,
  fallbackFilename: string,
): Promise<PortalApiDownload> {
  const response = await portalApiResponse(path);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return {
    blob: await response.blob(),
    filename: match?.[1] || fallbackFilename,
  };
}
