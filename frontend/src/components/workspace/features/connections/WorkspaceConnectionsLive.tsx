'use client';

/**
 * Connections — managed AI OS gateway keys plus BYOK credentials (ТЗ §12).
 *
 * Secrets are write-only: paste allowed, never rendered back, never re-shown.
 * Create → verify → revoke call the user-scoped backend endpoints.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import type { GatewayKey, GatewayKeyStatus, ProviderCredential } from '@/types/workspace';

const PROVIDERS = [
  ['openai', 'OpenAI'],
  ['openrouter', 'OpenRouter'],
  ['anthropic', 'Anthropic'],
  ['deepseek', 'DeepSeek'],
  ['groq', 'Groq'],
  ['runpod', 'Runpod'],
] as const;

const PROVIDER_LABELS: Record<string, string> =
  Object.fromEntries(PROVIDERS.map(([value, label]) => [value, label]));

/** 1050000 reads as noise; 1.05M reads as a context window. */
function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

function verificationTone(state: ProviderCredential['verification_state']) {
  if (state === 'live_verified') return 'ok';
  if (state === 'error' || state === 'revoked') return 'bad';
  return 'neutral';
}

function useLocale() {
  return parseLocale(usePathname());
}

function hermesConfig(key: GatewayKey, secret?: string | null) {
  return [
    'model:',
    '  default: aios-fast',
    '  provider: custom',
    `  base_url: ${key.base_url}`,
    `  api_key: ${secret || '<YOUR_GATEWAY_KEY>'}`,
  ].join('\n');
}

