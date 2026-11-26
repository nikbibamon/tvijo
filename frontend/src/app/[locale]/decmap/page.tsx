/**
 * Server wrapper for /[locale]/decmap: its own title and canonical instead of the locale
 * home. The decision-map copy is translated in all locale dictionaries, so — like
 * pricing — every locale is indexable and listed in hreflang.
 */
import type { Metadata } from 'next';
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';
import { getTranslations } from '@/i18n/index';
import { marketingMetadata } from '@/lib/seo/marketing';
import DecmapClient from './DecmapClient';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const t = getTranslations(isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE);
  return marketingMetadata({
    locale: params.locale,
    path: '/decmap',
    title: `${t.decmap.title} · Tvijo`,
    description: t.decmap.subtitle,
    keywords: params.locale === 'ru'
      ? ['карта решений', 'принятие решений', 'сравнение вариантов', 'Tvijo']
      : ['decision map', 'decision making', 'compare options', 'Tvijo'],
    indexIn: LOCALES,
  });
}

export default function DecisionCenterPage() {
  return <DecmapClient />;
}
