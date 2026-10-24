import type { Metadata } from 'next';
import WorkspaceGuardrailsLive from '@/components/workspace/features/guardrails/WorkspaceGuardrailsLive';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'guardrails');
}

export default function WorkspaceGuardrailsPage() {
  return <WorkspaceGuardrailsLive />;
}
