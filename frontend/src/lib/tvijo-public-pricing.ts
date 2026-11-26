const PRICING_URL = 'https://dsh.tvijo.com/api/dshrem/v1/public/pricing';

const RATE_FIELDS = [
  'input_per_million_usd', 'output_per_million_usd',
  'input_per_million_tt', 'output_per_million_tt',
] as const;

type ModelPrice = Record<(typeof RATE_FIELDS)[number], string> & {
  id: string;
  name: string;
  provider: string;
  source: string;
  observed_at: string;
  live_tested: true;
};

export type PublicPricing = {
  tt_per_usd: number;
  managed_markup_percent: string;
  models: ModelPrice[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAmount(value: unknown): value is string {
  return typeof value === 'string' && /^\d+(\.\d+)?$/.test(value);
}

function isPriceSource(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isModelPrice(value: unknown): value is ModelPrice {
  return isRecord(value) && value.live_tested === true &&
    typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.provider === 'string' && isPriceSource(value.source) &&
    typeof value.observed_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.observed_at) &&
    RATE_FIELDS.every((field) => isAmount(value[field]));
}

export async function loadPublicPricing(fetcher: typeof fetch = fetch): Promise<PublicPricing | null> {
  try {
    const response = await fetcher(PRICING_URL, {
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    if (!isRecord(value) || value.tt_per_usd !== 1000 || value.prices_are_not_settlement !== true ||
        !isAmount(value.managed_markup_percent) || !Array.isArray(value.models)) return null;
    return {
      tt_per_usd: value.tt_per_usd,
      managed_markup_percent: value.managed_markup_percent,
      models: value.models.filter(isModelPrice),
    };
  } catch {
    return null;
  }
}
