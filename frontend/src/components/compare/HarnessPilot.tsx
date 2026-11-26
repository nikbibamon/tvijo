import pilot from '@/data/harness-pilot.json';

type Locale = 'en' | 'ru';
const link = 'text-blue-300 underline underline-offset-4';
const number = (value: unknown, digits = 2) => typeof value === 'number' ? value.toFixed(digits) : 'UNKNOWN';

export default function HarnessPilot({ locale }: { locale: Locale }) {
  const t = pilot.labels[locale];
  return <section id="our-trials" className="mt-12 min-w-0 scroll-mt-28 space-y-6 text-slate-300" aria-labelledby="pilot-heading">
    <div id="engineering-pilot" className="scroll-mt-28 rounded-2xl border border-blue-300/30 bg-blue-300/5 p-5 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-blue-200">{pilot.campaign} · {pilot.checked_on}</p>
      <h2 id="pilot-heading" className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{t.title}</h2>
      <p className="mt-4 leading-7">{t.scope}</p>
      <p className="mt-3 leading-7">{t.configuration}</p>
      <p className="mt-3 leading-7">{t.cost}</p>
      <p className="mt-3 leading-7">{t.limits}</p>
      <p className="mt-4 flex flex-wrap gap-4"><a className={link} href={pilot.data_url}>{t.download}</a><a className={link} href={pilot.csv_url}>CSV</a><a className={link} href={`/wiki/${locale === 'ru' ? 'ru/' : ''}tvijo-harness-pilot-offline-live-guard/`}>{t.instructions}</a></p>
    </div>
    {pilot.tasks.map(task => <div key={task.id} className="min-w-0">
      <h3 className="text-xl font-semibold text-white">{task.id} · {task.title[locale]}</h3>
      <p className="mt-2 text-sm leading-6">{task.scope[locale]} · {t.baseline}: <code className="break-all">{task.baseline_sha}</code></p>
      <div className="mt-3 max-w-full overflow-x-auto rounded-xl border border-white/10" role="region" aria-label={task.title[locale]} tabIndex={0}>
        <table className="w-full min-w-[980px] text-left text-sm">
          <caption className="p-4 text-left text-slate-400">{t.tableNote}</caption>
          <thead className="bg-white/5"><tr>{t.columns.map(label => <th key={label} scope="col" className="p-3 align-top">{label}</th>)}</tr></thead>
          <tbody>{pilot.runs.filter(run => run.task === task.id).map(run => <tr key={run.run_id} className="border-t border-white/10">
            <th scope="row" className="p-3 font-normal"><strong className="block text-white">{run.harness}</strong><span className="block text-xs">{run.version}</span></th>
            <td className="p-3">{run.status}<br /><span className="text-xs">Q {run.Q ?? 'UNKNOWN'}</span></td>
            <td className="p-3">{number(run.full_seconds)} s</td>
            <td className="p-3">{number(run.api_cost_usage_tariff_usd, 6)}</td>
            <td className="p-3">{run.api_requests ?? 'UNKNOWN'}<br /><span className="text-xs">{run.input_tokens ?? 'UNKNOWN'} / {run.output_tokens ?? 'UNKNOWN'} / {run.cache_read_tokens ?? 'UNKNOWN'}</span></td>
            <td className="p-3">{run.human_assisted ? 'YES' : '0'}<br /><span className="text-xs">{run.reason || '—'}</span></td>
            <td className="break-all p-3"><a className={link} href={run.evidence_url}>{run.claim_id}</a><br /><span className="text-xs">{pilot.checked_on}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      {task.id === 'B' && <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-7">{locale === 'ru'
        ? 'Область проверки, 10 ноября 2026. Эти строки оценены версией оценщика, опубликованной с пилотом 9 ноября. 10 ноября исправленный оценщик курсора (T2-presence-v2-20261110) офлайн переоценил другой набор сохранённых артефактов из другой кампании: отсутствие cursor допустимо, явный null должен отклоняться. PILOT-B использует другую фикстуру (базовый коммит ffb2f416; переоценённый набор T2 — 5c508b0d) и не переоценивался, поэтому его PASS — это PASS по исходному оценщику. Перед сравнением этих строк с переоценённым набором нужен отдельный офлайн-прогон исправленным оценщиком.'
        : 'Evaluator scope, 10 Nov 2026. These rows were graded with the evaluator published with the pilot on 9 Nov. On 10 Nov a corrected cursor evaluator (T2-presence-v2-20261110) re-graded a different set of saved artifacts from another campaign offline: a missing cursor is allowed, an explicit null cursor must be rejected. PILOT-B uses a different fixture (baseline ffb2f416; the re-graded T2 set uses baseline 5c508b0d) and has not been re-graded, so its PASS rows are PASS under the original evaluator. A separate offline replay with the corrected evaluator is required before these rows are compared with the re-graded set.'}</p>}
    </div>)}
    <h3 className="text-xl font-semibold text-white">{t.aggregateTitle}</h3>
    <div className="max-w-full overflow-x-auto rounded-xl border border-white/10" role="region" aria-label={t.aggregateTitle} tabIndex={0}>
      <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white/5"><tr>{t.aggregateColumns.map(label => <th key={label} className="p-3" scope="col">{label}</th>)}</tr></thead>
        <tbody>{pilot.summary.map(row => <tr key={row.harness} className="border-t border-white/10"><th scope="row" className="p-3">{row.harness}</th><td className="p-3">{row.accepted}/{row.started} · {number(row.success_rate * 100)}%</td><td className="p-3">{number(row.median_full_seconds)} s</td><td className="p-3">{number(row.api_cost_usage_tariff_usd, 6)}</td><td className="p-3">{row.cost_per_accepted === null ? t.undefined : number(row.cost_per_accepted, 6)}</td><td className="p-3">{row.minutes_per_accepted === null ? t.undefined : number(row.minutes_per_accepted)}</td><td className="p-3">{row.infra_errors} / {row.model_started}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="text-sm leading-7">{t.formulas}</p>
    <div className="grid gap-4 sm:grid-cols-2">{pilot.tools.map(tool => <article key={tool.id} className="rounded-xl border border-white/10 p-5"><h3 className="font-semibold text-white">{tool.name} · {tool.version}</h3><p className="mt-2 text-sm leading-6">{tool.role[locale]}</p><a className={`${link} mt-3 block break-all text-sm`} href={tool.source}>{tool.claim_id}</a><p className="mt-2 text-xs">{pilot.checked_on} · {tool.scope[locale]}</p></article>)}</div>
    <details className="rounded-xl border border-white/10 p-5"><summary className="cursor-pointer font-semibold text-white">{t.provenance}</summary><div className="mt-4 space-y-5">{pilot.claims.map(claim => <article key={claim.claim_id} className="text-sm leading-6"><h4 className="font-semibold text-white">{claim.claim_id} · {claim.checked_on}</h4><p>{claim.result[locale]}</p><p>{t.scopeLabel}: {claim.conditions[locale]}</p><p>{t.limitsLabel}: {claim.limitations[locale]}</p><p>{t.contrary}: {claim.contrary_data[locale]}</p><p>{t.recheck}: {claim.recheck[locale]}</p><p className="break-all">{claim.version}</p><a className={link} href={claim.source}>{t.source}</a></article>)}</div></details>
    <p className="text-sm leading-7">{t.external}</p>
  </section>;
}
