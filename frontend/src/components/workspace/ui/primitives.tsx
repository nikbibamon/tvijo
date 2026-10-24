'use client';

/**
 * Workspace data-surface UI primitives (ТЗ §8): every data surface needs
 * skeleton, zero-state, recoverable error + retry.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

export function WsSnippet({ kind = 'table', rows = 4 }: { kind?: string; rows?: number }) {
  const t = getWorkspaceCopy(parseLocale(usePathname())).global;
  return (
    <div className="twk-data-skeleton" role="status" aria-label={t.loadingDataAria}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`twk-data-skeleton-row is-${kind}`} />
      ))}
    </div>
  );
}

export function WsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = getWorkspaceCopy(parseLocale(usePathname())).global;
  return (
    <div className="twk-data-error" role="alert">
      <p>{message || t.loadFailed}</p>
      <button type="button" onClick={onRetry}>{t.retry}</button>
    </div>
  );
}

/**
 * The error surface for a run the backend refused on budget.
 *
 * Rendered as a generic failure with a Retry button it reads as an outage and
 * invites the one action that cannot work: the cap will refuse the retry too.
 * This states the limit and points at the control that changes it.
 */
export function WsBudgetError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).global;
  return (
    <div className="twk-data-error is-budget" role="alert">
      <p>
        <strong>{t.budgetExceededTitle}</strong>
        {message ? ` — ${message}` : null}
      </p>
      <Link href={`/${locale}/workspace/billing`}>{t.budgetExceededAction}</Link>
      {onRetry ? <button type="button" onClick={onRetry}>{t.retry}</button> : null}
    </div>
  );
}

export function WsEmpty({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className="twk-data-empty">
      <strong>{title}</strong>
      {copy ? <span>{copy}</span> : null}
    </div>
  );
}

export function MetricCard({
  label, value, detail, tone = 'neutral',
}: { label: string; value: ReactNode; detail?: string; tone?: string }) {
  const cls = ['twk-kpi-card', tone && tone !== 'neutral' ? `is-${tone}` : '']
    .filter(Boolean).join(' ');
  return (
    <article className={cls}>
      <p className="twk-kpi-label">{label}</p>
      <strong className="twk-kpi-value">{value}</strong>
      {detail ? <span className="twk-kpi-detail">{detail}</span> : null}
    </article>
  );
}
