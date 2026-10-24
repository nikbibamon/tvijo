/**
 * SEO helpers for the marketing funnel (/solutions, /proof, /security, /compare,
 * /ai-radar, /domains, /seo-geo, /agent-skills, /crawler-policy).
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §2.
 *
 * Honest-indexing rule: a locale is only advertised to search engines when it
 * carries genuinely unique copy. The funnel is written in English and Russian;
 * the other nine locales still render (so no link 404s) but are served
 * `noindex, follow`, are absent from sitemap.xml and are never listed in
 * hreflang. Nine identical English copies must not compete as unique locales.
 *
 * SEO rule (every public page): pass on-topic `title`, `description` AND
 * `keywords`. `keywords` is required by the type signature on purpose — a new
 * page that forgets topic keywords fails to type-check instead of shipping
 * with an empty <meta name="keywords">. Keywords describe the page's single
 * topic (query angle); they are not a tag dump.
 */

import type { Metadata } from 'next';
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';

export const BASE_URL = 'https://tvijo.com';

/** Locales with unique funnel copy. */
export const MARKETING_LOCALES = ['en', 'ru'] as const;
export type MarketingLocale = (typeof MARKETING_LOCALES)[number];

/** /compare content is English-only, so only `en` may be indexed there. */
export const ENGLISH_ONLY_LOCALES = ['en'] as const;

const OG_LOCALE: Record<string, string> = { en: 'en_US', ru: 'ru_RU' };

export function normalizeLocale(locale: string): string {
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

/** Which copy to render: `ru` for Russian, English for everything else. */
export function marketingLocale(locale: string): MarketingLocale {
  return locale === 'ru' ? 'ru' : 'en';
}

export function isIndexable(
  locale: string,
  indexIn: readonly string[] = MARKETING_LOCALES,
): boolean {
  return indexIn.includes(locale);
}

interface MarketingMetadataInput {
  locale: string;
  /** Path after the locale segment, e.g. `/solutions/ai-audit-evidence`. */
  path: string;
  title: string;
  description: string;
  /** Required on-topic keywords — see the SEO rule in the module docblock. */
  keywords: readonly string[];
  ogType?: 'website' | 'article';
  /** Locales this page may be indexed in. Defaults to en + ru. */
  indexIn?: readonly string[];
}

export function marketingMetadata({
  locale: rawLocale,
  path,
  title,
  description,
  keywords,
  ogType = 'website',
  indexIn = MARKETING_LOCALES,
}: MarketingMetadataInput): Metadata {
  const locale = normalizeLocale(rawLocale);
  const url = `${BASE_URL}/${locale}${path}`;

  // hreflang lists only the locales that are actually indexable for this page.
  const languages: Record<string, string> = {};
  for (const loc of indexIn) {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  }
  languages['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}${path}`;

  const indexable = isIndexable(locale, indexIn);

  return {
    // `absolute` — the root layout appends the full site name, which would push
    // these titles past the length a SERP renders.
    title: { absolute: title },
    description,
    keywords: [...keywords],
    alternates: { canonical: url, languages },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: ogType,
      url,
      title,
      description,
      siteName: 'Tvijo',
      locale: OG_LOCALE[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/** BreadcrumbList JSON-LD for a funnel page. */
export function breadcrumbJsonLd(
  locale: string,
  trail: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tvijo', item: `${BASE_URL}/${locale}` },
      ...trail.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${BASE_URL}/${locale}${item.path}`,
      })),
    ],
  };
}

/** FAQPage JSON-LD. Only call it when the same Q&A is rendered on the page. */
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
