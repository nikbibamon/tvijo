'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KBArticleDetail } from '@/types/knowledge';

export type ArticleGraphData = {
  schema: 'tvijo.article-graph/v1'; selected: string;
  nodes: { id: string; title: string; summary: string; href: string; kind: string; label?: string }[];
  edges: { source: string; target: string; kind: string }[];
};
declare global {
  interface Window {
    TvijoKnowledgeGraph?: { mount: (root: HTMLElement, data: ArticleGraphData) => () => void };
  }
}
let loader: Promise<void> | undefined;
function loadGraph() {
  if (window.TvijoKnowledgeGraph) return Promise.resolve();
  if (!loader) loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/knowledge-assets/graph.js?v=1'; script.async = true;
    script.onload = () => resolve(); script.onerror = () => { loader = undefined; reject(new Error('graph_asset_unavailable')); };
    document.head.append(script);
  });
  return loader;
}
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function publishedGraph(article: KBArticleDetail, locale: string): ArticleGraphData {
  const lang = /^[a-z]{2}$/.test(locale) ? locale : 'en';
  const candidates = [article, ...(article.related_articles || [])];
  const unique = new Map(candidates.filter(a => slugPattern.test(a.slug) &&
    slugPattern.test((a as KBArticleDetail).category?.slug || a.category_slug))
    .slice(0, 48).map(a => [a.slug, a]));
  const nodes = Array.from(unique.values()).map(a => ({
    id: 'tvijo:kb:' + a.slug, title: a.title, summary: a.excerpt || '', kind: 'published-article',
    href: `/${lang}/kb/${(a as KBArticleDetail).category?.slug || a.category_slug}/${a.slug}#article-top`,
  }));
  const selected = 'tvijo:kb:' + article.slug;
  return {schema:'tvijo.article-graph/v1', selected, nodes,
    edges:nodes.filter(n => n.id !== selected).map(n => ({source:selected,target:n.id,kind:'related-article-link'}))};
}

/** Read only explicit KB links, then confirm the target exists in the public API.
 * At most eight requests, once near the viewport; no private context or cookies.
 */
async function withPublishedLinks(base: ArticleGraphData, article: KBArticleDetail, locale: string, signal: AbortSignal) {
  // Template content stays inert: inspecting links must not load article images/iframes.
  const document = window.document.createElement('template');
  document.innerHTML = (article.content_html || '').slice(0, 256000);
  const targets = new Set<string>();
  for (const anchor of Array.from(document.content.querySelectorAll('a[href]'))) {
    try {
      const url = new URL(anchor.getAttribute('href') || '', window.location.origin);
      const match = url.pathname.match(/^\/[a-z]{2}\/kb\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/);
      if (match && !url.username && !url.password &&
          (url.origin === window.location.origin || (url.origin === 'https://tvijo.com')) &&
          match[2] !== article.slug && !base.nodes.some(n => n.id === 'tvijo:kb:' + match[2])) targets.add(match[2]);
    } catch { /* Invalid source links never enter the graph. */ }
    if (targets.size >= 8) break;
  }
  const results = await Promise.allSettled(Array.from(targets).map(async slug => {
    const q = locale === 'ru' ? '?lang=ru' : '';
    const response = await fetch(`/api/v1/knowledge/articles/${slug}/${q}`, {signal, credentials:'omit', headers:{Accept:'application/json'}});
    if (!response.ok) return null;
    const text = await response.text(); if (text.length > 512000) return null;
    const target = JSON.parse(text) as KBArticleDetail;
    if (target.slug !== slug || typeof target.title !== 'string' || target.title.length > 300 ||
        !slugPattern.test(target.category?.slug || target.category_slug)) return null;
    const node = publishedGraph({...target, related_articles:[]}, locale).nodes[0];
    const targetDoc = window.document.createElement('template');
    targetDoc.innerHTML = (target.content_html || '').slice(0,256000);
    const backlink = Array.from(targetDoc.content.querySelectorAll('a[href]')).some(a => {
      try {
        const url = new URL(a.getAttribute('href') || '', window.location.origin);
        return (url.origin === window.location.origin || url.origin === 'https://tvijo.com') &&
          url.pathname.endsWith('/' + article.slug) && /^\/[a-z]{2}\/kb\//.test(url.pathname);
      } catch { return false; }
    });
    return node ? {node, backlink} : null;
  }));
  const confirmed = results.flatMap(r => r.status === 'fulfilled' && r.value ? [r.value] : []);
  return {...base, nodes:[...base.nodes,...confirmed.map(r => r.node)].slice(0,48), edges:[...base.edges,
    ...confirmed.flatMap(({node,backlink}) => [{source:base.selected,target:node.id,kind:'article-content-link'},
      ...(backlink ? [{source:node.id,target:base.selected,kind:'article-content-backlink'}] : [])])]};
}

/** One shared renderer, lazy near the viewport. Native anchors survive JS failure. */
export default function ConnectedArticleGraph({ article, graph, locale = 'en' }: {
  article?: KBArticleDetail; graph?: ArticleGraphData; locale?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const data = useMemo(() => graph || (article ? publishedGraph(article, locale) : undefined), [article, graph, locale]);
  const [verified, setVerified] = useState<ArticleGraphData>();
  useEffect(() => {
    const element = root.current; if (!element || !data) return;
    let cancelled = false, dispose: (() => void) | undefined;
    const requests = new AbortController();
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      observer.disconnect();
      deadline = setTimeout(() => requests.abort(), 4000);
      const ready = article ? withPublishedLinks(data, article, locale, requests.signal) : Promise.resolve(data);
      Promise.all([loadGraph().catch(() => {}), ready]).then(([, validated]) => {
        if (!cancelled) {
          setVerified(validated);
          dispose = window.TvijoKnowledgeGraph?.mount(element, validated);
        }
      }).catch(() => { /* Real fallback links remain available. */ }).finally(() => clearTimeout(deadline));
    }, {rootMargin:'200px'});
    observer.observe(element);
    return () => { cancelled = true; requests.abort(); clearTimeout(deadline); observer.disconnect(); dispose?.(); };
  }, [data, article, locale]);
  if (!data || !data.nodes.length) return null;
  const ru = locale === 'ru';
  return <section ref={root} className="tvijo-graph" lang={ru ? 'ru' : 'en'}>
    <link rel="stylesheet" href="/knowledge-assets/graph.css?v=1" />
    <h2>{ru ? 'Связи статей' : 'Article connections'}</h2>
    <p>{ru ? 'Ссылки на опубликованные статьи. Узел открывает статью у заголовка.' : 'Published article links. Select a node to open its article at the heading.'}</p>
    {article && <p><a href={`/${locale}/knowledge#article-top`}>{ru ? 'Neovim и оркестрация: связанные руководства' : 'Neovim & orchestration: connected guides'}</a></p>}
    <div className="tg-mount" />
    <details className="tg-fallback" open><summary>{ru ? 'Ссылки · клавиатура / текстовый вид' : 'Article links · keyboard / text view'}</summary>
      <ul>{(verified || data).nodes.map(n => <li key={n.id}><a href={n.href}>{n.title}</a></li>)}</ul>
    </details>
  </section>;
}
