import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ConnectedKnowledgeArticle, { catalog } from '@/components/kb/ConnectedKnowledgeArticle';

export const revalidate = 60;
export function generateStaticParams() {
  return ['en','ru'].flatMap(locale => catalog.articles.map(a => ({locale,slug:a.slug})));
}
export function generateMetadata({params}:{params:{locale:string;slug:string}}): Metadata {
  const a = catalog.articles.find(a => a.slug === params.slug);
  if (!a) return {};
  const lang = params.locale === 'ru' ? 'ru' : 'en';
  return {title:a.title[lang],description:a.summary[lang],alternates:{canonical:a.canonical_url,
    languages:{en:a.canonical_url,ru:a.canonical_url+'?lang=ru'}}};
}
export default function Page({params}:{params:{locale:string;slug:string}}) {
  if (!['en','ru'].includes(params.locale) || !catalog.articles.some(a => a.slug === params.slug)) notFound();
  return <ConnectedKnowledgeArticle slug={params.slug} locale={params.locale} />;
}
