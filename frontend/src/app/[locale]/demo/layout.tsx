/**
 * Server layout for /[locale]/demo.
 *
 * Emits the page's real canonical, the localized sample-page meta copy and the
 * full 11-locale hreflang set. The title comes from `src/i18n/public-surface.ts` rather
 * than `demoPage` in the shared `Translations`: the page stopped being a
 * gated "demo workspace" and became a public sample, and the old copy
 * described the login screen it no longer has.
 */

import type { Metadata } from 'next';
import { LOCALES, LOCALE_META, isValidLocale, DEFAULT_LOCALE } from '@/i18n/config';
import { getDemoCopy } from '@/i18n/public-surface';

const BASE = 'https://tvijo.com';

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const copy = getDemoCopy(locale);

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[LOCALE_META[loc].hreflang] = `${BASE}/${loc}/demo`;
  }
  languages['x-default'] = `${BASE}/${DEFAULT_LOCALE}/demo`;

  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: { canonical: `${BASE}/${locale}/demo`, languages },
  };
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
