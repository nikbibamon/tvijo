/**
 * `/{locale}/demo` — the public sample result.
 *
 * This page used to be a login form: an anonymous visitor who clicked a button
 * labelled "demo" was asked for a password and shown nothing
 * (plans/08092026/gate-f/DEMO_SURFACE_REVIEW_RU.md). The operator chose option
 * A — a real, finished, read-only example before registration — so the page is
 * now a server component that renders one sample run from
 * `GET /contracts/sample/`.
 *
 * Three properties are deliberate:
 *
 * 1. **Server-rendered.** The result and the explanation are readable with
 *    JavaScript disabled; the only client code is the replay control, which
 *    re-reads what is already on the page.
 * 2. **Nothing private can reach it.** The endpoint is public and touches no
 *    database, so there is no customer row, token or cached query to leak.
 * 3. **One primary CTA.** It carries the template id and locale through
 *    sign-in and nothing else — no sample tenant, no run id, no balance.
 */

import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { DEFAULT_LOCALE, isValidLocale, type Locale } from '@/i18n/config';
import { getDemoCopy, type DemoCopy } from '@/i18n/public-surface';
import {
  fetchPublicSample,
  type PublicSample,
  type SampleAcceptanceCheck,
} from '@/services/demo-sample-api';
import DemoReplay from './DemoReplay';

// Rendered per request, not baked at build time: the deploy builds the
// frontend candidate BEFORE the backend release goes live, so a statically
// prerendered page would capture the state where /contracts/sample/ does not
// exist yet and serve that snapshot for an hour. The fetch itself still caches
// for an hour, so this costs one API call per hour, not one per visitor.
export const dynamic = 'force-dynamic';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}

function SampleBadge({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
      {label}
    </p>
  );
}

function Panel({ id, title, subtitle, children }: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-emerald-400/30 pl-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1.5 text-sm leading-6 text-slate-200">{children}</dd>
    </div>
  );
}

/** Evidence dicts differ per rule, so render the scalars and count the rest. */
function evidenceSummary(evidence: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(evidence || {})) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length) parts.push(`${key}: ${value.length}`);
      continue;
    }
    if (typeof value === 'object') continue;
    parts.push(`${key}: ${String(value)}`);
  }
  return parts.join(' · ');
}

function CheckRow({ check, copy }: { check: SampleAcceptanceCheck; copy: DemoCopy['steps'] }) {
  return (
    <tr className="border-t border-white/10 align-top">
      <th scope="row" className="py-3 pr-4 text-left font-mono text-sm font-medium text-slate-200">
        {check.rule}
      </th>
      <td className="py-3 pr-4 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            check.passed
              ? 'bg-emerald-400/15 text-emerald-200'
              : 'bg-red-400/15 text-red-200'
          }`}
        >
          <span aria-hidden="true">{check.passed ? '✓' : '✕'}</span>
          {check.passed ? copy.passed : copy.failed}
        </span>
      </td>
      <td className="py-3 font-mono text-xs leading-5 text-slate-400">{evidenceSummary(check.evidence)}</td>
    </tr>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-2 break-words text-lg font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function ErrorState({ copy, locale }: { copy: DemoCopy; locale: Locale }) {
  return (
    <Shell>
      <SampleBadge label={copy.sampleBadge} />
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{copy.error.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{copy.error.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/demo`}
          className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-bold text-[#001b18] transition hover:bg-emerald-300"
        >
          {copy.error.retry}
        </Link>
        <Link
          href={`/${locale}/pricing`}
          className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          {copy.cta.secondary}
        </Link>
      </div>
    </Shell>
  );
}

