import Link from 'next/link';
import record from '@/data/experiments/tvijo-programme-v3-20261110.en.json';

const link = 'text-cyan-300 underline underline-offset-4 hover:text-cyan-200';
const states: Record<string, string> = {
  COMPLETED: 'Completed turn; acceptance unknown',
  FAILED: 'Failed: max tokens',
  OPERATOR_STOPPED: 'Operator stopped',
  UNKNOWN_OR_IN_FLIGHT: 'Unknown or in flight',
};
const observations = record.attempt_observations;
const count = (state: string) => observations.filter(row => row.execution_state === state).length;
const download = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(record, null, 2))}`;

/** Server-rendered public projection; no provider, CMS or measurement calls. */
export default function ProgrammeEvidence({ summary = false }: { summary?: boolean }) {
  return <section id="programme-v3" aria-labelledby="programme-v3-title" className="mt-10 min-w-0 scroll-mt-28 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.04] p-5 text-slate-300 sm:p-8">
    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Local fixture evidence · {record.observed_on}</p>
    <h2 id="programme-v3-title" className="mt-3 text-2xl font-semibold text-white">What our local harness trials establish</h2>
    <p className="mt-4 leading-7">{record.author_disclosure} This engineering pilot covers local T1/T2/T3 fixtures, not SWE-bench or Terminal-Bench. This versioned reconciliation retains <strong className="text-amber-200">unknown task costs and acceptance</strong>. A completed worker turn does not establish independently accepted work.</p>
    <p className="mt-3 leading-7">Provider exports reconcile to USD {record.provider_export_total_usd.replace(/(\.\d{9})0+$/, '$1')} across two nonoverlapping account/key windows. This is neither a task cost nor an invoice or campaign settlement. Task-attributed cost, independent acceptance and allocated subscription seat cost remain unknown (null).</p>
    <p className="mt-3 leading-7">Configuration identity is partial. Returned names and aliases do not attest the model, provider or harness revision. Exact settings and exact patch attribution are unavailable for these observations. No quality index, ranking, stable multiplier or savings guarantee follows.</p>
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
      <Link className={link} href={summary ? '/en/compare/experiments#programme-v3' : '/en/compare/methodology#programme-v3'}>{summary ? 'Read the attempt record and redacted evidence' : 'Read the methodology and limits'}</Link>
      <a className={link} href={download} download="tvijo-programme-v3-20261110.en.json">Download the reconciliation record (JSON)</a>
    </div>
    {!summary && <>
      <p className="mt-5 break-words text-sm">Canonical experiment ID: <code>{record.experiment_id}</code>. This is a source-linked copy, separate from the Atlas proposals: no measured snapshot was imported.</p>
      <h3 className="mt-6 text-lg font-semibold text-white">Attempt observations, with explicit denominators</h3>
      <p className="mt-3 text-sm leading-7">Of {observations.length} recorded observations: {count('COMPLETED')} completed turns, {count('FAILED')} failed attempts, {count('OPERATOR_STOPPED')} operator-stopped attempt and {count('UNKNOWN_OR_IN_FLIGHT')} unknown/in-flight snapshot. Independent acceptance is unknown for all {observations.length}/{observations.length}; this is not a success rate or a sample of independent tasks. Paid retries remain separate. Usage representations are stream/final copies, not extra responses.</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">{Object.entries(record.task_families).map(([id, task]) => <div key={id} className="min-w-0 rounded-lg border border-white/10 p-3"><dt className="font-semibold text-white">{id} · local fixture</dt><dd className="mt-1 leading-6">{task}</dd></div>)}</dl>
      <div className="mt-4 max-w-full overflow-x-auto" role="region" aria-label="Attempt observation table" tabIndex={0}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Nine observations; execution status is distinct from independent acceptance and cost.</caption>
          <thead className="text-slate-100"><tr><th className="p-3">Attempt / evidence</th><th className="p-3">Execution state</th><th className="p-3">Provider responses</th><th className="p-3">Usage representations</th><th className="p-3">Accepted / task USD</th></tr></thead>
          <tbody>{observations.map(row => <tr key={row.attempt_id} className="border-t border-white/10"><th scope="row" className="break-words p-3 font-medium"><a className={link} href={`#evidence-${row.attempt_id}`}>{row.attempt_id}</a></th><td className="p-3">{states[row.execution_state]}</td><td className="p-3">{row.identified_provider_responses}</td><td className="p-3">{row.usage_representations}</td><td className="p-3">Unknown / unknown</td></tr>)}</tbody>
        </table>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">The patched T3 summary is unverified</h3>
      <p className="mt-3 text-sm leading-7">The supplied report claims {record.reported_patched_T3_claim.model_calls} calls, {record.reported_patched_T3_claim.wall_seconds} seconds, USD {record.reported_patched_T3_claim.reported_cost_usd} and {record.reported_patched_T3_claim.reported_gold_cases} gold cases. These are reported, UNVERIFIED figures. The frozen completed-turn journal has 102 responses; another unfinished snapshot has 139. Their correspondence to the exact attempt and patch is missing. The original released T3 was operator-stopped. No second-place claim is established.</p>
      <details className="mt-6 rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer font-semibold text-white">Redacted evidence references and source provenance</summary>
        <p className="mt-3 text-sm leading-7">These accessible excerpts come from the versioned record. Hashes identify retained private sources; the raw journals and billing exports are withheld. These summaries are not independent verification or an invoice. No prompts, credentials, customer records or third-party benchmark rows are distributed.</p>
        <p className="mt-3 break-all text-xs">Canonical source SHA-256: <code>{record._provenance.source_sha256}</code></p>
        <ul className="mt-4 space-y-4 text-sm">{observations.map(row => <li id={`evidence-${row.attempt_id}`} key={row.attempt_id} className="scroll-mt-28"><p className="font-semibold text-white">{row.attempt_id} · REDACTED journal excerpt</p><p>{states[row.execution_state]}; {row.identified_provider_responses} response identities; {row.usage_representations} usage representations; independent acceptance and attributed USD: null.</p><p className="mt-1 break-all font-mono text-xs">SHA-256 {row.source_sha256}</p></li>)}</ul>
        <ul className="mt-4 space-y-3 text-sm">{record.provider_export_windows.map(window => <li key={window.start_utc} className="break-words">REDACTED export: <time>{window.start_utc}</time> to <time>{window.end_utc}</time>; USD {window.exported_paid_total.USD}; pricing delta {window.unit_price_reconciliation_delta}. Price export SHA-256: <code className="break-all text-xs">{window.price_export_sha256}</code>.</li>)}</ul>
        <p className="mt-4 text-sm leading-7">Original journals identify {record.original_dshrem_identified_requests} responses against {record.original_dshrem_key_window_requests} requests in their key window: {record.unattributed_key_window_requests} request remains unattributed. This original scope excludes later patched attempts. Overlapping export revisions are not additive; equal token counts do not identify a retry.</p>
      </details>
      <h3 className="mt-6 text-lg font-semibold text-white">When this record cannot answer your question</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{record.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
      <p className="mt-4 text-sm leading-7">Subscription execution consumes a paid seat and quota; a zero marginal API invoice is not free API work. Earlier closed campaigns retain their own scopes. This record does not establish production readiness, a new integrity proof or final independent acceptance.</p>
    </>}
  </section>;
}
