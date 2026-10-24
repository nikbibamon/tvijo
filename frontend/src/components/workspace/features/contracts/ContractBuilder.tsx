'use client';

/**
 * The five-screen contract builder (plans/0409 Phase 6).
 *
 * Without it `/workspace/contracts` was honest and permanently empty: nothing
 * in the product could produce a contract, so the list said "no contracts yet"
 * to every user forever.
 *
 * Two constraints shape this component:
 *
 * 1. **It may only offer what the backend honours.** Acceptance rules, tools,
 *    forbidden actions and gates all come from `GET /contracts/tools/`, which
 *    is built from `evaluator.RULES` and `enforce.check_action`. Models come
 *    from providers the user actually has a key for. Offering a rule nobody
 *    implements would push every run into `rework`, because `evaluate()` fails
 *    unknown rules closed.
 * 2. **The hash it previews must be the hash the server stores.** The payload
 *    is canonicalised and hashed in the browser with the same algorithm as
 *    `apps/contracts/hash.py`, and the review step shows both. Money follows
 *    the frozen number rule — whole amounts as integers, fractional as strings
 *    — because `3` and `3.0` hash differently.
 *
 * The builder stops at freezing. There is no "run" action, because
 * `complete_under_contract` in apps/ai/contract_router.py has no callers: a run
 * created today would sit at `running` forever.
 *
 * Spec: bibamoney-backend/specs/2026-09-contract-builder-and-provider-checks.md §4.C
 */

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import {
  canonicalize,
  contractHash,
  normalizeCount,
  normalizeMoney,
} from '@/lib/contract-canonical';
import type { ContractDraft } from '@/types/workspace';

type KnowledgeRow = { ref: string; kind: string; version: string };

type Props = {
  /** Called after a contract is frozen, so the list can reload. */
  onCreated: (contractId: string) => void;
  onCancel: () => void;
};

const STEPS = 6;

