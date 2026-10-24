'use client';

/**
 * Execution Contracts — explainer plus the caller's own contracts.
 *
 * The first version was a static page: three definitions, a list of seven
 * artifact names and a DEMO DATA worked example with a hardcoded sha256. It sat
 * in the Workspace nav next to Runs, so it looked like a data screen while
 * containing no data at all — and `GET /api/v1/contracts/` had been built and
 * left unwired.
 *
 * Now the explainer is compressed to what a reader needs before the list makes
 * sense, and everything below it is real: contracts owned by this account, the
 * frozen payload exactly as it was hashed, the runs under it and their evidence
 * packs. The invented hash is gone — a hash on this page belongs to a contract
 * that exists. An empty list stays empty.
 *
 * Spec: bibamoney-backend/specs/2026-09-workspace-data-and-design-pass.md §4.E
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import ContractBuilder from './ContractBuilder';
import ContractRunPanel from './ContractRunPanel';
import type {
  ContractDetail,
  ContractEvidence,
  ContractListRow,
  ContractRunSummary,
} from '@/types/workspace';

function useLocale() {
  return parseLocale(usePathname());
}

const ARTIFACTS = [
  'contract_hash',
  'knowledge_snapshot',
  'binding',
  'authorization',
  'execution_trace',
  'acceptance_result',
  'evidence_pack',
];

/**
 * Run states that mean the run is finished and accepted, finished badly, or
 * still moving. The words are the frozen enum from plans/0409; only the tone
 * is a UI decision.
 */
const RUN_TONE: Record<string, 'ok' | 'bad' | 'busy'> = {
  passed: 'ok',
  blocked: 'bad',
  rework: 'bad',
  running: 'busy',
  bound: 'busy',
  approved: 'busy',
  verification: 'busy',
};

/** A 64-character hash is unreadable inline; the first 12 identify it fine. */
function shortHash(hash: string): string {
  return hash ? `${hash.slice(0, 12)}…` : '';
}

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

