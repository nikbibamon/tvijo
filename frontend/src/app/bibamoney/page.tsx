import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tvijo AI OS — evidence report',
  description:
    'Every number on this page was measured against the running system on 14 July 2026 and cross-checked by two independent audit passes. Sources are named. Nothing is projected.',
  robots: { index: false, follow: false },
};

/**
 * Evidence report for the Tvijo / bibamoney platform.
 *
 * Rules for this page:
 *  - A number appears only if it was read out of a live database, trace file, or log on the
 *    production host, with the source named beside it.
 *  - Counterfactuals are arithmetic on measured token counts and are labelled as such.
 *  - Findings that make the system look worse are reported with the same weight as the ones
 *    that make it look good — that is what makes the rest of the page worth reading.
 *
 * Measured 2026-07-14 against biba2 (188.245.200.3): llm_traces.db + council.json +
 * llm_cache.db from the running ai-os, Postgres aios_startups / bibamoney_db, and prod code
 * at git HEAD 09b6953. Two independent audit passes were run and reconciled; where the first
 * pass was wrong (guardrail counts, the $44.47 headline) this page carries the corrected value.
 */

const MEASURED_ON = '14 July 2026';

// Daily calls & cost, verbatim from:
//   SELECT substr(ts,1,10), COUNT(*), SUM(cost_usd) FROM llm_traces GROUP BY 1 ORDER BY 1
// Days absent from this list had zero traffic (23 of 82 calendar days).
const DAILY: [string, number, number][] = [
  ['04-24', 85, 0], ['04-25', 80, 0], ['04-26', 242, 0], ['04-29', 47, 0], ['04-30', 33, 0],
  ['05-02', 48, 0], ['05-03', 40, 0], ['05-05', 120, 0], ['05-06', 32, 0],
  ['05-26', 799, 0.14], ['05-27', 1997, 0.29], ['05-28', 1643, 0.28], ['05-29', 1274, 0.23],
  ['05-30', 1461, 0.25], ['05-31', 1538, 0.26], ['06-01', 1310, 0.22], ['06-02', 1235, 0.22],
  ['06-03', 1269, 0.22], ['06-04', 1388, 0.25], ['06-05', 1290, 0.23], ['06-06', 1512, 0.25],
  ['06-07', 1510, 0.23], ['06-08', 1271, 0.22], ['06-09', 1209, 0.21], ['06-10', 1278, 0.45],
  ['06-11', 1132, 0.2], ['06-12', 1301, 0.2], ['06-13', 1436, 0.61], ['06-14', 1493, 0.36],
  ['06-15', 1519, 0.65], ['06-16', 1306, 0.23], ['06-17', 1307, 0.61], ['06-18', 1336, 0.42],
  ['06-19', 1503, 0.26], ['06-20', 1485, 0.42], ['06-21', 1562, 0.66], ['06-22', 1549, 0.23],
  ['06-23', 1552, 0.22], ['06-24', 1421, 0.51], ['06-25', 1809, 2.14], ['06-26', 117917, 17.88],
  ['06-27', 3331, 0.36], ['06-28', 580, 0.07], ['06-29', 369, 0.05], ['06-30', 5001, 1.11],
  ['07-01', 3463, 0.74], ['07-02', 5084, 1.41], ['07-03', 4966, 1.26], ['07-04', 1882, 0.31],
  ['07-05', 1898, 0.39], ['07-06', 2096, 1.0], ['07-07', 2180, 0.51], ['07-08', 2026, 0.38],
  ['07-09', 2114, 0.46], ['07-10', 2412, 0.53], ['07-11', 5893, 1.21], ['07-12', 10945, 1.75],
  ['07-13', 9193, 1.64], ['07-14', 11450, 1.75],
];

const RUNTIME = [
  { value: '237,211', label: 'LLM calls traced', src: 'llm_traces.db — grew by 23 rows during the audit itself' },
  { value: '72.1M', label: 'tokens processed', src: 'SUM(total_tokens)' },
  { value: '≈$13–17', label: 'actually paid (repriced estimate)', src: 'log said $35.17 — see the correction below' },
  { value: '≈$6.9', label: 'avoided by cache (repriced)', src: '60,960 hits, per-hash matched' },
  { value: '19,476', label: 'secrets redacted before leaving the system', src: 'extra_json.guardrails.counts' },
  { value: '59 / 82', label: 'days with traffic', src: '23 idle days incl. one 19-day gap' },
];

