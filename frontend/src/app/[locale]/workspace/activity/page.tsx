import type { Metadata } from 'next';
import WorkspaceActivityLive from '@/components/workspace/features/activity/WorkspaceActivityLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'activity');
}

export default function WorkspaceActivityPage() {
  return <WorkspaceActivityLive />;
}
