import { notFound } from 'next/navigation';
import ResearchFrame from '@/components/compare/ResearchFrame';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ResearchAtlas from '@/components/compare/ResearchAtlas';
import DecisionMathLab from '@/components/compare/DecisionMathLab';
import ProgrammeEvidence from '@/components/compare/ProgrammeEvidence';
import { atlasCatalog } from '@/data/model-atlas/catalog';
import { atlasMetadata, ATLAS_RELEASE_LOCALES, atlasLocaleAvailable } from '@/lib/model-atlas/routes';

export function generateStaticParams() { return ATLAS_RELEASE_LOCALES.map(locale => ({ locale })); }
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!atlasLocaleAvailable(params.locale)) notFound();
  return atlasMetadata(params.locale, "/compare/experiments", {"en": "Own evaluations and success snapshots", "ru": "Собственные испытания и снимки успешности"}, {"en": "Experiment plans, acceptance criteria, accepted-task cost, Wilson intervals and Brier. Measurements stay distinct from examples.", "ru": "План эксперимента, критерии приёмки, стоимость принятой задачи, интервал Уилсона и Brier. Измерения отделены от примеров."});
}
export default function Page({ params }: { params: { locale: string } }) {
  // Preserve the existing non-English frame and its locale validation.
  if (!atlasLocaleAvailable(params.locale)) notFound();
  if (params.locale !== 'en') return <ResearchFrame locale={params.locale} view="experiments" />;
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <Navbar />
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2">
          <Link href="/en" className="hover:text-white">Tvijo</Link><span aria-hidden="true">/</span>
          <Link href="/en/compare" className="hover:text-white">Compare</Link><span aria-hidden="true">/</span>
          <Link href="/en/compare/research" className="text-cyan-300">Model Atlas</Link>
        </nav>
        {atlasLocaleAvailable('ru') ? <Link href="/ru/compare/experiments" hrefLang="ru" className="rounded-lg border border-white/15 px-3 py-2 text-slate-200 hover:border-cyan-300/50">По-русски</Link> : null}
      </div>
      <ResearchAtlas catalog={atlasCatalog} locale="en" view="experiments" />
      <ProgrammeEvidence />
      <DecisionMathLab locale="en" />
    </main>
    <Footer />
  </div>;
}
