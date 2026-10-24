'use client';

/**
 * Why Tvijo — the rules system behind governed AI operations.
 * Copy lives in src/i18n/locales/*.ts (`whyTvijo`); English is the source of truth.
 */

import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { useLocale } from '@/i18n/useLocale';

export default function WhyTvijoPage() {
  const { locale, t } = useLocale();
  const c = t.whyTvijo;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#031117] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{c.lede}</p>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{c.whatTitle}</h2>
          <div className="mt-4 space-y-4">
            {c.whatBody.map((p, i) => (
              <p key={i} className="text-base leading-7 text-slate-600 dark:text-slate-400">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">{c.rulesTitle}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">{c.rulesLede}</p>

          <div className="mt-8 space-y-4">
            {c.benefits.map((b) => (
              <div
                key={b.num}
                className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {b.num}
                  </span>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                </div>
                <ul className="mt-4 space-y-2 pl-1">
                  {b.points.map((pt, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      <span className="mt-1 text-emerald-500">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-8 dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <h2 className="text-xl font-semibold">{c.bottomTitle}</h2>
          <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">{c.bottomBody}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/demo`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
            >
              {c.ctaDemo}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {c.ctaPricing}
            </Link>
          </div>
        </section>

        <Link
          href={`/${locale}`}
          className="mt-8 inline-flex text-sm font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
        >
          ← {c.back}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
