import { notFound } from 'next/navigation';
import ResearchFrame from '@/components/compare/ResearchFrame';
import { atlasMetadata, ATLAS_RELEASE_LOCALES, atlasLocaleAvailable } from '@/lib/model-atlas/routes';

export function generateStaticParams() { return ATLAS_RELEASE_LOCALES.map(locale => ({ locale })); }
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!atlasLocaleAvailable(params.locale)) notFound();
  return atlasMetadata(params.locale, "/compare/systems", {"en": "Compare models and executors", "ru": "Сравнение моделей и исполнителей"}, {"en": "Complete model, executor, provider, effort, version and tool configurations. Candidates for project evaluations.", "ru": "Полная связка: модель, исполнитель, provider, effort, версии, инструменты. Кандидаты для собственных испытаний."});
}
export default function Page({ params }: { params: { locale: string } }) { return <ResearchFrame locale={params.locale} view="systems" />; }
