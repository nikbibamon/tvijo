import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';
import { getTranslations } from '@/i18n/index';

export const dynamic = 'force-dynamic';

export default function MarketIntelligencePage({ params }: { params: { locale: string } }) {
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getTranslations(locale);
  const c = t.marketIntel;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#031117] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
          {c.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{c.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">{c.intro}</p>

        <h2 className="mt-12 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
          {c.surfacesTitle}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {c.surfaces.map((s) => (
            <Link
              key={s.title}
              href={s.href.startsWith('/#') ? `/${locale}${s.href.slice(1)}` : `/${locale}${s.href}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-400/40"
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-3 text-lg font-semibold">{s.title}</div>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition group-hover:gap-2 dark:text-emerald-300">
                {s.cta} →
              </span>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-semibold tracking-tight">{c.howTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {c.how.map((h) => (
            <div
              key={h.step}
              className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {h.step}
              </div>
              <div className="mt-4 text-base font-semibold">{h.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{h.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-8 dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <h2 className="text-xl font-semibold">{c.ctaTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{c.ctaDesc}</p>
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
        </div>

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