export default function WorkspaceConnectionsLive() {
  const locale = useLocale();
  const t = getWorkspaceCopy(locale).connections;
  const creds = useWorkspaceData(() => workspaceApi.listCredentials(), []);
  // Independent resources load in parallel; neither request waits on the other.
  const gatewayKeys = useWorkspaceData(() => workspaceApi.listGatewayKeys(), []);
  // The provider registry answers two questions this page could not: which
  // providers can actually have a key checked, and how big/expensive each
  // catalog is (measured from the AI Radar snapshot, not asserted).
  const providers = useWorkspaceData(() => workspaceApi.modelsProviders(), []);

  const [creating, setCreating] = useState(false);
  const [creatingGateway, setCreatingGateway] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [formError, setFormError] = useState<string | null>(null);
  // Only set when the provider was actually contacted (today: OpenRouter).
  const [verifyNote, setVerifyNote] = useState<string | null>(null);
  const [createdGateway, setCreatedGateway] = useState<GatewayKey | null>(null);
  const [copied, setCopied] = useState<'secret' | 'config' | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<Record<string, GatewayKeyStatus>>({});
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // One credential per provider is the shape the cards need; the table below
  // still lists every row, including extra keys for the same provider.
  const credByProvider: Record<string, ProviderCredential> = {};
  for (const cred of creds.data || []) {
    if (cred.verification_state === 'revoked') continue;
    if (!credByProvider[cred.provider]) credByProvider[cred.provider] = cred;
  }

  const VERIFICATION_LABEL: Record<string, string> = {
    live_verified: t.stateLiveVerified,
    stored: t.stateStored,
    error: t.stateError,
    revoked: t.revoked,
  };

  const handleCreateGateway = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const dailyBudget = String(fd.get('daily_budget_usd') || '').trim();
    if (!name) { setFormError(t.gatewayNameRequired); return; }
    setFormError(null);
    setCreatingGateway(true);
    try {
      const key = await workspaceApi.createGatewayKey({
        name,
        daily_budget_usd: dailyBudget || undefined,
      });
      setCreatedGateway(key);
      setCopied(null);
      form.reset();
      gatewayKeys.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.gatewayCreateFailed);
    } finally {
      setCreatingGateway(false);
    }
  };

  const handleGatewayStatus = async (id: string) => {
    setFormError(null);
    setStatusLoading(id);
    try {
      const next = await workspaceApi.gatewayKeyStatus(id);
      setGatewayStatus((current) => ({ ...current, [id]: next }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.gatewayStatusFailed);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleRevokeGateway = async (id: string) => {
    if (!window.confirm(t.gatewayConfirmRevoke)) return;
    setFormError(null);
    try {
      await workspaceApi.revokeGatewayKey(id);
      setGatewayStatus((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      gatewayKeys.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.gatewayRevokeFailed);
    }
  };

  const copyText = async (kind: 'secret' | 'config', value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const provider = String(fd.get('provider') || '');
    const secret = String(fd.get('secret') || '').trim();
    const label = String(fd.get('label') || '').trim();
    if (!secret) { setFormError(t.secretRequired); return; }
    setFormError(null);
    setCreating(true);
    try {
      await workspaceApi.createCredential({ provider, secret, label });
      form.reset();
      setSelectedProvider('openai');
      creds.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.createFailed);
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (id: string) => {
    setFormError(null);
    try {
      const result = await workspaceApi.verifyCredential(id);
      if (result.verification === 'unavailable') {
        // A 200 here does not mean the key works — it means nothing asked.
        setVerifyNote(t.storedNotVerified);
      } else {
        // Providers answer with different facts; show whichever arrived
        // instead of inventing a common shape.
        const info = result.key_info || {};
        const details: string[] = [];
        if (typeof info.limit_remaining === 'number') {
          details.push(`${t.keyCreditRemaining}: $${info.limit_remaining}`);
        }
        if (typeof info.model_count === 'number') {
          details.push(`${info.model_count} ${t.catalogModels.toLowerCase()}`);
        }
        if (typeof info.endpoint_count === 'number') {
          details.push(`${info.endpoint_count} endpoints`);
        }
        if (info.balance) {
          details.push(`${t.keyCreditRemaining}: ${info.balance} ${info.currency || ''}`.trim());
        }
        setVerifyNote(`${t.verifiedLive}${details.length ? ` · ${details.join(' · ')}` : ''}`);
      }
      creds.reload();
    } catch (err) {
      setVerifyNote(null);
      setFormError(err instanceof Error ? err.message : t.verifyFailed);
    }
  };

  const handleRevokeCred = async (id: string) => {
    if (!window.confirm(t.confirmRevoke)) return;
    try { await workspaceApi.revokeCredential(id); creds.reload(); }
    catch (err) { setFormError(err instanceof Error ? err.message : t.revokeFailed); }
  };

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      {formError ? <div className="twk-data-error" role="alert"><p>{formError}</p></div> : null}
      {verifyNote ? <div className="twk-data-note" role="status"><p>{verifyNote}</p></div> : null}

      {providers.loading ? <WsSnippet kind="table" rows={2} /> : null}
      {providers.data ? (
        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head"><div><h2>{t.providersTitle}</h2></div></header>
          <p className="twk-panel-copy">{t.providersCopy}</p>
          <div className="twk-provider-grid">
            {providers.data.providers.map((p) => {
              const cred = credByProvider[p.provider];
              const catalog = p.catalog;
              return (
                <article className="twk-provider-card" key={p.provider}>
                  <header>
                    <strong>{PROVIDER_LABELS[p.provider] || p.provider}</strong>
                    <span className={`twk-chip is-${cred ? verificationTone(cred.verification_state) : 'none'}`}>
                      {cred ? VERIFICATION_LABEL[cred.verification_state] : t.noCredential}
                    </span>
                  </header>
                  <p className={`twk-provider-check is-${p.has_live_check ? 'yes' : 'no'}`}>
                    {p.has_live_check ? t.liveCheckYes : t.liveCheckNo}
                  </p>
                  {!p.has_live_check ? (
                    <p className="twk-provider-hint">{t.liveCheckNoHint}</p>
                  ) : null}
                  {catalog ? (
                    <>
                      <dl className="twk-provider-facts">
                        <div>
                          <dt>{t.catalogModels}</dt>
                          <dd>{catalog.model_count}</dd>
                        </div>
                        {catalog.input_per_million_usd ? (
                          <div>
                            <dt>{t.catalogInput}</dt>
                            <dd>${catalog.input_per_million_usd.min}–${catalog.input_per_million_usd.max}</dd>
                          </div>
                        ) : null}
                        {catalog.output_per_million_usd ? (
                          <div>
                            <dt>{t.catalogOutput}</dt>
                            <dd>${catalog.output_per_million_usd.min}–${catalog.output_per_million_usd.max}</dd>
                          </div>
                        ) : null}
                        {catalog.max_context_length ? (
                          <div>
                            <dt>{t.catalogContext}</dt>
                            <dd>{formatContext(catalog.max_context_length)}</dd>
                          </div>
                        ) : null}
                      </dl>
                      {/* Attribution and date, so a price is checkable rather
                          than a number we appear to have invented. */}
                      <p className="twk-provider-source">
                        {t.perMillion} · {t.catalogSourceLabel}{' '}
                        {catalog.as_of ? new Date(catalog.as_of).toLocaleDateString() : ''} ·{' '}
                        {catalog.scope === 'aggregated' ? t.catalogScopeAggregated : t.catalogScopeVendor}
                      </p>
                    </>
                  ) : (
                    <p className="twk-provider-hint">{t.catalogNone}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* The gateway control plane is an operator-configured integration. When
          it is not configured, every user used to see a form they could never
          submit plus a "not configured" notice; showing nothing is honest and
          shorter. */}
      {gatewayKeys.data?.configured ? (
      <section className="twk-admin-panel twk-gateway-panel">
        <header className="twk-admin-panel-head">
          <div>
            <p>{t.gatewayEyebrow}</p>
            <h2>{t.gatewayTitle}</h2>
          </div>
        </header>
        <p className="twk-panel-copy">{t.gatewayCopy}</p>
        {gatewayKeys.data?.configured ? (
          <form onSubmit={handleCreateGateway} className="twk-conn-form">
            <div className="twk-conn-field">
              <label>{t.gatewayNameLabel}
                <input name="name" type="text" required placeholder={t.gatewayNamePlaceholder} />
              </label>
            </div>
            <div className="twk-conn-field">
              <label>{t.gatewayBudgetLabel}
                <input
                  name="daily_budget_usd"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  defaultValue="5.00"
                  required
                />
              </label>
            </div>
            <div className="twk-conn-actions">
              <button className="twk-primary-button" type="submit" disabled={creatingGateway}>
                {creatingGateway ? t.gatewayCreating : t.gatewayCreate}
              </button>
            </div>
          </form>
        ) : null}

        {createdGateway?.secret ? (
          <aside className="twk-key-once" role="status">
            <strong>{t.gatewaySecretOnce}</strong>
            <code>{createdGateway.secret}</code>
            <button
              className="twk-secondary-button"
              type="button"
              onClick={() => void copyText('secret', createdGateway.secret || '')}
            >
              {copied === 'secret' ? t.copied : t.copySecret}
            </button>
            <strong>{t.gatewayConfigTitle}</strong>
            <pre>{hermesConfig(createdGateway, createdGateway.secret)}</pre>
            <button
              className="twk-secondary-button"
              type="button"
              onClick={() => void copyText(
                'config', hermesConfig(createdGateway, createdGateway.secret))}
            >
              {copied === 'config' ? t.copied : t.copyConfig}
            </button>
          </aside>
        ) : null}
      </section>
      ) : null}

      {gatewayKeys.loading ? <WsSnippet kind="table" rows={2} /> : null}
      {gatewayKeys.error ? <WsError message={gatewayKeys.error} onRetry={gatewayKeys.reload} /> : null}
      {gatewayKeys.data ? (
        gatewayKeys.data.keys.length === 0 ? (
          gatewayKeys.data.configured ? (
            <WsEmpty title={t.gatewayEmptyTitle} copy={t.gatewayEmptyCopy} />
          ) : null
        ) : (
          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.gatewayKeysTitle}</h2></div></header>
            <div className="twk-admin-table twk-gateway-table">
              <div className="twk-admin-tr is-head">
                <span>{t.headLabel}</span><span>{t.gatewayKeyHead}</span>
                <span>{t.gatewayBudgetHead}</span><span>{t.gatewayUsageHead}</span>
                <span>{t.headActions}</span>
              </div>
              {gatewayKeys.data.keys.map((key) => {
                const live = gatewayStatus[key.id];
                return (
                  <div className="twk-admin-tr" key={key.id}>
                    <span><strong>{key.name}</strong><small>{key.plan}</small></span>
                    <span><code>{key.prefix}…{key.last4}</code></span>
                    <span>${key.daily_budget_usd} / {t.day}</span>
                    <span>
                      {live
                        ? `$${live.usage.daily.cost_usd} · ${live.usage.daily.requests} ${t.gatewayRequests}`
                        : '—'}
                    </span>
                    <span className="twk-row-actions">
                      {key.revoked_at ? <span className="is-muted">{t.revoked}</span> : (
                        <>
                          <button
                            type="button"
                            disabled={statusLoading === key.id}
                            onClick={() => void handleGatewayStatus(key.id)}
                          >{statusLoading === key.id ? t.loadingStatus : t.refreshStatus}</button>
                          <button type="button" onClick={() => void handleRevokeGateway(key.id)}>
                            {t.revoke}
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            {Object.entries(gatewayStatus).map(([id, live]) => (
              <div className="twk-gateway-status" key={id}>
                <strong>{t.gatewayTraceTitle}</strong>
                <span>{live.recent_traces.length} {t.gatewayTraces}</span>
                <span>${live.usage.monthly.cost_usd} · {live.usage.monthly.requests} {t.gatewayRequests} ({t.month})</span>
                <code>{live.key.base_url}</code>
              </div>
            ))}
          </section>
        )
      ) : null}

      {/* Create credential modal-less inline form */}
      <section className="twk-admin-panel">
        <header className="twk-admin-panel-head"><div><h2>{t.addKey}</h2></div></header>
        <form onSubmit={handleCreate} className="twk-conn-form">
          <div className="twk-conn-field">
            <label>{t.providerLabel}
              <select
                name="provider"
                value={selectedProvider}
                onChange={(event) => setSelectedProvider(event.target.value)}
                required
              >
                {PROVIDERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <div className="twk-conn-field">
            <label>{t.labelLabel}
              <input name="label" type="text" placeholder={t.labelPlaceholder} />
            </label>
          </div>
          <div className="twk-conn-field">
            <label>{t.secretLabel}
              <input
                name="secret"
                type="password"
                autoComplete="off"
                required
                placeholder={selectedProvider === 'openrouter' ? 'sk-or-v1-…' : t.secretPlaceholder}
              />
            </label>
          </div>
          <div className="twk-conn-actions">
            <button className="twk-inline-button" type="submit" disabled={creating}>{t.addVerify}</button>
          </div>
          {selectedProvider === 'openrouter' ? (
            <aside className="twk-openrouter-note" role="note">
              <div>
                <strong>{t.openRouterTitle}</strong>
                <p>{t.openRouterCopy}</p>
                <small>{t.openRouterPrivacy}</small>
              </div>
              <nav aria-label={t.openRouterResources}>
                <a href="https://openrouter.ai/docs/quickstart" target="_blank" rel="noreferrer">{t.openRouterDocs}</a>
                <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer">{t.openRouterModels}</a>
              </nav>
            </aside>
          ) : null}
        </form>
      </section>

      {/* Credentials list */}
      {creds.loading ? <WsSnippet kind="table" rows={3} /> : null}
      {creds.error ? <WsError message={creds.error} onRetry={creds.reload} /> : null}
      {creds.data ? (
        creds.data.length === 0 ? (
          <WsEmpty title={t.noCredsTitle} copy={t.noCredsCopy} />
        ) : (
          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.credsTitle}</h2></div></header>
            <div className="twk-admin-table">
              <div className="twk-admin-tr is-head"><span>{t.headProvider}</span><span>{t.headLabel}</span><span>{t.headVerification}</span><span>{t.headHint}</span><span>{t.headActions}</span></div>
              {creds.data.map((c) => (
                <div className="twk-admin-tr" key={c.id}>
                  <span><strong>{PROVIDER_LABELS[c.provider] || c.provider}</strong></span>
                  <span>{c.label || '—'}</span>
                  <span className={`twk-chip is-${verificationTone(c.verification_state)}`}>
                    {VERIFICATION_LABEL[c.verification_state] || c.status}
                  </span>
                  <span><code>{c.secret_hint}</code></span>
                  <span className="twk-row-actions">
                    {c.status !== 'revoked' ? (
                      <>
                        {c.status !== 'verified' ? <button type="button" onClick={() => handleVerify(c.id)}>{t.verify}</button> : null}
                        <button type="button" onClick={() => handleRevokeCred(c.id)}>{t.revoke}</button>
                      </>
                    ) : <span className="is-muted">{t.revoked}</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )
      ) : null}

      <p className="twk-q0-note">
        <Link href={`/${locale}/workspace/management-keys`}>{t.manageKeysLink}</Link> ·{' '}
        <Link href={`/${locale}/workspace/apps`}>{t.viewAppsLink}</Link> ·{' '}
        <Link href={`/${locale}/workspace/models`}>{t.viewModelsLink}</Link>
      </p>
    </div>
  );
}
