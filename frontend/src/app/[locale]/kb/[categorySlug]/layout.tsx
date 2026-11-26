import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BASE_URL } from '@/lib/seo/marketing';

/**
 * SEO-20261103: страница категории — клиентский компонент без метаданных, из-за
 * чего canonical указывал на корень локали. Название категории берётся из слага;
 * описание честно говорит, что лежит на странице.
 */
const ACRONYMS: Record<string, string> = { ai: 'AI', mcp: 'MCP', erp: 'ERP', api: 'API' };

function humanize(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word, i) =>
      ACRONYMS[word] ?? (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word),
    )
    .join(' ');
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; categorySlug: string };
}): Metadata {
  const locale = params.locale === 'ru' ? 'ru' : params.locale === 'uk' ? 'uk' : 'en';
  const name = humanize(params.categorySlug);
  const title =
    locale === 'ru'
      ? `${name} — база знаний Tvijo`
      : locale === 'uk'
        ? `${name} — база знань Tvijo`
        : `${name} — Tvijo knowledge`;
  const description =
    locale === 'ru'
      ? `Статьи раздела «${name}»: практика, ограничения и источники в базе знаний Tvijo.`
      : locale === 'uk'
        ? `Статті розділу «${name}»: практика, обмеження та джерела в базі знань Tvijo.`
        : `Articles in the ${name} section of the Tvijo knowledge base: practice, limitations and sources.`;
  // 2026-11-06: публикуются только EN и RU (решение оператора). Прочие локали
  // редиректятся на /en в middleware, поэтому в hreflang их быть не должно.
  const translated = ['en', 'ru'].includes(params.locale);
  const selfUrl = `${BASE_URL}/${params.locale}/kb/${params.categorySlug}`;
  const canonical = translated
    ? selfUrl
    : `${BASE_URL}/en/kb/${params.categorySlug}`;
  const languages = {
    en: `${BASE_URL}/en/kb/${params.categorySlug}`,
    ru: `${BASE_URL}/ru/kb/${params.categorySlug}`,
    'x-default': `${BASE_URL}/en/kb/${params.categorySlug}`,
  };
  const url = selfUrl;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Tvijo',
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default function KbCategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
