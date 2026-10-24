'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

export default function WorkspaceManagementKeysLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).keys;
  const keys = useWorkspaceData(() => workspaceApi.listAccessKeys(), []);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const createKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name) return setError(t.keyNameRequired);
    setSaving(true); setError(null);
    try {
      const key = await workspaceApi.createAccessKey({ name, scopes: ['activity:read'] });
      setCreatedSecret(key.secret);
      form.reset(); keys.reload();
    } catch (err) { setError(err instanceof Error ? err.message : t.createFailed); }
    finally { setSaving(false); }
  };

  const revoke = async (id: string) => {
    if (!window.confirm(t.confirmRevoke)) return;
    try { await workspaceApi.revokeAccessKey(id); keys.reload(); }
    catch (err) { setError(err instanceof Error ? err.message : t.revokeFailed); }
  };

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading"><div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div></header>
      {error ? <div className="twk-data-error" role="alert"><p>{error}</p></div> : null}
      <section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.createTitle}</h2></div></header><form className="twk-conn-form" onSubmit={createKey}><div className="twk-conn-field"><label>{t.keyName}<input name="name" placeholder={t.keyNamePlaceholder} /></label></div><div className="twk-conn-actions"><button className="twk-primary-button" disabled={saving} type="submit">{saving ? t.creating : t.createKey}</button></div></form></section>
      {createdSecret ? <div className="twk-key-once" role="alert"><strong>{t.secretOnce}</strong><code data-testid="created-secret">{createdSecret}</code><button type="button" onClick={() => navigator.clipboard.writeText(createdSecret)}>{t.copyText}</button></div> : null}
      {keys.loading ? <WsSnippet kind="table" rows={3} /> : null}
      {keys.error ? <WsError message={keys.error} onRetry={keys.reload} /> : null}
      {keys.data ? keys.data.length ? <section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.activeRevokedTitle}</h2></div></header><div className="twk-admin-table"><div className="twk-admin-tr is-head"><span>{t.headName}</span><span>{t.headKey}</span><span>{t.headScopes}</span><span>{t.headStatus}</span></div>{keys.data.map((key) => <div className="twk-admin-tr" key={key.id}><span><strong>{key.name}</strong></span><span><code>{key.prefix}…{key.last4}</code></span><span>{key.scopes.join(', ')}</span><span className="twk-row-actions">{key.revoked_at ? t.revoked : <button type="button" onClick={() => revoke(key.id)}>{t.revoke}</button>}</span></div>)}</div></section> : <WsEmpty title={t.noKeyList} copy={t.noKeysCopy} /> : null}
    </div>
  );
}
