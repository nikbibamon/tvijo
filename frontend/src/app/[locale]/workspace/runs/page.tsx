import type { Metadata } from 'next';
import WorkspaceRunsLive from '@/components/workspace/features/runs/WorkspaceRunsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'runs');
}

export default function WorkspaceRunsPage() {
  return <WorkspaceRunsLive />;
}
