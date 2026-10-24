'use client';

/**
 * Homepage entry point for the External AI Exposure Check (GEN-AISCAN-001).
 * Spec: bibamoney-backend/specs/2026-08-external-ai-exposure-check.md §4.4
 *
 * The scan itself runs on /{locale}/scan — this is only the URL field that
 * hands the target over, so the homepage never waits on a network scan.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Radar, Search } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

export default function ExposureScanEntry() {
  const { t, locale } = useLocale();
  const copy = t.scanPage.home;
  const router = useRouter();
  const [url, setUrl] = useState('');

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = url.trim();
    trackEvent('aiscan_entry', { location: 'hero', filled: trimmed ? 1 : 0 });
    router.push(trimmed ? `/${locale}/scan?url=${encodeURIComponent(trimmed)}` : `/${locale}/scan`);
  };

  return (
    <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Radar className="h-4 w-4 text-emerald-300" aria-hidden="true" />
        {copy.title}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{copy.desc}</p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="home-scan-url">
          {copy.title}
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            id="home-scan-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-lg border border-white/15 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/20"
        >
          {copy.button} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-[11px] text-slate-500">{copy.note}</p>
    </div>
  );
}
