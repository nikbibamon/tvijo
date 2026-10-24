'use client';

/**
 * External AI Exposure Check — report page (GEN-AISCAN-001).
 * Backend: /api/v1/aiscan/ (bibamoney-backend/apps/aiscan).
 * Spec: bibamoney-backend/specs/2026-08-external-ai-exposure-check.md
 *
 * The whole report is shown without asking for an email; the contact form is
 * only for the control review. Copy lives in src/i18n (`scanPage`) — finding
 * titles and details are English strings from the API by design (spec §4.4).
 */

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Eye,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Radar,
  Search,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from 'lucide-react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import LeadCaptureForm from '@/components/home/LeadCaptureForm';
import { useLocale } from '@/i18n/useLocale';
import type { Translations } from '@/i18n';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import {
  getScan,
  isScanError,
  markReviewRequested,
  runScan,
  type ExposureReport,
  type Finding,
  type FindingStatus,
  type ScanBlock,
} from '@/services/aiscan-api';

type ScanCopy = Translations['scanPage'];

const BLOCK_ORDER: ScanBlock[] = ['exposure', 'privacy', 'ai_client', 'governance', 'code_access'];

const BLOCK_COPY_KEY: Record<ScanBlock, 'exposure' | 'privacy' | 'aiClient' | 'governance' | 'codeAccess'> = {
  exposure: 'exposure',
  privacy: 'privacy',
  ai_client: 'aiClient',
  governance: 'governance',
  code_access: 'codeAccess',
};

const BLOCK_ICON: Record<ScanBlock, typeof Radar> = {
  exposure: Radar,
  privacy: Eye,
  ai_client: Terminal,
  governance: ShieldCheck,
  code_access: Lock,
};

