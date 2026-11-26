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
  const self = `https://tvijo.com/${lang}/knowledge/${a.slug}`;
  return {title:a.title[lang],description:a.summary[lang],
    alternates:{canonical:self,languages:{en:`https://tvijo.com/en/knowledge/${a.slug}`,
      ru:`https://tvijo.com/ru/knowledge/${a.slug}`,'x-default':`https://tvijo.com/en/knowledge/${a.slug}`}},
    openGraph:{type:'article',url:self,title:a.title[lang],description:a.summary[lang],siteName:'Tvijo',
      images:[{url:'https://tvijo.com/og-image.png',width:1200,height:630,alt:a.title[lang]}]}};
}
export default function Page({params}:{params:{locale:string;slug:string}}) {
  if (!['en','ru'].includes(params.locale) || !catalog.articles.some(a => a.slug === params.slug)) notFound();
  return <ConnectedKnowledgeArticle slug={params.slug} locale={params.locale} />;
}
