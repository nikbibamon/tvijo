/**
 * /[locale]/domains — the public catalogue.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.10.
 *
 * Server-rendered so the listing is in the HTML. Filter combinations are
 * `noindex, follow` with a canonical back to the clean URL: a catalogue can
 * generate an unbounded number of query permutations, and none of them are
 * pages worth indexing.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { LOCALES } from '@/i18n/config';
import {
  BASE_URL,
  breadcrumbJsonLd,
  marketingLocale,
  marketingMetadata,
  normalizeLocale,
} from '@/lib/seo/marketing';
import { catalogCopy } from '@/data/catalog-copy';
import { fetchCatalog, scoreTone } from '@/services/seo-geo-api';

export const revalidate = 300;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const copy = catalogCopy[marketingLocale(params.locale)].catalog;
  const filtered = Object.keys(searchParams || {}).length > 0;
  const base = marketingMetadata({
    locale: params.locale,
    path: '/domains',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['SEO audit catalogue', 'AI readiness scores', 'website AI readiness', 'GEO check', 'passive SEO scan'],
  });
  if (!filtered) return base;
  return {
    ...base,
    robots: { index: false, follow: true },
    alternates: { canonical: `${BASE_URL}/${normalizeLocale(params.locale)}/domains` },
  };
}

function ScoreCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-600">—</span>;
  }
  return <span className={`font-semibold ${scoreTone(value)}`}>{value}</span>;
}

export default async function DomainsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = catalogCopy[lang].catalog;

  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const ordering = typeof searchParams.ordering === 'string' ? searchParams.ordering : 'overall';
  const page = await fetchCatalog({ q: query, ordering, page_size: 24 });
  const rows = page?.results ?? [];

  const breadcrumb = breadcrumbJsonLd(locale, [{ name: copy.eyebrow, path: '/domains' }]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: copy.metaTitle,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: row.host,
      url: `${BASE_URL}/${locale}/domains/${row.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {copy.headline}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{copy.subhead}</p>

        <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-300/60 sm:max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span className="sr-only sm:not-sr-only">{copy.sortLabel}</span>
            <select
              name="ordering"
              defaultValue={ordering}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-300/60"
            >
              {copy.sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {copy.sortLabel}
          </button>
        </form>

        {page && !page.ranking_enabled && (
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-slate-400">
            {copy.rankingDisabled}
          </p>
        )}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="px-5 py-3 font-semibold">{copy.columns.host}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.overall}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.seo}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.geo}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.exposure}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.checked}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/${locale}/domains/${row.slug}`}
                      className="font-medium text-white underline-offset-2 hover:text-emerald-300 hover:underline"
                    >
                      {row.host}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ScoreCell value={row.overall_score} /></td>
                  <td className="px-4 py-3"><ScoreCell value={row.seo_score} /></td>
                  <td className="px-4 py-3"><ScoreCell value={row.geo_score} /></td>
                  <td className="px-4 py-3"><ScoreCell value={row.exposure_score} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {row.last_scanned_at ? row.last_scanned_at.slice(0, 10) : '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    {copy.empty}{' '}
                    <Link href={`/${locale}/seo-geo`} className="text-emerald-400 underline-offset-2 hover:underline">
                      {catalogCopy[lang].scanner.submit}
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {copy.methodTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.methodBody}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={`/${locale}/seo-geo`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {catalogCopy[lang].scanner.eyebrow}
            </Link>
            <Link href={`/${locale}/crawler-policy`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {catalogCopy[lang].crawlerPolicy.headline}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