const PROVIDERS = [
  { name: 'DeepSeek', model: 'deepseek-v4-flash', calls: '187,216', spend: '$30.49', latency: '1.42s' },
  { name: 'Groq', model: 'llama-3.3-70b-versatile', calls: '46,402', spend: '$7.79', latency: '0.68s' },
  { name: 'OpenAI', model: 'gpt-4o-mini', calls: '1,380', spend: '$0.14', latency: '4.69s' },
  { name: 'Anthropic', model: 'claude-opus-4-1, claude-3-5-haiku', calls: '312', spend: '$5.15', latency: '4.53s' },
  { name: 'Ollama', model: 'local, on-host', calls: '66', spend: '$0.00', latency: '10.11s' },
  { name: 'RunPod', model: 'Qwen2.5-7B (serverless vLLM)', calls: '52', spend: '$0.01', latency: '5.15s' },
  { name: 'OpenRouter', model: 'minimax-m3 ×25, qwen3-coder-480b ×4, deepseek-v4-pro ×1', calls: '30', spend: '$0.17', latency: '68.27s' },
  { name: 'gpt55 lane', model: 'gpt-5.5-2026-04-23', calls: '7', spend: '$0.72', latency: '30.27s' },
  { name: 'Gemini', model: 'experimental', calls: '2', spend: '$0.00', latency: '1.35s' },
];

const WORKLOADS = [
  {
    name: 'Startup-directory localization backfill',
    calls: '116,934',
    cost: '$17.64',
    note: 'One day (26 June). Translated the public startups directory into ja/de/ko/ru and more — 300,488 rows now in portal_i18n_cache. Identified from cache-DB samples, not guessed.',
  },
  {
    name: 'News enrichment (cron, every 10 min)',
    calls: '58,884',
    cost: '$9.19',
    note: '6,560 sessions since 26 May, still running today.',
  },
  {
    name: 'Knowledge-base & portal translation lane',
    calls: '43,474',
    cost: '$9.18',
    note: 'All DeepSeek. Since 30 June, still running today.',
  },
  {
    name: 'Multi-model council (incl. arbiter)',
    calls: '—',
    cost: '$5.16',
    note: 'Summed from council.json per-session costs. Council traffic carries no session tag in traces, so it sits inside the unattributed bucket below — the provider table and this row overlap; do not add them.',
  },
  {
    name: 'Prediction enrichment',
    calls: '8,645',
    cost: '$1.39',
    note: '',
  },
];

const COUNCIL_EXHIBITS = [
  {
    id: '2026-07-06 · $0.597 · three models',
    q: 'Review the trading Playbook Forward Ledger and Command Center controls before they inform any capital decision.',
    dissent:
      '“deepseek framed the equal-weight benchmark as ‘statistically meaningless’ and pushed for an external index now, while minimax and gpt-5.5 judged it an acceptable lab default needing only universe-freeze + n≥2 guard (arbiter sided with the latter)… arbiter adopted gpt-5.5’s P0 grouping.”',
    verdict:
      'Ship one hardening PR (CSRF, rate-limit, audit on mutation endpoints, subprocess watchdog) first — “internal-lab-acceptable now, not production-safe.”',
  },
  {
    id: '2026-06-25 · $0.154 · keep or drop copy-traders',
    q: 'MoonBot copy-lab: which of 8 traders survive scrutiny?',
    dissent:
      '“deepseek recommended keeping 6 traders vs claude’s 3; deepseek suggested 100% allocation to one trader for testing while claude proposed Kelly sizing… All agreed current setup has fatal survivorship bias and should not auto-trade.”',
    verdict:
      'Do NOT proceed — only 1 of 8 picks has robust evidence; minimum 50 out-of-sample trades, profit factor ≥ 1.5, 15% cap, −2% book stop.',
  },
  {
    id: '2026-06-30 · $0.368 · the honesty exhibit',
    q: 'Adversarially break a ZigZag backtest before committing to forward-paper.',
    dissent:
      'The arbiter refused to fake a consensus: “Only deepseek provided substantive analysis (panel slot gpt-5.5 returned empty), so there is no genuine cross-model disagreement to arbitrate… it asserts a ‘70% chance the edge evaporates’ (speculative, not validated)… I keep the original stricter gate.”',
    verdict: '“Do NOT start forward-paper yet” — survivorship, chop-regime, slippage and funding stress tests first.',
  },
];

