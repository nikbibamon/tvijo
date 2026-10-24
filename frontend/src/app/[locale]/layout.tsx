import type { Metadata } from 'next';
import { LOCALES, LOCALE_META, isValidLocale, DEFAULT_LOCALE } from '@/i18n/config';
import { getTranslations } from '@/i18n/index';

const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  hi: 'hi_IN',
  ko: 'ko_KR',
  ja: 'ja_JP',
  zh: 'zh_CN',
  de: 'de_DE',
  es: 'es_ES',
  pt: 'pt_PT',
  nl: 'nl_NL',
  uk: 'uk_UA',
};

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const t = getTranslations(locale);

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[LOCALE_META[loc].hreflang] = `https://tvijo.com/${loc}`;
  }
  languages['x-default'] = `https://tvijo.com/${DEFAULT_LOCALE}`;

  const localeAlternates: Record<string, string> = {};
  for (const loc of LOCALES) {
    localeAlternates[OG_LOCALE_MAP[loc]] = `https://tvijo.com/${loc}`;
  }

  return {
    title: {
      default: t.metadata.title,
      template: `%s | ${t.metadata.title}`,
    },
    description: t.metadata.description,
    alternates: {
      canonical: `https://tvijo.com/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale] || 'en_US',
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE_MAP[l]),
      url: `https://tvijo.com/${locale}`,
      siteName: 'Tvijo',
      title: t.metadata.title,
      description: t.metadata.description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metadata.title,
      description: t.metadata.description,
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
