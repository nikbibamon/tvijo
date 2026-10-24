/**
 * /[locale]/proof — the evidence-record field list.
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §4.
 *
 * Deliberately has no download: there is no evidence-pack export in the
 * backend, so a file here would be a fabricated product artefact.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
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
import { proofCopy, proofFields, proofExampleRecord, PROOF_LEAD_SOURCE } from '@/data/proof';
import { CLAIM_STATUS_NOTE } from '@/data/solutions';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const copy = proofCopy[marketingLocale(params.locale)];
  return marketingMetadata({
    locale: params.locale,
    path: '/proof',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['AI audit evidence', 'AI evidence pack', 'AI governance records', 'audit evidence fields', 'AI compliance evidence'],
    ogType: 'article',
  });
}

export default function ProofPage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = proofCopy[lang];
  const isRu = lang === 'ru';

  const breadcrumb = breadcrumbJsonLd(locale, [{ name: copy.eyebrow, path: '/proof' }]);

  const related = [
    {
      href: `/${locale}/solutions/ai-audit-evidence`,
      label: isRu ? 'Доказательства для аудита' : 'AI audit evidence',
      note: isRu
        ? 'Зачем это нужно и чем отличается от логов.'
        : 'Why this matters and how it differs from logs.',
    },
    {
      href: `/${locale}/security`,
      label: isRu ? 'Безопасность и данные' : 'Security & data handling',
      note: isRu
        ? 'Хранение, ключи, доступ и названные пробелы.'
        : 'Retention, keys, access and the named gaps.',
    },
    {
      href: `/${locale}/demo`,
      label: isRu ? 'Разбор с человеком' : 'Book a walkthrough',
      note: isRu
        ? 'Показываем, что построено, а что нет.'
        : 'We walk through what is built and what is not.',
    },
    {
      href: `/${locale}/scan`,
      label: isRu ? 'Внешняя проверка AI-периметра' : 'External AI Exposure Check',
      note: isRu
        ? 'Бесплатно, без аккаунта, отчёт целиком.'
        : 'Free, no account, full report shown.',
    },
  ];

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
            {isRu ? 'Решения' : 'Solutions'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{copy.eyebrow}</span>
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {copy.headline}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{copy.subhead}</p>
        <p className="mt-4 text-sm leading-6 text-slate-400">{CLAIM_STATUS_NOTE[lang]}</p>

        {/* Field table */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-white">{copy.fieldsTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{copy.fieldsIntro}</p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 text-left font-semibold text-slate-300">{copy.colField}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">{copy.colAnswers}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">{copy.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {proofFields.map((field) => (
                  <tr key={field.name} className="border-b border-white/5 align-top last:border-0">
                    <td className="px-5 py-4">
                      <code className="text-xs font-semibold text-emerald-300">{field.name}</code>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {field.answers[lang]}
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {field.note[lang]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ClaimStatusBadge status={field.status} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Example record */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.exampleTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{copy.exampleIntro}</p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-5">
            <pre className="text-xs leading-6 text-slate-300">
              <code>{proofExampleRecord}</code>
            </pre>
          </div>
          <p className="mt-3 text-xs text-slate-500">{copy.exampleCaption}</p>
        </section>

        {/* Pack structure */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white">{copy.packTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{copy.packIntro}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {copy.pack.map((block) => (
              <div key={block.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{block.title}</h3>
                  <ClaimStatusBadge status={block.status} lang={lang} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Today vs not claimed */}
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

        {/* FAQ */}
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

        {/* CTA + form */}
        <section id="request" className="mt-16 scroll-mt-28">
          <div className="grid gap-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">{copy.ctaTitle}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">{copy.ctaBody}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <LeadCaptureForm
                source={PROOF_LEAD_SOURCE}
                title={copy.formTitle}
                subtitle={copy.formSubtitle}
                submitLabel={copy.formSubmit}
                extraMessage={`Landing: /${locale}/proof`}
              />
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            {copy.relatedTitle}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
