'use client';

/**
 * Solution catalog — the answer to "what can I get and how do I get it".
 *
 * specs/2026-08-workspace-solution-catalog-and-assistant.md §4.2/§4.6.
 *
 * Availability and delivery paths come from the server. A path the client
 * cannot complete today is rendered disabled with the reason rather than
 * hidden: silence would read as "it works", and a missing option is itself
 * information.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { WorkspaceIcon, type WorkspaceIconName } from '@/components/workspace/WorkspaceIcon';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { useDialog } from '@/components/workspace/ui/useDialog';
import { workspaceLinkLabel } from '@/components/workspace/workspaceLinks';
import type { Locale } from '@/i18n/config';
import { formatTemplate, getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import type {
  DeliveryKind,
  Solution,
  SolutionCatalog as SolutionCatalogPayload,
  SolutionDelivery,
  SolutionRequest,
} from '@/types/workspace';
import { useCatalog, type Loadable } from './useWorkspaceData';

type CatalogCopy = ReturnType<typeof getWorkspaceCopy>['catalog'];

const CATEGORY_ORDER = ['support', 'knowledge', 'growth', 'control'] as const;

/** How many cards a phone shows before "show all". */
const MOBILE_PREVIEW_COUNT = 3;

function iconFor(name: string): WorkspaceIconName {
  const known: WorkspaceIconName[] = [
    'bot', 'database', 'target', 'guardrails', 'file', 'connections',
    'layers', 'sparkles', 'engineering',
  ];
  return (known as string[]).includes(name)
    ? (name as WorkspaceIconName)
    : 'layers';
}

function deliveryCopy(copy: CatalogCopy, kind: DeliveryKind) {
  if (kind === 'self_serve') return copy.selfServe;
  if (kind === 'guided') return copy.guided;
  return copy.doneForYou;
}

function availabilityCopy(copy: CatalogCopy, solution: Solution) {
  if (solution.availability === 'live') {
    return { label: copy.liveLabel, hint: copy.liveHint, tone: 'is-live' };
  }
  if (solution.availability === 'assisted') {
    return { label: copy.assistedLabel, hint: copy.assistedHint, tone: 'is-assisted' };
  }
  return { label: copy.plannedLabel, hint: copy.plannedHint, tone: 'is-planned' };
}

export function requestStatusLabel(copy: CatalogCopy, status: SolutionRequest['status']) {
  switch (status) {
    case 'in_review': return copy.statusInReview;
    case 'scheduled': return copy.statusScheduled;
    case 'done': return copy.statusDone;
    case 'declined': return copy.statusDeclined;
    default: return copy.statusNew;
  }
}

export function requestNextStepLabel(copy: CatalogCopy, step: SolutionRequest['next_step']) {
  switch (step) {
    case 'scoping': return copy.stepScoping;
    case 'scheduled': return copy.stepScheduled;
    case 'delivered': return copy.stepDelivered;
    case 'declined': return copy.stepDeclined;
    default: return copy.stepAwaitingReview;
  }
}

/* ----------------------------- copy-to-clipboard -------------------------- */

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The snippet
      // stays selectable on screen, so the user is never stuck.
      setCopied(false);
    }
  };

  return (
    <button type="button" className="twk-copy-button" onClick={copy}>
      <WorkspaceIcon name={copied ? 'check' : 'file'} />
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}

/* --------------------------------- card ---------------------------------- */

function SolutionCard({
  solution, copy, request, onOpen,
}: {
  solution: Solution;
  copy: CatalogCopy;
  request?: SolutionRequest;
  onOpen: () => void;
}) {
  const availability = availabilityCopy(copy, solution);
  const paths = solution.delivery.filter((option) => option.available);

  return (
    <article className={`twk-solution-card ${availability.tone}`}>
      <button
        type="button"
        className="twk-solution-card-hit"
        onClick={onOpen}
        aria-label={formatTemplate(copy.detailAria, { name: solution.name })}
      />
      <header>
        <span className="twk-solution-icon"><WorkspaceIcon name={iconFor(solution.icon)} /></span>
        <span className="twk-availability"><i aria-hidden="true" />{availability.label}</span>
      </header>
      <h3>{solution.name}</h3>
      <p className="twk-solution-summary">{solution.summary}</p>
      <p className="twk-solution-outcome">{solution.outcome}</p>
      <footer>
        {paths.length ? (
          <span className="twk-path-chips">
            {paths.map((option) => (
              <span key={option.kind}>{deliveryCopy(copy, option.kind).label}</span>
            ))}
          </span>
        ) : (
          <span className="twk-path-chips is-muted"><span>{copy.plannedLabel}</span></span>
        )}
        {request ? (
          <span className="twk-status-pill is-neutral">{copy.requested}</span>
        ) : (
          <span className="twk-solution-open">{copy.open}<WorkspaceIcon name="chevron" /></span>
        )}
      </footer>
    </article>
  );
}

