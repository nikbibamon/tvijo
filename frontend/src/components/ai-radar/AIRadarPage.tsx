'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Box,
  Braces,
  Clock3,
  Code2,
  Calculator,
  LockKeyhole,
  ExternalLink,
  Gauge,
  History,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

import Footer from '@/components/portal/Footer';
import Navbar from '@/components/portal/Navbar';
import { aiRadarCopy, aiRadarLanguage } from '@/data/ai-radar';
import { fetchAIRadar, fetchAIRadarBudgetPlan, fetchAIRadarEconomics, type AIRadarBudgetPlan, type AIRadarEconomics, type AIRadarModel, type AIRadarOverview } from '@/services/ai-radar-api';

type Tab = 'overview' | 'models' | 'apps' | 'benchmarks' | 'changes' | 'economics';
type Filter = 'all' | 'tools' | 'structured' | 'long';

const TABS: Array<{ id: Tab; icon: typeof Activity }> = [
  { id: 'overview', icon: Activity },
  { id: 'models', icon: Box },
  { id: 'apps', icon: LayoutGrid },
  { id: 'benchmarks', icon: BarChart3 },
  { id: 'changes', icon: History },
  { id: 'economics', icon: Calculator },
];

const EVENT_TONES: Record<string, string> = {
  MODEL_ADDED: 'border-cyan-300/30 bg-cyan-300/[0.07] text-cyan-300',
  MODEL_REMOVED: 'border-red-300/30 bg-red-300/[0.07] text-red-300',
  PRICE_CHANGED: 'border-emerald-300/30 bg-emerald-300/[0.07] text-emerald-300',
  CONTEXT_CHANGED: 'border-violet-300/30 bg-violet-300/[0.07] text-violet-300',
  CAPABILITY_ADDED: 'border-amber-300/30 bg-amber-300/[0.07] text-amber-300',
};

function compact(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function dateTime(value: string | null, locale: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  }).format(new Date(value));
}

function money(value: number | null) {
  if (value === null) return '—';
  if (value >= 0.01) return '$' + value.toFixed(2);
  const precise = value.toFixed(8);
  return Number(precise) === 0 ? '<$0.00000001' : '$' + precise;
}

function context(value: number | null, locale: string) {
  return value ? compact(value, locale) : '—';
}

function matchesModelFilter(model: AIRadarModel, filter: Filter) {
  if (filter === 'all') return true;
  if (filter === 'tools') return model.capabilities.includes('tools');
  if (filter === 'structured') return model.capabilities.includes('response_format');
  return (model.context_length || 0) >= 128000;
}

