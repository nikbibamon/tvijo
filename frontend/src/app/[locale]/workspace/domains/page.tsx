import type { Metadata } from 'next';
import WorkspaceDomainsLive from '@/components/workspace/features/domains/WorkspaceDomainsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'domains');
}

export default function WorkspaceDomainsPage() {
  return <WorkspaceDomainsLive />;
}
