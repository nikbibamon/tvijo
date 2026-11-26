import { notFound } from 'next/navigation';
import ResearchFrame from '@/components/compare/ResearchFrame';
import { atlasCatalog } from '@/data/model-atlas/catalog';
import { atlasMetadata, ATLAS_RELEASE_LOCALES, atlasLocaleAvailable, ATLAS_PROJECTS } from '@/lib/model-atlas/routes';

export function generateStaticParams() { return ATLAS_RELEASE_LOCALES.flatMap(locale => ATLAS_PROJECTS.map(project => ({ locale, project }))); }
export function generateMetadata({ params }: { params: { locale: string; project: string } }) {
  if (!atlasLocaleAvailable(params.locale)) notFound();
  const project = atlasCatalog.projects.find(item => item.id === params.project);
  if (!project) notFound();
  return atlasMetadata(params.locale, `/compare/research/${project.id}`, { en: `${project.name.en}: model and agent research`, ru: `${project.name.ru}: исследование моделей и агентов` }, project.summary);
}
export default function Page({ params }: { params: { locale: string; project: string } }) { return <ResearchFrame locale={params.locale} view="project" projectId={params.project} />; }
