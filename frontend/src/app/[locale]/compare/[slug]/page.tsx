import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { comparisons, getComparison, type CompareValue } from '@/data/compare';
import { LOCALES } from '@/i18n/config';
import { marketingMetadata, ENGLISH_ONLY_LOCALES } from '@/lib/seo/marketing';

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    comparisons.map((c) => ({ locale, slug: c.slug })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  const c = getComparison(params.slug);
  if (!c) return { title: { absolute: 'Compare — TVIJO' } };
  return marketingMetadata({
    locale: params.locale,
    path: `/compare/${c.slug}`,
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: ['LLM gateway comparison', 'AI governance', 'model routing', 'AI observability', 'enterprise AI tooling'],
    ogType: 'article',
    // Comparison copy exists in English only, so only `en` may be indexed.
    indexIn: ENGLISH_ONLY_LOCALES,
  });
}

function Cell({ value }: { value: CompareValue }) {
  if (value === true) return <span className="font-semibold text-emerald-400">✓</span>;
  if (value === false) return <span className="text-slate-600">—</span>;
  if (value === 'partial') return <span className="text-xs text-teal-400">Partial</span>;
  return <span className="text-xs text-slate-300">{value}</span>;
}

export default function ComparePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = params.locale === 'ru' ? 'ru' : 'en';
  const c = getComparison(params.slug);
  if (!c) notFound();

  const others = comparisons.filter((x) => x.slug !== c.slug);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://tvijo.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: `https://tvijo.com/${locale}/compare` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `TVIJO vs ${c.competitor}`,
        item: `https://tvijo.com/${locale}/compare/${c.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500">
          <Link href={`/${locale}/compare`} className="hover:text-slate-300">
            Compare
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">TVIJO vs {c.competitor}</span>
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          {c.category}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {c.headline}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{c.intro}</p>

        {/* Honest summaries */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              What {c.competitor} does well
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{c.competitorSummary}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">
              Where TVIJO fits
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">{c.tvijoSummary}</p>
          </div>
        </div>

        {/* Capability table */}
        <h2 className="mt-14 text-2xl font-semibold text-white">
          Capability comparison
        </h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left font-semibold text-slate-300">Capability</th>
                <th className="px-4 py-3 text-center font-semibold text-emerald-400">TVIJO</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-400">{c.competitor}</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.capability} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 text-left text-slate-300">{r.capability}</td>
                  <td className="px-4 py-3 text-center"><Cell value={r.tvijo} /></td>
                  <td className="px-4 py-3 text-center"><Cell value={r.competitor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* When to choose which */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold text-slate-200">
              Choose {c.competitor} if…
            </h3>
            <ul className="mt-4 space-y-2">
              {c.chooseCompetitor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6">
            <h3 className="text-sm font-semibold text-emerald-300">Choose TVIJO if…</h3>
            <ul className="mt-4 space-y-2">
              {c.chooseTvijo.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Honest note */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm leading-6 text-slate-400">
            <span className="font-semibold text-slate-300">In short:</span>{' '}
            {c.honestNote}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/#cta`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300 sm:w-auto"
          >
            Talk to Sales
          </Link>
          <Link
            href={`/${locale}/demo`}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Book Demo
          </Link>
        </div>

        {/* Other comparisons */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Other comparisons
          </h3>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/${locale}/compare/${o.slug}`}
                className="font-medium text-blue-400 underline-offset-2 hover:underline"
              >
                TVIJO vs {o.competitor}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
