/** Public content contract for the Django HomePage model. */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

export type HomePageBlock = {
  type: 'hero' | 'text' | 'image' | 'cta' | 'chart' | string;
  value: Record<string, unknown>;
};

export type HomePageContent = {
  source: 'wagtail' | 'fallback' | string;
  model: 'pages.HomePage' | string;
  id?: number;
  title: string;
  search_description?: string;
  content: HomePageBlock[];
};

const FETCH_TIMEOUT_MS = 6000;

export async function fetchHomePageContent(signal?: AbortSignal): Promise<HomePageContent> {
  // Never let a slow API hold the homepage hostage: the static markup is the
  // fallback, so we give the CMS a few seconds and move on. Older browsers
  // without AbortSignal.timeout/any just skip the timeout.
  let finalSignal = signal;
  if (typeof AbortSignal.timeout === 'function' && typeof AbortSignal.any === 'function') {
    const signals = [AbortSignal.timeout(FETCH_TIMEOUT_MS)];
    if (signal) signals.push(signal);
    finalSignal = AbortSignal.any(signals);
  }

  const response = await fetch(`${API_BASE}/homepage/`, {
    headers: { Accept: 'application/json' },
    signal: finalSignal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Homepage API returned ${response.status}`);
  }

  return response.json() as Promise<HomePageContent>;
}

export function getHomePageBlock(
  page: HomePageContent | null,
  type: HomePageBlock['type'],
): HomePageBlock | undefined {
  return page?.content.find((block) => block.type === type);
}

export function getStringField(block: HomePageBlock | undefined, field: string, fallback: string): string {
  const value = block?.value[field];
  return typeof value === 'string' && value.trim() ? value : fallback;
}
