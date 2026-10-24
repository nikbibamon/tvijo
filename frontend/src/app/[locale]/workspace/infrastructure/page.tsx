import type { Metadata } from 'next';
import WorkspaceInfrastructureLive from '@/components/workspace/features/infrastructure/WorkspaceInfrastructureLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'infrastructure');
}

export default function WorkspaceInfrastructurePage() {
  return <WorkspaceInfrastructureLive />;
}
