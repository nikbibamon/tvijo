/**
 * Investment Funds API client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface InvestmentFundListItem {
  id: string;
  domain: string;
  slug: string;
  name: string;
  description: string;
  region: string;
  sector: string;
  stage: string;
  aum: string;
  focus: string;
  lead_score: number | null;
  has_email: boolean;
  email_count: number;
  github_url: string;
  company_overlap: boolean;
  linked_company_slug: string | null;
  portfolio_count: number;
  last_enriched_at: string | null;
}

export interface FundPortfolioItem {
  id: string;
  company_domain: string;
  company_slug: string | null;
  company_name: string;
  project_name: string;
  round_stage: string;
  invested_year: number | null;
  notes: string;
  source: string;
}

export interface InvestmentFundDetail extends InvestmentFundListItem {
  emails: string;
  email_list: string[];
  contact_page_url: string;
  contact_form_url: string;
  telegram_urls: string;
  x_urls: string;
  linkedin_urls: string;
  facebook_urls: string;
  instagram_urls: string;
  youtube_urls: string;
  portfolio_summary: unknown[];
  portfolio_items: FundPortfolioItem[];
  linked_company_name: string | null;
  source_metadata: Record<string, unknown>;
  last_visited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentFundStats {
  total_funds: number;
  total_with_email: number;
  total_overlap_with_companies: number;
  total_portfolio_items: number;
  top_regions: { region: string; count: number }[];
  top_sectors: { sector: string; count: number }[];
  top_stages: { stage: string; count: number }[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const investmentFundsApi = {
  list: (params: {
    page?: number;
    search?: string;
    region?: string;
    sector?: string;
    stage?: string;
    ordering?: string;
    company_overlap?: string;
  } = {}) =>
    apiFetch<Paginated<InvestmentFundListItem>>(
      `/directory/investment-funds/${qs({
        format: 'json',
        page: params.page,
        search: params.search,
        region: params.region,
        sector: params.sector,
        stage: params.stage,
        ordering: params.ordering || '-lead_score',
        company_overlap: params.company_overlap,
      })}`
    ),

  get: (slug: string) =>
    apiFetch<InvestmentFundDetail>(`/directory/investment-funds/${slug}/?format=json`),

  stats: () =>
    apiFetch<InvestmentFundStats>('/directory/investment-funds/stats/?format=json'),
};
