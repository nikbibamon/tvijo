export type ModuleMetric = {
  key: string;
  value: string;
  label: string;
};

export type TvijoModule = {
  slug: string;
  name: string;
  category: 'news' | 'ai-infra' | 'trading-research' | 'data';
  status: 'available' | 'beta' | 'roadmap';
  short_pitch: string;
  description: string;
  limitations: string;
  evidence: {
    measured_on: string | null;
    source_url: string;
    source_label: string;
    metrics: ModuleMetric[];
    notes: string[];
  };
  pricing_model: 'subscription' | 'one-time' | 'custom';
  price_from: number | null;
  cta_type: 'demo' | 'contact' | 'roadmap';
  seo_title: string;
  seo_description: string;
};

type ModuleListResponse = { results: TvijoModule[]; count: number };

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const SERVER_API_BASE = API_BASE.startsWith('http') ? API_BASE : 'https://api.tvijo.com/api/v1';

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${SERVER_API_BASE}${path}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getModules(locale: string): Promise<TvijoModule[]> {
  const payload = await getJson<ModuleListResponse>(`/modules/?locale=${encodeURIComponent(locale)}`);
  return payload?.results ?? [];
}

export async function getModule(slug: string, locale: string): Promise<TvijoModule | null> {
  return getJson<TvijoModule>(`/modules/${encodeURIComponent(slug)}/?locale=${encodeURIComponent(locale)}`);
}
