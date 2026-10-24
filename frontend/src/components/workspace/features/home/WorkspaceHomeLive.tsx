'use client';

/**
 * Dashboard home.
 *
 * Answers three questions in order: what should I do next, what can I get,
 * what did I already ask for. Everything on this screen comes from ONE
 * request (`/workspace/dashboard/`) — including the next action, which is a
 * server-side state machine, so the page cannot render a temporarily wrong
 * "first run" state while responses land out of order.
 *
 * specs/2026-08-workspace-solution-catalog-and-assistant.md §4.6.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WorkspaceIcon, type WorkspaceIconName } from '@/components/workspace/WorkspaceIcon';
import SolutionCatalog, {
  RequestState, requestStatusLabel,
} from '@/components/workspace/features/catalog/SolutionCatalog';
import { useDashboard } from '@/components/workspace/features/catalog/useWorkspaceData';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import type { NextAction, SolutionRequest, WorkspaceDashboard } from '@/types/workspace';

import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';

type HomeRow = { title: string; copy: string; href: string; icon: WorkspaceIconName };
type HomeCopy = ReturnType<typeof getWorkspaceCopy>['home'];
type CatalogCopy = ReturnType<typeof getWorkspaceCopy>['catalog'];

function rowItem(title: string, copy: string, href: string, icon: WorkspaceIconName): HomeRow {
  return { title, copy, href, icon };
}

function Row({ row, locale }: { row: HomeRow; locale: string }) {
  return (
    <Link className="twk-home-row" href={`/${locale}${row.href}`}>
      <span className="twk-home-row-icon"><WorkspaceIcon name={row.icon} /></span>
      <span className="twk-home-row-copy"><strong>{row.title}</strong><small>{row.copy}</small></span>
      <WorkspaceIcon name="chevron" />
    </Link>
  );
}

function firstName(fullName: string, email: string) {
  return fullName.trim().split(/\s+/)[0] || email.split('@')[0] || 'there';
}

/** Labels for the server's next-action id. The decision is the server's; only
 *  the wording lives here. */