/* -------------------------------- detail --------------------------------- */

function DeliveryPanel({
  solution, option, copy, locale, request, sentDelivery, onRequest, busy, error,
}: {
  solution: Solution;
  option: SolutionDelivery;
  copy: CatalogCopy;
  locale: Locale;
  request?: SolutionRequest;
  sentDelivery: string | null;
  onRequest: (delivery: string, message: string, contact: string) => void;
  busy: boolean;
  error: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const info = deliveryCopy(copy, option.kind);

  useEffect(() => {
    setFormOpen(false);
    setMessage('');
    setContact('');
  }, [option.kind, solution.id]);

  const alreadyRequested = sentDelivery === option.kind
    || (request && request.delivery === option.kind);

  if (!option.available) {
    return (
      <div className="twk-delivery-panel is-unavailable">
        <p className="twk-delivery-unavailable">
          <WorkspaceIcon name="lock" />
          <span>{option.note || copy.pathUnavailable}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="twk-delivery-panel">
      <p className="twk-delivery-tagline">{info.tagline}</p>
      {option.eta ? (
        <p className="twk-delivery-eta"><WorkspaceIcon name="calendar" />{copy.etaLabel} {option.eta}</p>
      ) : null}

      <ol className="twk-delivery-steps">
        {option.steps.map((step, index) => (
          <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>
        ))}
      </ol>

      {option.snippet ? (
        <div className="twk-snippet">
          <header>
            <span>{copy.snippetTitle}</span>
            <CopyButton value={option.snippet} label={copy.copySnippet} copiedLabel={copy.copied} />
          </header>
          <pre>{option.snippet}</pre>
        </div>
      ) : null}

      {option.note ? <p className="twk-delivery-note"><WorkspaceIcon name="info" />{option.note}</p> : null}

      {alreadyRequested ? (
        <div className="twk-request-ack-block">
          <p className="twk-request-ack"><WorkspaceIcon name="check" />{copy.sentCopy}</p>
          {request ? <RequestState copy={copy} request={request} /> : null}
        </div>
      ) : formOpen ? (
        <form
          className="twk-request-form"
          onSubmit={(event) => { event.preventDefault(); onRequest(option.kind, message, contact); }}
        >
          <p className="twk-request-note">
            {formatTemplate(copy.requestNote, { sla: solution.first_reply_sla })}
          </p>
          <label>
            <span>{copy.messageLabel}</span>
            <textarea
              value={message}
              maxLength={2000}
              rows={3}
              placeholder={copy.messagePlaceholder}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <label>
            <span>{copy.contactLabel}</span>
            <input
              value={contact}
              maxLength={190}
              placeholder={copy.contactPlaceholder}
              onChange={(event) => setContact(event.target.value)}
            />
          </label>
          {error ? <p className="twk-form-error" role="alert">{error}</p> : null}
          <div className="twk-request-actions">
            <button className="twk-primary-button" type="submit" disabled={busy}>
              {busy ? copy.sending : copy.submit}
            </button>
            <button className="twk-text-button" type="button" onClick={() => setFormOpen(false)}>{copy.cancel}</button>
          </div>
        </form>
      ) : (
        <button className="twk-primary-button" type="button" onClick={() => setFormOpen(true)}>
          {info.cta}
        </button>
      )}

      {solution.workspace_links.length ? (
        <div className="twk-solution-links">
          {solution.workspace_links.map((href) => (
            <Link key={href} href={`/${locale}${href}`}>
              {copy.openIn} {workspaceLinkLabel(locale, href)}
              <WorkspaceIcon name="arrow" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** What happens next with a request the client already sent. */
export function RequestState({ copy, request }: { copy: CatalogCopy; request: SolutionRequest }) {
  return (
    <dl className="twk-request-state">
      <div>
        <dt>{copy.statusLabel}</dt>
        <dd>{requestStatusLabel(copy, request.status)}</dd>
      </div>
      <div>
        <dt>{copy.nextStepLabel}</dt>
        <dd>{requestNextStepLabel(copy, request.next_step)}</dd>
      </div>
      {request.status === 'new' ? (
        <div>
          <dt>{copy.firstReplyLabel}</dt>
          <dd>{request.first_reply_sla}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function SolutionDetail({
  solution, copy, locale, request, sentDelivery, onClose, onRequest, busy, error,
}: {
  solution: Solution;
  copy: CatalogCopy;
  locale: Locale;
  request?: SolutionRequest;
  sentDelivery: string | null;
  onClose: () => void;
  onRequest: (delivery: string, message: string, contact: string) => void;
  busy: boolean;
  error: string;
}) {
  const options = solution.delivery;
  const preferredKind = (list: SolutionDelivery[]) => {
    const requested = sentDelivery || request?.delivery;
    const match = list.find((option) => option.kind === requested && option.available);
    if (match) return match.kind;
    const firstAvailable = list.find((option) => option.available);
    return firstAvailable ? firstAvailable.kind : (list.length ? list[0].kind : null);
  };
  const [activeKind, setActiveKind] = useState<DeliveryKind | null>(() => preferredKind(options));
  const [notifyOpen, setNotifyOpen] = useState(false);
  const availability = availabilityCopy(copy, solution);
  const active = options.find((option) => option.kind === activeKind) || null;
  const dialogRef = useDialog<HTMLElement>(true, onClose);

  useEffect(() => {
    setActiveKind(preferredKind(options));
    setNotifyOpen(false);
    // Solution identity, not array identity, decides the reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solution.id]);

  return (
    <div className="twk-modal-layer twk-solution-layer" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className="twk-solution-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={formatTemplate(copy.detailAria, { name: solution.name })}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="twk-sheet-head">
          <span className={`twk-solution-icon ${availability.tone}`}><WorkspaceIcon name={iconFor(solution.icon)} /></span>
          <div>
            <h2>{solution.name}</h2>
            <p className={`twk-availability ${availability.tone}`}><i aria-hidden="true" />{availability.label}</p>
          </div>
          <button className="twk-icon-button" type="button" aria-label={copy.close} onClick={onClose}>
            <WorkspaceIcon name="x" />
          </button>
        </header>

        <div className="twk-sheet-body">
          <p className="twk-sheet-lead">{solution.summary}</p>

          <section className="twk-sheet-block">
            <h3>{copy.whatYouGet}</h3>
            <p>{solution.outcome}</p>
          </section>

          {solution.pains.length ? (
            <section className="twk-sheet-block">
              <h3>{copy.whatItSolves}</h3>
              <ul className="twk-pain-list">
                {solution.pains.map((pain) => <li key={pain}>{pain}</li>)}
              </ul>
            </section>
          ) : null}

          {solution.availability === 'planned' ? (
            <section className="twk-sheet-block twk-planned-block">
              <h3>{copy.plannedTitle}</h3>
              <p>{copy.plannedCopy}</p>
              {sentDelivery === 'notify' || request ? (
                <div className="twk-request-ack-block">
                  <p className="twk-request-ack"><WorkspaceIcon name="check" />{copy.notifyAck}</p>
                </div>
              ) : notifyOpen ? (
                <form
                  className="twk-request-form"
                  onSubmit={(event) => { event.preventDefault(); onRequest('notify', '', ''); }}
                >
                  {error ? <p className="twk-form-error" role="alert">{error}</p> : null}
                  <div className="twk-request-actions">
                    <button className="twk-primary-button" type="submit" disabled={busy}>
                      {busy ? copy.sending : copy.submit}
                    </button>
                    <button className="twk-text-button" type="button" onClick={() => setNotifyOpen(false)}>{copy.cancel}</button>
                  </div>
                </form>
              ) : (
                <button className="twk-secondary-button" type="button" onClick={() => setNotifyOpen(true)}>
                  {copy.notifyCta}
                </button>
              )}
            </section>
          ) : (
            <section className="twk-sheet-block">
              <h3>{copy.howToGet}</h3>
              <div className="twk-delivery-tabs" role="tablist" aria-label={copy.howToGet}>
                {options.map((option) => {
                  const info = deliveryCopy(copy, option.kind);
                  const isActive = option.kind === activeKind;
                  return (
                    <button
                      key={option.kind}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${isActive ? 'is-active' : ''}${option.available ? '' : ' is-unavailable'}`}
                      onClick={() => setActiveKind(option.kind)}
                    >
                      {info.label}
                      {option.available ? null : <em>{copy.notAvailableShort}</em>}
                    </button>
                  );
                })}
              </div>
              {active ? (
                <DeliveryPanel
                  solution={solution}
                  option={active}
                  copy={copy}
                  locale={locale}
                  request={request}
                  sentDelivery={sentDelivery}
                  onRequest={onRequest}
                  busy={busy}
                  error={error}
                />
              ) : null}
            </section>
          )}

          {solution.requires.length ? (
            <section className="twk-sheet-block">
              <h3>{copy.needsFirst}</h3>
              <ul className="twk-need-list">
                {solution.requires.map((item) => <li key={item}><WorkspaceIcon name="info" />{item}</li>)}
              </ul>
            </section>
          ) : null}

          {solution.proof.length ? (
            <section className="twk-sheet-block">
              <h3>{copy.runsToday}</h3>
              <ul className="twk-proof-list">
                {solution.proof.map((proof) => (
                  <li key={proof.label}>
                    <WorkspaceIcon name="check" />
                    <span>{proof.label}</span>
                    <em>{copy.ownDeployment}</em>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- catalog --------------------------------- */

export { useCatalog };

export default function SolutionCatalog({
  locale,
  variant = 'full',
  source = 'catalog',
  catalog,
}: {
  locale: Locale;
  variant?: 'full' | 'compact';
  source?: 'dashboard' | 'catalog';
  /** Supplied by the dashboard, which already has the catalog in its single
   *  response. When present nothing is fetched here. */
  catalog?: Loadable<SolutionCatalogPayload>;
}) {
  const copy = getWorkspaceCopy(locale).catalog;
  const own = useCatalog(locale, !catalog);
  const state = catalog ?? own;
  const { data, loading, error, reload } = state;

  const [category, setCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState<{ solutionId: string; delivery: string } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const requestsBySolution = useMemo(() => {
    const map = new Map<string, SolutionRequest>();
    (data?.requests || []).forEach((request) => {
      if (!map.has(request.solution_id)) map.set(request.solution_id, request);
    });
    return map;
  }, [data]);

  const solutions = data?.solutions || [];
  const visible = useMemo(() => (
    category === 'all'
      ? solutions
      : solutions.filter((solution) => solution.category === category)
  ), [solutions, category]);

  const open = openId ? solutions.find((solution) => solution.id === openId) : undefined;

  const submitRequest = async (delivery: string, message: string, contact: string) => {
    if (!open) return;
    setBusy(true);
    setFormError('');
    try {
      await workspaceApi.requestSolution({
        solution_id: open.id, delivery, message, contact, source,
      });
      setSent({ solutionId: open.id, delivery });
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <WsSnippet kind="cards" rows={3} />;
  if (error || !data) return <WsError message={error || copy.loadFailed} onRetry={reload} />;

  const categoryLabel = (key: string) => {
    switch (key) {
      case 'support': return copy.categorySupport;
      case 'knowledge': return copy.categoryKnowledge;
      case 'growth': return copy.categoryGrowth;
      case 'control': return copy.categoryControl;
      default: return copy.allCategories;
    }
  };

  const collapsible = visible.length > MOBILE_PREVIEW_COUNT && !showAll;

  return (
    <div className={`twk-catalog is-${variant}`}>
      {variant === 'full' ? (
        <div className="twk-segmented" role="tablist" aria-label={copy.title}>
          {['all', ...CATEGORY_ORDER].map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={category === key}
              className={category === key ? 'is-active' : ''}
              onClick={() => { setCategory(key); setShowAll(false); }}
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length ? (
        <>
          <div className={collapsible ? 'twk-solution-grid is-collapsed' : 'twk-solution-grid'}>
            {visible.map((solution) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
                copy={copy}
                request={requestsBySolution.get(solution.id)}
                onOpen={() => { setFormError(''); setOpenId(solution.id); }}
              />
            ))}
          </div>
          {collapsible ? (
            <button className="twk-show-all" type="button" onClick={() => setShowAll(true)}>
              {formatTemplate(copy.showAll, { count: visible.length - MOBILE_PREVIEW_COUNT })}
              <WorkspaceIcon name="chevron" />
            </button>
          ) : null}
        </>
      ) : (
        <div className="twk-catalog-empty">
          <WorkspaceIcon name="layers" />
          <h3>{copy.emptyTitle}</h3>
          <p>{copy.emptyCopy}</p>
        </div>
      )}

      {open ? (
        <SolutionDetail
          solution={open}
          copy={copy}
          locale={locale}
          request={requestsBySolution.get(open.id)}
          sentDelivery={sent && sent.solutionId === open.id ? sent.delivery : null}
          onClose={() => setOpenId(null)}
          onRequest={submitRequest}
          busy={busy}
          error={formError}
        />
      ) : null}
    </div>
  );
}
