import catalog from '@/data/connected-knowledge.json';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ConnectedArticleGraph, { type ArticleGraphData } from './ConnectedArticleGraph';

export { catalog };
export async function currentRelease() {
  try {
    const response = await fetch(catalog.release_metadata_url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const data = await response.json();
    return data.schema === 'tvijo.extension-release/v1' && /^\d+\.\d+\.\d+$/.test(data.latest_version)
      && ['published', 'prepared'].includes(data.publication?.status)
      ? {version:String(data.latest_version),status:String(data.publication.status),asOf:String(data.as_of)} : null;
  } catch { return null; }
}
const runtimeStates = ['integration_in_progress','host_verified','available_on_configured_hosts'];
export async function currentCatalogState() {
  const fallback = {surface_publication:catalog.surface_publication, runtime_status:'integration_in_progress', runtime_evidence:catalog.runtime_evidence};
  try {
    const response = await fetch(catalog.canonical_origin + '/api/dshrem/v1/public/knowledge', {next:{revalidate:60},signal:AbortSignal.timeout(4000)});
    if (!response.ok) return fallback;
    const data = await response.json();
    if (data.schema !== catalog.schema || !runtimeStates.includes(data.runtime_status) ||
        !data.surface_publication || !['main','dsh','platform'].every(k => ['prepared','published'].includes(data.surface_publication[k]))) return fallback;
    const evidence = data.runtime_evidence;
    if (!evidence || evidence.receipt_url !== catalog.runtime_evidence.receipt_url) return fallback;
    if (data.runtime_status !== 'integration_in_progress' &&
        (!/^[a-f0-9]{64}$/.test(evidence.receipt_sha256) || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(evidence.observed_at) || !Number.isFinite(Date.parse(evidence.observed_at)))) return fallback;
    return {surface_publication:data.surface_publication as typeof catalog.surface_publication,
      runtime_status:String(data.runtime_status), runtime_evidence:{receipt_url:catalog.runtime_evidence.receipt_url,
        observed_at:typeof evidence.observed_at === 'string' ? evidence.observed_at : null,
        receipt_sha256:typeof evidence.receipt_sha256 === 'string' ? evidence.receipt_sha256 : null}};
  } catch { return fallback; }
}
export function runtimeLabel(status:string, ru:boolean) {
  const labels:Record<string,[string,string]> = {
    integration_in_progress:['Runtime integration is in progress.','Интеграция runtime в работе.'],
    host_verified:['Runtime verified on an observed host.','Runtime проверен на наблюдаемом хосте.'],
    available_on_configured_hosts:['Runtime available on configured hosts with verification receipts.','Runtime доступен на настроенных хостах с квитанциями проверки.'],
  };
  return (labels[status] || labels.integration_in_progress)[ru ? 1 : 0] + (ru ? ' Для других хостов нужны собственная настройка и проверки.' : ' Other hosts require their own setup and checks.');
}

export default async function ConnectedKnowledgeArticle({ slug, locale }: {slug:string;locale:string}) {
  const lang = locale === 'ru' ? 'ru' : 'en';
  const ru = lang === 'ru';
  const article = catalog.articles.find(a => a.slug === slug)!;
  const [release, state] = await Promise.all([currentRelease(), currentCatalogState()]);
  const href = (s:string) => `/${lang}/knowledge/${s}#article-top`;
  const graph: ArticleGraphData = {
    schema:'tvijo.article-graph/v1', selected:article.id,
    nodes:catalog.articles.map(a => ({id:a.id,title:a.title[lang],label:a.graph_label[lang],summary:a.summary[lang],kind:a.kind,href:href(a.slug)})),
    edges:catalog.articles.flatMap(a => a.links.map(target => ({source:a.id,target:'tvijo:'+target,kind:'link'}))),
  };
  const relations = [
    {title:ru ? 'Читайте дальше' : 'Continue reading',items:catalog.articles.filter(a => article.links.includes(a.slug))},
    {title:ru ? 'Обратные ссылки' : 'Backlinks',items:catalog.articles.filter(a => a.links.includes(slug))},
  ];
  return <>
    <Navbar />
    <div className="tk-page pt-24">
      <link rel="stylesheet" href="/knowledge-assets/graph.css?v=1" />
      <main className="tk-main" lang={lang}>
        <p className="tk-eyebrow">TVIJO / KNOWLEDGE</p>
        <a href={`/${lang}/kb`}>{ru ? 'База знаний' : 'Knowledge base'}</a>
        <span> · </span><a href={`/${ru ? 'en' : 'ru'}/knowledge/${slug}#article-top`} hrefLang={ru ? 'en' : 'ru'}>{ru ? 'English' : 'Русский'}</a>
        <h1 id="article-top" tabIndex={-1}>{article.title[lang]}</h1>
        <p className="tk-summary">{article.summary[lang]}</p>
        <p className="tk-meta">{ru ? 'Источники проверены' : 'Sources verified'} · <time dateTime={article.verified_at}>{article.verified_at}</time> · {article.kind}</p>
        <nav className="tk-toc" aria-label={ru ? 'На странице' : 'On this page'}>
          {article.sections.map((s,i) => <a key={i} href={`#section-${i}`}>{s.heading[lang]}</a>)}
        </nav>
        <article className="tk-prose">{article.sections.map((s,i) => <section key={i}>
          <h2 id={`section-${i}`}>{s.heading[lang]}</h2>{s.paragraphs.map((p,j) => <p key={j}>{p[lang]}</p>)}
        </section>)}</article>
        {relations.map(group => <section className="tk-related" key={group.title}><h2>{group.title}</h2><ul>
          {group.items.map(a => <li key={a.id}><a href={href(a.slug)}>{a.title[lang]}</a></li>)}
        </ul></section>)}
        {(state.surface_publication.dsh === 'published' || state.surface_publication.platform === 'published') &&
          <p className="tk-meta">{ru ? 'Эта статья на' : 'Read this article on'}: {' '}
            {state.surface_publication.dsh === 'published' && <a href={article.canonical_url + (ru ? '?lang=ru' : '') + '#article-top'}>DSH</a>}{' '}
            {state.surface_publication.platform === 'published' && <a href={article.alternatives.platform[lang] + '#article-top'}>Platform</a>}
          </p>}
        <section className="tk-sources"><h2>{ru ? 'Источники' : 'Sources'}</h2><ul>
          {article.sources.map(s => <li key={s.url}><a href={s.url}>{s.label}</a></li>)}
        </ul></section>
        <aside className="tk-evidence"><h2>{ru ? 'Версии и доказательства' : 'Versions and evidence'}</h2>
          <p data-release-status={release?.status || 'unavailable'}>{release ? `${release.status} · ${release.version} · ${release.asOf}` : ru ? 'Метаданные выпуска недоступны' : 'Release metadata unavailable'}</p>
          <p><a href="https://dsh.tvijo.com/changelog">Changelog</a> · <a href={catalog.release_metadata_url}>Release JSON</a> · <a href={catalog.proof_url}>{ru ? 'Датированные квитанции' : 'Dated proof / receipts'}</a></p>
          <p data-runtime-status={state.runtime_status}>{runtimeLabel(state.runtime_status,ru)}</p>
          <p><a href={state.runtime_evidence.receipt_url}>{ru ? 'Квитанция проверки runtime' : 'Runtime verification receipt'}</a>{state.runtime_evidence.observed_at ? ' · ' + state.runtime_evidence.observed_at : ''}</p>
        </aside>
        <ConnectedArticleGraph graph={graph} locale={lang} />
      </main>
    </div>
    <Footer />
  </>;
}
