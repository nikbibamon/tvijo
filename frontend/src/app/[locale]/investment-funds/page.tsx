'use client';

/**
 * Tvijo Investment Funds — catalog (VC / PE / accelerators)
 */

import { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import { parseLocale } from '@/i18n/config';
import DirectoryTabs from '@/components/portal/DirectoryTabs';
import {
  investmentFundsApi,
  type InvestmentFundListItem,
  type InvestmentFundStats,
} from '@/services/investment-funds-api';

function FundCard({ fund, locale }: { fund: InvestmentFundListItem; locale: string }) {
  const desc = fund.description?.replace(/\s+/g, ' ').trim();
  return (
    <Link
      href={`/${locale}/investment-funds/${fund.slug}`}
      className="group block rounded-xl border border-white/5 bg-[#12121A] p-5 transition-all hover:border-emerald-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500/20 to-teal-600/5 text-lg font-bold text-emerald-400">
          {fund.name?.charAt(0)?.toUpperCase() || fund.domain.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-emerald-400">
              {fund.name || fund.domain}
            </h3>
            {fund.company_overlap && (
              <span
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300"
                title="Also listed in company directory"
              >
                Also in Directory
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-gray-500">{fund.domain}</p>
        </div>
      </div>

      {desc && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-400">{desc}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {fund.region && (
          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{fund.region}</span>
        )}
        {fund.sector && (
          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{fund.sector}</span>
        )}
        {fund.stage && (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">{fund.stage}</span>
        )}
        {fund.aum && (
          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">AUM {fund.aum}</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[10px] text-gray-500">
        {fund.has_email && <span title="Has email">📧 {fund.email_count}</span>}
        {fund.github_url && <span title="GitHub">GitHub</span>}
        {fund.portfolio_count > 0 && (
          <span title="Portfolio items">{fund.portfolio_count} portfolio</span>
        )}
        {fund.linked_company_slug && (
          <span className="text-amber-400/80">Linked startup profile</span>
        )}
        <span className="ml-auto text-gray-600">View fund →</span>
      </div>
    </Link>
  );
}

function InvestmentFundsPageInner() {
  const pathname = usePathname() || '';
  const locale = parseLocale(pathname);
  const searchParams = useSearchParams();

  const [funds, setFunds] = useState<InvestmentFundListItem[]>([]);
  const [stats, setStats] = useState<InvestmentFundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [overlapOnly, setOverlapOnly] = useState(searchParams.get('overlap') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-lead_score');

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await investmentFundsApi.list({
        page,
        search: search || undefined,
        region: region || undefined,
        ordering: sortBy,
        company_overlap: overlapOnly ? 'true' : undefined,
      });
      setFunds(data.results || []);
      setTotal(data.count || 0);
    } catch (e) {
      console.error('Failed to fetch investment funds:', e);
      setFunds([]);
      setTotal(0);
    }
    setLoading(false);
  }, [page, search, region, sortBy, overlapOnly]);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  useEffect(() => {
    investmentFundsApi.stats().then(setStats).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white">
      <Navbar />
      <div className="border-b border-white/5 bg-gradient-to-b from-emerald-500/5 to-transparent pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <DirectoryTabs />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Investors &amp; accelerators</p>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Investment <span className="text-emerald-400">Funds</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-400">
            VC, PE, and accelerator profiles with portfolio links — separate from the startup company directory.
            {stats ? ` ${stats.total_funds.toLocaleString()} funds indexed.` : ''}
          </p>

          {stats && (
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-bold text-emerald-400">{stats.total_funds.toLocaleString()}</span>{' '}
                <span className="text-gray-500">Funds</span>
              </div>
              <div>
                <span className="font-bold text-teal-400">{stats.total_with_email.toLocaleString()}</span>{' '}
                <span className="text-gray-500">With email</span>
              </div>
              <div>
                <span className="font-bold text-amber-400">{stats.total_overlap_with_companies.toLocaleString()}</span>{' '}
                <span className="text-gray-500">Also in Directory</span>
              </div>
              <div>
                <span className="font-bold text-blue-400">{stats.total_portfolio_items.toLocaleString()}</span>{' '}
                <span className="text-gray-500">Portfolio links</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <div className="relative max-w-xl flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search funds by name, domain, focus..."
                className="w-full rounded-lg border border-white/10 bg-[#12121A] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchFunds()}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 space-y-6 lg:block">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sort</h4>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-white/10 bg-[#12121A] px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
              >
                <option value="-lead_score">Lead score</option>
                <option value="name">Name A–Z</option>
                <option value="-last_enriched_at">Recently enriched</option>
              </select>
            </div>

            {stats?.top_regions && stats.top_regions.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Region</h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegion('');
                      setPage(1);
                    }}
                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                      !region ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    All regions
                  </button>
                  {stats.top_regions.map((r) => (
                    <button
                      key={r.region}
                      type="button"
                      onClick={() => {
                        setRegion(r.region);
                        setPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                        region === r.region
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{r.region}</span>
                      <span className="text-[10px] text-gray-600">{r.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={overlapOnly}
                onChange={(e) => {
                  setOverlapOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500"
              />
              <span className="text-sm text-gray-400">Also in company directory</span>
            </label>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {total.toLocaleString()} funds
                {search && (
                  <>
                    {' '}
                    for <span className="text-emerald-400">&ldquo;{search}&rdquo;</span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
            </div>

            {loading && (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {funds.map((fund) => (
                  <FundCard key={fund.id} fund={fund} locale={locale} />
                ))}
              </div>
            )}

            {!loading && funds.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                <p className="mb-2 text-lg">No investment funds found</p>
                <p className="text-sm">Try another search or import data on the backend.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition hover:bg-white/10 disabled:opacity-30"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition hover:bg-white/10 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestmentFundsPage() {
  return (
    <Suspense fallback={null}>
      <InvestmentFundsPageInner />
    </Suspense>
  );
}
