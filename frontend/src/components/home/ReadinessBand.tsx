'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getReadinessCopy, getPublicCta } from '@/i18n/public-surface';

/**
 * Two honest lists on the home page: what a visitor can use now, and what is
 * only in preparation.
 *
 * The page previously offered TVIJO DSH, hosted previews and own-server
 * deployment as if they existed. The distribution repository holds a licence
 * file and nothing else, hosted previews are not built and server enrollment
 * is not released — so those get a status line, not a button. A control that
 * cannot do what it says is worse than an absent one, and this block is where
 * the home page stops implying otherwise.
 *
 * Spec: plans/08092026/tvijo-next/02_DESIGN_AND_COPY_RU.md §2 (APP-013-p1).
 */
export default function ReadinessBand() {
  const locale = parseLocale(usePathname());
  const copy = getReadinessCopy(locale);
  const cta = getPublicCta(locale);

  return (
    <section className="border-t border-white/5 bg-[#04121a] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{copy.eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">{copy.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{copy.subtitle}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">{copy.todayTitle}</h3>
            <ul className="mt-4 space-y-3">
              {copy.today.map((item) => (
                <li key={item.title} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-300">{item.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/demo`}
                className="rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                {cta.exploreDemo}
              </Link>
              <Link
                href={`/${locale}/workspace`}
                className="rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#001b18] transition hover:bg-emerald-300"
              >
                {cta.openWorkspace}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{copy.soonTitle}</h3>
            <ul className="mt-4 space-y-3">
              {copy.soon.map((item) => (
                <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-base font-semibold text-slate-200">{item.title}</p>
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">{item.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-5 text-slate-500">{copy.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
