import type { Metadata } from 'next';
import WorkspaceReferenceLive from '@/components/workspace/features/reference/WorkspaceReferenceLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'reference');
}

export default function WorkspaceReferencePage() {
  return <WorkspaceReferenceLive />;
}
