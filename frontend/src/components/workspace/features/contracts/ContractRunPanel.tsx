'use client';

/**
 * Run an approved contract on the user's own provider key.
 *
 * This is the first place in the product where a click spends someone's money,
 * so it is deliberately two steps and says the amount out loud. The model is
 * chosen from the contract's own `allowed_models` — anything else is refused
 * by `enforce.check_model` and would only produce a blocked run.
 *
 * An `Idempotency-Key` is generated per attempt and reused across retries of
 * that attempt: a double-click, or a retry after a lost response, must return
 * the run that already happened instead of buying the same answer twice
 * (plans/tvijo_astra_biba_ai-os §8).
 *
 * Spec: bibamoney-backend/specs/2026-09-contract-executor.md §4.C
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import type { ContractDetail, ContractRunResult } from '@/types/workspace';

type Props = {
  contract: ContractDetail;
  onFinished: () => void;
};

/** Distinct per attempt; stable across retries of the same attempt. */
function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ContractRunPanel({ contract, onFinished }: Props) {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).contracts;

  const models = contract.payload.allowed_models || [];
  const budget = contract.payload.budget;

  const [confirming, setConfirming] = useState(false);
  const [model, setModel] = useState(models[0] || '');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ContractRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Held across retries so a second attempt at the *same* run does not pay
  // twice; cleared once the run has finished.
  const [attemptKey, setAttemptKey] = useState<string>(newIdempotencyKey);

  const start = async () => {
    if (!model) return;
    setBusy(true);
    setError(null);
    try {
      const run = await workspaceApi.createContractRun(contract.id, model, attemptKey);
      setResult(run);
      setConfirming(false);
      setAttemptKey(newIdempotencyKey());
      onFinished();
    } catch (err) {
      // The key is intentionally NOT rotated here: if the request reached the
      // server and only the response was lost, retrying with the same key
      // returns that run rather than starting a second paid one.
      setError(err instanceof Error ? err.message : t.loadFailed);
    } finally {
      setBusy(false);
    }
  };

  const verdict = (): string | null => {
    if (!result) return null;
    if (result.status === 'passed') return t.runResultPassed;
    if (result.status === 'rework') return t.runResultRework;
    if (result.status === 'blocked') return t.runResultBlocked;
    return t.runResultUnfinished;
  };

  if (models.length === 0) return null;

  return (
    <section className="twk-run-panel">
      <header>
        <strong>{t.runTitle}</strong>
        <p>{t.runIntro}</p>
      </header>

      {!confirming ? (
        <button type="button" className="twk-primary-button"
                onClick={() => setConfirming(true)}>
          {t.runTitle}
        </button>
      ) : (
        <div className="twk-run-confirm">
          <label>
            <span>{t.runModelLabel}</span>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {models.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          </label>
          <p className="twk-run-warning">{t.runSpendWarning}</p>
          <div className="twk-run-actions">
            <button type="button" className="twk-primary-button"
                    disabled={busy || !model} onClick={() => void start()}>
              {busy ? t.runStarting : `${t.runConfirm} $${budget?.max_usd ?? '?'}`}
            </button>
            <button type="button" className="twk-secondary-button"
                    disabled={busy} onClick={() => setConfirming(false)}>
              {t.runCancel}
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div className="twk-data-error" role="alert">
          <p>{error}</p>
          {/* The one failure a user can act on themselves. */}
          {error.toLowerCase().includes('openrouter') ? (
            <p>
              <Link href={`/${locale}/workspace/connections`}>{t.runNoKey}</Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <div className="twk-run-result" role="status">
          <strong>{verdict()}</strong>
          <dl>
            <div><dt>{t.runCost}</dt><dd>${result.cost_usd}</dd></div>
            <div><dt>{t.runTokens}</dt><dd>{result.tokens ?? t.none}</dd></div>
            <div>
              <dt>{t.runAcceptance}</dt>
              <dd>{result.acceptance_total
                ? `${result.acceptance_passed}/${result.acceptance_total}`
                : t.none}</dd>
            </div>
          </dl>
          {result.errors?.length ? (
            <p className="twk-run-reason">
              {result.errors.map((e) => `${e.code}: ${e.message}`).join(' · ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
