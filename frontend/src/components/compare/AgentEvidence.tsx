import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { agentEvidence as evidence } from '@/data/compare';

export const evidencePairs = evidence.pairs;
export type EvidencePair = (typeof evidence.pairs)[number];
const link = 'text-blue-300 underline decoration-blue-400/40 underline-offset-4 hover:text-blue-200';
const panel = 'rounded-2xl border border-white/10 bg-white/[0.03] p-6';

export function SourceLinks({ ids }: { ids: string[] }) {
  return <span className="flex flex-wrap gap-x-3 gap-y-2 text-sm">{ids.map((id) => {
    const source = evidence.sources.find((s) => s.id === id);
    if (!source) throw new Error(`Missing evidence source: ${id}`);
    return source.url ? <a key={id} className={link} href={source.url}>{id}: {source.title}</a>
      : <span key={id} className="text-slate-400">{id}: {source.title} (operator evidence; private artifacts)</span>;
  })}</span>;
}

export function EvidenceStatus() {
  return <aside className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/5 p-5 text-sm leading-7 text-slate-300">
    <p className="font-semibold text-amber-200">What the DSHREM evidence establishes</p>
    <p>{evidence.products.find((p) => p.id === 'dshrem')!.capability} Systemwide activation remains blocked. Isolated native acceptance does not establish a production swarm.</p>
    <p className="mt-2 text-slate-400">Checked {evidence.checked_on} · External = official documentation or studies. Own = operator acceptance evidence. Hypothesis = an evaluation proposal.</p>
    <SourceLinks ids={['OWN01','OWN02']} />
  </aside>;
}

export function EvidenceFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 text-slate-300 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm"><Link className={link} href="/en/compare">Compare</Link><span className="mx-2">/</span><span>Agent evidence</span></nav>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Choose by workflow · checked {evidence.checked_on}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8">{intro}</p>
      {children}
      <div className="mt-12 flex flex-wrap gap-5 border-t border-white/10 pt-8">
        <Link href="/en/compare/methodology" className={link}>Read the comparison methodology</Link>
        <Link href={evidence.cta.url} className={link}>{evidence.cta.label} →</Link>
      </div>
      <p className="mt-6 text-xs text-slate-400">{evidence.reviewer} · Review by {evidence.fresh_until}</p>
    </main>
    <Footer />
  </div>;
}

