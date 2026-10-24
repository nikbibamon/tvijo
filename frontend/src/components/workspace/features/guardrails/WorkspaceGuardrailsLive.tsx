'use client';

/**
 * Guardrails — provable controls only.
 *
 * The previous version rendered four tiles, three of which were answered by
 * the backend with a literal `true`. Every user, on every visit, saw
 * "Isolated worker: Enforced", "Secrets denied to agents: Enforced" and
 * "Human acceptance required: Enforced" regardless of any configuration or
 * data. That contradicted the page's own subtitle and the honest-claims rule
 * in CLAUDE.md.
 *
 * The backend now returns `controls[]`, where each entry is derived from
 * configuration or from the user's own rows, and a control it cannot derive is
 * absent from the array. This component renders whatever it is given and says
 * where each state came from, so a green tile can be checked rather than
 * trusted.
 *
 * Spec: bibamoney-backend/specs/2026-09-workspace-data-and-design-pass.md §4.D
 */

import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import type { GuardrailControl } from '@/types/workspace';

function useLocale() {
  return parseLocale(usePathname());
}

/** States that mean "this actually stops something". */
const STRONG_STATES = new Set(['enforced', 'encrypted', 'worker', 'active']);
/** States that mean "nothing is wrong, but nothing is proven either". */
const NEUTRAL_STATES = new Set(['not_configured', 'no_runs']);

function toneFor(state: string): 'strong' | 'weak' | 'neutral' {
  if (STRONG_STATES.has(state)) return 'strong';
  if (NEUTRAL_STATES.has(state)) return 'neutral';
  return 'weak';
}

export default function WorkspaceGuardrailsLive() {
  const locale = useLocale();
  const t = getWorkspaceCopy(locale).guardrails;

  const NAMES: Record<string, string> = {
    spend_cap: t.ctlSpendCap,
    secret_storage: t.ctlSecretStorage,
    execution_isolation: t.ctlExecutionIsolation,
    human_acceptance: t.ctlHumanAcceptance,
    tool_authorization: t.ctlToolAuthorization,
  };

  const WHY: Record<string, string> = {
    spend_cap: t.whySpendCap,
    secret_storage: t.whySecretStorage,
    execution_isolation: t.whyExecutionIsolation,
    human_acceptance: t.whyHumanAcceptance,
    tool_authorization: t.whyToolAuthorization,
  };

  const STATES: Record<string, string> = {
    not_configured: t.stNotConfigured,
    configured_soft: t.stConfiguredSoft,
    enforced: t.stEnforced,
    encrypted: t.stEncrypted,
    unavailable: t.stUnavailable,
    worker: t.stWorker,
    inline: t.stInline,
    off: t.stOff,
    active: t.stActive,
    no_runs: t.stNoRuns,
  };

  const { data, loading, error, reload } = useWorkspaceData(
    () => workspaceApi.guardrailsSummary(), []);

  /** Extra line a control can add when it carries counts worth showing. */
  const detailFor = (control: GuardrailControl): string | null => {
    if (control.key === 'tool_authorization' && control.state === 'active') {
      return `${control.allowed ?? 0} ${t.decisionsAllowed} · ${control.denied ?? 0} ${t.decisionsDenied} · ${t.windowDays}`;
    }
    if (control.key === 'human_acceptance' && control.total_contracts) {
      return `${control.gated_contracts ?? 0} / ${control.total_contracts}`;
    }
    if (control.key === 'spend_cap' && control.state === 'configured_soft') {
      return t.softLimitCopy;
    }
    return null;
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

      {loading ? <WsSnippet kind="table" rows={3} /> : null}
      {error ? <WsError message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <div className="twk-control-grid">
            {(data.controls || []).map((control) => {
              const detail = detailFor(control);
              return (
                <article className={`twk-control is-${toneFor(control.state)}`} key={control.key}>
                  <h2>{NAMES[control.key] || control.key}</h2>
                  <strong>{STATES[control.state] || control.state}</strong>
                  {detail ? <p className="twk-control-detail">{detail}</p> : null}
                  <p className="twk-control-why">{WHY[control.key] || ''}</p>
                </article>
              );
            })}
          </div>

          {data.budget ? (
            <section className="twk-admin-panel">
              <header className="twk-admin-panel-head"><div><h2>{t.budgetPolicy}</h2></div></header>
              <div className="twk-admin-table">
                <div className="twk-admin-tr is-head"><span>{t.limit}</span><span>{t.value}</span></div>
                <div className="twk-admin-tr"><span>{t.rowsDaily}</span><span>{data.budget.daily_limit ?? '—'}</span></div>
                <div className="twk-admin-tr"><span>{t.rowsMonthly}</span><span>{data.budget.monthly_limit ?? '—'}</span></div>
                <div className="twk-admin-tr"><span>{t.rowsPerRequest}</span><span>{data.budget.per_request_limit ?? '—'}</span></div>
                <div className="twk-admin-tr"><span>{t.rowsHardStop}</span><span>{data.budget.hard_stop ? t.yes : t.no}</span></div>
              </div>
            </section>
          ) : null}

          <section className="twk-admin-panel">
            {/* `p` inside a panel head renders as the 8px eyebrow, so the
                sentence goes under the heading, not into the head. */}
            <header className="twk-admin-panel-head"><div><h2>{t.decisionTrailTitle}</h2></div></header>
            <p className="twk-panel-copy">{t.decisionTrailCopy}</p>
            {data.decision_trail.length === 0 ? (
              <WsEmpty title={t.onTrail} copy={t.onTrailCopy} />
            ) : (
              <div className="twk-admin-table">
                <div className="twk-admin-tr is-head"><span>{t.rowAction}</span><span>{t.rowResource}</span><span>{t.rowWhen}</span></div>
                {data.decision_trail.map((entry) => (
                  <div className="twk-admin-tr" key={entry.id}>
                    <span>{entry.action}</span><span>{entry.resource}</span>
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