export default async function DemoPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const copy = getDemoCopy(locale);
  const sample: PublicSample | null = await fetchPublicSample();

  if (!sample) return <ErrorState copy={copy} locale={locale} />;

  const { contract, run, acceptance, cost_basis: cost, reservation } = sample;
  const accepted = acceptance.passed === acceptance.total && acceptance.total > 0;
  // Only the template id and the locale cross the sign-in boundary; the
  // workspace shell appends its own `redirect` when it asks for a login.
  const startHref = `/${locale}/workspace?template=${encodeURIComponent(sample.sample_id)}&from=demo`;

  return (
    <Shell>
      <header className="max-w-3xl">
        <SampleBadge label={copy.sampleBadge} />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{copy.title}</h1>
        <p className="mt-5 text-base leading-7 text-slate-300">{copy.intro}</p>
        <p className="mt-4 text-sm leading-6 text-slate-400">{copy.notice}</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">{copy.scopeNote}</p>
      </header>

      <nav aria-label={copy.title} className="mt-8 flex flex-wrap gap-2 border-y border-white/10 py-4">
        {[
          ['result', copy.nav.result],
          ['steps', copy.nav.steps],
          ['cost', copy.nav.cost],
        ].map(([anchor, label]) => (
          <a
            key={anchor}
            href={`#${anchor}`}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-8">
        <Panel id="result" title={copy.result.title} subtitle={copy.result.subtitle}>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label={copy.result.goalLabel}>{contract.goal}</Field>
            <Field label={copy.result.expectedLabel}>{contract.expected_result}</Field>
          </dl>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {copy.result.outputLabel}
          </h3>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0f14] p-5">
            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-200">
              {sample.output}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {copy.result.acceptanceLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                accepted ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'
              }`}
            >
              <span aria-hidden="true">{accepted ? '✓' : '!'}</span>
              {accepted ? copy.result.acceptedValue : copy.result.reviewValue}
            </span>
            <span className="text-xs text-slate-500">
              {acceptance.passed}/{acceptance.total} {copy.steps.summary}
            </span>
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {copy.result.sourcesTitle}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy.result.sourcesNote}</p>
          <ul className="mt-4 space-y-3">
            {sample.sources.map((source) => (
              <li key={source.ref} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="break-all font-mono text-sm text-emerald-200">{source.ref}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {source.kind} · {copy.result.versionLabel} {source.version}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  <span className="text-slate-500">{copy.result.snapshotLabel}: </span>
                  {source.snapshot}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel id="steps" title={copy.steps.title} subtitle={copy.steps.subtitle}>
          <DemoReplay steps={sample.steps} copy={copy.steps} />

          <h3 className="mt-10 text-lg font-semibold text-white">{copy.steps.checksTitle}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy.steps.checksSubtitle}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th scope="col" className="pb-3 pr-4">{copy.steps.ruleCol}</th>
                  <th scope="col" className="pb-3 pr-4">{copy.steps.resultCol}</th>
                  <th scope="col" className="pb-3">{copy.steps.evidenceCol}</th>
                </tr>
              </thead>
              <tbody>
                {acceptance.acceptance.map((check) => (
                  <CheckRow key={check.rule} check={check} copy={copy.steps} />
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="cost" title={copy.cost.title} subtitle={copy.cost.subtitle}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={copy.cost.modelLabel} value={run.binding.model || '—'} />
            <Stat label={copy.cost.providerLabel} value={run.binding.provider || '—'} />
            <Stat label={copy.cost.inputLabel} value={String(cost.input_tokens)} />
            <Stat label={copy.cost.outputLabel} value={String(cost.output_tokens)} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label={copy.cost.rateLabel}
              value={`$${cost.input_usd_per_million} / $${cost.output_usd_per_million}`}
              hint={`${copy.cost.inputLabel} / ${copy.cost.outputLabel}`}
            />
            <Stat label={copy.cost.estimateLabel} value={`$${cost.total_usd}`} />
            <Stat label={copy.cost.heldLabel} value={`$${reservation.held_usd}`} hint={reservation.state} />
            <Stat label={copy.cost.settledLabel} value={`$${reservation.settled_usd}`} />
          </div>

          <p className="mt-4 text-sm leading-6 text-amber-200/80">{copy.cost.basisNote}</p>

          <h3 className="mt-8 text-lg font-semibold text-white">{copy.cost.hashTitle}</h3>
          <dl className="mt-4 space-y-4">
            <Field label={copy.cost.contractHashLabel}>
              <span className="break-all font-mono text-xs text-slate-300">{contract.contract_hash}</span>
            </Field>
            {sample.evidence[0] && (
              <Field label={copy.cost.evidenceHashLabel}>
                <span className="break-all font-mono text-xs text-slate-300">{sample.evidence[0].pack_hash}</span>
              </Field>
            )}
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-400">{copy.cost.hashNote}</p>
        </Panel>

        <section className="rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.07] p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.cta.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">{copy.cta.body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-6 py-3 text-sm font-bold text-[#001b18] transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              {copy.cta.primary}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              {copy.cta.secondary}
            </Link>
          </div>
        </section>
      </div>
    </Shell>
  );
}