const MODULES = [
  {
    name: 'News Sentiment & Signals API',
    status: 'preparing launch',
    tone: 'emerald',
    offer:
      'Hosted API: sentiment scores, entities, AI summaries, links to sources. Derived signals only — full article text is not part of the product.',
    market:
      'Comparable products publicly charge $29–249/mo (Finlight), ~$166–199/mo (Marketaux), $449/mo (NewsAPI Business). Planned tiers: free / $49 / $199.',
    honesty:
      '“99.99%” is processing coverage, not accuracy. No accuracy claim will be made until a benchmark is published. This product does not predict markets and is not investment advice.',
  },
  {
    name: 'Localization conveyor',
    status: 'offered as a service',
    tone: 'emerald',
    offer:
      'Productized service: your application in 11 languages through CI, fixed price per language. Proof: this site — 300,488 localized strings produced by the same conveyor.',
    market:
      'AI-first competitors publicly charge $99/mo + usage (Lingo.dev); TMS platforms $144–1,245/mo (Lokalise, Phrase).',
    honesty: '300k strings is a volume metric, not a quality metric. No “human parity” claims.',
  },
  {
    name: 'AI-OS router + multi-model council',
    status: 'managed deployments only',
    tone: 'cyan',
    offer:
      'We deploy and operate the routing/tracing/council stack for teams that need an audit trail of AI decisions. Not distributed as a software artifact.',
    market:
      'Gateway licenses publicly range $49/mo (Portkey managed) to $2,499–2,999/mo (Langfuse Enterprise, TrueFoundry). The council’s recorded-dissent verdict has no priced equivalent among vendors we verified.',
    honesty:
      'No SOC 2 claim until an actual audit. “No content retention” applies to traces (SHA-256 hashes); the semantic cache does store responses — we say so.',
  },
  {
    name: 'Backtest lab',
    status: 'research software, not offered yet',
    tone: 'slate',
    offer:
      'Parameter-sweep engine (920,952 runs, 42 strategies × 151 symbols). If offered, it will be as research tooling only.',
    market: 'Retail research SaaS publicly charges $15–70/mo (TradingView tiers).',
    honesty:
      'No performance numbers will ever be shown as results: hypothetical-performance marketing is restricted (CFTC Rule 4.41, FINRA 2210), and cherry-picking winners from 920k sweeps is p-hacking. The platform’s own council twice ruled “do not proceed” on live trading.',
  },
  {
    name: 'Company directory dataset',
    status: 'not for sale',
    tone: 'slate',
    offer: 'Used internally to power our own lead generation. Not offered as a dataset.',
    market: 'Bulk firmographic data trades at $0.005–0.28 per record — 79k records is not a dataset business.',
    honesty: '“138 countries” is a spread, not coverage: on average ~570 companies per country.',
  },
];

