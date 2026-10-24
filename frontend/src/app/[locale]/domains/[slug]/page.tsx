/**
 * /[locale]/domains/[slug] — one public domain card.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.8, §4.10.
 *
 * The card shows observations with their coverage, the ruleset version and the
 * date. It never states that a company is unsafe, never shows secret-shaped
 * evidence (the API cannot serve it — the serializer is an allowlist), and it
 * carries correction and removal routes in the page itself rather than in a
 * footer nobody reads.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { BASE_URL, breadcrumbJsonLd, marketingLocale, marketingMetadata, normalizeLocale } from '@/lib/seo/marketing';
import { catalogCopy } from '@/data/catalog-copy';
import { fetchDomainProfile, scoreTone, type AuditFinding } from '@/services/seo-geo-api';

export const revalidate = 300;

const STATUS_STYLE: Record<string, string> = {
  fail: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  warn: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  pass: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  info: 'border-white/15 bg-white/5 text-slate-300',
  unknown: 'border-white/15 bg-white/5 text-slate-400',
  not_applicable: 'border-white/10 bg-white/[0.03] text-slate-500',
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const lang = marketingLocale(params.locale);
  const profile = await fetchDomainProfile(params.slug);
  if (!profile) {
    return marketingMetadata({
      locale: params.locale,
      path: `/domains/${params.slug}`,
      title: catalogCopy[lang].catalog.metaTitle,
      description: catalogCopy[lang].catalog.metaDescription,
      keywords: ['domain SEO audit', 'AI readiness score', 'GEO check', 'passive website audit'],
    });
  }

  const title = lang === 'ru'
    ? `${profile.host}: оценки SEO и готовности к AI`
    : `${profile.host}: SEO and AI readiness scores`;
  const description = lang === 'ru'
    ? `Пассивная проверка ${profile.host}: SEO ${profile.seo_score ?? '—'}, GEO ${profile.geo_score ?? '—'}, покрытие ${profile.coverage}%. Наблюдения снаружи, с датой и версией правил.`
    : `Passive check of ${profile.host}: SEO ${profile.seo_score ?? '—'}, GEO readiness ${profile.geo_score ?? '—'}, coverage ${profile.coverage}%. Observed from outside, dated and versioned.`;

  const base = marketingMetadata({
    locale: params.locale,
    path: `/domains/${profile.slug}`,
    title,
    description,
    keywords: [`${profile.host} SEO audit`, `${profile.host} AI readiness`, 'GEO score', 'passive SEO scan', 'website AI audit'],
    ogType: 'article',
  });

  // Thin or contested cards stay reachable by link but out of the index.
  if (profile.publication_status !== 'listed' || profile.coverage < 70) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

function Score({ label, value, coverage }: { label: string; value: number | null; coverage?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`text-4xl font-black ${scoreTone(value)}`}>{value ?? '—'}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      {coverage !== undefined && (
        <div className="mt-1 text-[11px] text-slate-500">coverage {coverage}%</div>
      )}
    </div>
  );
}

function FindingRow({ finding }: { finding: AuditFinding }) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{finding.title}</h3>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
            STATUS_STYLE[finding.status] || STATUS_STYLE.info
          }`}
        >
          {finding.status}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{finding.detail}</p>
      {finding.evidence?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {finding.evidence.map((item) => (
            <li key={item} className="break-all font-mono text-[11px] leading-5 text-slate-500">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function DomainProfilePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = normalizeLocale(params.locale);
  const lang = marketingLocale(locale);
  const copy = catalogCopy[lang].profile;
  const catalog = catalogCopy[lang].catalog;
  const isRu = lang === 'ru';

  const profile = await fetchDomainProfile(params.slug);
  if (!profile) notFound();

  const findings = profile.findings || [];
  const seoFindings = findings.filter((f) => f.category === 'seo');
  const geoFindings = findings.filter((f) => f.category === 'geo');
  const crawlers = profile.scan?.robots_matrix || [];

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: catalog.eyebrow, path: '/domains' },
    { name: profile.host, path: `/domains/${profile.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <nav className="text-xs text-slate-500">
          <Link href={`/${locale}/domains`} className="hover:text-slate-300">
            {catalog.eyebrow}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{profile.host}</span>
        </nav>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {profile.host}
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          {copy.scanned}: {profile.last_scanned_at ? profile.last_scanned_at.slice(0, 10) : '—'}
          {profile.ruleset_version ? ` · ${profile.ruleset_version}` : ''}
          {profile.scan?.pages_scanned ? ` · ${profile.scan.pages_scanned} pages` : ''}
        </p>
        {profile.is_stale && (
          <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs text-amber-200">
            {copy.staleNote}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Score label={copy.overall} value={profile.overall_score} />
          <Score label={copy.seo} value={profile.seo_score} coverage={profile.scan?.summary?.seo?.coverage} />
          <Score label={copy.geo} value={profile.geo_score} coverage={profile.scan?.summary?.geo?.coverage} />
          <Score label={copy.exposure} value={profile.exposure_score} />
        </div>
        {profile.overall_score === null && (
          <p className="mt-3 text-xs text-slate-500">{copy.insufficient}</p>
        )}

        {crawlers.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold text-white">{copy.crawlersTitle}</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <tbody>
                  {crawlers.map((crawler) => (
                    <tr key={crawler.token} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 font-mono text-xs text-slate-300">{crawler.token}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {copy.crawlerIntents[crawler.intent] || crawler.intent}
                      </td>
                      <td className="px-4 py-3">
                        <span className={crawler.allowed ? 'text-emerald-300' : 'text-rose-300'}>
                          {crawler.allowed ? copy.allowed : copy.blocked}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {crawler.matched_rule || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-white">{copy.findingsTitle}</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {copy.seo}
              </div>
              {seoFindings.map((finding) => (
                <FindingRow key={finding.code} finding={finding} />
              ))}
            </div>
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {copy.geo}
              </div>
              {geoFindings.map((finding) => (
                <FindingRow key={finding.code} finding={finding} />
              ))}
            </div>
          </div>
        </section>

        {profile.history?.length > 1 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold text-white">{copy.historyTitle}</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <tbody>
                  {profile.history.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-xs text-slate-400">{entry.created_at.slice(0, 10)}</td>
                      <td className="px-4 py-3">SEO <span className={scoreTone(entry.seo_score)}>{entry.seo_score ?? '—'}</span></td>
                      <td className="px-4 py-3">GEO <span className={scoreTone(entry.geo_score)}>{entry.geo_score ?? '—'}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500">coverage {entry.coverage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-14 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              {copy.ownerTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copy.ownerBody}</p>
            <Link
              href={`/${locale}/seo-geo?url=${encodeURIComponent(profile.host)}`}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {copy.rescanCta}
            </Link>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-300">
              {copy.disputeTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copy.disputeBody}</p>
            <Link
              href={`/${locale}/domains/${profile.slug}/dispute`}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
            >
              {copy.disputeCta}
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={`/${locale}/domains`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {catalog.eyebrow}
            </Link>
            <Link href={`/${locale}/seo-geo`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {isRu ? 'Проверить свой сайт' : 'Check your own site'}
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
