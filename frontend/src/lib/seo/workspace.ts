import type { Metadata } from 'next';
import { DEFAULT_LOCALE, isValidLocale, type Locale } from '@/i18n/config';
import { getWorkspaceCopy, type WorkspaceCopy } from '@/i18n/workspace';

export type WorkspaceMetadataPage =
  | 'dashboard'
  | 'overview'
  | 'activity'
  | 'apps'
  | 'billing'
  | 'connections'
  | 'domains'
  | 'guardrails'
  | 'infrastructure'
  | 'management-keys'
  | 'models'
  | 'plugins'
  | 'preferences'
  | 'profile'
  | 'reference'
  | 'contracts'
  | 'runs';

type PageCopy = { title: string; description: string; path: string };

function pageCopy(copy: WorkspaceCopy, page: WorkspaceMetadataPage): PageCopy {
  switch (page) {
    case 'dashboard':
      return { title: copy.shell.home, description: copy.home.subtitle, path: '/dashboard' };
    case 'overview':
      return { title: copy.overview.title, description: copy.overview.subtitle, path: '/workspace' };
    case 'activity':
      return { title: copy.activity.title, description: copy.activity.subtitle, path: '/workspace/activity' };
    case 'apps':
      return { title: copy.catalog.title, description: copy.catalog.subtitle, path: '/workspace/apps' };
    case 'billing':
      return { title: copy.billing.title, description: copy.billing.subtitle, path: '/workspace/billing' };
    case 'connections':
      return { title: copy.connections.title, description: copy.connections.subtitle, path: '/workspace/connections' };
    case 'domains':
      return { title: copy.domains.title, description: copy.domains.subtitle, path: '/workspace/domains' };
    case 'guardrails':
      return { title: copy.guardrails.title, description: copy.guardrails.subtitle, path: '/workspace/guardrails' };
    case 'infrastructure':
      return { title: copy.infrastructure.title, description: copy.infrastructure.subtitle, path: '/workspace/infrastructure' };
    case 'management-keys':
      return { title: copy.keys.title, description: copy.keys.subtitle, path: '/workspace/management-keys' };
    case 'models':
      return { title: copy.models.title, description: copy.models.subtitle, path: '/workspace/models' };
    case 'plugins':
      return { title: copy.skillPacks.title, description: copy.skillPacks.subtitle, path: '/workspace/plugins' };
    case 'preferences':
      return { title: copy.preferences.title, description: copy.preferences.subtitle, path: '/workspace/preferences' };
    case 'profile':
      return { title: copy.profile.title, description: copy.profile.subtitle, path: '/workspace/profile' };
    case 'reference':
      return { title: copy.reference.title, description: copy.reference.subtitle, path: '/workspace/reference' };
    case 'contracts':
      return { title: copy.contracts.title, description: copy.contracts.subtitle, path: '/workspace/contracts' };
    case 'runs':
      return { title: copy.runs.title, description: copy.runs.subtitle, path: '/workspace/runs' };
  }
}

export function workspaceMetadata(
  localeParam: string,
  page: WorkspaceMetadataPage,
): Metadata {
  const locale: Locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const info = pageCopy(getWorkspaceCopy(locale), page);
  const title = `${info.title} | Tvijo`;
  const url = `https://tvijo.com/${locale}${info.path}`;

  return {
    title: { absolute: title },
    description: info.description,
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description: info.description,
      siteName: 'Tvijo',
    },
  };
}
