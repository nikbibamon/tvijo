'use client';

/**
 * Client island for the SEO/GEO scanner: queue a job, poll it, show progress.
 *
 * The audit is asynchronous by design, so this component never claims to know
 * how long it will take — it shows the stage the backend reports and waits.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import {
  getSeoGeoScan,
  queueSeoGeoScan,
  scoreTone,
  type SeoGeoScan,
} from '@/services/seo-geo-api';
import type { CatalogCopy } from '@/data/catalog-copy';

const POLL_MS = 2500;
const MAX_POLLS = 80;

export default function SeoGeoScanForm({
  copy,
  locale,
}: {
  copy: CatalogCopy['scanner'];
  locale: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [scanId, setScanId] = useState(searchParams.get('id') || '');
  const [scan, setScan] = useState<SeoGeoScan | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const polls = useRef(0);

  const poll = useCallback(async (id: string) => {
    const result = await getSeoGeoScan(id);
    if (result) setScan(result);
    return result;
  }, []);

  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;
    polls.current = 0;

    const tick = async () => {
      if (cancelled) return;
      const result = await poll(scanId);
      polls.current += 1;
      const settled = result && !['queued', 'running'].includes(result.status);
      if (!settled && polls.current < MAX_POLLS && !cancelled) {
        setTimeout(tick, POLL_MS);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [scanId, poll]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = url.trim();
    if (!value || sending) return;
    setSending(true);
    setError('');
    setScan(null);

    const result = await queueSeoGeoScan(value, locale);
    setSending(false);
    if (!result.ok) {
      setError(result.detail || result.error);
      return;
    }
    setScanId(result.id);
    router.replace(`/${locale}/seo-geo?id=${result.id}`, { scroll: false });
  };

  const running = scan ? ['queued', 'running'].includes(scan.status) : Boolean(scanId && !scan);

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="seo-geo-url">
          {copy.placeholder}
        </label>
        <input
          id="seo-geo-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={copy.placeholder}
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20"
        />
        <button
          type="submit"
          disabled={sending || running}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending || running ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          {copy.submit}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {running && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {scan?.status === 'running' ? copy.running : copy.queued}
        </p>
      )}

      {scan && !running && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {scan.status === 'blocked' && scan.error_code === 'blocked_by_robots' ? (
            <p className="text-sm leading-6 text-amber-200">{copy.blockedByRobots}</p>
          ) : scan.status === 'failed' ? (
            <p className="text-sm leading-6 text-rose-200">{copy.failed}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className={`text-4xl font-black ${scoreTone(scan.seo_score)}`}>
                    {scan.seo_score ?? '—'}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">SEO</div>
                </div>
                <div>
                  <div className={`text-4xl font-black ${scoreTone(scan.geo_score)}`}>
                    {scan.geo_score ?? '—'}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">GEO</div>
                </div>
                <div className="text-sm text-slate-400">
                  {scan.host} · {scan.pages_scanned} pages · coverage {scan.coverage}%
                </div>
              </div>
              {scan.profile_slug && (
                <Link
                  href={`/${locale}/domains/${scan.profile_slug}`}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {copy.resultCta} →
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
