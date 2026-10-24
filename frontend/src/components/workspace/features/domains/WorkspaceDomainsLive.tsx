'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { DomainCheckResponse } from '@/types/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import { WsEmpty, WsError } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';

export default function WorkspaceDomainsLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).domains;
  const history = useWorkspaceData(() => workspaceApi.domainSearches(), []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState<DomainCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget; const idea = String(new FormData(form).get('idea') || '').trim(); if (!idea) return;
    setLoading(true); setError(null); setResult(null);
    try { const next = await workspaceApi.domainSuggest(idea, 12); setSuggestions(next.suggestions); setResult(await workspaceApi.domainCheck(next.suggestions)); history.reload(); }
    catch (err) { setError(err instanceof Error ? err.message : t.whenFail); }
    finally { setLoading(false); }
  };

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading"><div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div></header>
      <section className="twk-domain-search"><span><WorkspaceIcon name="network" /></span><form onSubmit={search}><label htmlFor="domain-idea">{t.describeIdea}</label><div><input id="domain-idea" name="idea" placeholder={t.ideaPlaceholder} /><button className="twk-primary-button" disabled={loading} type="submit">{loading ? t.checking : t.findDomains}</button></div></form></section>
      {error ? <WsError message={error} onRetry={() => setError(null)} /> : null}
      {result?.configured === false ? <WsEmpty title={t.notConfiguredTitle} copy={result.detail || t.notConfiguredCopy} /> : null}
      {suggestions.length ? <section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.suggestionsTitle}</h2></div><span className="twk-status-pill is-neutral">{t.purchaseExternal}</span></header><div className="twk-domain-results">{suggestions.map((domain) => { const checked = result?.results.find((item) => item.domain === domain); return <article key={domain}><span><WorkspaceIcon name="network" /><strong>{domain}</strong></span><span className={checked?.available ? 'is-available' : ''}>{checked ? checked.available ? t.statesAvailable : t.statesUnavailable : t.statesUnverified}</span>{checked?.price ? <small>{checked.price}</small> : null}</article>; })}</div></section> : null}
      {history.error ? <WsError message={history.error} onRetry={history.reload} /> : history.data?.searches.length ? <section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.recentSearches}</h2></div></header><div className="twk-admin-table">{history.data.searches.map((item) => <div className="twk-admin-tr" key={item.id}><span>{item.domains.slice(0, 3).join(', ')}</span><span>{formatTemplate(t.states, { count: item.available })}</span><span>{new Date(item.created_at).toLocaleDateString()}</span></div>)}</div></section> : null}
    </div>
  );
}
