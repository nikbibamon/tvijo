'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import { WsBudgetError, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';

function displayMoney(currency: string, value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return `${currency} ${amount.toFixed(amount > 0 && amount < 1 ? 4 : 2)}`;
}

export default function WorkspaceBillingLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).billing;
  const summary = useWorkspaceData(() => workspaceApi.billingSummary(), []);
  const ledger = useWorkspaceData(() => workspaceApi.billingTransactions(), []);
  const [tab, setTab] = useState<'charges' | 'credits'>('charges');
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const saveBudget = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nullable = (name: string) => String(form.get(name) || '').trim() || null;
    setSaving(true);
    setFormError(null);
    try {
      await workspaceApi.updateBudgetPolicy({
        daily_limit: nullable('daily_limit'),
        monthly_limit: nullable('monthly_limit'),
        per_request_limit: nullable('per_request_limit'),
        warning_ratio: String(form.get('warning_ratio') || '0.80'),
        hard_stop: form.get('hard_stop') === 'on',
      });
      summary.reload();
      setBudgetOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (summary.loading) return <div className="twk-billing-page"><WsSnippet kind="metrics" rows={3} /></div>;
  if (summary.errorCode === 'budget_exceeded') return <div className="twk-billing-page"><WsBudgetError message={summary.error || ''} onRetry={summary.reload} /></div>;
  if (summary.error || !summary.data) return <div className="twk-billing-page"><WsError message={summary.error || getWorkspaceCopy(locale).global.loadFailed} onRetry={summary.reload} /></div>;

  const data = summary.data;
  const policy = data.budget_policy;
  const budgetLabel = policy?.monthly_limit ? `${data.currency} ${policy.monthly_limit}${t.month}` : policy?.daily_limit ? `${data.currency} ${policy.daily_limit}${t.day}` : t.addBoundary;

  return (
    <div className="twk-billing-page">
      <header className="twk-v2-heading">
        <div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div>
        <button className="twk-primary-button" type="button" onClick={() => setBudgetOpen(true)}><WorkspaceIcon name="wallet" />{t.setBudget}</button>
      </header>

      <section className="twk-billing-summary-grid">
        <article>
          <span className="twk-summary-icon"><WorkspaceIcon name="activity" /></span>
          <div>
            <p>{t.providerUsage}</p>
            <strong>{displayMoney(data.currency, data.measured_spend)}</strong>
            <small>{t.measuredPaid}</small>
            {/* Split, never one number: on a BYOK account most of this is
                money the provider billed the customer directly, and merging
                the two tells them Tvijo's spend is theirs. */}
            <dl className="twk-spend-split">
              <div><dt>{t.byokSpend}</dt><dd>{displayMoney(data.currency, data.byok_spend)}</dd><small>{t.byokSpendNote}</small></div>
              <div><dt>{t.platformSpend}</dt><dd>{displayMoney(data.currency, data.platform_spend)}</dd><small>{t.platformSpendNote}</small></div>
            </dl>
          </div>
          <Link href={`/${locale}/workspace/activity`}>{t.details}</Link>
        </article>
        <article><span className="twk-summary-icon"><WorkspaceIcon name="billing" /></span><div><p>{t.tvijoCharges}</p><strong>{ledger.loading ? '—' : ledger.data?.ledger_available ? t.seeLedger : formatTemplate(t.zero, { currency: data.currency })}</strong><small>{ledger.data?.ledger_available ? t.recordedInLedger : t.noPaymentLedger}</small></div></article>
        <article><span className="twk-summary-icon"><WorkspaceIcon name="shield" /></span><div><p>{t.budgetPolicy}</p><strong>{budgetLabel}</strong><small>{policy?.hard_stop ? t.hardStopEnabled : policy ? t.warningActive : t.addBoundary}</small></div><button type="button" onClick={() => setBudgetOpen(true)}>{t.edit}</button></article>
      </section>

      <section className="twk-billing-flow">
        <header><p className="twk-eyebrow">{t.flowEyebrow}</p><h2>{t.howBillingWorks}</h2></header>
        <div className="twk-billing-lanes">
          <article><span>1</span><WorkspaceIcon name="activity" /><strong>{t.stepProviderCalls}</strong><p>{t.stepProviderCopy}</p></article>
          <i><WorkspaceIcon name="arrow" /></i>
          <article><span>2</span><WorkspaceIcon name="layers" /><strong>{t.stepTvijoServices}</strong><p>{t.stepTvijoCopy}</p></article>
          <i><WorkspaceIcon name="arrow" /></i>
          <article><span>3</span><WorkspaceIcon name="server" /><strong>{t.stepManagedCompute}</strong><p>{t.stepManagedCopy}</p></article>
          <i><WorkspaceIcon name="arrow" /></i>
          <article><span>4</span><WorkspaceIcon name="network" /><strong>{t.stepDomains}</strong><p>{t.stepDomainsCopy}</p></article>
        </div>
      </section>

      <div className="twk-billing-lower-grid">
        <section className="twk-v2-panel twk-ledger-panel">
          <header><div><p className="twk-eyebrow">{t.ledgerEyebrow}</p><h2>{t.chargesCredits}</h2></div></header>
          <div className="twk-ledger-tabs" role="tablist" aria-label={t.chargesCredits}><button className={tab === 'charges' ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === 'charges'} onClick={() => setTab('charges')}>{t.charges}</button><button className={tab === 'credits' ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === 'credits'} onClick={() => setTab('credits')}>{t.credits}</button></div>
          {tab === 'charges' ? (
            ledger.loading ? <WsSnippet kind="table" rows={3} /> : ledger.error ? <WsError message={ledger.error} onRetry={ledger.reload} /> : (
              <div className="twk-ledger-empty"><WorkspaceIcon name="billing" /><strong>{t.noChargesTitle}</strong><p>{t.noChargesCopy}</p></div>
            )
          ) : (
            <div className="twk-ledger-empty"><WorkspaceIcon name="wallet" /><strong>{t.noCreditsTitle}</strong><p>{t.noCreditsCopy}</p></div>
          )}
        </section>

        <aside className="twk-managed-service-card">
          <span className="twk-summary-icon"><WorkspaceIcon name="server" /></span><p className="twk-eyebrow">{t.managedEyebrow}</p><h2>{t.infrastructure}</h2><p>{t.managedCopy}</p><ul><li><WorkspaceIcon name="check" />{t.manageBenefitQuote}</li><li><WorkspaceIcon name="check" />{t.manageBenefitNoAuto}</li><li><WorkspaceIcon name="check" />{t.manageBenefitPricing}</li></ul><Link className="twk-secondary-button" href={`/${locale}/workspace/infrastructure`}>{t.exploreInfra} <WorkspaceIcon name="arrow" /></Link>
        </aside>
      </div>

      {data.unpriced_calls > 0 ? (
        <p className="twk-billing-unpriced" role="note">
          <WorkspaceIcon name="info" />{' '}
          {formatTemplate(t.unpricedNote, { count: data.unpriced_calls })}
        </p>
      ) : null}

      <p className="twk-billing-separation"><WorkspaceIcon name="info" /> {t.separationNote}</p>

      {budgetOpen ? (
        <div className="twk-modal-layer" role="presentation" onMouseDown={() => setBudgetOpen(false)}>
          <section className="twk-budget-dialog" role="dialog" aria-modal="true" aria-labelledby="budget-title" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><p className="twk-eyebrow">{t.dialogEyebrow}</p><h2 id="budget-title">{t.setBudgetPolicy}</h2><p>{t.dialogSub}</p></div><button type="button" aria-label={t.dialogCloseAria} onClick={() => setBudgetOpen(false)}><WorkspaceIcon name="x" /></button></header>
            <form onSubmit={saveBudget}>
              <div className="twk-budget-fields"><label>{formatTemplate(t.dailyLimit, { currency: data.currency })}<input name="daily_limit" type="number" min="0" step="0.0001" defaultValue={policy?.daily_limit || ''} placeholder={t.optional} /></label><label>{formatTemplate(t.monthlyLimit, { currency: data.currency })}<input name="monthly_limit" type="number" min="0" step="0.0001" defaultValue={policy?.monthly_limit || ''} placeholder={t.optional} /></label><label>{formatTemplate(t.perRequestLimit, { currency: data.currency })}<input name="per_request_limit" type="number" min="0" step="0.0001" defaultValue={policy?.per_request_limit || ''} placeholder={t.optional} /></label><label>{t.warnAt}<select name="warning_ratio" defaultValue={policy?.warning_ratio || '0.80'}><option value="0.50">50%</option><option value="0.75">75%</option><option value="0.80">80%</option><option value="0.90">90%</option></select></label></div>
              <label className="twk-checkbox-row"><input name="hard_stop" type="checkbox" defaultChecked={policy?.hard_stop || false} /><span><strong>{t.enableHardStop}</strong><small>{t.hardStopHelp}</small></span></label>
              {formError ? <p className="twk-form-error" role="alert">{formError}</p> : null}
              <footer><button className="twk-secondary-button" type="button" onClick={() => setBudgetOpen(false)}>{t.cancel}</button><button className="twk-primary-button" type="submit" disabled={saving}>{saving ? t.saving : t.savePolicy}</button></footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
