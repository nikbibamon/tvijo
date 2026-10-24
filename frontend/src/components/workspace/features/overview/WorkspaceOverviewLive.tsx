'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceIcon, type WorkspaceIconName } from '@/components/workspace/WorkspaceIcon';
import { WorkspaceSetupProgress } from '@/components/workspace/features/setup/WorkspaceSetupProgress';
import SolutionCatalog from '@/components/workspace/features/catalog/SolutionCatalog';
import { useDashboard } from '@/components/workspace/features/catalog/useWorkspaceData';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import type { NextAction } from '@/types/workspace';

function money(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(amount > 0 && amount < 1 ? 4 : 2)}` : '—';
}

function number(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-US').format(amount) : '—';
}

function firstName(fullName: string, email: string) {
  return fullName.trim().split(/\s+/)[0] || email.split('@')[0] || 'there';
}

/** Wording for the server's next-action id. The decision is the server's;
 *  only the words are ours. Moved here from the home surface, which
 *  stopped having a URL when /dashboard became a redirect. */
function nextActionCopy(t: ReturnType<typeof getWorkspaceCopy>['home'], action: NextAction) {
  switch (action.id) {
    case 'provider':
      return { title: t.nextProvider, copy: t.nextProviderCopy, icon: 'connections' as WorkspaceIconName };
    case 'budget':
      return { title: t.nextBudget, copy: t.nextBudgetCopy, icon: 'billing' as WorkspaceIconName };
    case 'run':
      return { title: t.nextRun, copy: t.nextRunCopy, icon: 'apps' as WorkspaceIconName };
    default:
      return { title: t.nextOperate, copy: t.nextOperateCopy, icon: 'activity' as WorkspaceIconName };
  }
}

export default function WorkspaceOverviewLive() {
  const locale = parseLocale(usePathname());
  const copy = getWorkspaceCopy(locale);
  const t = copy.overview;
  const bootstrap = useWorkspaceData(() => workspaceApi.bootstrap(), []);
  const activity = useWorkspaceData(() => workspaceApi.activityOverview(), []);
  const runs = useWorkspaceData(() => workspaceApi.runs({ limit: '5' }), []);
  // One extra request, and deliberately not blocking: if it fails the
  // numbers below still render. It carries the greeting, the next action
  // and the catalog — the parts of the old home screen worth keeping.
  const dashboard = useDashboard(locale);

  if (bootstrap.loading || activity.loading) return <div className="twk-overview-page"><WsSnippet kind="metrics" rows={4} /></div>;
  if (bootstrap.error || activity.error || !bootstrap.data || !activity.data) {
    return <div className="twk-overview-page"><WsError message={bootstrap.error || activity.error || 'Workspace overview could not be loaded.'} onRetry={() => { bootstrap.reload(); activity.reload(); runs.reload(); }} /></div>;
  }

  const boot = bootstrap.data;
  const usage = activity.data;
  const recentRuns = runs.data?.runs || [];
  const runCount = runs.data?.count || 0;
  const hasUsage = Number(usage.metrics.requests) > 0;
  const home = dashboard.data;
  const next = home ? nextActionCopy(copy.home, home.next_action) : null;
  const budget = boot.budget_summary;
  const budgetValue = budget?.monthly_limit ? `${budget.currency} ${budget.monthly_limit}${t.monthSuffix}` : budget?.daily_limit ? `${budget.currency} ${budget.daily_limit}${t.daySuffix}` : t.notConfigured;

  return (
    <div className="twk-overview-page">
      <header className="twk-v2-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow} · {boot.environment.toUpperCase()}</p>
          {/* The greeting used to live on /dashboard, which is a redirect
              now. Falling back to the section title keeps the heading
              honest when the dashboard request did not come back. */}
          <h1>{home ? formatTemplate(copy.home.greeting, { name: firstName(home.user.full_name, home.user.email) }) : t.title}</h1>
          <p>{home ? copy.home.subtitle : t.subtitle}</p>
        </div>
        <div className="twk-heading-buttons"><Link className="twk-secondary-button" href={`/${locale}/workspace/activity`}>{t.viewActivity}</Link><Link className="twk-primary-button" href={`/${locale}${boot.connection_summary.verified_credentials ? '/workspace/apps' : '/workspace/connections'}`}><WorkspaceIcon name={boot.connection_summary.verified_credentials ? 'play' : 'connections'} />{boot.connection_summary.verified_credentials ? t.startRun : t.connectProvider}</Link></div>
      </header>

      {next && home ? (
        <section className="twk-next-step">
          <div className="twk-next-step-body">
            <span className="twk-next-step-icon"><WorkspaceIcon name={next.icon} /></span>
            <div>
              <p className="twk-eyebrow">{copy.home.nextStepEyebrow}</p>
              <h2>{next.title}</h2>
              <p className="twk-next-step-copy">{next.copy}</p>
            </div>
          </div>
          <div className="twk-next-step-actions">
            <Link className="twk-primary-button" href={`/${locale}${home.next_action.href}`}>{next.title}</Link>
            <Link className="twk-text-link" href={`/${locale}/workspace/apps`}>{copy.home.browseAll}<WorkspaceIcon name="arrow" /></Link>
          </div>
        </section>
      ) : null}

      <section className="twk-overview-metrics" aria-label="Workspace metrics">
        <article><span>{t.measuredSpend}</span><strong>{hasUsage ? money(usage.metrics.spend) : '—'}</strong><small>{hasUsage ? t.providerUsage : t.noUsage}</small></article>
        <article><span>{t.requests}</span><strong>{hasUsage ? number(usage.metrics.requests) : '—'}</strong><small>{hasUsage ? t.inSelectedPeriod : t.noUsage}</small></article>
        <article><span>{t.totalTokens}</span><strong>{hasUsage ? number(usage.metrics.total_tokens) : '—'}</strong><small>{hasUsage ? t.inputOutput : t.noUsage}</small></article>
        <article><span>{t.runs}</span><strong>{runs.loading ? '—' : number(String(runCount))}</strong><small>{t.evidenceBacked}</small></article>
      </section>

      <WorkspaceSetupProgress bootstrap={boot} runCount={runCount} locale={locale} variant="overview" />

      <div className="twk-overview-body-grid">
        <section className="twk-v2-panel twk-usage-panel">
          <header><div><p className="twk-eyebrow">{t.usageEyebrow}</p><h2>{t.usageTitle}</h2></div><Link href={`/${locale}/workspace/activity`}>{t.openActivity} <WorkspaceIcon name="arrow" /></Link></header>
          {!hasUsage ? (
            <div className="twk-large-empty"><span><WorkspaceIcon name="activity" /></span><h3>{t.noUsageTitle}</h3><p>{t.connectAndRun}</p><Link className="twk-secondary-button" href={`/${locale}/workspace/connections`}>{t.connectProvider}</Link></div>
          ) : (
            <div className="twk-usage-lists">
              <div><h3>{t.topModels}</h3>{usage.top_models.length ? usage.top_models.map((item) => <p key={item.model}><span>{item.model || t.unknownModel}</span><strong>{money(item.cost)}</strong></p>) : <p><span>{t.noModelBreakdown}</span><strong>—</strong></p>}</div>
              <div><h3>{t.topProviders}</h3>{usage.top_providers.length ? usage.top_providers.map((item) => <p key={item.provider}><span>{item.provider || t.unknownProvider}</span><strong>{money(item.cost)}</strong></p>) : <p><span>{t.noProviderBreakdown}</span><strong>—</strong></p>}</div>
            </div>
          )}
        </section>

        <aside className="twk-v2-panel twk-control-panel">
          <header><div><p className="twk-eyebrow">{t.stateEyebrow}</p><h2>{t.controlTitle}</h2></div></header>
          <div className="twk-control-row"><span><WorkspaceIcon name="connections" />{t.providerConnection}</span><strong className={boot.connection_summary.verified_credentials ? 'is-good' : ''}>{boot.connection_summary.verified_credentials ? formatTemplate(t.verified, { count: boot.connection_summary.verified_credentials }) : t.required}</strong></div>
          <div className="twk-control-row"><span><WorkspaceIcon name="wallet" />{t.budgetPolicy}</span><strong className={budget ? 'is-good' : ''}>{budgetValue}</strong></div>
          <div className="twk-control-row"><span><WorkspaceIcon name="key" />{t.managementKeys}</span><strong>{formatTemplate(t.active, { count: boot.connection_summary.active_keys })}</strong></div>
          <div className="twk-control-row"><span><WorkspaceIcon name="shield" />{t.secretIsolation}</span><strong className="is-good">{t.defaultDeny}</strong></div>
          <Link className="twk-panel-link" href={`/${locale}/workspace/guardrails`}>{t.reviewGuardrails} <WorkspaceIcon name="arrow" /></Link>
        </aside>

        <section className="twk-v2-panel twk-recent-runs-panel">
          <header><div><p className="twk-eyebrow">{t.latestEyebrow}</p><h2>{t.recentRuns}</h2></div><Link href={`/${locale}/workspace/runs`}>{t.viewAll} <WorkspaceIcon name="arrow" /></Link></header>
          {runs.loading ? <WsSnippet kind="table" rows={3} /> : recentRuns.length ? (
            <div className="twk-recent-run-list">{recentRuns.map((run) => <Link href={`/${locale}/workspace/runs`} key={run.id}><span className="twk-run-kind"><WorkspaceIcon name="file" /><span><strong>{run.kind || t.workspaceRun}</strong><small>{run.model || run.route || t.modelNotReported}</small></span></span><span>{run.status}</span><time>{new Date(run.created_at).toLocaleDateString()}</time><WorkspaceIcon name="chevron" /></Link>)}</div>
          ) : (
            <div className="twk-compact-empty"><WorkspaceIcon name="file" /><div><strong>{t.noRunsTitle}</strong><span>{t.browseApps}</span></div><Link href={`/${locale}/workspace/apps`}>{t.browseApps}</Link></div>
          )}
        </section>
      </div>

      {home ? (
        <section className="twk-v2-panel twk-catalog-section">
          <header>
            <div>
              <p className="twk-eyebrow">{copy.catalog.eyebrow}</p>
              <h2>{copy.catalog.title}</h2>
              <p className="twk-section-sub">{copy.catalog.subtitle}</p>
            </div>
            <Link className="twk-text-link" href={`/${locale}/workspace/apps`}>{copy.home.browseAll}<WorkspaceIcon name="arrow" /></Link>
          </header>
          <SolutionCatalog
            locale={locale}
            variant="compact"
            source="dashboard"
            catalog={{ data: home.catalog, loading: false, error: '', reload: dashboard.reload }}
          />
        </section>
      ) : null}

      <section className="twk-evidence-callout"><span><WorkspaceIcon name="shield" /></span><div><strong>{t.calloutTitle}</strong><p>{t.calloutBody}</p></div><Link href={`/${locale}/workspace/runs`}>{t.runsEvidence} <WorkspaceIcon name="arrow" /></Link></section>
      <p className="twk-billing-separation"><WorkspaceIcon name="info" /> {t.billingSeparation} <Link href={`/${locale}/workspace/billing`}>{t.billingCreditsLink}</Link>.</p>
    </div>
  );
}
