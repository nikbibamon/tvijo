import type { Metadata } from 'next';
import PromptHandoff from '@/components/kb/PromptHandoff';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ConnectedArticleGraph, { type ArticleGraphData } from '@/components/kb/ConnectedArticleGraph';
import { catalog, currentCatalogState, runtimeLabel } from '@/components/kb/ConnectedKnowledgeArticle';

export const revalidate = 60;
export function generateMetadata({params}:{params:{locale:string}}): Metadata {
  const locale = params.locale === 'ru' ? 'ru' : 'en';
  const title = locale === 'ru' ? 'Связанные знания' : 'Connected knowledge';
  const description = locale === 'ru'
    ? 'Понятные настройки, команды агентов и единый индекс опубликованных статей.'
    : 'Understandable settings, agent teams and one index of published articles.';
  const url = `https://tvijo.com/${locale}/knowledge`;
  return {title, description, alternates:{canonical:url},
    openGraph:{type:'website',url,title,description,siteName:'Tvijo',
      images:[{url:'https://tvijo.com/og-image.png',width:1200,height:630,alt:title}]},
    twitter:{card:'summary_large_image',title,description,images:['https://tvijo.com/og-image.png']}};
}
export default async function Page({params}:{params:{locale:string}}) {
  if (!['en','ru'].includes(params.locale)) notFound();
  const state = await currentCatalogState();
  const lang = params.locale === 'ru' ? 'ru' : 'en';
  const graph: ArticleGraphData = {schema:'tvijo.article-graph/v1',selected:'',
    nodes:catalog.articles.map(a => ({id:a.id,title:a.title[lang],label:a.graph_label[lang],summary:a.summary[lang],kind:a.kind,href:`/${lang}/knowledge/${a.slug}#article-top`})),
    edges:catalog.articles.flatMap(a => a.links.map(slug => ({source:a.id,target:'tvijo:'+slug,kind:'link'})))};
  return <><Navbar /><div className="tk-page pt-24"><link rel="stylesheet" href="/knowledge-assets/graph.css?v=1" />
    <main className="tk-main" lang={lang}><p className="tk-eyebrow">TVIJO / KNOWLEDGE</p>
      <h1 id="article-top" tabIndex={-1}>{lang === 'ru' ? 'Связанные знания' : 'Connected knowledge'}</h1>
      <p className="tk-summary">{lang === 'ru' ? 'Понятные настройки, команды агентов и единый индекс опубликованных статей.' : 'Understandable settings, agent teams and one index of published articles.'}</p>
      <div className="tk-cards">{catalog.articles.map(a => <article key={a.id}><p className="tk-eyebrow">{a.kind}</p><h2><a href={`/${lang}/knowledge/${a.slug}#article-top`}>{a.title[lang]}</a></h2><p>{a.summary[lang]}</p></article>)}</div>
      <p className="tk-meta" data-runtime-status={state.runtime_status}>{runtimeLabel(state.runtime_status,lang === 'ru')} <a href={state.runtime_evidence.receipt_url}>{lang === 'ru' ? 'Доказательства' : 'Verification receipt'}</a></p>
      <PromptHandoff locale={lang} />
      <ConnectedArticleGraph graph={graph} locale={lang} />
    </main></div><Footer /></>;
}
