import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getModuleCopy } from '@/i18n/module-catalog';
import { getModules } from '@/services/modules-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  noStore();
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'en';
  const copy = getModuleCopy(locale);
  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: {
      canonical: `https://tvijo.com/${locale}/modules`,
      languages: {
        en: 'https://tvijo.com/en/modules',
        ru: 'https://tvijo.com/ru/modules',
        'x-default': 'https://tvijo.com/en/modules',
      },
    },
  };
}

function statusLabel(status: string, copy: ReturnType<typeof getModuleCopy>) {
  return status === 'roadmap' ? copy.roadmap : status === 'beta' ? copy.beta : copy.available;
}

export default async function ModulesPage({ params }: { params: { locale: string } }) {
  noStore();
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'en';
  const copy = getModuleCopy(locale);
  const modules = await getModules(locale);

  return (
    <div className="min-h-screen bg-[#041922] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">{copy.subtitle}</p>
        </header>

        {modules.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-300">{copy.noModules}</p>
        ) : (
          <section aria-label={copy.eyebrow} className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <article key={module.slug} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/10">
                <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  <span className="text-emerald-300">{copy.categories[module.category]}</span>
                  <span className={module.status === 'roadmap' ? 'text-amber-300' : 'text-slate-400'}>{statusLabel(module.status, copy)}</span>
                </div>
                <h2 className="mt-6 text-2xl font-bold">{module.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{module.short_pitch}</p>
                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400">
                  {module.evidence.metrics.slice(0, 2).map((metric) => (
                    <div key={metric.key} className="flex justify-between gap-4 py-1">
                      <span>{metric.label}</span><strong className="text-slate-200">{metric.value}</strong>
                    </div>
                  ))}
                </div>
                <Link href={`/${locale}/modules/${module.slug}`} className="mt-6 inline-flex items-center justify-center rounded-lg border border-emerald-300/40 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/10">
                  {module.status === 'roadmap' ? copy.askRoadmap : copy.requestDemo}
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