const CONTRACTS_CSS = `
.twk-contracts-stack { display: grid; gap: 14px; margin-top: 16px; }
.twk-contracts-body {
  padding: 16px; display: grid; gap: 12px;
  font-size: 13px; line-height: 1.6; color: #c9d3e0;
}
.twk-contracts-body > p { margin: 0; }

/* Contract / Binding / Authorization split rows */
.twk-contracts-split {
  display: grid; grid-template-columns: 148px 1fr; gap: 3px 16px;
  align-items: baseline; padding: 9px 0;
  border-bottom: 1px dashed var(--twk-border-soft);
}
.twk-contracts-split:first-child { padding-top: 0; }
.twk-contracts-split:last-of-type { border-bottom: 0; padding-bottom: 0; }
.twk-contracts-split strong { color: var(--twk-violet-2); font-size: 11px; font-weight: 730; letter-spacing: .05em; }
.twk-contracts-split span { color: #c9d3e0; font-size: 12.5px; }

/* State-machine strip */
.twk-contracts-status {
  margin: 0; padding: 10px 12px;
  border: 1px solid rgba(45, 212, 191, .28); border-radius: 8px;
  background: rgba(45, 212, 191, .06); overflow-x: auto;
}
.twk-contracts-status code { color: #5eead4; font-size: 11.5px; white-space: nowrap; }

/* Seven recorded artifacts — numbered chip grid */
.twk-contracts-artifacts {
  list-style: none; counter-reset: artifact; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;
}
.twk-contracts-artifacts li {
  counter-increment: artifact;
  display: flex; align-items: center; gap: 9px; min-width: 0;
  padding: 9px 11px;
  border: 1px solid var(--twk-border-soft); border-radius: 8px;
  background: rgba(148, 163, 184, .04);
}
.twk-contracts-artifacts li::before {
  content: counter(artifact, decimal-leading-zero);
  color: var(--twk-violet-2); font-size: 9px; font-weight: 750; letter-spacing: .08em;
}
.twk-contracts-artifacts code { color: #e2e8f0; font-size: 11.5px; overflow-wrap: anywhere; }

/* Honesty note */
.twk-contracts-note {
  margin: 0; padding: 10px 12px;
  border-left: 2px solid rgba(245, 158, 11, .5); border-radius: 0 8px 8px 0;
  background: rgba(245, 158, 11, .05);
  color: #b8c2d2; font-size: 12px;
}

/* Bottom CTA to /workspace/runs */
.twk-contracts-cta {
  min-height: 54px; padding: 12px 16px;
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--twk-border); border-radius: 10px;
  background: linear-gradient(145deg, rgba(17, 24, 39, .98), rgba(12, 20, 34, .98));
  color: inherit; transition: border-color 140ms ease, background 140ms ease;
}
.twk-contracts-cta:hover { border-color: rgba(52, 211, 153, .45); background: rgba(52, 211, 153, .05); }
.twk-contracts-cta strong { color: #eef3f8; font-size: 12px; }
.twk-contracts-cta svg { width: 16px; height: 16px; color: var(--twk-violet-2); flex: 0 0 auto; }
.twk-contracts-cta svg:last-child { margin-left: auto; width: 14px; color: #607086; }

.twk-contracts-links { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 2px; font-size: 12.5px; }
.twk-contracts-links a { color: var(--twk-violet-2); }

/* --- Live list --- */
.twk-contract-rows { display: grid; }
.twk-contract-row {
  width: 100%; text-align: left; cursor: pointer;
  display: grid; grid-template-columns: minmax(0, 2fr) auto auto auto auto;
  align-items: center; gap: 8px 14px;
  padding: 13px 16px; border: 0; border-top: 1px solid var(--twk-border-soft);
  background: none; color: inherit;
}
.twk-contract-rows > .twk-contract-row:first-child { border-top: 0; }
.twk-contract-row:hover { background: rgba(52, 211, 153, .05); }
.twk-contract-row:focus-visible { outline: 2px solid var(--twk-violet-2); outline-offset: -2px; }
.twk-contract-goal { min-width: 0; display: grid; gap: 3px; }
.twk-contract-goal strong { color: var(--twk-text); font-size: 13px; font-weight: 600; }
.twk-contract-goal small { color: var(--twk-faint); font-size: 11px; }
.twk-contract-cell { color: var(--twk-muted); font-size: 11.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.twk-contract-cell code { color: #a7f3d0; font-size: 11px; }

.twk-run-chip {
  padding: 3px 8px; border: 1px solid var(--twk-border); border-radius: 999px;
  color: var(--twk-muted); font-size: 10px; font-weight: 640; white-space: nowrap;
}
.twk-run-chip.is-ok { border-color: rgba(52, 211, 153, .42); color: var(--twk-violet-2); }
.twk-run-chip.is-bad { border-color: rgba(239, 68, 68, .42); color: #fca5a5; }
.twk-run-chip.is-busy { border-color: rgba(45, 212, 191, .35); color: #5eead4; }

/* --- Detail --- */
.twk-contract-back {
  padding: 0 0 12px; border: none; background: none; cursor: pointer;
  color: var(--twk-violet-2); font-size: 13px;
}
.twk-contract-back:hover { text-decoration: underline; }

.twk-frozen-grid {
  margin: 0; padding: 16px;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px 20px;
}
.twk-frozen-grid > div { min-width: 0; display: grid; gap: 4px; align-content: start; }
.twk-frozen-grid dt {
  color: var(--twk-faint); font-size: 8.5px; font-weight: 750;
  letter-spacing: .1em; text-transform: uppercase;
}
.twk-frozen-grid dd { margin: 0; color: var(--twk-text); font-size: 12.5px; line-height: 1.5; overflow-wrap: anywhere; }
.twk-frozen-grid dd code { color: #a7f3d0; font-size: 11.5px; }
.twk-frozen-list { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 5px; }
.twk-frozen-list li {
  padding: 3px 8px; border: 1px solid var(--twk-border-soft); border-radius: 6px;
  background: rgba(148, 163, 184, .04); color: #d5dde8; font-size: 11px;
}
.twk-frozen-list.is-forbidden li { border-color: rgba(239, 68, 68, .3); color: #fca5a5; }

.twk-run-card {
  padding: 14px 16px; border-top: 1px solid var(--twk-border-soft);
  display: grid; gap: 9px;
}
.twk-run-head { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.twk-run-head strong { color: var(--twk-text); font-size: 13px; }
.twk-run-facts {
  margin: 0; display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px 14px;
}
.twk-run-facts > div { min-width: 0; display: grid; gap: 2px; }
.twk-run-facts dt { color: var(--twk-faint); font-size: 8.5px; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
.twk-run-facts dd { margin: 0; color: var(--twk-text); font-size: 12.5px; font-variant-numeric: tabular-nums; }
.twk-evidence-out {
  margin: 0; padding: 10px 12px; overflow-x: auto;
  border: 1px solid var(--twk-border); border-radius: 8px; background: #070c16;
  color: #a7f3d0; font-size: 11px;
}

@media (max-width: 720px) {
  .twk-contracts-split { grid-template-columns: 1fr; padding: 8px 0; }
  .twk-contracts-body { padding: 13px 14px; }
  .twk-contracts-artifacts { grid-template-columns: 1fr; }
  .twk-contract-row { grid-template-columns: 1fr auto; }
  .twk-frozen-grid { grid-template-columns: 1fr; padding: 14px; }
}
`;

