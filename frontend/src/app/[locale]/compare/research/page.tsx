import { notFound } from 'next/navigation';
import ResearchFrame from '@/components/compare/ResearchFrame';
import { atlasMetadata, ATLAS_RELEASE_LOCALES, atlasLocaleAvailable } from '@/lib/model-atlas/routes';

export function generateStaticParams() { return ATLAS_RELEASE_LOCALES.map(locale => ({ locale })); }
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!atlasLocaleAvailable(params.locale)) notFound();
  return atlasMetadata(params.locale, "/compare/research", {"en": "Research matrix for Tvijo, Hotido and FinEdg", "ru": "Матрица исследований для Tvijo, Hotido и FinEdg"}, {"en": "24 project slices across probability, mathematics, data, marketing, economics, management, autonomy and improvement.", "ru": "24 проектных среза: вероятности, математика, данные, маркетинг, экономика, управление, автономность и улучшение."});
}
export default function Page({ params }: { params: { locale: string } }) { return <ResearchFrame locale={params.locale} view="overview" />; }