const STATUS_STYLE: Record<FindingStatus, { chip: string; dot: string; icon: typeof Check }> = {
  fail: { chip: 'border-red-400/30 bg-red-400/10 text-red-200', dot: 'bg-red-400', icon: TriangleAlert },
  warn: { chip: 'border-amber-400/30 bg-amber-400/10 text-amber-200', dot: 'bg-amber-400', icon: AlertTriangle },
  pass: { chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200', dot: 'bg-emerald-400', icon: Check },
  info: { chip: 'border-sky-400/30 bg-sky-400/10 text-sky-200', dot: 'bg-sky-400', icon: Info },
  unknown: { chip: 'border-slate-400/25 bg-slate-400/10 text-slate-300', dot: 'bg-slate-500', icon: HelpCircle },
};

const STATUS_ORDER: FindingStatus[] = ['fail', 'warn', 'info', 'pass', 'unknown'];

/** API error codes → i18n keys. Anything unmapped falls back to `generic`. */
const ERROR_KEY: Record<string, keyof ScanCopy['errors']> = {
  empty_url: 'invalid',
  invalid_url: 'invalid',
  url_too_long: 'invalid',
  invalid_request: 'invalid',
  bad_scheme: 'blocked',
  bad_port: 'blocked',
  credentials_in_url: 'blocked',
  private_target: 'blocked',
  dns_error: 'unreachable',
  unreachable: 'unreachable',
  timeout: 'unreachable',
  tls_error: 'unreachable',
  too_many_redirects: 'unreachable',
  scanner_busy: 'busy',
  http_429: 'rateLimited',
  not_found: 'notFound',
};

/** Codes that come back inside a stored report: the target answered, just not with a page. */
const TARGET_BLOCK_CODES = new Set(['http_401', 'http_403', 'http_406', 'http_429', 'http_451']);

function targetErrorKey(code: string): keyof ScanCopy['errors'] {
  if (TARGET_BLOCK_CODES.has(code)) return 'botBlocked';
  if (/^http_\d+$/.test(code)) return 'httpError';
  return ERROR_KEY[code] ?? 'generic';
}

function scoreTone(score: number): string {
  if (score >= 78) return 'text-emerald-300';
  if (score >= 62) return 'text-amber-300';
  return 'text-red-300';
}

function FindingRow({ finding, copy }: { finding: Finding; copy: ScanCopy }) {
  const style = STATUS_STYLE[finding.status] ?? STATUS_STYLE.info;
  const StatusIcon = style.icon;
  return (
    <li className="flex gap-3 border-t border-white/5 py-4 first:border-t-0">
      <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${style.chip}`}>
        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-white">{finding.title}</h4>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.chip}`}>
            {copy.statusLabels[finding.status]}
          </span>
          {finding.status !== 'pass' && finding.severity !== 'info' && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {copy.severityLabels[finding.severity]}
            </span>
          )}
          {finding.confidence !== 'high' && (
            <span className="text-[10px] text-slate-500">
              {copy.confidenceLabel}: {copy.confidenceLabels[finding.confidence]}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-400">{finding.detail}</p>
        {finding.evidence.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {copy.evidenceLabel}
            </span>
            {finding.evidence.map((item) => (
              <code
                key={item}
                className="max-w-full truncate rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-slate-300"
              >
                {item}
              </code>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function ReportView({ report, locale, copy }: { report: ExposureReport; locale: string; copy: ScanCopy }) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/scan?id=${report.id}`
      : `https://tvijo.com/${locale}/scan?id=${report.id}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const counts = report.counts || {};

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {copy.result.target}
            </div>
            <div className="mt-1 truncate text-xl font-black text-white sm:text-2xl">{report.host}</div>
            <div className="mt-1 truncate text-xs text-slate-500">{report.final_url || report.url}</div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                {copy.result.durationLabel}: {(report.duration_ms / 1000).toFixed(1)}s
              </span>
              <span>
                {report.findings.length} {copy.result.checksLabel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-black leading-none ${scoreTone(report.score)}`}>{report.score}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {copy.result.scoreLabel} · {copy.result.grade} {report.grade}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_ORDER.filter((status) => (counts[status] ?? 0) > 0).map((status) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status].chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[status].dot}`} />
              {counts[status]} {copy.statusLabels[status]}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{copy.result.scoreNote}</p>
      </section>

      {BLOCK_ORDER.map((block, index) => {
        const blockCopy = copy.blocks[BLOCK_COPY_KEY[block]];
        const summary = report.blocks.find((item) => item.block === block);
        const findings = report.findings.filter((item) => item.block === block);
        if (findings.length === 0) return null;
        const BlockIcon = BLOCK_ICON[block];
        const isCodeAccess = block === 'code_access';

        return (
          <section
            key={block}
            className={`rounded-2xl border p-6 sm:p-8 ${
              isCodeAccess ? 'border-emerald-300/25 bg-emerald-300/[0.04]' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-emerald-300">
                  <BlockIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {index + 1}. {blockCopy.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{blockCopy.desc}</p>
                </div>
              </div>
              {summary && summary.score !== null && (
                <div className="text-right">
                  <div className={`text-2xl font-black ${scoreTone(summary.score)}`}>{summary.score}</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    {summary.checks} {copy.result.checksLabel}
                  </div>
                </div>
              )}
            </div>
            <ul className="mt-4">
              {findings.map((finding) => (
                <FindingRow key={finding.code} finding={finding} copy={copy} />
              ))}
            </ul>
          </section>
        );
      })}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.result.shareTitle}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-300">
            {shareUrl}
          </code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? copy.result.copied : copy.result.copy}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{copy.result.shareNote}</p>
      </section>
    </div>
  );
}

function ScanClient() {
  const { t, locale } = useLocale();
  const copy = t.scanPage;
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url') || '';
  const idParam = searchParams.get('id') || '';

  const [input, setInput] = useState(urlParam);
  const [report, setReport] = useState<ExposureReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const startedRef = useRef(false);

  const showError = useCallback(
    (code: string) => setErrorText(copy.errors[ERROR_KEY[code] ?? 'generic']),
    [copy],
  );

  /** Same, for codes stored on a report — there `http_403` means the target refused us. */
  const showTargetError = useCallback(
    (code: string) => setErrorText(copy.errors[targetErrorKey(code)]),
    [copy],
  );

  const execute = useCallback(
    async (target: string) => {
      const trimmed = target.trim();
      if (!trimmed) {
        setErrorText(copy.errors.empty);
        return;
      }
      setLoading(true);
      setErrorText('');
      setReport(null);
      trackEvent('aiscan_run', { locale });

      const result = await runScan(trimmed, locale);
      setLoading(false);

      if (isScanError(result)) {
        showError(result.error);
        trackEvent('aiscan_error', { code: result.error });
        return;
      }
      if (result.status !== 'ok') {
        showTargetError(result.error_code || 'generic');
        trackEvent('aiscan_error', { code: result.error_code || 'unknown' });
        return;
      }
      setReport(result);
      trackEvent('aiscan_report', { score: result.score, grade: result.grade });
      router.replace(`/${locale}/scan?id=${result.id}`, { scroll: false });
    },
    [copy, locale, router, showError, showTargetError],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (idParam) {
      setLoading(true);
      getScan(idParam).then((existing) => {
        setLoading(false);
        if (!existing) {
          showError('not_found');
          return;
        }
        setInput(existing.url);
        if (existing.status === 'ok') setReport(existing);
        else showTargetError(existing.error_code || 'generic');
      });
      return;
    }
    if (urlParam) execute(urlParam);
  }, [execute, idParam, showError, showTargetError, urlParam]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    execute(input);
  };

  return (
    <main className="min-h-screen bg-[#04121a] pb-20 pt-24 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-2 text-xs font-semibold text-emerald-200">
          <Radar className="h-4 w-4" aria-hidden="true" />
          {copy.eyebrow}
        </div>
        <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{copy.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="scan-url">
            {copy.urlLabel}
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="scan-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.urlPlaceholder}
              className="w-full rounded-lg border border-white/15 bg-black/30 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-bold text-[#001b18] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? copy.submitting : report ? copy.rescan : copy.submit}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">{loading ? copy.submittingNote : copy.noEmail}</p>

        {errorText && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          >
            {errorText}
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white">{copy.scopeTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
            {[copy.scopePassive, copy.scopeNoAttacks, copy.scopeServerSide].map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {report && (
          <div className="mt-10">
            <ReportView report={report} locale={locale} copy={copy} />
          </div>
        )}

        <section className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl">{copy.cta.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{copy.cta.desc}</p>
            <Link
              href={`/${locale}/pricing`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 underline-offset-4 hover:underline"
            >
              {copy.cta.pricingLink} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20">
            <LeadCaptureForm
              source="control_review"
              title={copy.cta.formTitle}
              subtitle={copy.cta.formSubtitle}
              submitLabel={copy.cta.submit}
              extraMessage={
                report
                  ? `Exposure report: ${report.host} — score ${report.score} (${report.grade}) — https://tvijo.com/${locale}/scan?id=${report.id}`
                  : undefined
              }
              onSuccess={() => {
                if (report) markReviewRequested(report.id);
              }}
            />
          </div>
        </section>

        {/* Funnel links: the scan is the top of the funnel, these are the next steps. */}
        <section className="mx-auto mt-10 max-w-5xl px-4 pb-4 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {locale === 'ru' ? 'Что дальше' : 'What next'}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={`/${locale}/solutions/shadow-ai-discovery`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {locale === 'ru' ? 'Поиск теневого AI' : 'Shadow AI discovery'}
            </Link>
            <Link href={`/${locale}/proof`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {locale === 'ru' ? 'Структура evidence pack' : 'Evidence pack structure'}
            </Link>
            <Link href={`/${locale}/security`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {locale === 'ru' ? 'Безопасность и данные' : 'Security & data handling'}
            </Link>
            <Link href={`/${locale}/solutions`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
              {locale === 'ru' ? 'Все решения' : 'All solutions'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#04121a] text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </main>
        }
      >
        <ScanClient />
      </Suspense>
      <Footer />
    </>
  );
}