function RadarHero({ radar, locale, copy }: {
  radar: AIRadarOverview;
  locale: string;
  copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy];
}) {
  const source = radar.source_status;
  const metrics = [
    source.models?.items || 0,
    source.app_rankings?.items || 0,
    source.benchmarks?.items || 0,
    source.task_classifications?.items || 0,
  ];
  const state = copy.hero.states[radar.status];

  return (
    <section className="border-b border-cyan-300/10 pb-12 pt-28 sm:pb-16 sm:pt-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div>
          <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">{copy.hero.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{copy.hero.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2 font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />{state}
            </span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{copy.hero.updated} {dateTime(radar.as_of, locale)}</span>
            <a href={radar.attribution.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200">
              {copy.hero.source}<ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 border-l border-cyan-300/10 pl-0 sm:pl-8">
          {metrics.map((value, index) => (
            <div key={copy.hero.metrics[index]} className="border-b border-white/[0.07] py-5">
              <dt className="mt-1 text-xs leading-5 text-slate-500">{copy.hero.metrics[index]}</dt>
              <dd className="order-first text-3xl font-black text-white">{compact(value, locale)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function RadarControls({ activeTab, setActiveTab, query, setQuery, filter, setFilter, copy }: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  query: string;
  setQuery: (query: string) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy];
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-white/[0.08] bg-[#020f18]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 sm:px-6 xl:flex-row xl:items-center lg:px-8">
        <div className="flex overflow-x-auto" role="tablist" aria-label="AI radar views">
          {TABS.map(({ id, icon: Icon }, index) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-4 text-sm font-semibold transition ${activeTab === id ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" />{copy.tabs[index]}
              {activeTab === id ? <span className="absolute inset-x-3 bottom-0 h-0.5 bg-cyan-300" /> : null}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pb-3 xl:pb-0">
          <label className="flex min-w-0 flex-1 items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2 xl:w-72">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          </label>
          <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)} className="border border-white/10 bg-[#041922] px-3 py-2 text-sm font-medium text-slate-300 outline-none focus:border-cyan-300/40">
            {Object.entries(copy.filters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function ModelsTable({ models, locale, copy }: { models: AIRadarModel[]; locale: string; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  return (
    <section className="py-10 sm:py-14" id="models">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h2 className="text-2xl font-bold text-white">{copy.models.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{copy.models.description}</p></div>
        <span className="text-xs text-slate-500">{models.length} / 8</span>
      </div>
      <div className="overflow-x-auto border-y border-white/10">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead><tr>{copy.models.columns.map((column) => <th key={column} className="border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{column}</th>)}</tr></thead>
          <tbody>
            {models.map((model) => (
              <tr key={`${model.date}:${model.id}`} className="group border-b border-white/[0.07] transition hover:bg-cyan-300/[0.035]">
                <td className="px-4 py-5 text-sm font-bold text-cyan-300">{model.rank}</td>
                <td className="max-w-[260px] px-4 py-5"><div className="truncate text-sm font-semibold text-white">{model.name}</div><div className="mt-1 truncate text-[11px] text-slate-600">{model.id}</div></td>
                <td className="px-4 py-5 text-sm font-semibold text-slate-200">{compact(model.total_tokens, locale)}</td>
                <td className="px-4 py-5 text-sm text-slate-300">{context(model.context_length, locale)}</td>
                <td className="px-4 py-5 text-sm text-slate-300">{money(model.input_per_million_usd)}</td>
                <td className="px-4 py-5 text-sm text-slate-300">{money(model.output_per_million_usd)}</td>
                <td className="px-4 py-5"><div className="flex max-w-[260px] flex-wrap gap-1.5">{model.capabilities.slice(0, 3).map((capability) => <span key={capability} className="border border-white/10 px-2 py-1 text-[10px] text-slate-400">{capability.replaceAll('_', ' ')}</span>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {models.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">{copy.models.empty}</p> : null}
      </div>
    </section>
  );
}

function ChangesTimeline({ radar, query, locale, copy }: { radar: AIRadarOverview; query: string; locale: string; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  const events = radar.events.filter((event) => `${event.title} ${event.entity_name}`.toLowerCase().includes(query));
  return (
    <section className="border-y border-white/[0.08] py-10 sm:py-14" id="changes">
      <h2 className="text-2xl font-bold text-white">{copy.changes.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy.changes.description}</p>
      <div className="mt-8 divide-y divide-white/[0.07]">
        {events.slice(0, 8).map((event) => (
          <article key={`${event.type}:${event.entity_id}:${event.event_at}`} className="grid gap-3 py-5 sm:grid-cols-[165px_150px_1fr_auto] sm:items-center">
            <time className="text-xs text-slate-500">{dateTime(event.event_at, locale)}</time>
            <span className={`w-fit border px-2 py-1 text-[10px] font-semibold tracking-[0.06em] ${EVENT_TONES[event.type] || 'border-white/10 bg-white/[0.03] text-slate-300'}`}>{event.type}</span>
            <div><h3 className="text-sm font-semibold text-white">{event.title}</h3>{event.summary ? <p className="mt-1 text-xs text-slate-500">{event.summary}</p> : null}</div>
            {event.source_url ? <a href={event.source_url} target="_blank" rel="noreferrer" aria-label={event.title} className="text-cyan-300 hover:text-cyan-200"><ExternalLink className="h-4 w-4" /></a> : null}
          </article>
        ))}
        {events.length === 0 ? <p className="py-10 text-sm text-slate-500">{copy.changes.empty}</p> : null}
      </div>
    </section>
  );
}

function AppsTable({ radar, query, locale, copy }: { radar: AIRadarOverview; query: string; locale: string; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  const apps = radar.trending_apps.filter((app) => app.name.toLowerCase().includes(query));
  return (
    <section className="py-10 sm:py-14" id="apps">
      <h2 className="text-2xl font-bold text-white">{copy.apps.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy.apps.description}</p>
      <div className="mt-7 overflow-x-auto border-y border-white/10">
        <table className="w-full min-w-[560px] text-left"><thead><tr>{copy.apps.columns.map((column) => <th key={column} className="border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{column}</th>)}</tr></thead>
          <tbody>{apps.map((app) => <tr key={String(app.id)} className="border-b border-white/[0.07] hover:bg-cyan-300/[0.035]"><td className="px-4 py-4 text-sm font-bold text-cyan-300">{app.rank}</td><td className="px-4 py-4 text-sm font-semibold text-white">{app.name}</td><td className="px-4 py-4 text-sm text-slate-300">{compact(app.total_tokens, locale)}</td><td className="px-4 py-4 text-sm text-slate-300">{app.total_requests === null ? '—' : compact(app.total_requests, locale)}</td></tr>)}</tbody>
        </table>{apps.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">{copy.apps.empty}</p> : null}
      </div>
    </section>
  );
}

function BenchmarksTable({ radar, query, copy }: { radar: AIRadarOverview; query: string; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  const rows = radar.benchmarks.filter((item) => item.name.toLowerCase().includes(query));
  const score = (value: number | undefined) => value === undefined ? '—' : new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);
  return (
    <section className="py-10 sm:py-14" id="benchmarks">
      <h2 className="text-2xl font-bold text-white">{copy.benchmarks.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy.benchmarks.description}</p>
      <div className="mt-7 overflow-x-auto border-y border-white/10"><table className="w-full min-w-[720px] text-left"><thead><tr>{copy.benchmarks.columns.map((column) => <th key={column} className="border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{column}</th>)}</tr></thead>
        <tbody>{rows.map((item) => <tr key={`${item.source}:${item.id}`} className="border-b border-white/[0.07] hover:bg-cyan-300/[0.035]"><td className="px-4 py-4 text-sm font-semibold text-white">{item.name}</td><td className="px-4 py-4 text-xs text-slate-500">{item.source}</td><td className="px-4 py-4 text-sm text-slate-300">{score(item.scores.intelligence_index)}</td><td className="px-4 py-4 text-sm text-slate-300">{score(item.scores.coding_index)}</td><td className="px-4 py-4 text-sm text-slate-300">{score(item.scores.agentic_index)}</td><td className="px-4 py-4 text-sm text-slate-300">{score(item.scores.accuracy)}</td></tr>)}</tbody>
      </table>{rows.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">{copy.benchmarks.empty}</p> : null}</div>
    </section>
  );
}

function DecisionGuide({ locale, copy }: { locale: string; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  const icons = [Gauge, Code2, ShieldCheck];
  return (
    <section className="border border-emerald-300/20 bg-emerald-300/[0.025]" id="decisions">
      <div className="border-b border-white/[0.08] px-5 py-6 sm:px-8"><h2 className="text-2xl font-bold text-white">{copy.decision.title}</h2></div>
      <div className="hidden grid-cols-[1fr_1.2fr_1.5fr] border-b border-white/[0.08] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 md:grid">{copy.decision.columns.map((column) => <span key={column}>{column}</span>)}</div>
      <div className="divide-y divide-white/[0.08]">{copy.decision.rows.map((row, index) => { const Icon = icons[index]; return <div key={row[0]} className="grid gap-5 px-5 py-6 md:grid-cols-[1fr_1.2fr_1.5fr] md:items-center md:px-8"><div className="flex items-center gap-4"><Icon className="h-6 w-6 shrink-0 text-cyan-300" /><h3 className="font-semibold text-white">{row[0]}</h3></div><p className="text-sm leading-6 text-slate-400">{row[1]}</p><div className="flex items-center gap-4"><ArrowRight className="hidden h-5 w-5 shrink-0 text-cyan-300 md:block" /><p className="text-sm leading-6 text-slate-300">{row[2]}</p></div></div>; })}</div>
      <div className="border-t border-white/[0.08] p-5 text-center"><Link href={`/${locale}/workspace/models`} className="inline-flex items-center gap-2 bg-emerald-400 px-6 py-3 text-sm font-bold text-[#001b18] transition hover:bg-emerald-300">{copy.decision.cta}<ArrowRight className="h-4 w-4" /></Link></div>
    </section>
  );
}



type EconomicsCopy = (typeof aiRadarCopy)[keyof typeof aiRadarCopy]['economics'];

const TASK_PRESETS = {
  coding: { input: 8000, output: 2000 },
  seo: { input: 5000, output: 1200 },
  smm: { input: 1800, output: 500 },
  direct_mail: { input: 1200, output: 350 },
  parsing: { input: 3000, output: 500 },
} as const;

function numberText(value: number | null | undefined, locale: string) {
  return value == null ? '—' : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

function ModelEconomicsPanel({ locale, language, copy }: {
  locale: string;
  language: string;
  copy: EconomicsCopy;
}) {
  const formatLocale = language === 'ru' ? 'ru-RU' : language === 'uk' ? 'uk-UA' : 'en-GB';
  const [token, setToken] = useState('');
  const [data, setData] = useState<AIRadarEconomics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [task, setTask] = useState<keyof typeof TASK_PRESETS>('coding');
  const [inputTokens, setInputTokens] = useState<number>(TASK_PRESETS.coding.input);
  const [outputTokens, setOutputTokens] = useState<number>(TASK_PRESETS.coding.output);
  const [budget, setBudget] = useState('1000');
  const [modelId, setModelId] = useState('');
  const [plan, setPlan] = useState<AIRadarBudgetPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    const access = localStorage.getItem('access_token');
    const legacy = localStorage.getItem('newsadmin_access');
    if (!access && legacy) localStorage.setItem('access_token', legacy);
    setToken(access || legacy || '');
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAIRadarEconomics().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    }).catch((reason: unknown) => {
      if (!cancelled) {
        setError(reason instanceof Error ? reason.message : copy.loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [token, reload, copy.loadError]);

  const modelChoices = useMemo(() => data
    ? data.market.models.filter((item) => item.price_as_of !== null).map((item) => ({ id: item.id, name: item.name || item.id }))
    : [], [data]);
  useEffect(() => {
    if (!modelId && modelChoices.length) setModelId(modelChoices[0].id);
  }, [modelId, modelChoices]);

  async function calculatePlan() {
    if (!token || !modelId) return;
    const parsedBudget = Number(budget);
    if (!Number.isFinite(parsedBudget) || parsedBudget < 1 || parsedBudget > 100000) {
      setPlanError(copy.invalidBudget);
      return;
    }
    setPlanLoading(true);
    setPlanError(null);
    setPlan(null);
    try {
      setPlan(await fetchAIRadarBudgetPlan({
        model_id: modelId,
        budget_usd: parsedBudget,
        input_tokens_per_task: inputTokens,
        output_tokens_per_task: outputTokens,
      }));
    } catch (reason) {
      setPlanError(reason instanceof Error ? reason.message : copy.planError);
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <section className="py-10 sm:py-14" id="model-economics">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 border border-amber-300/25 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200"><LockKeyhole className="h-3.5 w-3.5" />{copy.admin}</p>
          <h2 className="text-2xl font-bold text-white">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy.intro}</p>
        </div>
        {data ? <button type="button" onClick={() => setReload((n) => n + 1)} className="border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/30">{copy.refresh}</button> : null}
      </header>

      {!token ? (
        <div className="border border-amber-300/20 bg-amber-300/[0.035] p-6">
          <h3 className="font-semibold text-white">{copy.signInTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{copy.signInBody}</p>
          <Link href={`/${locale}/login`} className="mt-4 inline-flex border border-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-200/5">{copy.signIn}</Link>
        </div>
      ) : loading && !data ? (
        <p className="border border-white/10 p-6 text-sm text-slate-400">{copy.loading}</p>
      ) : error && !data ? (
        <div className="border border-amber-300/20 p-6"><p className="text-sm text-amber-100">{error === 'Admin sign-in required' ? copy.denied : copy.loadError}</p><button type="button" onClick={() => setReload((n) => n + 1)} className="mt-4 border border-white/10 px-3 py-2 text-xs text-slate-300">{copy.retry}</button></div>
      ) : data ? (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-500">{copy.internalWindow}</p><p className="mt-2 text-xl font-bold text-white">{data.internal.window_days} {copy.days}</p><p className="mt-1 text-[11px] text-slate-500">{copy.asOf}: {dateTime(data.internal.as_of, formatLocale)}</p></article>
            <article className="border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-500">{copy.callsObserved}</p><p className="mt-2 text-xl font-bold text-white">{numberText(data.internal.totals.calls, formatLocale)}</p><p className="mt-1 text-[11px] text-slate-500">{copy.sourceLabel}: {copy.internalSource} · {copy.coverageWindow}</p></article>
            <article className="border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-500">{copy.knownCost}</p><p className="mt-2 text-xl font-bold text-white">{data.internal.totals.known_cost_usd == null ? '—' : money(data.internal.totals.known_cost_usd)}</p><p className="mt-1 text-[11px] text-slate-500">{copy.unknownCostCalls}: {numberText(data.internal.totals.unknown_cost_calls, formatLocale)}</p></article>
            <article className="border border-cyan-300/15 bg-cyan-300/[0.025] p-4"><p className="text-xs text-cyan-100/60">{copy.publicAdoption}</p><p className="mt-2 text-xl font-bold text-white">{data.market.source}</p><p className="mt-1 text-[11px] text-slate-500">{copy.asOf}: {dateTime(data.market.ranking_date || data.source_status?.popularity?.as_of || null, formatLocale)}{data.source_status?.popularity?.stale ? ' · ' + copy.stale : ''}</p></article>
          </div>
          {data.source_status ? <div className="flex flex-wrap gap-2">{Object.entries(data.source_status).map(([key, status]) => <span key={key} className="border border-white/10 px-2.5 py-1.5 text-[10px] text-slate-400">{key}: {status.available ? copy.sourceAvailable : copy.sourceMissing} · {dateTime(status.as_of, formatLocale)}{status.stale ? ` · ${copy.stale}` : ''}</span>)}</div> : null}

          <section className="border border-white/10">
            <header className="border-b border-white/10 p-4"><h3 className="font-semibold text-white">{copy.publicTitle}</h3><p className="mt-1 text-xs text-slate-500">{copy.publicDescription} · {copy.rankBy}: {data.market.ranking_metric} · <a href={data.market.attribution_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">{data.market.source}</a> · {copy.asOf}: {dateTime(data.market.ranking_date || data.source_status?.popularity?.as_of || null, formatLocale)}</p></header>
            <div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left"><thead><tr>{[copy.rank, copy.model, copy.publicTokens, copy.inputPrice, copy.outputPrice, copy.externalBenchmark].map((label) => <th key={label} className="border-b border-white/10 px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead>
              <tbody>{data.market.models.map((model) => <tr key={model.id} className="border-b border-white/[0.06]"><td className="px-3 py-3 text-sm text-cyan-200">{model.rank ?? '—'}</td><td className="px-3 py-3"><div className="text-sm font-semibold text-white">{model.name}</div><div className="text-[10px] text-slate-600">{model.id}</div></td><td className="px-3 py-3 text-sm text-slate-300">{model.total_tokens == null ? '—' : compact(model.total_tokens, formatLocale)}<div className="text-[10px] text-slate-600">{dateTime(model.period_date, formatLocale)}</div></td><td className="px-3 py-3 text-sm text-slate-300">{money(model.input_per_million_usd)}<div className="text-[10px] text-slate-600">{dateTime(model.price_as_of, formatLocale)}</div></td><td className="px-3 py-3 text-sm text-slate-300">{money(model.output_per_million_usd)}</td><td className="px-3 py-3 text-xs text-slate-400">{model.score_source || '—'}{Object.entries(model.scores || {}).map(([key, value]) => <span key={key} className="ml-1 inline-block border border-white/10 px-1.5 py-0.5">{key}: {numberText(value, formatLocale)}</span>)}</td></tr>)}</tbody>
            </table>{data.market.models.length === 0 ? <p className="p-5 text-sm text-slate-500">{copy.noMarketData}</p> : null}</div>
          </section>

          <section className="border border-white/10">
            <header className="border-b border-white/10 p-4"><h3 className="font-semibold text-white">{copy.observedTitle}</h3><p className="mt-1 text-xs text-slate-500">{copy.observedDescription}</p></header>
            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr>{[copy.model, copy.callsObserved, copy.inputTokens, copy.outputTokens, copy.providerCost, copy.estimatedCost, copy.unknownCostCalls, copy.acceptance].map((label) => <th key={label} className="border-b border-white/10 px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead>
              <tbody>{data.internal.models.map((model) => <tr key={model.id} className="border-b border-white/[0.06]"><td className="px-3 py-3 text-sm font-semibold text-white">{model.id}</td><td className="px-3 py-3 text-sm text-slate-300">{numberText(model.calls, formatLocale)}</td><td className="px-3 py-3 text-sm text-slate-300">{compact(model.input_tokens, formatLocale)}</td><td className="px-3 py-3 text-sm text-slate-300">{compact(model.output_tokens, formatLocale)}</td><td className="px-3 py-3 text-sm text-slate-300">{model.cost_by_source_usd.provider == null ? '—' : money(model.cost_by_source_usd.provider)}</td><td className="px-3 py-3 text-sm text-slate-300">{model.cost_by_source_usd.estimated == null ? '—' : money(model.cost_by_source_usd.estimated)}</td><td className="px-3 py-3 text-sm text-slate-300">{numberText(model.unknown_cost_calls, formatLocale)}</td><td className="px-3 py-3 text-sm text-slate-300">{model.success_rate == null ? copy.notEvaluated : `${numberText(model.success_rate * 100, formatLocale)}%`}</td></tr>)}</tbody>
            </table>{data.internal.models.length === 0 ? <p className="p-5 text-sm text-slate-500">{copy.noInternalData}</p> : null}</div>
          </section>

          <section className="border border-emerald-300/20 bg-emerald-300/[0.025] p-4 sm:p-6">
            <div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200">{copy.plannerEyebrow}</p><h3 className="mt-2 text-xl font-bold text-white">{copy.plannerTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy.plannerDescription}</p></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-slate-400">{copy.taskClass}<select value={task} onChange={(event) => { const next = event.target.value as keyof typeof TASK_PRESETS; setTask(next); setInputTokens(TASK_PRESETS[next].input); setOutputTokens(TASK_PRESETS[next].output); setPlan(null); }} className="mt-2 w-full border border-white/10 bg-[#041922] px-3 py-2.5 text-sm text-white">{Object.keys(TASK_PRESETS).map((key) => <option key={key} value={key}>{copy.tasks[key as keyof typeof TASK_PRESETS]}</option>)}</select></label>
              <label className="text-xs text-slate-400">{copy.model}<select value={modelId} onChange={(event) => { setModelId(event.target.value); setPlan(null); }} className="mt-2 w-full border border-white/10 bg-[#041922] px-3 py-2.5 text-sm text-white">{modelChoices.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
              <label className="text-xs text-slate-400">{copy.inputAssumption}<input type="number" min="1" max="1000000" value={inputTokens} onChange={(event) => { setInputTokens(Number(event.target.value)); setPlan(null); }} className="mt-2 w-full border border-white/10 bg-[#041922] px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-slate-400">{copy.outputAssumption}<input type="number" min="1" max="1000000" value={outputTokens} onChange={(event) => { setOutputTokens(Number(event.target.value)); setPlan(null); }} className="mt-2 w-full border border-white/10 bg-[#041922] px-3 py-2.5 text-sm text-white" /></label>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{copy.assumptionNote}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[100, 1000, 10000].map((amount) => <button key={amount} type="button" onClick={() => { setBudget(String(amount)); setPlan(null); }} className={`border px-3 py-2 text-xs font-bold ${Number(budget) === amount ? 'border-emerald-300/50 bg-emerald-300/10 text-emerald-100' : 'border-white/10 text-slate-300 hover:border-white/25'}`}>${amount.toLocaleString('en-US')}</button>)}
              <label className="flex items-center gap-2 text-xs text-slate-400">{copy.customBudget}<span>$</span><input type="number" min="1" max="100000" value={budget} onChange={(event) => { setBudget(event.target.value); setPlan(null); }} className="w-32 border border-white/10 bg-[#041922] px-3 py-2 text-sm text-white" /></label>
              <button type="button" disabled={planLoading || !modelId || inputTokens < 1 || outputTokens < 1} onClick={() => void calculatePlan()} className="ml-auto bg-emerald-300 px-4 py-2.5 text-sm font-bold text-[#001b18] disabled:cursor-not-allowed disabled:opacity-40">{planLoading ? copy.calculating : copy.calculate}</button>
            </div>
            {planError ? <p role="alert" className="mt-4 text-sm text-amber-200">{planError}</p> : null}
            {plan ? <div className="mt-5 border-t border-white/10 pt-5">
              {plan.status === 'stale_price' ? <p className="mb-4 border border-amber-300/20 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100">{copy.stalePrice}</p> : null}
              {plan.status === 'zero_price' ? <p className="mb-4 border border-amber-300/20 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100">{copy.zeroPrice}</p> : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <div><p className="text-[11px] text-slate-500">{copy.estimatedUnitCost}</p><p className="mt-1 font-semibold text-white">{plan.status === 'stale_price' ? copy.stale : plan.status === 'zero_price' ? copy.zeroPriceLabel : plan.unit_cost_usd == null ? copy.unpriced : money(plan.unit_cost_usd)}</p></div>
                <div><p className="text-[11px] text-slate-500">{copy.affordableTasks}</p><p className="mt-1 font-semibold text-white">{plan.affordable_tasks == null ? '—' : numberText(plan.affordable_tasks, formatLocale)}</p></div>
                <div><p className="text-[11px] text-slate-500">{copy.priceAsOf}</p><p className="mt-1 font-semibold text-white">{dateTime(plan.price_as_of, formatLocale)}</p></div>
              </div>
              {plan.scenarios.length ? <div className="mt-4 flex flex-wrap gap-2">{plan.scenarios.map((scenario) => <span key={scenario.budget_usd} className="border border-white/10 px-3 py-2 text-xs text-slate-300">${numberText(scenario.budget_usd, formatLocale)} → {scenario.affordable_tasks == null ? '—' : numberText(scenario.affordable_tasks, formatLocale)} {copy.tasksLabel}</span>)}</div> : null}
              {plan.caveats.map((item, index) => <p key={index} className="mt-3 text-xs leading-5 text-slate-500">{item}</p>)}
            </div> : null}
          </section>
          <p className="border-t border-white/[0.08] pt-4 text-xs leading-5 text-slate-500">{copy.footer}</p>
        </div>
      ) : null}
    </section>
  );
}

function LoadState({ error, retry, copy }: { error: boolean; retry: () => void; copy: (typeof aiRadarCopy)[keyof typeof aiRadarCopy] }) {
  return <div className="flex min-h-[72vh] items-center justify-center px-4 pt-20"><div className="max-w-md text-center">{error ? <><ShieldCheck className="mx-auto h-9 w-9 text-amber-300" /><p className="mt-5 text-sm leading-6 text-slate-400">{copy.error}</p><button type="button" onClick={retry} className="mt-5 border border-cyan-300/30 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/[0.06]">{copy.retry}</button></> : <><Sparkles className="mx-auto h-9 w-9 animate-pulse text-cyan-300" /><p className="mt-5 text-sm text-slate-400">{copy.loading}</p></>}</div></div>;
}

export default function AIRadarPage({ locale }: { locale: string }) {
  const language = aiRadarLanguage(locale);
  const copy = aiRadarCopy[language];
  const formatLocale = language === 'ru' ? 'ru-RU' : 'en-GB';
  const [radar, setRadar] = useState<AIRadarOverview | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetchAIRadar(controller.signal).then(setRadar).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError(true);
    });
    return () => controller.abort();
  }, [reload]);

  if (!radar) return <div className="dark min-h-screen bg-[#020f18] text-white"><Navbar /><LoadState error={error} retry={() => setReload((value) => value + 1)} copy={copy} /></div>;

  const normalizedQuery = query.trim().toLowerCase();
  const models = radar.trending_models.filter((model) => matchesModelFilter(model, filter) && `${model.name} ${model.id}`.toLowerCase().includes(normalizedQuery));
  const show = (tab: Tab) => activeTab === 'overview' || activeTab === tab;

  return (
    <div className="dark min-h-screen bg-[#020f18] text-white selection:bg-cyan-300/25">
      <Navbar />
      <main>
        <RadarHero radar={radar} locale={formatLocale} copy={copy} />
        <RadarControls activeTab={activeTab} setActiveTab={setActiveTab} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} copy={copy} />
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {show('models') ? <ModelsTable models={models} locale={formatLocale} copy={copy} /> : null}
          {show('changes') ? <ChangesTimeline radar={radar} query={normalizedQuery} locale={formatLocale} copy={copy} /> : null}
          {activeTab === 'economics' ? <ModelEconomicsPanel locale={locale} language={language} copy={copy.economics} /> : null}
          <div className={activeTab === 'overview' ? 'grid gap-x-10 xl:grid-cols-[0.85fr_1.15fr]' : ''}>
            {show('apps') ? <AppsTable radar={radar} query={normalizedQuery} locale={formatLocale} copy={copy} /> : null}
            {show('benchmarks') ? <BenchmarksTable radar={radar} query={normalizedQuery} copy={copy} /> : null}
          </div>
          {activeTab === 'overview' ? <><p className="mb-8 border-t border-white/[0.08] pt-6 text-xs leading-5 text-slate-500">{copy.caveat}</p><DecisionGuide locale={locale} copy={copy} /></> : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
