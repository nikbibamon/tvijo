/**
 * Buyer-motive landing page — /[locale]/solutions/[slug].
 * Spec: bibamoney-backend/specs/2026-08-buyer-motive-landings.md
 * Addendum: specs/2026-08-marketing-funnel-addendum.md (claims status, indexing)
 *
 * Server component: content is static, only the lead form is a client island.
 * Each page reports its own LeadCapture source (`landing_<slug>`) so a page that
 * brings traffic but no conversations can be culled on its own.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import LeadCaptureForm from '@/components/home/LeadCaptureForm';
import ClaimStatusBadge from '@/components/marketing/ClaimStatusBadge';
import { LOCALES } from '@/i18n/config';
import {
  marketingMetadata,
  marketingLocale,
  normalizeLocale,
  breadcrumbJsonLd,
  faqJsonLd,
} from '@/lib/seo/marketing';
import {
  solutions,
  getSolution,
  solutionsIndexCopy,
  CLAIM_STATUS_NOTE,
  type SolutionLink,
} from '@/data/solutions';

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => solutions.map((s) => ({ locale, slug: s.slug })));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  const solution = getSolution(params.slug);
  if (!solution) return { title: { absolute: 'Solutions — Tvijo' } };
  const copy = solution.copy[marketingLocale(params.locale)];

  return marketingMetadata({
    locale: params.locale,
    path: `/solutions/${solution.slug}`,
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['AI governance', 'AI audit evidence', 'enterprise AI policy', 'AI risk management', 'EU AI Act readiness'],
    ogType: 'article',
  });
}

function relatedHref(link: SolutionLink, locale: string) {
  return link.apex ? link.path : `/${locale}${link.path}`;
}

export default function SolutionPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = normalizeLocale(params.locale);
  const solution = getSolution(params.slug);
  if (!solution) notFound();

  const lang = marketingLocale(locale);
  const copy = solution.copy[lang];
  const index = solutionsIndexCopy[lang];
  const others = solutions.filter((s) => s.slug !== solution.slug);
  const isRu = lang === 'ru';

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: index.eyebrow, path: '/solutions' },
    { name: copy.cardTitle, path: `/solutions/${solution.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(copy.faq)) }}
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <nav className="text-xs text-slate-500">
          <Link href={`/${locale}/solutions`} className="hover:text-slate-300">
            {index.eyebrow}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{copy.cardTitle}</span>
        </nav>

        {/* Hero */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {copy.headline}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{copy.subhead}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#request"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300"
          >
            {copy.formSubmit}
          </a>
          <Link
            href={`/${locale}/scan`}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {isRu ? 'Сначала бесплатная проверка' : 'Run the free check first'}
          </Link>
        </div>

        {/* Pain */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.painTitle}</h2>
          <ul className="mt-5 space-y-3">
            {copy.pains.map((pain) => (
              <li
                key={pain}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/80" />
                <span>{pain}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Offer — every block carries its real status */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.offerTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{CLAIM_STATUS_NOTE[lang]}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {copy.offer.map((block) => (
              <div
                key={block.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{block.title}</h3>
                  <ClaimStatusBadge status={block.status} lang={lang} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.stepsTitle}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {copy.steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <ClaimStatusBadge status={step.status} lang={lang} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Today vs not claimed — the honest-claims pair, always together */}
        <section className="mt-16 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
              {copy.todayTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {copy.today.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-300">
              {copy.notClaimTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {copy.notClaim.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ — rendered as plain text, mirrored in FAQPage JSON-LD above */}
        <section className="mt-16">
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

        {/* CTA + lead form */}
        <section id="request" className="mt-16 scroll-mt-28">
          <div className="grid gap-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">{copy.ctaTitle}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">{copy.ctaBody}</p>
              <p className="mt-6 text-xs leading-5 text-slate-500">
                {isRu ? (
                  <>
                    Хотите сначала проверить нас — структура записей расписана по полям на{' '}
                    <Link href={`/${locale}/proof`} className="font-semibold text-emerald-300 underline-offset-2 hover:underline">
                      странице доказательств
                    </Link>
                    , а внешняя проверка отдаёт отчёт целиком без почты.
                  </>
                ) : (
                  <>
                    Prefer to check us first? The record structure is written out field by field on the{' '}
                    <Link href={`/${locale}/proof`} className="font-semibold text-emerald-300 underline-offset-2 hover:underline">
                      evidence page
                    </Link>
                    , and the external check shows its full report without an email.
                  </>
                )}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <LeadCaptureForm
                source={solution.leadSource}
                title={copy.formTitle}
                subtitle={copy.formSubtitle}
                submitLabel={copy.formSubmit}
                extraMessage={`Landing: /${locale}/solutions/${solution.slug}`}
              />
            </div>
          </div>
        </section>

        {/* Related live surfaces */}
        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {index.relatedTitle}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {solution.related.map((link) => (
              <Link
                key={link.path}
                href={relatedHref(link, locale)}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                <span className="text-sm font-semibold text-white group-hover:text-emerald-300">
                  {link.label[lang]}
                </span>
                <p className="mt-2 text-xs leading-5 text-slate-400">{link.note[lang]}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Sibling landings */}
        <section className="mt-14 border-t border-white/10 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {isRu ? 'Другие задачи' : 'Other problems we cover'}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/${locale}/solutions/${other.slug}`}
                className="font-medium text-emerald-400 underline-offset-2 hover:underline"
              >
                {other.copy[lang].cardTitle}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
