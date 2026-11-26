'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { receiptCopy } from '@/i18n/receipts';
import { PortalApiError, portalApiFetch } from '@/lib/portal-auth-fetch';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '383216921789-aehqalavgh6ubrh16989uk2a50jjt58u.apps.googleusercontent.com';
type GoogleApi = { accounts: { id: { initialize: (options: Record<string, unknown>) => void; renderButton: (element: HTMLElement, options: Record<string, unknown>) => void } } };

export default function GoogleAccountLink() {
  const locale = parseLocale(usePathname());
  const t = receiptCopy(locale);
  const [authEpoch, setAuthEpoch] = useState(0);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [armed, setArmed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const password = useRef('');
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLDivElement>(null);
  const active = useRef(true);
  const allowed = useRef(false);
  const attempt = useRef(0);
  useEffect(() => {
    const changed = () => {
      attempt.current += 1; allowed.current = false; password.current = '';
      if (input.current) input.current.value = '';
      setArmed(false); setBusy(false); setLinked(null); setError(''); setAuthEpoch(value => value + 1);
    };
    const storage = (event: StorageEvent) => { if (!event.key || event.key === 'access_token') changed(); };
    window.addEventListener('tvijo-auth-changed', changed);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('tvijo-auth-changed', changed); window.removeEventListener('storage', storage); };
  }, []);
  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    portalApiFetch<{ schema_version: string; provider: string; issuer: string; subject: string }>('/workspace/receipt-identity/', { signal: controller.signal, cache: 'no-store' })
      .then(identity => {
        if (identity.schema_version !== 'tvijo.receipt-identity.v1' || identity.provider !== 'google' || identity.issuer !== 'https://accounts.google.com' || typeof identity.subject !== 'string' || !identity.subject) throw new Error('Invalid identity response');
        if (!controller.signal.aborted) setLinked(true);
      })
      .catch(err => { if (!controller.signal.aborted) { if (err instanceof PortalApiError && err.code === 'identity_not_connected') setLinked(false); else setError(t.unavailable); } });
    return () => { controller.abort(); active.current = false; allowed.current = false; password.current = ''; };
  }, [t.unavailable, authEpoch]);
  const cancel = () => { attempt.current += 1; allowed.current = false; password.current = ''; if (input.current) input.current.value = ''; setArmed(false); };
  const receive = useCallback(async (response: { credential?: string }) => {
    if (!active.current || !allowed.current || !password.current || !response.credential) return;
    const currentAttempt = attempt.current;
    allowed.current = false;
    setBusy(true); setError('');
    try {
      await portalApiFetch('/auth/google/', { method: 'POST', body: JSON.stringify({ credential: response.credential, link_existing: true, current_password: password.current }) });
      if (active.current && currentAttempt === attempt.current) { setLinked(true); window.dispatchEvent(new Event('tvijo-auth-changed')); }
    } catch {
      if (active.current && currentAttempt === attempt.current) setError(t.linkFailure);
    } finally {
      if (currentAttempt === attempt.current) {
        password.current = '';
        if (input.current) input.current.value = '';
        if (active.current) { setBusy(false); setArmed(false); }
      }
    }
  }, [t.linkFailure]);
  useEffect(() => {
    if (!loaded || !armed || !button.current) return;
    const api = (window as Window & { google?: GoogleApi }).google;
    if (!api) { setError(t.googleUnavailable); return; }
    api.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: receive, auto_select: false });
    api.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', width: 250, locale });
  }, [loaded, armed, receive, locale, t.googleUnavailable]);
  return <section className="twk-admin-panel p-5" aria-label={t.linkTitle}>
    <h2>{t.linkTitle}</h2>
    {error ? <p role="alert">{error}</p> : null}
    {linked === true ? <p role="status">{t.linked}</p> : linked === false ? <>
      <p>{t.linkCopy}</p>
      <form className="grid gap-3 mt-4 max-w-md" onSubmit={event => {
        event.preventDefault();
        const value = input.current?.value || '';
        if (!value) { setError(t.passwordRequired); return; }
        password.current = value; allowed.current = true; setError(''); setArmed(true);
      }}>
        <label>{t.password}<input ref={input} type="password" name="current_password" autoComplete="current-password" className="block w-full border rounded p-2 bg-transparent" required disabled={busy || armed} /></label>
        {!armed ? <button type="submit" className="twk-secondary-button" disabled={busy}>{t.ready}</button> : <button type="button" className="twk-secondary-button" disabled={busy} onClick={cancel}>{t.cancel}</button>}
      </form>
      {armed ? <><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => { cancel(); setError(t.googleUnavailable); }} /><div className="mt-4" ref={button} />{!loaded ? <p role="status">{t.googleLoading}</p> : null}</> : null}
    </> : !error ? <p role="status">…</p> : null}
  </section>;
}
