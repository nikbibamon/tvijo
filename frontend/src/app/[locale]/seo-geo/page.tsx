/**
 * /[locale]/seo-geo — the free SEO/GEO check and its landing copy.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.10.
 *
 * Server component so the copy is in the HTML for crawlers; only the form and
 * its polling are client-side.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import SeoGeoScanForm from '@/components/catalog/SeoGeoScanForm';
import { LOCALES } from '@/i18n/config';
import {
  breadcrumbJsonLd,
  marketingLocale,
  marketingMetadata,
  normalizeLocale,
} from '@/lib/seo/marketing';
import { catalogCopy } from '@/data/catalog-copy';
import { fetchCatalogStats } from '@/services/seo-geo-api';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const copy = catalogCopy[marketingLocale(params.locale)].scanner;
  return marketingMetadata({
    locale: params.locale,
    path: '/seo-geo',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['free SEO check', 'GEO check', 'AI visibility audit', 'SEO audit tool', 'generative engine optimization'],
  });
}

export default async function SeoGeoPage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = catalogCopy[lang].scanner;
  const isRu = lang === 'ru';
  const stats = await fetchCatalogStats();

  const breadcrumb = breadcrumbJsonLd(locale, [{ name: copy.eyebrow, path: '/seo-geo' }]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {copy.headline}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{copy.subhead}</p>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-white/5" />}>
            <SeoGeoScanForm copy={copy} locale={locale} />
          </Suspense>
        </div>

        {stats && stats.listed_domains > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            {isRu
              ? `В каталоге ${stats.listed_domains} доменов · проверок выполнено: ${stats.scans_completed}`
              : `${stats.listed_domains} domains in the catalogue · ${stats.scans_completed} checks completed`}{' '}
            <Link href={`/${locale}/domains`} className="text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'открыть каталог' : 'browse the catalogue'}
            </Link>
          </p>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.whatWeCheck}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {copy.checks.map((check) => (
              <div key={check.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-sm font-semibold text-emerald-300">{check.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{check.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-300">
            {copy.limitsTitle}
          </h2>
          <ul className="mt-4 space-y-3">
            {copy.limits.map((limit) => (
              <li key={limit} className="flex gap-3 text-sm leading-6 text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-white/10 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {isRu ? 'Связанное' : 'Related'}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={`/${locale}/domains`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Каталог доменов' : 'Domain catalogue'}
            </Link>
            <Link href={`/${locale}/scan`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Проверка AI-периметра' : 'External AI Exposure Check'}
            </Link>
            <Link href={`/${locale}/solutions/shadow-ai-discovery`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Поиск теневого AI' : 'Shadow AI discovery'}
            </Link>
            <Link href={`/${locale}/crawler-policy`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Политика краулера' : 'Crawler policy'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