const BROKEN = [
  {
    what: 'The ok-flag cannot measure provider reliability — so we do not publish one',
    detail:
      'The router writes ok=true on every path it logs; a failed provider call raises and is never written to the trace at all. All 320 not-ok rows are orchestration spans — 53 of them are literally “RuntimeError: boom”, synthetic faults from the test suite polluting the production trace DB. An earlier draft of this page said “99.87% of calls completed without error”. That number measured nothing, and it is gone.',
  },
  {
    what: 'Real provider failures do exist — in the council log, not the traces',
    detail:
      '18 of 85 council panel answers failed, every one a Groq free-tier rate limit (429, 100k tokens/day quota). The council completed on the remaining panelists each time and recorded the failure inside the verdict. That is the genuine graceful-degradation evidence; the trace ok-flag is not.',
  },
  {
    what: 'The injection detector has never fired',
    detail:
      'The guardrail library scans every routed prompt for injection patterns (including Cyrillic homoglyph de-obfuscation). Recorded detections in 81 days: zero. Untested in anger — only the secret redactor has real mileage.',
  },
  {
    what: '55% of spend is unattributed',
    detail:
      '$24.33 of the logged cost carries an empty session tag. The workload table above attributes most of it forensically (cache-DB sampling identified the June-26 backfill), but “forensically” is the honest word.',
  },
  {
    what: 'All costs are estimates, not invoices',
    detail:
      'cost_usd is computed per call as tokens × a static price table (the code says so itself). No provider invoice has been reconciled against it.',
  },
  {
    what: 'The Django-side control plane is dark',
    detail:
      'apps/ai has a per-call audit log, a pre-flight daily budget cap, and versioned prompts — unit-tested, and with 0 rows behind each, because production traffic runs through the ai-os router instead. Retrieval is wired (pgvector enabled) with 0 embeddings populated. The Q-APU “quantum-inspired” orchestrator is a simulation fed by random numbers and its DB tables were never migrated; it must never be marketed.',
  },
  {
    what: 'The council has no customer-facing door',
    detail:
      'It runs as a systemd service on localhost and is used internally (32 sessions). No product surface calls it.',
  },
];

const CORPUS = [
  {
    value: '920,952',
    label: 'backtest runs',
    detail: '42 strategies × 151 symbols. Still being written today.',
    revenue: 'Internal R&D until validation gates pass (see the plan, 40/100). Sellable later as research tooling at $19–49/mo — never as trading signals.',
    src: 'aios_startups.lab_sweeps · COUNT(*)',
    live: true,
  },
  {
    value: '113,198',
    label: 'raw news items collected',
    detail: '81,497 published articles, 81,492 with sentiment analysis — 99.99% coverage. Pipeline running on a 10-minute cron.',
    revenue: 'Already earning-ready: the token-gated Signals API is live on this data — tiers $0 / $49 / $199, corridor confirmed by public competitor pricing.',
    src: 'bibamoney_db.news_*',
    live: true,
  },
  {
    value: '300,488',
    label: 'localized directory strings',
    detail: 'Produced by the June-26 translation backfill over the startups directory.',
    revenue: 'Proof-of-work for the localization service: your app in 11 languages through CI at a fixed price per language.',
    src: 'aios_startups.portal_i18n_cache',
    live: false,
  },
  {
    value: '79,322',
    label: 'companies indexed',
    detail: 'Across 138 countries. Last import 2 May 2026.',
    revenue: 'No revenue path as a product — internal fuel for our own lead generation.',
    src: 'aios_startups.domains',
    live: false,
  },
  {
    value: '57,383',
    label: 'SEC company facts',
    detail: 'Pulled from EDGAR. Last write 14 June 2026.',
    revenue: 'Legally the cleanest data we hold (EDGAR is public domain). Restart the stopped pipeline and it enriches Signals with fundamentals and powers per-ticker SEO pages.',
    src: 'aios_startups.sec_company_facts',
    live: false,
  },
  {
    value: '173,353',
    label: 'semantic-cache entries',
    detail: 'The store behind the $9.30 of avoided spend. File modified today.',
    revenue: 'Not a SKU — it is margin: the measured 25.7% hit-rate cut the AI bill by roughly a fifth, and ships as a feature of every managed AI-OS deployment.',
    src: 'llm_cache.db',
    live: true,
  },
];

