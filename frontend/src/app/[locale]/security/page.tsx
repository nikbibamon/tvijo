/**
 * /[locale]/security — data handling and security posture, gaps included.
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §3–4.
 * Copy + claim statuses: src/data/security.ts (checked against backend code).
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ClaimStatusBadge from '@/components/marketing/ClaimStatusBadge';
import { LOCALES } from '@/i18n/config';
import {
  marketingMetadata,
  marketingLocale,
  normalizeLocale,
  breadcrumbJsonLd,
  faqJsonLd,
} from '@/lib/seo/marketing';
import { securityCopy } from '@/data/security';
import { CLAIM_STATUS_NOTE } from '@/data/solutions';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const copy = securityCopy[marketingLocale(params.locale)];
  return marketingMetadata({
    locale: params.locale,
    path: '/security',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['AI security', 'AI governance security', 'LLM data security', 'AI control plane', 'prompt data handling', 'AI platform security'],
  });
}

export default function SecurityPage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = securityCopy[lang];
  const isRu = lang === 'ru';

  const breadcrumb = breadcrumbJsonLd(locale, [{ name: copy.eyebrow, path: '/security' }]);

  const related = [
    {
      href: `/${locale}/proof`,
      label: isRu ? 'Структура evidence pack' : 'Evidence pack structure',
      note: isRu
        ? 'Каждое поле записи со своим статусом.'
        : 'Every record field with its real status.',
    },
    {
      href: `/${locale}/solutions/ai-audit-evidence`,
      label: isRu ? 'Доказательства для аудита' : 'AI audit evidence',
      note: isRu
        ? 'Чем доказательство отличается от лога.'
        : 'How evidence differs from a log line.',
    },
    {
      href: `/${locale}/solutions/eu-ai-act-readiness`,
      label: isRu ? 'Готовность к EU AI Act' : 'EU AI Act readiness',
      note: isRu
        ? 'Реестр, классы риска, записи о надзоре.'
        : 'Inventory, risk classes, oversight records.',
    },
    {
      href: `/${locale}/scan`,
      label: isRu ? 'Внешняя проверка AI-периметра' : 'External AI Exposure Check',
      note: isRu
        ? 'Бесплатно и без аккаунта — что видно снаружи.'
        : 'Free, no account — what is visible from outside.',
    },
    {
      href: `/${locale}/pricing`,
      label: isRu ? 'Тарифы' : 'Pricing',
      note: isRu ? 'Что стоит пилот.' : 'What a pilot costs.',
    },
    {
      href: `/${locale}/solutions`,
      label: isRu ? 'Решения по задачам' : 'Solutions by problem',
      note: isRu
        ? 'Пять входов под конкретную задачу.'
        : 'Five entry points, one problem each.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(copy.faq)) }}
      />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{copy.headline}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{copy.subhead}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{CLAIM_STATUS_NOTE[lang]}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {copy.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-4">
                {section.items.map((item) => (
                  <li key={item.body} className="flex flex-col gap-2">
                    <ClaimStatusBadge status={item.status} lang={lang} />
                    <span className="text-sm leading-6 text-slate-300">{item.body}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Gaps — deliberately its own block, not buried in prose */}
        <section className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-300">
            {copy.gapsTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.gapsIntro}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.gaps.map((gap) => (
              <li key={gap} className="flex gap-3 text-sm leading-6 text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/[0.06] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-300">
            {copy.soc2Title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.soc2Body}</p>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-white">{copy.faqTitle}</h2>
          <div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {copy.faq.map((item) => (
              <div key={item.q} className="p-6">
                <h3 className="text-base font-semibold text-white">{item.q}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">{copy.ctaTitle}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{copy.ctaBody}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/demo`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
            >
              {copy.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/proof`}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </section>

        {/* Related */}
        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {copy.relatedTitle}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                <span className="text-sm font-semibold text-white group-hover:text-emerald-300">
                  {link.label}
                </span>
                <p className="mt-2 text-xs leading-5 text-slate-400">{link.note}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
