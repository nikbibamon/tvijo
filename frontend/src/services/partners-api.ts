/**
 * Exchange Partners API Client
 * Generation: GEN-REFERRAL-EXCHANGE-001
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ExchangePartner {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  referral_url: string;
  commission_rate: string;
  bonus_text: string;
  features: string[];
  supported_coins: number;
  trading_volume_24h: string;
  is_featured: boolean;
  click_count: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const partnersApi = {
  list: () => apiFetch<ExchangePartner[]>('/trading/partners/'),
  get: (slug: string) => apiFetch<ExchangePartner>(`/trading/partners/${slug}/`),
  trackClick: (slug: string, data?: Record<string, string>) =>
    apiFetch<{ url: string; partner: string }>(`/trading/partners/${slug}/click/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
};
