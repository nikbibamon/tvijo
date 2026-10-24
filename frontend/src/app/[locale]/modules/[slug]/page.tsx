import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import LeadCaptureForm from '@/components/home/LeadCaptureForm';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getModuleCopy } from '@/i18n/module-catalog';
import { getModule } from '@/services/modules-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function localeOf(value: string): Locale {
  return isValidLocale(value) ? value : 'en';
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  noStore();
  const locale = localeOf(params.locale);
  const module = await getModule(params.slug, locale);
  if (!module) return { title: 'Tvijo module' };
  return {
    title: module.seo_title,
    description: module.seo_description,
    alternates: {
      canonical: `https://tvijo.com/${locale}/modules/${module.slug}`,
      languages: {
        en: `https://tvijo.com/en/modules/${module.slug}`,
        ru: `https://tvijo.com/ru/modules/${module.slug}`,
        'x-default': `https://tvijo.com/en/modules/${module.slug}`,
      },
    },
    openGraph: {
      title: module.seo_title,
      description: module.seo_description,
      type: 'website',
      url: `https://tvijo.com/${locale}/modules/${module.slug}`,
    },
  };
}

export default async function ModuleDetailPage({ params }: { params: { locale: string; slug: string } }) {
  noStore();
  const locale = localeOf(params.locale);
  const copy = getModuleCopy(locale);
  const module = await getModule(params.slug, locale);
  if (!module) notFound();

  const ctaSource = `module_${module.slug}`;
  const isRoadmap = module.status === 'roadmap';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: module.name,
    description: module.seo_description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `https://tvijo.com/${locale}/modules/${module.slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      ...(module.price_from !== null ? { price: module.price_from } : { description: copy.customPricing }),
      availability: isRoadmap ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-[#041922] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href={`/${locale}/modules`} className="text-sm text-emerald-300 hover:text-emerald-200">← {copy.backToModules}</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{copy.categories[module.category]} · {isRoadmap ? copy.roadmap : module.status === 'beta' ? copy.beta : copy.available}</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{module.name}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{module.short_pitch}</p>
            {module.description && <p className="mt-5 max-w-3xl leading-8 text-slate-400">{module.description}</p>}

            <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <h2 className="text-2xl font-bold">{copy.evidence}</h2>
              <p className="mt-2 text-xs text-slate-500">{copy.measuredOn}: {module.evidence.measured_on || '—'}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {module.evidence.metrics.map((metric) => (
                  <div key={metric.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-2xl font-black text-white">{metric.value}</div>
                    <div className="mt-1 text-sm text-slate-300">{metric.label}</div>
                  </div>
                ))}
              </div>
              {module.evidence.notes.map((note) => <p key={note} className="mt-4 text-sm leading-6 text-slate-400">{note}</p>)}
              <Link href={module.evidence.source_url} className="mt-6 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200">{copy.sourceLink} ↗</Link>
            </section>

            {(module.limitations || isRoadmap || module.category === 'trading-research') && (
              <section className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6">
                <h2 className="text-lg font-bold text-amber-200">{copy.limitations}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{[module.limitations, module.category === 'trading-research' ? copy.researchDisclaimer : '', isRoadmap && !module.limitations ? 'Roadmap item. Availability is not claimed.' : ''].filter(Boolean).join('\n\n')}</p>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-emerald-300/20 bg-[#06252a] shadow-2xl shadow-emerald-950/30">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{copy.pricing}</p>
              <p className="mt-3 text-xl font-bold">{module.price_from !== null ? `From $${module.price_from}/month` : copy.customPricing}</p>
            </div>
            <LeadCaptureForm
              source={ctaSource}
              submitLabel={isRoadmap ? copy.askRoadmap : module.cta_type === 'contact' ? copy.contactSales : copy.requestDemo}
            />
          </aside>
        </div>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
