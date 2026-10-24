'use client';

/**
 * Models & usage — live user-scoped providers/usage/calls (ТЗ §10).
 * A file existing is not proof of a working connection: `supported` +
 * `credential_status` come from the backend feed honestly.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';

function useLocale() {
  return parseLocale(usePathname());
}

export default function WorkspaceModelsLive() {
  const locale = useLocale();
  const t = getWorkspaceCopy(locale).models;
  const providers = useWorkspaceData(() => workspaceApi.modelsProviders(), []);
  const usage = useWorkspaceData(() => workspaceApi.modelsUsage(), []);

  const hasAnyData = !!(usage.data && (usage.data.by_model.length || usage.data.by_provider.length));

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      {/* Provider registry */}
      {providers.loading ? <WsSnippet kind="table" rows={3} /> : null}
      {providers.error ? <WsError message={providers.error} onRetry={providers.reload} /> : null}
      {providers.data ? (
        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head"><div><h2>{t.registryTitle}</h2></div></header>
          <div className="twk-admin-table twk-model-table">
            <div className="twk-admin-tr is-head"><span>{t.headProvider}</span><span>{t.headSupported}</span><span>{t.headCredential}</span><span>{t.headLastVerified}</span></div>
            {providers.data.providers.map((p) => (
              <div className="twk-admin-tr" key={p.provider}>
                <span>
                  <strong>{p.provider === 'openrouter' ? 'OpenRouter' : p.provider}</strong>
                  {p.available_models?.length ? <small>{p.available_models.join(' · ')}</small> : null}
                  {/* Routing policy describes how these models are called,
                      so it belongs with them — not with credential status. */}
                  {p.routing_defaults ? <small>{t.openRouterPolicy}</small> : null}
                  {p.catalog_source ? (
                    <a className="twk-model-source" href={p.catalog_source} target="_blank" rel="noreferrer">
                      {t.catalogSource}
                    </a>
                  ) : null}
                </span>
                <span>{p.supported ? t.yes : t.no}</span>
                <span>{p.credential_status === 'none' ? '—' : p.credential_status}</span>
                <span>{p.last_verified_at ? new Date(p.last_verified_at).toLocaleString() : '—'}</span>
              </div>
            ))}
          </div>
          <p className="twk-panel-footnote">{t.footnote}</p>
        </section>
      ) : null}

      {/* Usage */}
      {usage.loading ? <WsSnippet kind="table" rows={2} /> : null}
      {usage.error ? <WsError message={usage.error} onRetry={usage.reload} /> : null}
      {usage.data && !hasAnyData ? (
        <WsEmpty title={t.noUsageTitle} copy={t.noUsageCopy} />
      ) : null}
      {usage.data && hasAnyData ? (
        <div className="twk-overview-grid">
          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.byModel}</h2></div></header>
            <div className="twk-admin-table">
              <div className="twk-admin-tr is-head"><span>{t.headModel}</span><span>{t.headCalls}</span><span>{t.headCost}</span></div>
              {usage.data.by_model.map((m) => (
                <div className="twk-admin-tr" key={m.model}><span>{m.model || '—'}</span><span>{m.calls}</span><span>${m.cost}</span></div>
              ))}
            </div>
          </section>
          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.byProvider}</h2></div></header>
            <div className="twk-admin-table">
              <div className="twk-admin-tr is-head"><span>{t.headProvider}</span><span>{t.headCalls}</span><span>{t.headCost}</span></div>
              {usage.data.by_provider.map((p) => (
                <div className="twk-admin-tr" key={p.provider}><span>{p.provider || '—'}</span><span>{p.calls}</span><span>${p.cost}</span></div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <p className="twk-q0-note">
        <Link href={`/${locale}/workspace/connections`}>{t.connectProviderKey}</Link> ·{' '}
        <Link href={`/${locale}/workspace/guardrails`}>{t.viewGuardrails}</Link>
      </p>
    </div>
  );
}
