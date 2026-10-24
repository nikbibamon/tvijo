/**
 * Solutions index — /[locale]/solutions.
 * Spec: bibamoney-backend/specs/2026-08-buyer-motive-landings.md
 *
 * Hub page for the buyer-motive landings: it exists so the set has one
 * crawlable entry point that the footer and sitemap can link to sitewide.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { LOCALES } from '@/i18n/config';
import {
  BASE_URL as BASE,
  marketingMetadata,
  marketingLocale,
  normalizeLocale,
  breadcrumbJsonLd,
} from '@/lib/seo/marketing';
import { solutions, solutionsIndexCopy } from '@/data/solutions';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const copy = solutionsIndexCopy[marketingLocale(params.locale)];
  return marketingMetadata({
    locale: params.locale,
    path: '/solutions',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['AI governance', 'enterprise AI solutions', 'AI audit', 'AI risk management', 'EU AI Act', 'AI policy'],
  });
}

export default function SolutionsIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = solutionsIndexCopy[lang];

  const breadcrumb = breadcrumbJsonLd(locale, [{ name: copy.eyebrow, path: '/solutions' }]);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: copy.metaTitle,
    itemListElement: solutions.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.copy[lang].cardTitle,
      url: `${BASE}/${locale}/solutions/${s.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {solutions.map((solution) => {
            const card = solution.copy[lang];
            return (
              <Link
                key={solution.slug}
                href={`/${locale}/solutions/${solution.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
                  {card.eyebrow}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-white group-hover:text-emerald-200">
                  {card.cardTitle}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{card.cardBody}</p>
                <span className="mt-5 text-sm font-semibold text-emerald-400">
                  {copy.cardCta} →
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-300">
            {copy.honestTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{copy.honestBody}</p>
        </section>

        <section className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {copy.relatedTitle}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href={`/${locale}/proof`}
              className="font-medium text-emerald-400 underline-offset-2 hover:underline"
            >
              {lang === 'ru' ? 'Структура evidence pack' : 'Evidence pack structure'}
            </Link>
            <Link
              href={`/${locale}/compare`}
              className="font-medium text-emerald-400 underline-offset-2 hover:underline"
            >
              {lang === 'ru' ? 'Сравнение с альтернативами' : 'How Tvijo compares'}
            </Link>
            <Link
              href={`/${locale}/security`}
              className="font-medium text-emerald-400 underline-offset-2 hover:underline"
            >
              {lang === 'ru' ? 'Безопасность и данные' : 'Security & data'}
            </Link>
            <Link
              href={`/${locale}/scan`}
              className="font-medium text-emerald-400 underline-offset-2 hover:underline"
            >
              {lang === 'ru' ? 'Внешняя проверка AI-периметра' : 'External AI Exposure Check'}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="font-medium text-emerald-400 underline-offset-2 hover:underline"
            >
              {lang === 'ru' ? 'Тарифы' : 'Pricing'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
