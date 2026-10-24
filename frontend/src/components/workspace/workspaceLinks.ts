/**
 * Human labels for internal workspace hrefs, reusing the localized strings the
 * navigation already ships. Avoids a second, drifting copy of every screen
 * name for the solution catalog.
 */

import type { Locale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

/** Same order as the shell's NAV_ROUTES table. */
const NAV_HREFS: ReadonlyArray<ReadonlyArray<string>> = [
  ['/dashboard'],
  ['/workspace', '/workspace/activity', '/workspace/runs', '/workspace/models', '/workspace/apps', '/workspace/reference'],
  ['/workspace/connections', '/workspace/management-keys', '/workspace/guardrails'],
  ['/workspace/infrastructure', '/workspace/domains'],
  ['/workspace/billing', '/workspace/profile', '/workspace/preferences'],
];

export function workspaceLinkLabel(locale: Locale, href: string): string {
  const copy = getWorkspaceCopy(locale);

  for (let group = 0; group < NAV_HREFS.length; group += 1) {
    const index = NAV_HREFS[group].indexOf(href);
    if (index !== -1) return copy.shell.groups[group].items[index].label;
  }
  if (href === '/kb') return copy.home.explore1Title;
  if (href === '/learn') return copy.home.explore2Title;
  if (href === '/scan') return copy.home.start2Title;

  // Unknown internal route: readable fallback, never a raw slug.
  const last = href.split('/').filter(Boolean).pop() || href;
  return last.replace(/-/g, ' ').replace(/^./, (char) => char.toUpperCase());
}
