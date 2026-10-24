import type { Metadata } from 'next';
import WorkspaceBillingLive from '@/components/workspace/features/billing/WorkspaceBillingLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'billing');
}

export default function WorkspaceBillingPage() {
  return <WorkspaceBillingLive />;
}