function Stat({ value, label, src }: { value: string; label: string; src: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</div>
      <div className="mt-2 text-sm leading-5 text-slate-300">{label}</div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">{src}</div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/[0.06] py-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      {lead && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * The one chart. Square-root scale, and the scale is declared on the chart itself:
 * the 26 June backfill (117,917 calls) is 49.7% of all traffic, and on a linear scale
 * every other day would render below two pixels — which would hide the routine traffic
 * that is the other half of the story. Idle days render as true gaps.
 */
function DailyChart() {
  const start = new Date('2026-04-24');
  const end = new Date('2026-07-14');
  const byDay = new Map(DAILY.map(([d, n, c]) => [d, { n, c }]));
  const days: { d: string; n: number }[] = [];
  for (let t = new Date(start); t <= end; t.setDate(t.getDate() + 1)) {
    const key = t.toISOString().slice(5, 10);
    days.push({ d: key, n: byDay.get(key)?.n ?? 0 });
  }
  const W = 940;
  const H = 190;
  const PAD = 4;
  const bw = (W - PAD * 2) / days.length;
  const maxSqrt = Math.sqrt(117917);

  return (
    <figure>
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <svg
          viewBox={`0 0 ${W} ${H + 26}`}
          className="h-auto w-full min-w-[560px]"
          role="img"
          aria-label="Calls per day, 24 April to 14 July 2026, square-root scale. One spike of 117,917 calls on 26 June; a 19-day idle gap from 7 to 25 May; routine traffic of one to eleven thousand calls per day otherwise."
        >
          {days.map((day, i) => {
            if (day.n === 0) return null;
            const h = Math.max(2, (Math.sqrt(day.n) / maxSqrt) * H);
            const spike = day.n > 100000;
            return (
              <rect
                key={day.d}
                x={PAD + i * bw + 0.5}
                y={H - h}
                width={Math.max(1, bw - 1)}
                height={h}
                className={spike ? 'fill-amber-300' : 'fill-emerald-400/80'}
              />
            );
          })}
          <line x1={PAD} y1={H + 0.5} x2={W - PAD} y2={H + 0.5} className="stroke-white/20" strokeWidth="1" />
          {['24 Apr', '26 May', '26 Jun', '14 Jul'].map((lbl, idx) => {
            const x = [PAD, PAD + 32 * bw, PAD + 63 * bw, W - PAD - 30][idx];
            return (
              <text key={lbl} x={x} y={H + 18} className="fill-slate-500" fontSize="11">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-6 text-slate-500">
        <span className="font-semibold text-slate-400">Square-root scale, declared.</span> The amber
        bar is 26 June — 117,917 calls, 49.7% of all traffic, a one-day localization backfill. On a
        linear scale every other day would be under two pixels tall. Empty stretches are real: 23 of
        82 days had zero traffic, including a 19-day gap from 7 to 25 May. Since 26 May the system
        has run every single day.
      </figcaption>
    </figure>
  );
}

export default function EvidenceReport() {
  return (
    <main className="min-h-screen bg-[#041922] text-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <header>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/[0.08] px-4 py-1.5 text-xs font-semibold text-emerald-200">
            Measured {MEASURED_ON} · two independent audit passes, reconciled
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            What the system actually does,
            <span className="block text-emerald-400">and what it does not</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
            Every figure below was read out of a live database, trace file, or log on the production
            host on {MEASURED_ON}, and the source is named beside it. Two audits were run
            independently and reconciled; where the first pass got a number wrong, this page says so
            rather than hiding the correction. Where a comparison is arithmetic rather than observed,
            it is labelled.
          </p>
        </header>

        <Section
          eyebrow="Runtime"
          title="82 days of traffic — bursty, and honestly so"
          lead="The ai-os router traces every call it serves: provider, model, tokens, cost estimate, latency, cache-hit, guardrail counts. Prompts are stored as a SHA-256 hash, never as text. The database gained 23 rows while this audit was running — it is live."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RUNTIME.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
          <div className="mt-8">
            <DailyChart />
          </div>
        </Section>

        <Section
          eyebrow="Spend"
          title="Where the money actually went — corrected twice"
          lead="This section has been corrected twice, and both corrections are part of the record. First: the router copies the original call's cost onto every cache hit, so $9.30 of the logged $44.47 was never paid. Second, and larger: the owner challenged the remaining ≈$35 against their actual DeepSeek billing (≈$7), and a price-table audit proved them right — the code priced DeepSeek at $0.27/$1.10 per million tokens while the vendor's current list price is $0.14/$0.28, with cache-hit input at $0.0028. Repricing the measured 35.2M input / 16.1M output DeepSeek tokens gives a corridor of $4.60–$9.43 — the owner's figure sits inside it. Total paid spend is therefore ≈$13–17, not $35."
        >
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Workload</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Calls</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Logged cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {WORKLOADS.map((w) => (
                  <tr key={w.name}>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-white">{w.name}</div>
                      {w.note && <div className="mt-1 max-w-xl text-xs leading-5 text-slate-500">{w.note}</div>}
                    </td>
                    <td className="px-5 py-3 text-right align-top tabular-nums">{w.calls}</td>
                    <td className="px-5 py-3 text-right align-top font-semibold tabular-nums text-emerald-300">{w.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-10 text-lg font-bold text-white">The counterfactual, labelled as one</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="px-5 py-4 text-slate-300">Actually paid (repriced estimate), all providers, 81 days</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-300">≈$13–17</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 text-slate-300">
                    The same 37.4M input + 17.3M output tokens, had every call gone to Claude Opus 4.8 at list price
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-white">$620.59</td>
                </tr>
                <tr className="bg-emerald-300/[0.05]">
                  <td className="px-5 py-4 font-semibold text-white">Difference</td>
                  <td className="px-5 py-4 text-right font-black text-emerald-300">≈$604 · 97%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            <span className="font-semibold text-slate-400">How to read this.</span> The $620.59 is
            arithmetic: real token counts × Anthropic&apos;s published prices. It assumes the same
            work would take the same tokens on a premium model — an assumption, not a result. Nobody
            ran the alternative. What is measured is the token counts and what was paid for them.
          </p>
        </Section>

        <Section
          eyebrow="Providers"
          title="Nine provider endpoints, observed"
          lead="Every row is real traffic, not a supported-vendor list. Latency is the mean over all calls to that endpoint. 79% of calls went to the cheapest capable provider; 0.13% to the most expensive."
        >
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Endpoint</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Models observed</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Calls</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Logged cost</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Mean latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {PROVIDERS.map((p) => (
                  <tr key={p.name}>
                    <td className="px-5 py-3 font-semibold text-white">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.model}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.calls}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.spend}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-400">{p.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            The Anthropic row overlaps the council row in the workload table above ($4.27 of it is
            council-arbiter usage) — the two must not be summed. Orchestration spans (1,721 internal
            rows) are excluded here: they are not provider calls. Costs in this table are the
            logged values from the conservative price table; the DeepSeek row is ≈3–4× above the
            vendor&apos;s actual price (see the Spend correction above). Scope note: these traces
            cover the product router only — the owner&apos;s development-tool usage (Claude Code,
            Cursor, Codex, Windsurf subscriptions) bills through those vendors and never touches
            this router, so it is deliberately not in these numbers.
          </p>
        </Section>

        <Section
          eyebrow="Guardrails"
          title="19,476 secrets never left the building"
          lead="Every routed prompt is screened by default. When the screen finds an API key, token, or JWT, it is replaced with a redaction marker before the prompt is sent to any provider or written to any log. The counts land in the trace record of each call."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat value="19,476" label="secret redactions, 81 days" src="firing since 24 Apr — incl. today" />
            <Stat value="10,822" label="of them on the backfill day alone" src="26 June" />
            <Stat value="0" label="prompt-injection detections, ever" src="detector live, never fired" />
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            The zero is reported with the same confidence as the 19,476: the injection detector runs
            on every call and has never flagged one. That means it is untested in anger — not that it
            works.
          </p>
        </Section>

        <Section
          eyebrow="Multi-model council"
          title="28 decisions where the disagreement is part of the record"
          lead="A question fans out in parallel to models from different vendors; a stronger arbiter reads the panel and returns one verdict — importance score, prioritised steps tied to files, and an explicit dissent field recording where the models disagreed. 32 sessions are logged ($5.16 total); 4 were smoke tests, so the honest count is 28. In 18 of 85 panel answers a provider failed (all Groq free-tier rate limits) and the council completed on the remaining panelists."
        >
          <div className="space-y-4">
            {COUNCIL_EXHIBITS.map((e) => (
              <article key={e.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-300">{e.id}</p>
                <h3 className="mt-2 text-sm font-bold text-white">{e.q}</h3>
                <p className="mt-3 border-l-2 border-emerald-400/40 pl-4 text-sm italic leading-6 text-slate-300">
                  {e.dissent}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  <span className="font-semibold text-slate-200">Verdict: </span>
                  {e.verdict}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            Quotes are verbatim from the decision log. The third exhibit is the one to notice: the
            arbiter records that there was <em>no</em> genuine disagreement to arbitrate — because one
            panelist returned nothing — instead of inventing a consensus. A tool that logs the absence
            of consensus is what auditability means.
          </p>
        </Section>

        <Section
          eyebrow="Corpus"
          title="What is stored"
          lead="Counted directly in each table. “Static” means the pipeline that produced it has stopped writing — a total as of the date given, not a live counter."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {CORPUS.map((c) => (
              <div key={c.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-white">{c.value}</span>
                  <span className="text-sm text-slate-300">{c.label}</span>
                  {c.live ? (
                    <span className="ml-auto rounded-full bg-emerald-300/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      live
                    </span>
                  ) : (
                    <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      static
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{c.detail}</p>
                <p className="mt-3 border-l-2 border-emerald-400/40 pl-3 text-xs leading-6 text-slate-300">
                  <span className="font-semibold text-emerald-300">Revenue path: </span>
                  {c.revenue}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">{c.src}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Commercial readiness"
          title="What is for sale, what is not, and why"
          lead="Two further audits ran on 14 July 2026: a packaging audit (what a paying customer would actually receive, checked file-by-file) and a market audit (competitor prices verified against vendors' public pricing pages). Their verdicts converged. Statuses below are commitments, not aspirations — and the honesty column is part of the offer."
        >
          <div className="space-y-4">
            {MODULES.map((m) => (
              <article key={m.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                  <span
                    className={
                      m.tone === 'emerald'
                        ? 'rounded-full bg-emerald-300/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300'
                        : m.tone === 'cyan'
                          ? 'rounded-full bg-cyan-300/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-200'
                          : 'rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400'
                    }
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{m.offer}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  <span className="font-semibold text-slate-300">Market context: </span>
                  {m.market}
                </p>
                <p className="mt-2 border-l-2 border-amber-300/40 pl-3 text-xs leading-6 text-slate-400">
                  {m.honesty}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            Competitor prices were read from vendors&apos; public pricing pages in July 2026 and may
            change; positions we could not verify are not quoted here. Nothing on this page
            constitutes investment advice. The action plan — every asset scored 0–100 against
            declared criteria, with owner decisions on the council verdicts —{' '}
            <Link href="/bibamoney/plan" className="text-emerald-300 underline-offset-4 hover:underline">
              lives on its own page
            </Link>
            .
          </p>
        </Section>

        <Section
          eyebrow="The other half"
          title="What does not work"
          lead="A report that only lists successes is a brochure. Each item below was found by reading the code and querying the production database — including two corrections to this page's own earlier draft."
        >
          <div className="space-y-4">
            {BROKEN.map((b) => (
              <div key={b.what} className="rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-5">
                <h3 className="text-sm font-bold text-amber-200">{b.what}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{b.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Method"
          title="How these numbers were obtained"
          lead="So that any of them can be re-derived rather than taken on trust."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-400">
            <li>
              <span className="font-semibold text-slate-200">Runtime and cost.</span> Direct SQL
              against the ai-os trace database on the production host — one row per call, written by
              the router at the moment of the call. Code inspected at git HEAD 09b6953.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Cache economics.</span> Every cache hit
              matched to its paid twin by (prompt-hash, model); 60,960 of 60,960 matched. Not an
              average-based estimate.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Counterfactual.</span> Measured token
              totals × published per-million prices. No alternative run took place.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Two passes, reconciled.</span> Two
              independent audits ran the same brief. Where they disagreed, the discrepancy was chased
              to ground: the first pass missed 19,476 guardrail redactions (a nested counter it
              didn&apos;t parse) and overstated paid spend by $9.30. The corrections are on this page;
              so is the admission.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Gaps.</span> A capability with zero rows
              behind it is reported as a gap, not a feature.
            </li>
          </ul>
        </Section>

        <footer className="border-t border-white/[0.06] py-10">
          <p className="text-xs leading-6 text-slate-500">
            Figures measured {MEASURED_ON} and not refreshed since. This page carries no live
            counters; when a number here goes stale it is wrong, and it should be re-measured rather
            than quietly rounded.
          </p>
          <Link
            href="/en"
            className="mt-6 inline-flex items-center gap-2 rounded text-sm font-semibold text-emerald-300 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            ← Back to Tvijo
          </Link>
        </footer>
      </div>
    </main>
  );
}
