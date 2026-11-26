'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { receiptCopy, receiptStatus } from '@/i18n/receipts';
import { receiptApi, formatTvijoTokens, type ProjectList, type ReceiptList, type Receipt } from '@/lib/workspace-receipts';
import { PortalApiError } from '@/lib/portal-auth-fetch';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';

type Result<T> = { key: string; data?: T; code?: string; error?: boolean };
export default function GatewayReceipts() {
  const locale = parseLocale(usePathname());
  const t = receiptCopy(locale);
  const [epoch, setEpoch] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [project, setProject] = useState('');
  const [cursor, setCursor] = useState('');
  const [detail, setDetail] = useState('');
  const [projects, setProjects] = useState<Result<ProjectList>>({ key: '' });
  const [receipts, setReceipts] = useState<Result<ReceiptList>>({ key: '' });
  const projectKey = `${epoch}:${refresh}`;
  const taskKey = JSON.stringify([epoch, refresh, project, cursor]);
  useEffect(() => {
    const changed = () => { setEpoch(v => v + 1); setProject(''); setCursor(''); setDetail(''); };
    const storage = (event: StorageEvent) => { if (!event.key || event.key === 'access_token') changed(); };
    window.addEventListener('tvijo-auth-changed', changed);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('tvijo-auth-changed', changed); window.removeEventListener('storage', storage); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    receiptApi.projects(controller.signal).then(data => {
      if (!controller.signal.aborted) setProjects({ key: projectKey, data });
    }).catch(error => {
      if (!controller.signal.aborted) setProjects({ key: projectKey, error: true, code: error instanceof PortalApiError ? error.code || undefined : undefined });
    });
    return () => controller.abort();
  }, [projectKey]);
  useEffect(() => {
    if (!project) return;
    const controller = new AbortController();
    receiptApi.tasks(project, cursor, controller.signal).then(data => {
      if (!controller.signal.aborted) {
        if (data.project_id !== project) setReceipts({ key: taskKey, error: true });
        else setReceipts({ key: taskKey, data });
      }
    }).catch(error => {
      if (!controller.signal.aborted) setReceipts({ key: taskKey, error: true, code: error instanceof PortalApiError ? error.code || undefined : undefined });
    });
    return () => controller.abort();
  }, [taskKey, project, cursor]);
  const currentProjects = projects.key === projectKey ? projects : null;
  const currentTasks = receipts.key === taskKey ? receipts : null;
  const retry = () => { setDetail(''); setRefresh(v => v + 1); };
  const errorText = (code?: string) => code === 'identity_not_connected' ? t.disconnected : t.unavailable;
  const unknown = (value: number | string | null | undefined) => value == null ? t.unknown : String(value);
  const money = (run: Receipt) => run.provider_cost.amount_usd == null ? t.unknown : `$${run.provider_cost.amount_usd}`;
  return <section className="twk-admin-panel" aria-label={t.title} data-testid="gateway-receipts">
    <header className="twk-admin-panel-head"><div><h2>{t.title}</h2><p style={{ fontSize: 14, letterSpacing: 'normal', fontWeight: 400, color: '#a8b5c7' }}>{t.subtitle}</p></div><button className="twk-secondary-button" type="button" onClick={retry}>{t.refresh}</button></header>
    {!currentProjects ? <WsSnippet rows={2} /> : currentProjects.error ? <WsError message={errorText(currentProjects.code)} onRetry={retry} /> : <>
      {currentProjects.data?.truncated ? <p role="status">{t.truncated}</p> : null}
      {currentProjects.data?.projects.length ? <label className="block p-4">{t.project}{' '}<select aria-label={t.project} className="max-w-full border rounded p-2 bg-transparent" value={project} onChange={event => { setProject(event.target.value); setCursor(''); setDetail(''); }}><option value="">{t.select}</option>{currentProjects.data.projects.map(item => <option value={item.id} key={item.id}>{item.name || item.id}</option>)}</select></label> : <WsEmpty title={t.noProjects} />}
      {project ? !currentTasks ? <WsSnippet rows={3} /> : currentTasks.error ? <WsError message={errorText(currentTasks.code)} onRetry={retry} /> : <>
        {currentTasks.data?.tasks.length ? <div className="grid gap-4 p-4">{currentTasks.data.tasks.map(run => <article key={run.task_id} className="border rounded-lg p-4 min-w-0" data-testid="receipt-card">
          <div className="flex flex-wrap justify-between gap-2"><strong className="break-all">{t.task}: {run.task_id}</strong><button type="button" className="twk-secondary-button" aria-expanded={detail === run.task_id} onClick={() => setDetail(detail === run.task_id ? '' : run.task_id)}>{detail === run.task_id ? t.close : t.details}</button></div>
          <dl className="grid gap-3 mt-3 sm:grid-cols-2"><div><dt>{t.state}</dt><dd>{receiptStatus(locale, run.status)}</dd></div><div><dt>{t.acceptance}</dt><dd>{receiptStatus(locale, run.acceptance.status)}</dd></div><div><dt>{t.provider}</dt><p className="text-sm">{run.provider_cost.payer === 'customer_provider_account' ? t.payerCustomer : t.payerPlatform}</p><dd>{money(run)} · {receiptStatus(locale, run.provider_cost.status)}</dd>{run.provider_cost.status !== 'complete' ? <p>{t.partial} {t.known}: {run.provider_cost.known_amount_usd == null ? t.unknown : `$${run.provider_cost.known_amount_usd}`}</p> : null}</div><div><dt>{t.credit} (TT)</dt><dd>{t.debited}: {unknown(formatTvijoTokens(run.service_credit.debited_micro_tvijo))} · {receiptStatus(locale, run.service_credit.status)}</dd></div></dl>
          {detail === run.task_id ? <div className="mt-4 border-t pt-3">{!run.provider_cost.invoice_verified ? <p>{t.invoice}</p> : null}<p>{t.tokens}: {unknown(run.model_usage.input_tokens)} / {unknown(run.model_usage.output_tokens)} · {receiptStatus(locale, run.model_usage.status)}</p><p>{t.reserved}: {unknown(formatTvijoTokens(run.service_credit.reserved_micro_tvijo))} · {t.held}: {unknown(formatTvijoTokens(run.service_credit.held_micro_tvijo))} · {t.released}: {unknown(formatTvijoTokens(run.service_credit.released_micro_tvijo))} TT</p><p className="break-all">{t.revision}: {run.revision}</p></div> : null}
        </article>)}</div> : <WsEmpty title={t.noTasks} />}
        <div className="flex flex-wrap gap-3 p-4">{cursor ? <button type="button" className="twk-secondary-button" onClick={() => { setCursor(''); setDetail(''); }}>{t.first}</button> : null}{currentTasks.data?.next_cursor ? <button type="button" className="twk-secondary-button" onClick={() => { setCursor(currentTasks.data?.next_cursor || ''); setDetail(''); }}>{t.next}</button> : null}</div>
      </> : null}
    </>}
    <p className="twk-q0-note p-4"><Link href={`/${locale}/workspace/profile`}>{t.profile}</Link> · <a href="https://platform.tvijo.com/">{t.platform}</a></p>
  </section>;
}
