'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import EntityEngagement from '@/components/engagement/EntityEngagement';
import { parseLocale } from '@/i18n/config';
import {
  investmentFundsApi,
  type InvestmentFundDetail,
} from '@/services/investment-funds-api';

function SocialLink({ url, label, icon }: { url: string; label: string; icon: string }) {
  if (!url) return null;
  const firstUrl = url.split(';')[0].trim();
  if (!firstUrl) return null;
  const href = firstUrl.startsWith('http') ? firstUrl : `https://${firstUrl}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
    >
      <span>{icon}</span> {label}
    </a>
  );
}

export default function InvestmentFundDetailPage() {
  const params = useParams();
  const pathname = usePathname() || '';
  const locale = parseLocale(pathname);
  const slug = String(params.slug || '');

  const [fund, setFund] = useState<InvestmentFundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    investmentFundsApi
      .get(slug)
      .then(setFund)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A12] text-white">
        <Navbar />
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen bg-[#0A0A12] text-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <p className="text-lg text-gray-400">Investment fund not found</p>
          <Link href={`/${locale}/investment-funds`} className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">
            ← Back to funds
          </Link>
        </div>
      </div>
    );
  }

  const focusTags = fund.focus
    ? fund.focus.split(/[,;|]/).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white">
      <Navbar />
      <div className="border-b border-white/5 bg-gradient-to-b from-emerald-500/5 to-transparent pt-20">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <nav className="mb-6 text-sm text-gray-500">
            <Link href={`/${locale}/investment-funds`} className="hover:text-emerald-400">
              Investment Funds
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">{fund.name || fund.domain}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/25 to-teal-600/10 text-2xl font-bold text-emerald-400">
              {(fund.name || fund.domain).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold md:text-3xl">{fund.name || fund.domain}</h1>
              <p className="mt-1 text-gray-500">{fund.domain}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fund.region && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{fund.region}</span>
                )}
                {fund.sector && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{fund.sector}</span>
                )}
                {fund.stage && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">{fund.stage}</span>
                )}
                {fund.aum && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">AUM {fund.aum}</span>
                )}
                {fund.company_overlap && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                    Also in company directory
                  </span>
                )}
              </div>
            </div>
          </div>

          {fund.company_overlap && fund.linked_company_slug && (
            <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-100/90">
                This domain also appears in the startup/company directory as{' '}
                <strong>{fund.linked_company_name}</strong>. Profiles are kept separate so fund data is not mixed with agency listings.
              </p>
              <Link
                href={`/${locale}/directory/${fund.linked_company_slug}`}
                className="mt-3 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                View company directory profile →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {fund.description && (
            <section className="rounded-xl border border-white/5 bg-[#12121A] p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">About</h2>
              <p className="text-sm leading-relaxed text-gray-300">{fund.description}</p>
            </section>
          )}

          {focusTags.length > 0 && (
            <section className="rounded-xl border border-white/5 bg-[#12121A] p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Focus</h2>
              <div className="flex flex-wrap gap-2">
                {focusTags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-white/5 bg-[#12121A] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Portfolio & investments
            </h2>
            {fund.portfolio_items.length > 0 ? (
              <ul className="space-y-3">
                {fund.portfolio_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.project_name || item.company_name || item.company_domain}
                      </p>
                      <p className="text-xs text-gray-500">{item.company_domain}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {item.round_stage && <span>{item.round_stage}</span>}
                      {item.invested_year && <span>{item.invested_year}</span>}
                      {item.company_slug && (
                        <Link
                          href={`/${locale}/directory/${item.company_slug}`}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          Directory profile
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No structured portfolio rows yet. Portfolio companies can be added in Django admin or via a future import.
              </p>
            )}
          </section>

          <EntityEngagement targetType="fund" targetId={slug} title="Community discussion" />
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-white/5 bg-[#12121A] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact & social</h2>
            <div className="grid gap-2">
              <SocialLink url={fund.linkedin_urls} label="LinkedIn" icon="in" />
              <SocialLink url={fund.x_urls} label="X / Twitter" icon="𝕏" />
              <SocialLink url={fund.telegram_urls} label="Telegram" icon="✈" />
              <SocialLink url={fund.github_url} label="GitHub" icon="⌥" />
              {fund.contact_page_url && (
                <SocialLink url={fund.contact_page_url} label="Contact page" icon="🌐" />
              )}
            </div>
            {fund.email_list.length > 0 && (
              <p className="mt-4 text-xs text-gray-500">
                {fund.email_list.length} email(s) on file (sign in to view addresses).
              </p>
            )}
          </section>

          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">TVIJO AI OS</p>
            <h3 className="mt-2 font-bold text-white">Govern portfolio diligence</h3>
            <p className="mt-2 text-sm text-emerald-50/80">
              Use TVIJO AI OS for audit trails, model routing, and compliance evidence when evaluating fund operations or LP reporting.
            </p>
            <Link
              href={`/${locale}/demo`}
              className="mt-4 block rounded-xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Open AI OS Workspace
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
