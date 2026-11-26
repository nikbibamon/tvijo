import type { Metadata } from 'next';
import WorkspaceKnowledgeLive from '@/components/workspace/features/knowledge/WorkspaceKnowledgeLive';
import { workspaceMetadata } from '@/lib/seo/workspace';
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  // Same private, noindex Workspace policy as the other sections; only title/canonical differ.
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const title = locale === 'ru' ? 'Знания и обучение' : locale === 'uk' ? 'Знання й навчання' : 'Knowledge & learning';
  return {
    ...workspaceMetadata(params.locale, 'reference'),
    title: { absolute: `${title} | Tvijo` },
    alternates: { canonical: `https://tvijo.com/${locale}/workspace/knowledge` },
  };
}

export default function WorkspaceKnowledgePage() {
  return <WorkspaceKnowledgeLive />;
}
