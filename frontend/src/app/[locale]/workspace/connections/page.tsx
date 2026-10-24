import type { Metadata } from 'next';
import WorkspaceConnectionsLive from '@/components/workspace/features/connections/WorkspaceConnectionsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'connections');
}

export default function WorkspaceConnectionsPage() {
  return <WorkspaceConnectionsLive />;
}