function nextActionCopy(t: HomeCopy, action: NextAction) {
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

function SetupPanel({
  data, t, setupCopy, locale,
}: {
  data: WorkspaceDashboard;
  t: HomeCopy;
  setupCopy: ReturnType<typeof getWorkspaceCopy>['setup'];
  locale: string;
}) {
  // Finished setup collapses to a single line: a completed checklist is not
  // worth a panel on every visit.
  const [open, setOpen] = useState(!data.setup.complete);
  const labels = setupCopy.steps;

  return (
    <section className={open ? 'twk-setup-progress is-home' : 'twk-setup-progress is-home is-collapsed'}>
      <header className="twk-setup-head">
        <h2>{data.setup.complete ? t.setupDone : setupCopy.homeTitle}</h2>
        <button className="twk-text-button" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {formatTemplate(setupCopy.doneOf, { count: data.setup.complete_count, total: data.setup.total })}
          <span>{open ? t.setupHide : t.setupShow}</span>
        </button>
      </header>

      {open ? (
        <>
          <ol className="twk-setup-steps">
            {data.setup.steps.map((step, index) => (
              <li className={step.complete ? 'is-complete' : ''} key={step.id}>
                <span className="twk-step-marker" aria-hidden="true">
                  {step.complete ? <WorkspaceIcon name="check" /> : index + 1}
                </span>
                <div>
                  <strong>{labels[index].label}</strong>
                  <small>{labels[index].description}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="twk-setup-action">
            <Link className="twk-text-link" href={`/${locale}/workspace`}>{setupCopy.openWorkspace}</Link>
          </div>
        </>
      ) : null}
    </section>
  );
}

function RequestRow({
  request, name, copy, locale,
}: { request: SolutionRequest; name: string; copy: CatalogCopy; locale: string }) {
  const date = new Date(request.created_at);
  const stamp = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(
      locale === 'uk' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-GB',
      { day: 'numeric', month: 'short' },
    );
  return (
    <div className="twk-request-row is-detailed">
      <div className="twk-request-headline">
        <span className="twk-request-name">{name}</span>
        <span className="twk-request-meta">{stamp}</span>
        <span className={`twk-status-pill is-${request.status === 'done' ? 'ready' : 'neutral'}`}>
          {requestStatusLabel(copy, request.status)}
        </span>
      </div>
      <RequestState copy={copy} request={request} />
    </div>
  );
}

export default function WorkspaceHomeLive() {
  const locale = parseLocale(usePathname());
  const copy = getWorkspaceCopy(locale);
  const t = copy.home;
  const dashboard = useDashboard(locale);

  if (dashboard.loading) return <div className="twk-home-page"><WsSnippet kind="metrics" rows={3} /></div>;
  if (dashboard.error || !dashboard.data) {
    return (
      <div className="twk-home-page">
        <WsError message={dashboard.error || t.loadFailed} onRetry={dashboard.reload} />
      </div>
    );
  }

  const data = dashboard.data;
  const next = nextActionCopy(t, data.next_action);
  const requests = data.catalog.requests;
  const showLocaleFallback = locale !== 'en' && locale !== 'uk' && locale !== 'ru';

  const statusRows = [
    {
      label: t.provider,
      value: data.connection_summary.verified_credentials
        ? formatTemplate(t.verified, { count: data.connection_summary.verified_credentials })
        : t.notConnected,
      ready: data.connection_summary.verified_credentials > 0,
    },
    { label: t.budget, value: data.budget.configured ? t.configured : t.notSet, ready: data.budget.configured },
    { label: t.runs, value: data.run_count ? String(data.run_count) : t.noRunsStatus, ready: data.run_count > 0 },
    { label: t.evidence, value: data.run_count ? t.available : t.pendingFirstRun, ready: data.run_count > 0 },
  ];

  const exploreRows = [
    rowItem(t.explore1Title, t.explore1Copy, '/kb', 'book'),
    rowItem(t.explore2Title, t.explore2Copy, '/learn', 'play'),
    rowItem(t.explore3Title, t.explore3Copy, '/decmap', 'target'),
    rowItem(t.explore4Title, t.explore4Copy, '/bubbles', 'layers'),
  ];

  const solutionName = (solutionId: string) =>
    data.catalog.solutions.find((solution) => solution.id === solutionId)?.name
    || (solutionId === 'support-escalation' ? copy.catalog.escalationLabel : solutionId);

  // The catalog is already in the dashboard response: hand it to the catalog
  // component as a ready source so it never issues a second request.
  const catalogSource = {
    data: data.catalog,
    loading: false,
    error: '',
    reload: dashboard.reload,
  };

  return (
    <div className="twk-home-page">
      <header className="twk-home-heading">
        <p className="twk-eyebrow">{t.eyebrow}</p>
        <h1>{formatTemplate(t.greeting, { name: firstName(data.user.full_name, data.user.email) })}</h1>
        <p>{t.subtitle}</p>
        {showLocaleFallback ? (
          <p className="twk-locale-fallback" role="note">
            <WorkspaceIcon name="info" />{copy.global.localeFallback}
          </p>
        ) : null}
      </header>

      <section className="twk-next-step">
        <div className="twk-next-step-body">
          <span className="twk-next-step-icon"><WorkspaceIcon name={next.icon} /></span>
          <div>
            <p className="twk-eyebrow">{t.nextStepEyebrow}</p>
            <h2>{next.title}</h2>
            <p className="twk-next-step-copy">{next.copy}</p>
          </div>
        </div>
        <div className="twk-next-step-actions">
          <Link className="twk-primary-button" href={`/${locale}${data.next_action.href}`}>{next.title}</Link>
          <Link className="twk-text-link" href={`/${locale}/workspace/apps`}>{t.browseAll}<WorkspaceIcon name="arrow" /></Link>
        </div>
      </section>

      <div className="twk-home-lead-grid">
        <section className="twk-home-status-panel">
          <header>
            <div><p className="twk-eyebrow">{t.liveEyebrow}</p><h2>{t.liveTitle}</h2></div>
            <span className="twk-live-dot">{t.liveBadge}</span>
          </header>
          {statusRows.map((row) => (
            <div className="twk-home-status-row" key={row.label}>
              <span>{row.label}</span><strong>{row.value}</strong>
              <i className={row.ready ? 'is-ready' : ''} aria-hidden="true" />
            </div>
          ))}
        </section>

        <SetupPanel data={data} t={t} setupCopy={copy.setup} locale={locale} />
      </div>

      <section className="twk-home-section twk-catalog-section">
        <header>
          <div>
            <p className="twk-eyebrow">{copy.catalog.eyebrow}</p>
            <h2>{copy.catalog.title}</h2>
            <p className="twk-section-sub">{copy.catalog.subtitle}</p>
          </div>
          <Link className="twk-text-link" href={`/${locale}/workspace/apps`}>{t.browseAll}<WorkspaceIcon name="arrow" /></Link>
        </header>
        <SolutionCatalog locale={locale} variant="compact" source="dashboard" catalog={catalogSource} />
      </section>

      <div className="twk-home-content-grid">
        <section className="twk-home-section">
          <header><div><p className="twk-eyebrow">{copy.catalog.eyebrow}</p><h2>{copy.catalog.yourRequests}</h2></div></header>
          {requests.length ? (
            <div className="twk-request-list">
              {requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  name={solutionName(request.solution_id)}
                  copy={copy.catalog}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="twk-muted-note">{copy.catalog.noRequests}</p>
          )}
        </section>

        <aside className="twk-home-section twk-explore-panel">
          <header><div><p className="twk-eyebrow">{t.knowledgeEyebrow}</p><h2>{t.exploreTvijo}</h2></div></header>
          <div className="twk-home-row-list">{exploreRows.map((row) => <Row row={row} locale={locale} key={row.title} />)}</div>
        </aside>
      </div>
    </div>
  );
}
