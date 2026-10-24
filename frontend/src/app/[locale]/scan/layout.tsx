/**
 * Server layout for /[locale]/scan.
 *
 * The page itself is a client component (search-params driven), so it cannot
 * export generateMetadata. Without this layout the page inherits the root
 * layout's default: canonical pointing at the locale root and a generic
 * site-name title. This layout emits the page's real canonical, the existing
 * localized scanPage meta copy and the full 11-locale hreflang set (the scan
 * page is fully localized, so all locales stay indexable).
 */

import type { Metadata } from 'next';
import { LOCALES, LOCALE_META, isValidLocale, DEFAULT_LOCALE } from '@/i18n/config';
import { getTranslations } from '@/i18n/index';

const BASE = 'https://tvijo.com';

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getTranslations(locale);

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[LOCALE_META[loc].hreflang] = `${BASE}/${loc}/scan`;
  }
  languages['x-default'] = `${BASE}/${DEFAULT_LOCALE}/scan`;

  return {
    title: { absolute: t.scanPage.metaTitle },
    description: t.scanPage.metaDescription,
    alternates: { canonical: `${BASE}/${locale}/scan`, languages },
  };
}

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
