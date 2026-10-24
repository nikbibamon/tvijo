/**
 * Knowledge Base — Article Detail Route (server wrapper for SEO).
 * Generation: GEN-KB-002
 *
 * Server component that fetches article data for generateMetadata (canonical,
 * OG tags, etc.) and renders the client-side ArticleClient component.
 */

import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { KBArticleDetail } from '@/types/knowledge';
import ArticleClient from './ArticleClient';

const API_BASE =
  process.env.NEXT_PUBLIC_DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api/v1';

const KB_LANGS = ['en', 'ru', 'uk'];

const fetchArticle = cache(async (slug: string, lang: string = 'en'): Promise<KBArticleDetail> => {
  const langQ = KB_LANGS.includes(lang) && lang !== 'en' ? `?lang=${lang}` : '';
  const url = `${API_BASE}/knowledge/articles/${slug}/${langQ}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch KB article ${slug}: ${res.status}`);
  }

  return (await res.json()) as KBArticleDetail;
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string; categorySlug: string; articleSlug: string };
}): Promise<Metadata> {
  const locale = KB_LANGS.includes(params.locale) ? params.locale : 'en';
  const { articleSlug } = params;

  try {
    const article = await fetchArticle(articleSlug, locale);
    const canonicalUrl = article.canonical_url
      || `https://tvijo.com/${locale}/kb/${article.category?.slug}/${article.slug}`;
    const title = article.meta_title || article.title;
    const desc = article.meta_description || article.excerpt || '';

    const metadata: Metadata = {
      title,
      description: desc,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'en': `https://tvijo.com/en/kb/${article.category?.slug}/${article.slug}`,
          'ru': `https://tvijo.com/ru/kb/${article.category?.slug}/${article.slug}`,
          'uk': `https://tvijo.com/uk/kb/${article.category?.slug}/${article.slug}`,
        },
      },
      openGraph: {
        title,
        description: desc,
        url: canonicalUrl,
        type: 'article',
        siteName: 'Tvijo',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
      },
    };

    if (article.cover_image_url) {
      metadata.openGraph!.images = [{
        url: article.cover_image_url,
        width: 1200,
        height: 630,
        alt: title,
      }];
      metadata.twitter!.images = [article.cover_image_url];
    }

    return metadata;
  } catch {
    notFound();
  }
}

export default function KBArticlePage() {
  return <ArticleClient />;
}
