import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { comparisons } from '@/data/compare';
import { LOCALES } from '@/i18n/config';
import { marketingMetadata, ENGLISH_ONLY_LOCALES } from '@/lib/seo/marketing';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  return marketingMetadata({
    locale: params.locale,
    path: '/compare',
    title: 'Compare Tvijo: gateways, observability and governance',
    description:
      'Side-by-side comparisons against Portkey, LiteLLM, Langfuse, LangSmith, Credo AI and n8n, each leading with what the other tool does better than us.',
    keywords: ['LLM gateway comparison', 'AI gateway', 'Tvijo vs Portkey', 'Tvijo vs LiteLLM', 'AI observability', 'AI cost control'],
    indexIn: ENGLISH_ONLY_LOCALES,
  });
}

export default function CompareIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === 'ru' ? 'ru' : 'en';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://tvijo.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: `https://tvijo.com/${locale}/compare` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'How TVIJO compares',
    itemListElement: comparisons.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `TVIJO vs ${c.competitor}`,
      url: `https://tvijo.com/${locale}/compare/${c.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
          Compare
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          How TVIJO compares
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          TVIJO is not a replacement for a gateway, an observability tool, or a
          governance suite. It is one control plane that spans routing, spend and
          audit evidence. Each comparison below leads with what the other tool
          does well, then shows where the single-layer approach differs.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/${locale}/compare/${c.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                {c.category}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white group-hover:text-blue-300">
                TVIJO vs {c.competitor}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{c.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-400">
                Read comparison →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Comparing tools, or solving a problem?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            If you arrived with a problem rather than a shortlist, the{' '}
            <Link
              href={`/${locale}/solutions`}
              className="font-semibold text-emerald-300 underline-offset-2 hover:underline"
            >
              solutions pages
            </Link>{' '}
            start there instead: EU AI Act readiness, audit evidence, LLM cost
            control, shadow AI discovery, and tooling for consultants.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h3 className="text-xl font-semibold text-white">
            Not sure which layer you need?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Talk to sales or book a demo to see routing, spend
            control and audit evidence in one cockpit.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