export function AgentOverview() {
  return <section className="mt-12" aria-labelledby="agent-catalogue">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs uppercase tracking-widest text-blue-300">Agent workflows</p><h2 id="agent-catalogue" className="mt-2 text-3xl font-semibold text-white">Choose the layer you need</h2></div>
      <Link className={link} href="/en/compare/methodology">Sources & methodology →</Link>
    </div>
    <p className="mt-4 max-w-3xl leading-7 text-slate-300">A ready agent can work in a repository. An SDK supplies building blocks. An orchestrator coordinates state and execution. The matrix describes fit; decisions are hypotheses for evaluation, without a universal ranking.</p>
    <EvidenceStatus />
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{evidence.pairs.map((p) => <Link href={`/en/compare/${p.slug}`} key={p.slug} className={`${panel} transition hover:border-blue-300/40`}><h3 className="text-xl font-semibold text-white">{p.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{p.fit}</p><span className="mt-4 block text-sm text-blue-300">Read fit, evidence and limits →</span></Link>)}</div>
    <p className="mt-8 text-sm text-slate-400" id="matrix-help">Nine products · current observed versions, not historical benchmark versions. Null values appear as “Unreported”. On small screens, scroll the table horizontally.</p>
    <div className="mt-3 max-w-full overflow-x-auto rounded-2xl border border-white/10 focus-visible:outline focus-visible:outline-blue-300" role="region" aria-label="Agent and framework comparison matrix" aria-describedby="matrix-help" tabIndex={0}>
      <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Agent, harness, SDK and orchestration fit as of {evidence.checked_on}</caption>
        <thead className="bg-white/5 text-white"><tr>{['Product / layer / version','Connection & verified use','Limits & decision','Sources'].map((t) => <th key={t} scope="col" className="p-5 align-top">{t}</th>)}</tr></thead>
        <tbody>{evidence.products.map((p) => <tr className="border-t border-white/10" key={p.id}>
          <th scope="row" className="p-5 align-top font-normal"><strong className="block text-base text-white">{p.name}</strong><span className="mt-2 block text-blue-200">{p.category}</span><span className="mt-3 block text-slate-300">{p.version ?? 'Unreported version'}</span><span className="mt-1 block text-slate-400">License: {p.license ?? 'Unreported'}</span><span className="mt-3 block text-xs uppercase tracking-wider text-slate-400">{p.classification} · {p.checked_on}</span></th>
          <td className="p-5 align-top leading-6 text-slate-300"><p>{p.connection}</p><p className="mt-3">{p.capability}</p></td>
          <td className="p-5 align-top leading-6 text-slate-300"><p>{p.limitation}</p><p className="mt-4 font-semibold text-emerald-200">{p.decision} · hypothesis</p><p className="mt-1">{p.decision_reason}</p></td>
          <td className="break-words p-5 align-top"><SourceLinks ids={p.source_ids} /></td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-5 text-sm leading-7 text-slate-400">{evidence.cost_policy} No additional integration is selected now. Aider is the sole candidate for a future isolated experiment after a measurable gap is defined.</p>
  </section>;
}

export function AgentPairPage({ pair }: { pair: EvidencePair }) {
  const products = [evidence.products.find((p) => p.id === 'dshrem')!, evidence.products.find((p) => p.id === pair.competitor_id)!];
  return <EvidenceFrame title={pair.title} intro={pair.fit}>
    <EvidenceStatus />
    <div className="mt-10 grid gap-6 md:grid-cols-2">{products.map((p) => <section key={p.id} className={panel}>
      <p className="text-xs uppercase tracking-widest text-blue-300">{p.classification} evidence</p><h2 className="mt-3 text-2xl font-semibold text-white">{p.name}</h2>
      <dl className="mt-5 space-y-5 text-sm leading-7">{[['Layer',p.category],['Version',p.version ?? 'Unreported'],['License',p.license ?? 'Unreported'],['Connection',p.connection],['Verified capability',p.capability],['Limitation',p.limitation]].map(([k,v]) => <div key={k}><dt className="font-semibold text-slate-200">{k}</dt><dd className="mt-1">{v}</dd></div>)}</dl>
      <p className="mt-5 text-xs text-slate-400">Checked {p.checked_on}</p><div className="mt-4"><SourceLinks ids={p.source_ids} /></div>
    </section>)}</div>
    <section className={`${panel} mt-8`}><h2 className="text-xl font-semibold text-white">Decision and its limits</h2><p className="mt-4 leading-7">{pair.decision}</p><p className="mt-4 leading-7">No matched head-to-head run establishes a quality, time or cost advantage here. Freeze model, provider, inputs, approvals and budgets before testing; count failed attempts and human review.</p><div className="mt-4"><SourceLinks ids={pair.source_ids} /></div></section>
  </EvidenceFrame>;
}

export function StudyMethodology() {
  return <>
    <EvidenceStatus />
    <section className={`${panel} mt-10`}><h2 className="text-2xl font-semibold text-white">A comparison is a configuration</h2><p className="mt-4 leading-7">Record the task and acceptance check, model identifier, harness version, provider, effort, prompts, tools, environment, context limits, budget, date and repeats. Separate independent attempts from repair turns and judge votes. Unknown fields stay null or unreported.</p><p className="mt-4 leading-7">Report accepted results alongside wall time, interventions, input/output/cache tokens, failed attempts and cost per accepted result. If there are no accepted results, the ratio is undefined. {evidence.cost_policy}</p></section>
    <section className="mt-12"><h2 className="text-3xl font-semibold text-white">Six studies, six different questions</h2><p className="mt-4 leading-7">These records document provenance and limits. They are not a pooled leaderboard. Current product releases in the overview are separate from the historical versions below.</p>
      <div className="mt-6 space-y-5">{evidence.studies.map((s) => <article className={panel} key={s.id}>
        <p className="text-xs uppercase tracking-widest text-blue-300">External study · checked {s.checked_on}</p><h3 className="mt-2 text-2xl font-semibold text-white">{s.title}</h3>
        <dl className="mt-5 grid gap-5 text-sm leading-7 sm:grid-cols-2">{[['Publication / update',s.published_on ?? 'Unreported'],['Evaluation dates',s.evaluation_period ?? 'Unreported'],['Tasks',s.tasks.description],['Independent attempts per pairing',s.repeats === null ? 'Unreported; see settings' : String(s.repeats)],['Historical agent versions',s.agent_versions === null ? 'Unreported / row-specific; never substituted with today’s release' : Object.entries(s.agent_versions).map(([k,v]) => `${k}: ${v}`).join('; ')],['Models',s.models?.join('; ') ?? 'Unreported / row-specific'],['Provider',s.provider ?? 'Unreported / row-specific'],['Settings',s.settings],['Metrics',s.metrics],['Limits',s.limitations]].map(([k,v]) => <div key={k}><dt className="font-semibold text-slate-200">{k}</dt><dd className="mt-1">{v}</dd></div>)}</dl>
        <div className="mt-6"><SourceLinks ids={s.source_ids} /></div>
      </article>)}</div>
    </section>
    <section className={`${panel} mt-8`}><h2 className="text-xl font-semibold text-white">What this edition does not establish</h2><p className="mt-4 leading-7">External scores do not transfer to Tvijo. The operator-reported isolated canary is own evidence, with private receipts and no independently reproduced quality comparison. Proposed integrations are hypotheses. A production activation or native swarm claim requires a separate accepted execution trace.</p></section>
  </>;
}
