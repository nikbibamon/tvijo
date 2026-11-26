import { notFound } from 'next/navigation';
import ResearchFrame from '@/components/compare/ResearchFrame';
import { atlasMetadata, ATLAS_RELEASE_LOCALES, atlasLocaleAvailable } from '@/lib/model-atlas/routes';

export function generateStaticParams() { return ATLAS_RELEASE_LOCALES.map(locale => ({ locale })); }
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!atlasLocaleAvailable(params.locale)) notFound();
  return atlasMetadata(params.locale, "/compare/benchmarks", {"en": "How to read AI model benchmarks", "ru": "Как читать бенчмарки ИИ-моделей"}, {"en": "English and Russian terms, units, practical use and limits. Decision Index, Openness, Brier and project evaluation metrics.", "ru": "Английский термин, русский смысл, единица, практическое влияние и пределы вывода. Decision Index, Openness, Brier и собственные метрики."});
}
export default function Page({ params }: { params: { locale: string } }) { return <ResearchFrame locale={params.locale} view="benchmarks" />; }
