/**
 * Server layout for /[locale]/pricing.
 *
 * The page is a client component, so it cannot export generateMetadata. This
 * layout gives it a real canonical (currently the root layout points the
 * canonical at the locale root) and a concise localized title built from the
 * existing pricingPage copy, while keeping the full 11-locale hreflang set —
 * pricing is fully localized, so the addendum's en/ru-only indexing policy
 * does not apply here.
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
    languages[LOCALE_META[loc].hreflang] = `${BASE}/${loc}/pricing`;
  }
  languages['x-default'] = `${BASE}/${DEFAULT_LOCALE}/pricing`;

  return {
    title: { absolute: `${t.pricingPage.heroAccent} · Tvijo` },
    description: t.pricingPage.heroSub,
    alternates: { canonical: `${BASE}/${locale}/pricing`, languages },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