export default function ExecutionContractsLive() {
  const locale = useLocale();
  const t = getWorkspaceCopy(locale).contracts;

  const list = useWorkspaceData(() => workspaceApi.contracts(), []);
  const [detail, setDetail] = useState<ContractDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Record<string, ContractEvidence | 'loading'>>({});
  const [building, setBuilding] = useState(false);

  const STATUS_LABEL: Record<string, string> = {
    draft: t.statusDraft,
    approved: t.statusApproved,
    blocked: t.statusBlocked,
  };

  const openContract = (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    workspaceApi.contract(id)
      .then(setDetail)
      .catch((err) => setDetailError(err instanceof Error ? err.message : t.loadFailed))
      .finally(() => setDetailLoading(false));
  };

  const loadEvidence = (contractId: string, runId: string) => {
    setEvidence((current) => ({ ...current, [runId]: 'loading' }));
    workspaceApi.contractRunEvidence(contractId, runId)
      .then((result) => setEvidence((current) => ({ ...current, [runId]: result })))
      .catch(() => setEvidence((current) => {
        const next = { ...current };
        delete next[runId];
        return next;
      }));
  };

  const splitRows = [t.splitContract, t.splitBinding, t.splitAuthorization].map((line) => {
    const separator = line.indexOf(' — ');
    return separator === -1
      ? { term: line, desc: '' }
      : { term: line.slice(0, separator), desc: line.slice(separator + 3) };
  });

  const renderList = (rows: string[] | undefined, forbidden = false) => {
    if (!rows || rows.length === 0) return <span>{t.none}</span>;
    return (
      <ul className={`twk-frozen-list${forbidden ? ' is-forbidden' : ''}`}>
        {rows.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  };

  if (detail) {
    const payload = detail.payload || {};
    const budget = payload.budget || detail.payload?.budget;
    return (
      <div className="twk-admin-page twk-contracts-page">
        <style>{CONTRACTS_CSS}</style>
        <header className="twk-admin-heading">
          <div>
            <p className="twk-eyebrow">{t.eyebrow}</p>
            <h1>{detail.goal}</h1>
            <p>{detail.expected_result}</p>
          </div>
        </header>
        <button type="button" className="twk-contract-back" onClick={() => setDetail(null)}>
          ← {t.backToList}
        </button>

        <div className="twk-contracts-stack">
          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.frozenTitle}</h2></div></header>
            <p className="twk-panel-copy">{t.frozenCopy}</p>
            <dl className="twk-frozen-grid">
              <div>
                <dt>{t.fieldHash}</dt>
                <dd><code>{detail.contract_hash}</code></dd>
              </div>
              <div>
                <dt>{t.fieldVersion}</dt>
                <dd>v{detail.version} · {STATUS_LABEL[detail.status] || detail.status}</dd>
              </div>
              <div>
                <dt>{t.fieldModels}</dt>
                <dd>{renderList(payload.allowed_models)}</dd>
              </div>
              <div>
                <dt>{t.fieldTools}</dt>
                <dd>{renderList(payload.allowed_tools)}</dd>
              </div>
              <div>
                <dt>{t.fieldForbidden}</dt>
                <dd>{renderList(payload.forbidden_actions, true)}</dd>
              </div>
              <div>
                <dt>{t.fieldGates}</dt>
                <dd>{renderList(payload.approval_gates)}</dd>
              </div>
              <div>
                <dt>{t.fieldAcceptance}</dt>
                <dd>{renderList((payload.acceptance || []).map((rule) => rule.rule))}</dd>
              </div>
              <div>
                <dt>{t.fieldKnowledge}</dt>
                <dd>
                  {detail.knowledge_refs.length === 0 ? t.none : (
                    <ul className="twk-frozen-list">
                      {detail.knowledge_refs.map((ref) => (
                        <li key={ref.ref}>{ref.ref} · v{ref.version}</li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              {budget ? (
                <>
                  <div><dt>{t.budgetUsd}</dt><dd>{budget.max_usd ?? t.none}</dd></div>
                  <div><dt>{t.budgetTokens}</dt><dd>{budget.max_tokens ?? t.none}</dd></div>
                  <div><dt>{t.budgetMinutes}</dt><dd>{budget.max_minutes ?? t.none}</dd></div>
                  <div><dt>{t.budgetSteps}</dt><dd>{budget.max_steps ?? t.none}</dd></div>
                </>
              ) : null}
            </dl>
          </section>

          <section className="twk-admin-panel">
            <header className="twk-admin-panel-head"><div><h2>{t.runsTitle}</h2></div></header>
            <p className="twk-contracts-status" style={{ margin: '0 16px' }}>
              <code>{t.statusLine}</code>
            </p>
            {detail.status === 'approved' ? (
              <ContractRunPanel
                contract={detail}
                onFinished={() => {
                  void workspaceApi.contract(detail.id).then(setDetail);
                  list.reload();
                }}
              />
            ) : null}
            {detail.runs.length === 0 ? (
              <WsEmpty title={t.noRunsTitle} copy={t.noRunsCopy} />
            ) : (
              detail.runs.map((run: ContractRunSummary) => {
                const packs = evidence[run.id];
                return (
                  <div className="twk-run-card" key={run.id}>
                    <div className="twk-run-head">
                      <strong>{t.runNo} #{run.run_no}</strong>
                      <span className={`twk-run-chip is-${RUN_TONE[run.status] || 'busy'}`}>
                        {run.status}
                      </span>
                    </div>
                    <dl className="twk-run-facts">
                      <div><dt>{t.runCost}</dt><dd>${run.cost_usd}</dd></div>
                      <div><dt>{t.runTokens}</dt><dd>{run.tokens ?? t.none}</dd></div>
                      <div><dt>{t.runSteps}</dt><dd>{run.steps ?? t.none}</dd></div>
                      <div>
                        <dt>{t.runAcceptance}</dt>
                        <dd>{run.acceptance_total ? `${run.acceptance_passed}/${run.acceptance_total}` : t.none}</dd>
                      </div>
                      <div><dt>{t.runEvidence}</dt><dd>{run.evidence_count}</dd></div>
                    </dl>
                    <div>
                      <button
                        type="button"
                        className="twk-secondary-button"
                        disabled={packs === 'loading'}
                        onClick={() => loadEvidence(detail.id, run.id)}
                      >
                        {packs === 'loading' ? t.evidenceLoading : t.evidenceButton}
                      </button>
                    </div>
                    {packs && packs !== 'loading' ? (
                      packs.evidence.length === 0 ? (
                        <p className="twk-contracts-note">{t.evidenceNone}</p>
                      ) : (
                        packs.evidence.map((pack) => (
                          <pre className="twk-evidence-out" key={pack.pack_hash}>
                            {t.evidenceHash}: {pack.pack_hash}
                            {'\n'}
                            {JSON.stringify(pack.manifest, null, 2)}
                          </pre>
                        ))
                      )
                    ) : null}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="twk-admin-page twk-contracts-page">
      <style>{CONTRACTS_CSS}</style>
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      <div className="twk-contracts-stack">
        <section className="twk-admin-panel">
          <div className="twk-contracts-body">
            {splitRows.map((row) => (
              <p className="twk-contracts-split" key={row.term}>
                <strong>{row.term}</strong>
                <span>{row.desc}</span>
              </p>
            ))}
            <p className="twk-contracts-status"><code>{t.statusLine}</code></p>
            <p>{t.artifactsIntro}</p>
            <ol className="twk-contracts-artifacts">
              {ARTIFACTS.map((name) => <li key={name}><code>{name}</code></li>)}
            </ol>
            <p className="twk-contracts-note">{t.honestNote}</p>
            <nav className="twk-contracts-links">
              <Link href={`/${locale}${t.runsHref}`}>{t.runsLink}</Link>
              <Link href={`/${locale}${t.articleHref}`}>{t.articleLink}</Link>
            </nav>
          </div>
        </section>

        {building ? (
          <ContractBuilder
            onCancel={() => setBuilding(false)}
            onCreated={(id) => {
              setBuilding(false);
              list.reload();
              openContract(id);
            }}
          />
        ) : null}

        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head">
            <div><h2>{t.listTitle}</h2></div>
            {!building ? (
              <button type="button" className="twk-primary-button"
                      onClick={() => setBuilding(true)}>{t.newContract}</button>
            ) : null}
          </header>
          <p className="twk-panel-copy">{t.listCopy}</p>

          {list.loading ? <WsSnippet kind="table" rows={3} /> : null}
          {list.error ? <WsError message={list.error} onRetry={list.reload} /> : null}
          {detailError ? <WsError message={detailError} onRetry={() => setDetailError(null)} /> : null}
          {detailLoading ? <WsSnippet kind="table" rows={2} /> : null}

          {list.data && list.data.contracts.length === 0 ? (
            <WsEmpty title={t.emptyTitle} copy={t.emptyCopy} />
          ) : null}

          {list.data && list.data.contracts.length > 0 ? (
            <div className="twk-contract-rows">
              {list.data.contracts.map((row: ContractListRow) => (
                <button
                  type="button"
                  className="twk-contract-row"
                  key={row.id}
                  onClick={() => openContract(row.id)}
                >
                  <span className="twk-contract-goal">
                    <strong>{row.goal}</strong>
                    <small>{STATUS_LABEL[row.status] || row.status} · v{row.version}</small>
                  </span>
                  <span className="twk-contract-cell"><code>{shortHash(row.contract_hash)}</code></span>
                  <span className="twk-contract-cell">
                    {row.budget.max_usd != null ? `$${row.budget.max_usd}` : t.none}
                  </span>
                  <span className="twk-contract-cell">
                    {row.latest_run_status ? (
                      <span className={`twk-run-chip is-${RUN_TONE[row.latest_run_status] || 'busy'}`}>
                        {row.latest_run_status}
                      </span>
                    ) : `${row.run_count} ${t.colRuns.toLowerCase()}`}
                  </span>
                  <span className="twk-contract-cell">{formatDate(row.created_at)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <Link className="twk-contracts-cta" href={`/${locale}${t.runsHref}`}>
          <WorkspaceIcon name="file" />
          <strong>{t.runsLink}</strong>
          <WorkspaceIcon name="chevron" />
        </Link>
      </div>
    </div>
  );
}