export default function ContractBuilder({ onCreated, onCancel }: Props) {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).contracts;

  const catalog = useWorkspaceData(() => workspaceApi.contractCatalog(), []);
  const providers = useWorkspaceData(() => workspaceApi.modelsProviders(), []);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [expected, setExpected] = useState('');
  const [knowledge, setKnowledge] = useState<KnowledgeRow[]>([]);
  const [draftRef, setDraftRef] = useState('');
  const [draftKind, setDraftKind] = useState('registry');
  const [draftVersion, setDraftVersion] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [gates, setGates] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [maxUsd, setMaxUsd] = useState('3');
  const [maxTokens, setMaxTokens] = useState('150000');
  const [maxMinutes, setMaxMinutes] = useState('20');
  const [maxSteps, setMaxSteps] = useState('30');

  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /**
   * Only models the router will actually execute.
   *
   * An earlier version also offered every id from the AI Radar catalog, so a
   * user with an OpenAI key would not hit an empty list. That was wrong in a
   * worse way: `apps/ai/policy.py` and the OpenRouter adapter both refuse any
   * model outside OPENROUTER_ALLOWED_MODELS, so those contracts were frozen
   * un-runnable. A friendlier list that produces dead contracts is not
   * friendlier.
   *
   * `available_models` is that allowlist. The catalog count stays visible as
   * context — what exists is not what we can run.
   */
  const availableModels = useMemo(() => {
    const out: string[] = [];
    for (const provider of providers.data?.providers || []) {
      for (const model of provider.available_models || []) {
        if (!out.includes(model)) out.push(model);
      }
    }
    return out;
  }, [providers.data]);

  /** True once the user holds a credential for a provider that can execute. */
  const canExecute = useMemo(() => (providers.data?.providers || []).some(
    (p) => (p.available_models || []).length > 0
      && p.credential_status !== 'none' && p.credential_status !== 'revoked',
  ), [providers.data]);

  const [modelFilter, setModelFilter] = useState('');
  const shownModels = useMemo(() => {
    const needle = modelFilter.trim().toLowerCase();
    const matching = needle
      ? availableModels.filter((m) => m.toLowerCase().includes(needle))
      : availableModels;
    // Anything already chosen stays visible, so a filter cannot hide a
    // selection the user would then not know they made.
    const chosen = models.filter((m) => !matching.includes(m));
    return [...chosen, ...matching];
  }, [availableModels, modelFilter, models]);

  const draft: ContractDraft | null = useMemo(() => {
    const usd = normalizeMoney(maxUsd);
    const tokens = normalizeCount(maxTokens);
    const minutes = normalizeCount(maxMinutes);
    const steps = normalizeCount(maxSteps);
    if (usd === null || tokens === null || minutes === null || steps === null) return null;
    return {
      schema: 'tvijo-execution-contract/v1',
      goal: goal.trim(),
      expected_result: expected.trim(),
      approved_knowledge: knowledge,
      allowed_models: models,
      allowed_tools: tools,
      forbidden_actions: forbidden,
      budget: {
        max_usd: usd, max_tokens: tokens, max_minutes: minutes, max_steps: steps,
      },
      acceptance: rules.map((rule) => ({ rule, type: 'deterministic' as const })),
      approval_gates: gates,
      // The backend overwrites principal from the authenticated caller; this
      // placeholder only keeps the preview a valid v1 payload.
      principal: 'user:me',
      version: 1,
    };
  }, [goal, expected, knowledge, models, tools, forbidden, gates, rules,
      maxUsd, maxTokens, maxMinutes, maxSteps]);

  // Recompute the preview hash whenever the draft changes, so the review step
  // is never showing a hash for an older version of the form.
  useEffect(() => {
    let cancelled = false;
    if (step !== STEPS - 1 || !draft) { setHash(null); return undefined; }
    contractHash(draft)
      .then((value) => { if (!cancelled) setHash(value); })
      .catch(() => { if (!cancelled) setHash(null); });
    return () => { cancelled = true; };
  }, [step, draft]);

  const toggle = (list: string[], setList: (next: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const stepError = (): string | null => {
    if (step === 0) {
      if (!goal.trim()) return t.errGoal;
      if (!expected.trim()) return t.errExpected;
    }
    if (step === 2 && models.length === 0) return t.errModels;
    if (step === 3 && !draft) return t.errBudget;
    if (step === 4 && rules.length === 0) return t.errAcceptance;
    return null;
  };

  const goNext = () => {
    const problem = stepError();
    setError(problem);
    if (!problem) setStep((s) => Math.min(s + 1, STEPS - 1));
  };

  const freeze = async () => {
    if (!draft) { setError(t.errBudget); return; }
    setBusy(true);
    setError(null);
    try {
      const created = await workspaceApi.createContract(draft);
      // Freeze and approve are separate calls server-side; the user asked for
      // one action, so the approve follows immediately.
      await workspaceApi.approveContract(created.id);
      onCreated(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.createFailedContract);
    } finally {
      setBusy(false);
    }
  };

  const addKnowledge = () => {
    const ref = draftRef.trim();
    const version = draftVersion.trim();
    if (!ref || !version) return;
    setKnowledge((rows) => [...rows, { ref, kind: draftKind, version }]);
    setDraftRef('');
    setDraftVersion('');
  };

  const titles = [t.stepGoal, t.stepKnowledge, t.stepPermissions, t.stepBudget,
    t.stepAcceptance, t.stepReview];

  if (catalog.loading || providers.loading) return <WsSnippet kind="table" rows={4} />;
  if (catalog.error) return <WsError message={catalog.error} onRetry={catalog.reload} />;

  return (
    <section className="twk-admin-panel twk-builder">
      <header className="twk-admin-panel-head">
        <div>
          <p>{t.step} {step + 1} {t.of} {STEPS} · {titles[step]}</p>
          <h2>{t.builderTitle}</h2>
        </div>
      </header>

      <ol className="twk-builder-steps" aria-label={t.builderTitle}>
        {titles.map((title, index) => (
          <li key={title} className={index === step ? 'is-current' : index < step ? 'is-done' : ''}>
            {title}
          </li>
        ))}
      </ol>

      <div className="twk-builder-body">
        {step === 0 ? (
          <>
            <label className="twk-builder-field">
              <span>{t.goalLabel}</span>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
                        rows={2} placeholder={t.goalPlaceholder} />
            </label>
            <label className="twk-builder-field">
              <span>{t.expectedLabel}</span>
              <textarea value={expected} onChange={(e) => setExpected(e.target.value)}
                        rows={2} placeholder={t.expectedPlaceholder} />
            </label>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="twk-builder-intro">{t.knowledgeIntro}</p>
            {knowledge.length === 0 ? (
              <p className="twk-builder-hint">{t.knowledgeEmpty}</p>
            ) : (
              <ul className="twk-builder-rows">
                {knowledge.map((row, index) => (
                  <li key={`${row.ref}-${index}`}>
                    <code>{row.ref}</code>
                    <span>{row.kind} · v{row.version}</span>
                    <button type="button"
                            onClick={() => setKnowledge((rows) => rows.filter((_, i) => i !== index))}>
                      {t.knowledgeRemove}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="twk-builder-inline">
              <label><span>{t.knowledgeRef}</span>
                <input value={draftRef} onChange={(e) => setDraftRef(e.target.value)}
                       placeholder="kb:article:openrouter-models" />
              </label>
              <label><span>{t.knowledgeKind}</span>
                <input value={draftKind} onChange={(e) => setDraftKind(e.target.value)} />
              </label>
              <label><span>{t.knowledgeVersion}</span>
                <input value={draftVersion} onChange={(e) => setDraftVersion(e.target.value)}
                       placeholder="2026-09-07" />
              </label>
              <button type="button" className="twk-secondary-button" onClick={addKnowledge}>
                {t.knowledgeAdd}
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="twk-builder-intro">{t.permissionsIntro}</p>
            <fieldset className="twk-builder-group">
              <legend>{t.modelsLabel}</legend>
              {availableModels.length === 0 ? (
                <p className="twk-builder-hint">{t.modelsEmpty}</p>
              ) : (
                <>
                  {availableModels.length > 8 ? (
                    <input className="twk-builder-filter" value={modelFilter}
                           onChange={(e) => setModelFilter(e.target.value)}
                           placeholder={t.modelsFilter} aria-label={t.modelsFilter} />
                  ) : null}
                  <div className="twk-builder-scroll">
                    {shownModels.map((model) => (
                      <label className="twk-builder-check" key={model}>
                        <input type="checkbox" checked={models.includes(model)}
                               onChange={() => toggle(models, setModels, model)} />
                        <code>{model}</code>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {availableModels.length > 0 && !canExecute ? (
                <p className="twk-builder-hint">{t.modelsNoKey}</p>
              ) : null}
              <p className="twk-builder-hint">{t.modelsRunnableNote}</p>
            </fieldset>
            <fieldset className="twk-builder-group">
              <legend>{t.toolsLabel}</legend>
              {(catalog.data?.tools || []).map((tool) => (
                <label className="twk-builder-check" key={tool.id}>
                  <input type="checkbox" checked={tools.includes(tool.id)}
                         onChange={() => toggle(tools, setTools, tool.id)} />
                  <code>{tool.id}</code>
                  {tool.side_effect ? <small>{t.sideEffect}</small> : null}
                </label>
              ))}
            </fieldset>
            <fieldset className="twk-builder-group">
              <legend>{t.forbiddenLabel}</legend>
              {(catalog.data?.forbidden_actions || []).map((action) => (
                <label className="twk-builder-check" key={action.id}>
                  <input type="checkbox" checked={forbidden.includes(action.id)}
                         onChange={() => toggle(forbidden, setForbidden, action.id)} />
                  <code>{action.id}</code>
                </label>
              ))}
            </fieldset>
            <fieldset className="twk-builder-group">
              <legend>{t.gatesLabel}</legend>
              {(catalog.data?.approval_gates || []).map((gate) => (
                <label className="twk-builder-check" key={gate.id}>
                  <input type="checkbox" checked={gates.includes(gate.id)}
                         onChange={() => toggle(gates, setGates, gate.id)} />
                  <code>{gate.id}</code>
                </label>
              ))}
            </fieldset>
            <p className="twk-builder-hint">{t.enforcementNote}</p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="twk-builder-intro">{t.budgetIntro}</p>
            <div className="twk-builder-inline">
              <label><span>{t.budgetUsd}</span>
                <input value={maxUsd} onChange={(e) => setMaxUsd(e.target.value)} inputMode="decimal" />
              </label>
              <label><span>{t.budgetTokens}</span>
                <input value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} inputMode="numeric" />
              </label>
              <label><span>{t.budgetMinutes}</span>
                <input value={maxMinutes} onChange={(e) => setMaxMinutes(e.target.value)} inputMode="numeric" />
              </label>
              <label><span>{t.budgetSteps}</span>
                <input value={maxSteps} onChange={(e) => setMaxSteps(e.target.value)} inputMode="numeric" />
              </label>
            </div>
            <p className="twk-builder-hint">{t.moneyRule}</p>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p className="twk-builder-intro">{t.acceptanceIntro}</p>
            <fieldset className="twk-builder-group">
              <legend>{t.fieldAcceptance}</legend>
              {(catalog.data?.acceptance_rules || []).map((rule) => (
                <label className="twk-builder-check" key={rule.id}>
                  <input type="checkbox" checked={rules.includes(rule.id)}
                         onChange={() => toggle(rules, setRules, rule.id)} />
                  <code>{rule.id}</code>
                </label>
              ))}
            </fieldset>
            <p className="twk-builder-hint">{t.acceptanceOnlyThese}</p>
          </>
        ) : null}

        {step === 5 && draft ? (
          <>
            <p className="twk-builder-intro">{t.reviewIntro}</p>
            <pre className="twk-builder-json">{canonicalize(draft)}</pre>
            <dl className="twk-builder-hash">
              <dt>{t.reviewHash}</dt>
              <dd><code>{hash || '…'}</code></dd>
            </dl>
            <p className="twk-builder-hint">{t.reviewHashNote}</p>
          </>
        ) : null}

        {error ? <div className="twk-data-error" role="alert"><p>{error}</p></div> : null}
      </div>

      <footer className="twk-builder-actions">
        <button type="button" className="twk-secondary-button" onClick={onCancel}>
          {t.cancel}
        </button>
        <span className="twk-builder-spacer" />
        {step > 0 ? (
          <button type="button" className="twk-secondary-button"
                  onClick={() => { setError(null); setStep((s) => s - 1); }}>
            {t.back}
          </button>
        ) : null}
        {step < STEPS - 1 ? (
          <button type="button" className="twk-primary-button" onClick={goNext}>
            {t.next}
          </button>
        ) : (
          <button type="button" className="twk-primary-button" disabled={busy || !draft}
                  onClick={() => void freeze()}>
            {busy ? t.freezing : t.freeze}
          </button>
        )}
      </footer>
    </section>
  );
}
