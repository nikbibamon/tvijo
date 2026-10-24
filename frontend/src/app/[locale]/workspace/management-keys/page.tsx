import type { Metadata } from 'next';
import WorkspaceManagementKeysLive from '@/components/workspace/features/keys/WorkspaceManagementKeysLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'management-keys');
}

export default function WorkspaceManagementKeysPage() {
  return <WorkspaceManagementKeysLive />;
}
