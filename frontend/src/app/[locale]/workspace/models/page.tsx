import type { Metadata } from 'next';
import WorkspaceModelsLive from '@/components/workspace/features/models/WorkspaceModelsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'models');
}

export default function WorkspaceModelsPage() {
  return <WorkspaceModelsLive />;
}
