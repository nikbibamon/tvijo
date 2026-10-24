'use client';

/**
 * Runs & Evidence — live user-scoped decisions (ТЗ §10).
 * Honest empty state; no static RUNS/DSH counters passed as live.
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

export default function WorkspaceRunsLive() {
  const locale = useLocale();
  const t = getWorkspaceCopy(locale).runs;
  const { data, loading, error, reload } = useWorkspaceData(
    () => workspaceApi.runs(), []);

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      {loading ? <WsSnippet kind="table" rows={4} /> : null}
      {error ? <WsError message={error} onRetry={reload} /> : null}

      {data ? (
        data.runs.length === 0 ? (
          <WsEmpty
            title={t.noRunsTitle}
            copy={t.noRunsCopy}
          />
        ) : (
          <div className="twk-admin-panel">
            <div className="twk-admin-table">
              <div className="twk-admin-tr is-head"><span>{t.headRoute}</span><span>{t.headModel}</span><span>{t.headStatus}</span><span>{t.headCost}</span><span>{t.headWhen}</span></div>
              {data.runs.map((run) => (
                <div className="twk-admin-tr" key={run.id}>
                  <span><strong>{run.route || '—'}</strong></span>
                  <span>{run.model || '—'}</span>
                  <span>{run.status}</span>
                  <span>{run.cost != null ? `$${run.cost}` : '—'}</span>
                  <span>{new Date(run.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ) : null}

      <p className="twk-q0-note">
        <Link href={`/${locale}/workspace/connections`}>{t.connectProvider}</Link> ·{' '}
        <Link href={`/${locale}/workspace/guardrails`}>{t.viewGuardrails}</Link>
      </p>
    </div>
  );
}