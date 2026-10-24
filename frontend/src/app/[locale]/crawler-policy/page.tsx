/**
 * /[locale]/crawler-policy — what TvijoAuditBot does and how to stop it.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.3.
 *
 * The audit bot's User-Agent points here. A crawler whose policy URL 404s is
 * asking site owners to trust it on nothing, so this page ships before the
 * first external fetch, not after.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { LOCALES } from '@/i18n/config';
import {
  breadcrumbJsonLd,
  marketingLocale,
  marketingMetadata,
  normalizeLocale,
} from '@/lib/seo/marketing';
import { catalogCopy } from '@/data/catalog-copy';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const copy = catalogCopy[marketingLocale(params.locale)].crawlerPolicy;
  return marketingMetadata({
    locale: params.locale,
    path: '/crawler-policy',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['TvijoAuditBot', 'SEO crawler policy', 'AI audit bot user agent', 'SEO scanner policy', 'website audit bot'],
  });
}

export default function CrawlerPolicyPage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = catalogCopy[lang].crawlerPolicy;
  const isRu = lang === 'ru';

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: copy.headline, path: '/crawler-policy' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white">{copy.headline}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{copy.intro}</p>

        <div className="mt-10 space-y-5">
          {copy.sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {copy.contactTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{copy.contactBody}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={`/${locale}/about`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Контакты' : 'Contact'}
            </Link>
            <Link href={`/${locale}/domains`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {catalogCopy[lang].catalog.eyebrow}
            </Link>
            <Link href={`/${locale}/seo-geo`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {catalogCopy[lang].scanner.eyebrow}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
