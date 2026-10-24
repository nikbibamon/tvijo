import type { Metadata } from 'next';
import WorkspaceSkillPacks from '@/components/workspace/features/skillpacks/WorkspaceSkillPacks';
import { workspaceMetadata } from '@/lib/seo/workspace';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return workspaceMetadata(params.locale, 'plugins');
}

export default function SkillPacksPage() {
  return <WorkspaceSkillPacks />;
}
