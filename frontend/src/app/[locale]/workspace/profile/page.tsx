import type { Metadata } from 'next';
import WorkspaceProfileLive from '@/components/workspace/features/profile/WorkspaceProfileLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'profile');
}

export default function WorkspaceProfilePage() {
  return <WorkspaceProfileLive />;
}
