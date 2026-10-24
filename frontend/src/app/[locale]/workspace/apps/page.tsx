import type { Metadata } from 'next';
import WorkspaceSolutionsLive from '@/components/workspace/features/catalog/WorkspaceSolutionsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'apps');
}

export default function WorkspaceAppsPage() {
  return <WorkspaceSolutionsLive />;
}
