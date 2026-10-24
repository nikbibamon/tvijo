import type { Metadata } from 'next';
import ExecutionContractsLive from '@/components/workspace/features/contracts/ExecutionContractsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'contracts');
}

export default function WorkspaceContractsPage() {
  return <ExecutionContractsLive />;
}
