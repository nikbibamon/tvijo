import type { Metadata } from 'next';
import WorkspaceOverviewLive from '@/components/workspace/features/overview/WorkspaceOverviewLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'overview');
}

export default function WorkspaceOverviewPage() {
  return <WorkspaceOverviewLive />;
}
