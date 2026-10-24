'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { portalApiFetch } from '@/lib/portal-auth-fetch';

type Profile = { email: string; first_name?: string; last_name?: string; full_name?: string };

export default function WorkspaceProfileLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).profile;
  const profile = useWorkspaceData(() => portalApiFetch<Profile>('/auth/me/'), []);
  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading"><div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div></header>
      {profile.loading ? <WsSnippet kind="metrics" rows={2} /> : null}
      {profile.error ? <WsError message={profile.error} onRetry={profile.reload} /> : null}
      {profile.data ? <section className="twk-profile-card"><span className="twk-profile-avatar"><WorkspaceIcon name="user" /></span><div><p>{t.displayName}</p><strong>{profile.data.full_name || `${profile.data.first_name || ''} ${profile.data.last_name || ''}`.trim() || t.notSet}</strong><p>{t.email}</p><strong>{profile.data.email}</strong></div><Link className="twk-secondary-button" href={`/${locale}/profile`}>{t.editPublic} <WorkspaceIcon name="arrow" /></Link></section> : null}
    </div>
  );
}
