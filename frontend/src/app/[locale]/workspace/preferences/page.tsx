import type { Metadata } from 'next';
import WorkspacePreferencesLive from '@/components/workspace/features/preferences/WorkspacePreferencesLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'preferences');
}

export default function WorkspacePreferencesPage() {
  return <WorkspacePreferencesLive />;
}
