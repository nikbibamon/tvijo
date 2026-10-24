/**
 * Visible status for a marketing claim: shipped code, pilot work, or design.
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §3.
 *
 * Server component — the funnel pages are static. A capability rendered without
 * one of these badges is a page bug, not a styling choice.
 */

import {
  CLAIM_STATUS_LABEL,
  type ClaimStatus,
  type SolutionLocale,
} from '@/data/solutions';

const STYLES: Record<ClaimStatus, string> = {
  live: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  pilot: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  design: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
};

export default function ClaimStatusBadge({
  status,
  lang,
}: {
  status: ClaimStatus;
  lang: SolutionLocale;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${STYLES[status]}`}
    >
      {CLAIM_STATUS_LABEL[status][lang]}
    </span>
  );
}
