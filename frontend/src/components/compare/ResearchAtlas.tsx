"use client";

import { useEffect, useId, useMemo, useState } from "react";
import styles from "./research-atlas.module.css";

export type AtlasLocale = "en" | "ru";
export type Localized = { en: string; ru: string };
export type AtlasStatus = "planned" | "unverified" | "ready" | "measured";
export type AtlasProject = { id: string; name: Localized; summary: Localized };
export type AtlasLens = { id: string; name: Localized; question: Localized };
export type MetricSpec = {
  id: string;
  name: Localized;
  unit: string;
  direction: "higher" | "lower" | "target" | "descriptive";
};
export type AcceptanceGate = {
  metricId: string;
  statistic: string;
  comparison: "absolute" | "candidate_minus_baseline";
  operator: "lt" | "lte" | "gt" | "gte" | "eq";
  value: number | null;
  parameter: string | null;
  unit: string;
  status: "proposal";
  rationale: string;
  grantsScope: string;
  onInsufficientData: "not_assessed";
  sourceIds: string[];
  source: { sliceId: string; admissionThresholdIndex: number; originalSourceIds: string[] };
  baseline: { identity: string | null; versionOrHash: string | null; status: "needs-pin"; freezeBeforeRun: true } | null;
};
export type AtlasSlice = {
  id: string;
  projectId: string;
  lensId: string;
  title: Localized;
  task: Localized;
  acceptance: Localized;
  acceptanceGates: AcceptanceGate[];
  metrics: MetricSpec[];
  benchmarkIds: string[];
  configIds: string[];
  status: AtlasStatus;
  limitations?: Localized;
  sourceIds?: string[];
  pilot?: { independentUnits: number; repetitions: number; unit: Localized };
  businessEffect?: Localized;
  proposedScope?: Localized;
};
export type AtlasBenchmark = {
  id: string;
  en: string;
  ru: string;
  family: string;
  measures: Localized;
  influences: Localized;
  limitation: Localized;
  sourceIds: string[];
  unit?: string;
};
export type AtlasExecutor = {
  id: string;
  name: string;
  summary: Localized;
  version?: string;
  versionStatus?: "desired" | "code-only" | "installed-verified" | "unknown";
  instrumentation: Localized[];
  sourceIds: string[];
};
export type AtlasConfig = {
  id: string;
  label: Localized;
  executorId: string;
  model: string;
  modelId?: string;
  provider: string;
  effort: string;
  harnessVersion: string;
  runtimeVersion?: string;
  tools: string[];
  status: AtlasStatus;
  sourceIds: string[];
  notes: Localized;
};
export type AtlasSource = {
  id: string;
  title: string;
  url: string;
  kind: "primary" | "own-protocol";
  accessedAt?: string;
};
export type OwnSnapshot = {
  id: string;
  projectId: string;
  configId: string;
  createdAt: string;
  tasksetHash: string;
  corpusVersion: string;
  uniqueTasks: number;
  acceptedUniqueTasks: number;
  repetitions: number;
  costComplete: boolean;
  evidenceStatus: "measured" | "illustrative";
  totalCost: number | null;
  currency: string;
  samplingUnit?: "independent-unique-task" | "correlated-or-unknown";
  repetitionAggregationRule?: string;
  sliceId?: string;
  repeatPolicy?: string;
  accountingBasis?: "marginal_cash" | "fully_loaded";
  costEstimand?: string;
  costPerAcceptedTask?: number | null;
  provenance?: Record<string, unknown>;
};
export type AtlasCatalog = {
  version: string;
  updatedAt: string;
  projects: AtlasProject[];
  lenses: AtlasLens[];
  slices: AtlasSlice[];
  benchmarks: AtlasBenchmark[];
  executors: AtlasExecutor[];
  configs: AtlasConfig[];
  sources: AtlasSource[];
  snapshots?: OwnSnapshot[];
};
export type ResearchAtlasProps = {
  catalog: AtlasCatalog;
  locale: AtlasLocale;
  view: "overview" | "project" | "benchmarks" | "systems" | "experiments";
  projectId?: string;
};
type Shared = { catalog: AtlasCatalog; locale: AtlasLocale };

const local = (value: Localized | undefined, locale: AtlasLocale) => value?.[locale] ?? "";
export function acceptancePlanFields(slice: Pick<AtlasSlice, "acceptanceGates">, acceptanceRule: string) {
  return {
    acceptanceRule,
    acceptanceGates: slice.acceptanceGates.map(gate => ({
      ...gate,
      sourceIds: [...gate.sourceIds],
      source: { ...gate.source, originalSourceIds: [...gate.source.originalSourceIds] },
      baseline: gate.baseline ? { ...gate.baseline } : null,
    })),
  };
}
const text = (locale: AtlasLocale, ru: string, en: string) => locale === "ru" ? ru : en;
const route = (locale: AtlasLocale, view: ResearchAtlasProps["view"], projectId?: string) => {
  const base = `/${locale}/compare`;
  if (view === "project") return `${base}/research/${encodeURIComponent(projectId ?? "")}`;
  return view === "overview" ? `${base}/research` : `${base}/${view}`;
};
const statusLabels: Record<AtlasStatus, Localized> = {
  planned: { ru: "Кандидат · план", en: "Candidate · planned" },
  unverified: { ru: "Не проверено", en: "Unverified" },
  ready: { ru: "Готово к тесту", en: "Ready to test" },
  measured: { ru: "Есть измерение", en: "Measurement exists" },
};
function Status({ status, locale }: { status: AtlasStatus; locale: AtlasLocale }) {
  const known = Object.prototype.hasOwnProperty.call(statusLabels, status) ? status : "unverified";
  return <span className={`${styles.status} ${styles[`status_${known}`]}`}>{local(statusLabels[known], locale)}</span>;
}
function SourceLinks({ ids, catalog, locale }: Shared & { ids: string[] }) {
  const requested = new Set(ids);
  const sources = catalog.sources.filter(s => requested.has(s.id) && /^(https?:\/\/|\/(?!\/))/.test(s.url));
  if (!sources.length) return null;
  return <div className={styles.sourceLinks} aria-label={text(locale, "Первоисточники", "Primary sources")}>
    {sources.map(source => {
      const href = source.kind === "own-protocol" && locale === "ru"
        ? source.url.replace(/^\/en(?=\/|$)/, "/ru").replace(/^(https?:\/\/(?:www\.)?tvijo\.com)\/en(?=\/|$)/, "$1/ru")
        : source.url;
      return <a key={source.id} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {source.title}<span aria-hidden="true"> ↗</span>
      {href.startsWith("http") && <span className={styles.srOnly}>{text(locale, " (новая вкладка)", " (new tab)")}</span>}
    </a>; })}
  </div>;
}
function numberDisplay(value: number, locale: AtlasLocale, digits = 1) {
  return value.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: digits });
}
function strictInteger(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}
function nonnegativeNumber(value: string): number | null {
  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function wilson(k: number, n: number) {
  const z = 1.959963984540054;
  const p = k / n;
  const denominator = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

export default function ResearchAtlas({ catalog, locale, view, projectId }: ResearchAtlasProps) {
  const headings = {
    overview: text(locale, "Атлас решений для трёх проектов", "A research atlas for three projects"),
    project: local(catalog.projects.find(p => p.id === projectId)?.name, locale) || text(locale, "Исследование проекта", "Project research"),
    benchmarks: text(locale, "Как читать бенчмарки", "How to read benchmarks"),
    systems: text(locale, "Исполнитель × модель × условия", "Executor × model × conditions"),
    experiments: text(locale, "От кандидата к собственному измерению", "From candidate to your own measurement"),
  };
  const sections: { view: ResearchAtlasProps["view"]; label: string }[] = [
    { view: "overview", label: text(locale, "Матрица проектов", "Project matrix") },
    { view: "benchmarks", label: text(locale, "Бенчмарки и термины", "Benchmarks & terms") },
    { view: "systems", label: text(locale, "Системы и кандидаты", "Systems & candidates") },
    { view: "experiments", label: text(locale, "Наши эксперименты", "Our experiments") },
  ];
  const measured = (catalog.snapshots ?? []).filter(s => s.evidenceStatus === "measured");
  return <div className={styles.atlas} lang={locale}>
    <a className={styles.skipLink} href="#atlas-content">{text(locale, "К содержанию", "Skip to content")}</a>
    <header className={styles.hero}>
      <div className={styles.eyebrow}>TVIJO / RESEARCH ATLAS <span>{catalog.version}</span></div>
      <h1>{headings[view]}</h1>
      <p className={styles.lead}>{text(locale,
        "Подбираем проверяемую конфигурацию под задачу. Здесь связаны проекты, критерии, бенчмарки и план собственных испытаний.",
        "Choose a testable configuration for a task. Connect projects, acceptance criteria, benchmarks, and a plan for your own evaluation.")}</p>
      <div className={styles.heroMeta}>
        <span>{catalog.projects.length} {text(locale, "проекта", "projects")}</span>
        <span>{catalog.lenses.length} {text(locale, "призм анализа", "evaluation lenses")}</span>
        <span>{measured.length} {text(locale, "собственных снимков", "own snapshots")}</span>
        <span>{text(locale, "Каталог", "Catalog")}: {catalog.updatedAt}</span>
      </div>
    </header>
    <nav className={styles.nav} aria-label={text(locale, "Разделы атласа", "Atlas sections")}>
      {sections.map(section => <a key={section.view} href={route(locale, section.view)} aria-current={view === section.view || (view === "project" && section.view === "overview") ? "page" : undefined}>{section.label}</a>)}
    </nav>
    <div id="atlas-content" className={styles.content}>
      {(view === "overview" || view === "project") && <ProjectMatrix catalog={catalog} locale={locale} projectId={view === "project" ? projectId : undefined} />}
      {view === "benchmarks" && <Benchmarks catalog={catalog} locale={locale} />}
      {view === "systems" && <Systems catalog={catalog} locale={locale} />}
      {view === "experiments" && <Experiments catalog={catalog} locale={locale} />}
    </div>
    <footer className={styles.footer}>
      <strong>{text(locale, "Статус доказательств имеет значение.", "Evidence status matters.")}</strong>
      <p>{text(locale,
        "Документированная функция, кандидат на тест и измеренный результат — разные состояния. Цена сессии не означает успешность, а результат coding agent не подтверждает доходность торговой стратегии.",
        "A documented feature, a test candidate, and a measured result are different states. Session cost does not measure success, and coding-agent performance does not establish trading profitability.")}</p>
    </footer>
  </div>;
}

function ProjectMatrix({ catalog, locale, projectId }: Shared & { projectId?: string }) {
  const [projectFilter, setProjectFilter] = useState(projectId ?? "all");
  const [lensFilter, setLensFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const filterId = useId();
  const project = catalog.projects.find(p => p.id === projectId);
  const selectedProject = projectId ?? projectFilter;
  const projects = catalog.projects.filter(p => selectedProject === "all" || p.id === selectedProject);
  const lenses = catalog.lenses.filter(l => lensFilter === "all" || l.id === lensFilter);
  const search = query.trim().toLocaleLowerCase();
  const slices = catalog.slices.filter(s => projects.some(p => p.id === s.projectId) && lenses.some(l => l.id === s.lensId)
    && (!search || [local(s.title, locale), local(s.task, locale), local(s.acceptance, locale), ...s.metrics.map(m => local(m.name, locale))].join(" ").toLocaleLowerCase().includes(search)));
  const selected = slices.find(s => s.id === selectedId) ?? slices[0];
  if (projectId && !project) return <div className={styles.empty}><h2>{text(locale, "Проект не найден", "Project not found")}</h2><a href={route(locale, "overview")}>{text(locale, "Открыть матрицу", "Open the matrix")}</a></div>;
  return <>
    {project && <section className={styles.projectIntro}><p>{local(project.summary, locale)}</p></section>}
    {!projectId && <div className={styles.projectCards}>{catalog.projects.map(p => <a href={route(locale, "project", p.id)} key={p.id} className={styles.projectCard}>
      <span className={styles.cardKicker}>{p.id}</span><h2>{local(p.name, locale)} <span aria-hidden="true">↗</span></h2><p>{local(p.summary, locale)}</p>
    </a>)}</div>}
    <section aria-labelledby={`${filterId}-heading`} className={styles.section}>
      <div className={styles.sectionHeading}><div><span className={styles.cardKicker}>{text(locale, "Задачи и критерии выбора", "Tasks and decision criteria")}</span><h2 id={`${filterId}-heading`}>{text(locale, "Проект × призма анализа", "Project × evaluation lens")}</h2></div><p>{text(locale, "Выберите ячейку: задача → приёмка → метрика → конфигурация.", "Select a cell: task → acceptance → metric → configuration.")}</p></div>
      <div className={styles.filters}>
        {!projectId && <label htmlFor={`${filterId}-project`}>{text(locale, "Проект", "Project")}<select id={`${filterId}-project`} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}><option value="all">{text(locale, "Все проекты", "All projects")}</option>{catalog.projects.map(p => <option key={p.id} value={p.id}>{local(p.name, locale)}</option>)}</select></label>}
        <label htmlFor={`${filterId}-lens`}>{text(locale, "Призма", "Lens")}<select id={`${filterId}-lens`} value={lensFilter} onChange={e => setLensFilter(e.target.value)}><option value="all">{text(locale, "Все призмы", "All lenses")}</option>{catalog.lenses.map(l => <option key={l.id} value={l.id}>{local(l.name, locale)}</option>)}</select></label>
        <label className={styles.searchField} htmlFor={`${filterId}-query`}>{text(locale, "Задача или метрика", "Task or metric")}<input id={`${filterId}-query`} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={text(locale, "Например: источник, recovery, leakage", "For example: source, recovery, leakage")} /></label>
      </div>
      <div className={styles.legend}><Status status="planned" locale={locale} /><Status status="unverified" locale={locale} /><Status status="ready" locale={locale} /><Status status="measured" locale={locale} /><span>{text(locale, "Цвет обозначает готовность, не балл качества.", "Color denotes readiness, not a quality score.")}</span></div>
      <div className={styles.matrixScroll} role="region" aria-label={text(locale, "Матрица, прокручивается по горизонтали", "Matrix, horizontally scrollable")} tabIndex={0}>
        <table className={styles.matrix}><caption className={styles.srOnly}>{text(locale, "Задачи проектов по призмам анализа. Кнопка открывает детали ниже.", "Project tasks by evaluation lens. Buttons open details below.")}</caption><thead><tr><th scope="col">{text(locale, "Проект / призма", "Project / lens")}</th>{lenses.map(l => <th scope="col" key={l.id}><span>{local(l.name, locale)}</span><small>{local(l.question, locale)}</small></th>)}</tr></thead><tbody>
          {projects.map(p => <tr key={p.id}><th scope="row">{local(p.name, locale)}</th>{lenses.map(l => {
            const slice = slices.find(s => s.projectId === p.id && s.lensId === l.id);
            return <td key={l.id}>{slice ? <button className={`${styles.matrixCell} ${selected?.id === slice.id ? styles.cellSelected : ""}`} type="button" onClick={() => setSelectedId(slice.id)} aria-pressed={selected?.id === slice.id} aria-controls={`${filterId}-detail`}><Status status={slice.status} locale={locale} /><strong>{local(slice.title, locale)}</strong><span>{slice.metrics.map(m => local(m.name, locale)).join(" · ")}</span></button> : <span className={styles.muted}>{text(locale, "Нет в выборке", "Not in selection")}</span>}</td>;
          })}</tr>)}
        </tbody></table>
      </div>
      <p className={styles.hint} aria-live="polite">{text(locale, "Найдено связей", "Matching relationships")}: {slices.length}. {text(locale, "На узком экране таблицу можно прокрутить вправо.", "On narrow screens, scroll the matrix horizontally.")}</p>
      {selected ? <SliceDetail slice={selected} catalog={catalog} locale={locale} id={`${filterId}-detail`} /> : <div className={styles.empty}>{text(locale, "По этим фильтрам задач нет. Измените запрос или призму.", "No tasks match these filters. Change the search or lens.")}</div>}
    </section>
  </>;
}
function SliceDetail({ slice, catalog, locale, id }: Shared & { slice: AtlasSlice; id: string }) {
  const project = catalog.projects.find(p => p.id === slice.projectId);
  const lens = catalog.lenses.find(l => l.id === slice.lensId);
  const benchmarks = catalog.benchmarks.filter(b => slice.benchmarkIds.includes(b.id));
  const configs = catalog.configs.filter(c => slice.configIds.includes(c.id));
  return <section id={id} className={styles.sliceDetail} aria-labelledby={`${id}-title`}>
    <div className={styles.sectionHeading}><div><p className={styles.cardKicker}>{local(project?.name, locale)} / {local(lens?.name, locale)}</p><h3 id={`${id}-title`}>{local(slice.title, locale)}</h3></div><Status status={slice.status} locale={locale} /></div>
    <div className={styles.twoColumns}><div><h4>{text(locale, "Конкретная задача", "Concrete task")}</h4><p>{local(slice.task, locale)}</p><h4>{text(locale, "Условие приёмки", "Acceptance rule")}</h4><p>{local(slice.acceptance, locale)}</p></div>
      <div><h4>{text(locale, "Что измеряем", "What to measure")}</h4><ul className={styles.metricList}>{slice.metrics.map(m => <li key={m.id}><strong>{local(m.name, locale)}</strong><span>{m.unit} · {m.direction === "higher" ? text(locale, "выше лучше", "higher is better") : m.direction === "lower" ? text(locale, "ниже лучше", "lower is better") : m.direction === "target" ? text(locale, "целевой диапазон", "target range") : text(locale, "описательная метрика", "descriptive metric")}</span></li>)}</ul></div></div>
    {slice.businessEffect && <div className={styles.notice}><strong>{text(locale, "Ожидаемый эффект для проекта — гипотеза", "Expected project impact — hypothesis")}</strong><p>{local(slice.businessEffect, locale)}</p></div>}
    {slice.proposedScope && <p><strong>{text(locale, "Предлагаемый объём пилота", "Proposed pilot scope")}: </strong>{local(slice.proposedScope, locale)}</p>}
    {slice.pilot && <p className={styles.hint}>{text(locale, "План, не выполненный прогон", "Planned, not an executed run")}: {slice.pilot.independentUnits} {local(slice.pilot.unit, locale)} · {slice.pilot.repetitions} {text(locale, "повторений на единицу. Повторы не увеличивают независимое n.", "repetitions per unit. Repetitions do not increase independent n.")}</p>}
    {slice.limitations && <p className={styles.caution}>{local(slice.limitations, locale)}</p>}
    <SourceLinks ids={slice.sourceIds ?? []} catalog={catalog} locale={locale} />
    <div className={styles.twoColumns}><div><h4>{text(locale, "Связанные бенчмарки и определения", "Related benchmarks and definitions")}</h4><div className={styles.chips}>{benchmarks.map(b => <a href={`${route(locale, "benchmarks")}#term-${encodeURIComponent(b.id)}`} key={b.id}>{b.en}<span>{b.ru}</span></a>)}</div>{!benchmarks.length && <p className={styles.muted}>{text(locale, "Пока не сопоставлены.", "Not mapped yet.")}</p>}</div><div><h4>{text(locale, "Конфигурации-кандидаты", "Candidate configurations")}</h4><div className={styles.chips}>{configs.map(c => <a href={`${route(locale, "systems")}#config-${encodeURIComponent(c.id)}`} key={c.id}>{local(c.label, locale)}<span>{c.model} · {c.effort}</span></a>)}</div>{!configs.length && <p className={styles.muted}>{text(locale, "Конфигурации ещё не выбраны.", "Configurations have not been selected.")}</p>}</div></div>
    <a className={styles.actionLink} href={`${route(locale, "experiments")}?project=${encodeURIComponent(slice.projectId)}&slice=${encodeURIComponent(slice.id)}`}>{text(locale, "Подготовить собственный эксперимент", "Prepare an experiment")} <span aria-hidden="true">→</span></a>
  </section>;
}

function Benchmarks({ catalog, locale }: Shared) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const id = useId();
  const families = Array.from(new Set(catalog.benchmarks.map(b => b.family)));
  const familyName = (value: string) => {
    switch (value.toLowerCase()) {
      case "decision": return text(locale, "Decision — качество решений", "Decision — decision quality");
      case "openness": return text(locale, "Openness — открытость и прозрачность", "Openness — openness and transparency");
      case "agents": case "agent": return text(locale, "Агенты и выполнение задач", "Agents and task execution");
      case "probability": return text(locale, "Вероятности и уверенность", "Probability and confidence");
      case "cost": return text(locale, "Стоимость и ресурсы", "Cost and resources");
      case "data": return text(locale, "Данные и качество извлечения", "Data and extraction quality");
      case "economics": return text(locale, "Экономика и эффективность", "Economics and efficiency");
      case "research": return text(locale, "Исследования и воспроизводимость", "Research and reproducibility");
      case "project-metrics": return text(locale, "Метрики наших проектов", "Our project metrics");
      case "capability": return text(locale, "Возможности моделей", "Model capabilities");
      case "business": return text(locale, "Бизнес-процессы", "Business processes");
      default: return value;
    }
  };
  const filtered = catalog.benchmarks.filter(b => (family === "all" || b.family === family) && [b.en, b.ru, local(b.measures, locale), local(b.influences, locale)].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section aria-labelledby={`${id}-title`}>
    <div className={styles.sectionHeading}><h2 id={`${id}-title`}>{text(locale, "От английского названия к практическому решению", "From an English label to a practical decision")}</h2><p>{text(locale, "Определения и первоисточники. Чужие сырые рейтинги и цены здесь не воспроизводятся.", "Definitions and primary sources. Third-party raw scores and prices are not reproduced here.")}</p></div>
    <div className={styles.noticeGrid}><div className={styles.notice}><strong>Decision</strong><p>{text(locale, "Правильность выбора, уверенность и цена ошибки. Проверяется отдельно от скорости и качества объяснения.", "Choice correctness, confidence, and the cost of error. Evaluate separately from speed and explanation quality.")}</p></div><div className={styles.notice}><strong>Openness</strong><p>{text(locale, "Доступность весов, лицензия и прозрачность. Требования к оборудованию и фактическая возможность запуска проверяются отдельно; открытость не является баллом интеллекта.", "Weights availability, licensing, and transparency. Hardware requirements and deployment feasibility require separate verification; openness is not an intelligence score.")}</p></div></div>
    <div className={styles.filters}><label className={styles.searchField} htmlFor={`${id}-search`}>{text(locale, "Термин на русском или английском", "Term in English or Russian")}<input id={`${id}-search`} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Accuracy, pass@k, Brier…" /></label><label htmlFor={`${id}-family`}>{text(locale, "Семейство", "Family")}<select id={`${id}-family`} value={family} onChange={e => setFamily(e.target.value)}><option value="all">{text(locale, "Все семейства", "All families")}</option>{families.map(f => <option value={f} key={f}>{familyName(f)}</option>)}</select></label></div>
    <p className={styles.hint} aria-live="polite">{text(locale, "Найдено терминов", "Matching terms")}: {filtered.length}</p>
    {families.filter(f => filtered.some(b => b.family === f)).map(f => <section key={f} className={styles.benchmarkFamily}><h3>{familyName(f)}</h3><div className={styles.benchmarkGrid}>{filtered.filter(b => b.family === f).map(b => <article key={b.id} id={`term-${b.id}`} className={styles.benchmarkCard}><header><span className={styles.cardKicker}>{familyName(b.family)}{b.unit ? ` / ${b.unit}` : ""}</span><h4>{b.en}</h4><p className={styles.translation}>{b.ru}</p></header><dl><dt>{text(locale, "Что измеряет", "What it measures")}</dt><dd>{local(b.measures, locale)}</dd><dt>{text(locale, "На что влияет", "Why it matters")}</dt><dd>{local(b.influences, locale)}</dd><dt>{text(locale, "Ограничение", "Limitation")}</dt><dd>{local(b.limitation, locale)}</dd></dl><SourceLinks ids={b.sourceIds} catalog={catalog} locale={locale} /></article>)}</div></section>)}
    {!filtered.length && <div className={styles.empty}>{text(locale, "Совпадений нет. Попробуйте другое название.", "No matches. Try a different term.")}</div>}
  </section>;
}

function ConfigIdentity({ config, catalog, locale }: Shared & { config: AtlasConfig }) {
  const executor = catalog.executors.find(e => e.id === config.executorId);
  const unknown = text(locale, "Не подтверждено", "Unverified");
  return <dl className={styles.identity}>
    <div><dt>Executor / harness</dt><dd>{executor?.name ?? config.executorId}</dd></div>
    <div><dt>{text(locale, "Модель — полное название", "Model — full label")}</dt><dd>{config.model || unknown}</dd></div>
    <div><dt>API model ID</dt><dd><code>{config.modelId || text(locale, "Точный ID не установлен", "Exact ID unresolved")}</code></dd></div>
    <div><dt>Provider / route</dt><dd>{config.provider || unknown}</dd></div>
    <div><dt>Reasoning effort</dt><dd>{config.effort || unknown}</dd></div>
    <div><dt>{text(locale, "Версия harness", "Harness version")}</dt><dd>{config.harnessVersion || unknown}</dd></div>
    <div><dt>{text(locale, "Версия runtime — отдельная ось", "Runtime version — separate axis")}</dt><dd>{config.runtimeVersion || unknown}</dd></div>
    <div><dt>Tools / skills</dt><dd>{config.tools.length ? config.tools.join(" · ") : text(locale, "Набор ещё не зафиксирован", "Toolset not fixed yet")}</dd></div>
  </dl>;
}
function Systems({ catalog, locale }: Shared) {
  const [executorId, setExecutorId] = useState("all");
  const [query, setQuery] = useState("");
  const id = useId();
  const configs = catalog.configs.filter(c => (executorId === "all" || c.executorId === executorId) && [local(c.label, locale), c.model, c.modelId ?? "", c.provider, c.effort, c.harnessVersion].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section aria-labelledby={`${id}-title`}>
    <div className={styles.sectionHeading}><h2 id={`${id}-title`}>{text(locale, "Сравниваем конфигурацию целиком", "Compare the complete configuration")}</h2><p>{text(locale, "Модель, executor, provider, runtime, effort и инструменты — отдельные параметры. Совпадение имени не означает одинаковые условия.", "Model, executor, provider, runtime, effort, and tools are separate parameters. Matching names do not establish matching conditions.")}</p></div>
    <div className={styles.notice}><strong>{text(locale, "Сначала readiness, затем результат", "Readiness first, results next")}</strong><p>{text(locale, "Точный ID → adapter и tool roundtrip → streaming и отмена → usage и полный журнал → замороженный набор задач. «Готово к тесту» ещё не означает «лучше».", "Exact ID → adapter and tool roundtrip → streaming and cancellation → usage and a complete trace → frozen taskset. Ready to test does not yet mean better.")}</p></div>
    <div className={styles.filters}><label htmlFor={`${id}-executor`}>Executor<select id={`${id}-executor`} value={executorId} onChange={e => setExecutorId(e.target.value)}><option value="all">{text(locale, "Все исполнители", "All executors")}</option>{catalog.executors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label className={styles.searchField} htmlFor={`${id}-query`}>{text(locale, "Модель, provider или версия", "Model, provider, or version")}<input id={`${id}-query`} type="search" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    <p className={styles.hint} aria-live="polite">{text(locale, "Конфигураций", "Configurations")}: {configs.length}</p>
    <div className={styles.systemGrid}>{configs.map(c => <article key={c.id} id={`config-${c.id}`} className={styles.systemCard}><div className={styles.sectionHeading}><h3>{local(c.label, locale)}</h3><Status status={c.status} locale={locale} /></div><ConfigIdentity config={c} catalog={catalog} locale={locale} /><p className={styles.caution}>{local(c.notes, locale)}</p><SourceLinks ids={c.sourceIds} catalog={catalog} locale={locale} /></article>)}</div>
    {!configs.length && <div className={styles.empty}>{text(locale, "Конфигураций по этому фильтру нет.", "No configurations match this filter.")}</div>}
    <section className={styles.section}><h2>{text(locale, "Документированные возможности executors", "Documented executor capabilities")}</h2><div className={styles.executorGrid}>{catalog.executors.filter(e => executorId === "all" || e.id === executorId).map(e => <article key={e.id} className={styles.executorCard}><h3>{e.name}</h3><p>{local(e.summary, locale)}</p>{e.version && <p className={styles.mono}>{text(locale, "Версия", "Version")}: {e.version} · {e.versionStatus ?? "unknown"}</p>}<ul>{e.instrumentation.map((item, index) => <li key={index}>{local(item, locale)}</li>)}</ul><SourceLinks ids={e.sourceIds} catalog={catalog} locale={locale} /></article>)}</div></section>
  </section>;
}

function Experiments({ catalog, locale }: Shared) {
  const snapshots = catalog.snapshots ?? [];
  const measured = snapshots.filter(s => s.evidenceStatus === "measured");
  return <>
    <section className={styles.section} aria-labelledby="own-snapshots"><div className={styles.sectionHeading}><h2 id="own-snapshots">{text(locale, "Собственные снимки результатов", "Own result snapshots")}</h2><span className={styles.count}>{measured.length}</span></div>
      {!measured.length ? <div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true">∅</span><div><h3>{text(locale, "Измерений пока нет", "No measurements yet")}</h3><p>{text(locale, "Каталог содержит кандидатов и протоколы. План и учебный калькулятор не создают результат измерения. Первый снимок появится после прогона, независимой приёмки и проверки журнала.", "The catalog contains candidates and protocols. A plan or an educational calculator does not create a measured result. A snapshot requires a run, independent acceptance, and trace verification.")}</p></div></div> : <div className={styles.snapshotGrid}>{measured.map(s => {
        const validCounts = Number.isSafeInteger(s.uniqueTasks) && s.uniqueTasks > 0 && Number.isSafeInteger(s.acceptedUniqueTasks) && s.acceptedUniqueTasks >= 0 && s.acceptedUniqueTasks <= s.uniqueTasks;
        return <article key={s.id} className={styles.snapshotCard}><span className={styles.cardKicker}>{s.createdAt}</span><h3>{s.id}</h3><p>{local(catalog.projects.find(p => p.id === s.projectId)?.name, locale)} · {local(catalog.configs.find(c => c.id === s.configId)?.label, locale) || s.configId}</p><p>{text(locale, "Принято уникальных задач", "Accepted unique tasks")}: {validCounts ? `${s.acceptedUniqueTasks} / ${s.uniqueTasks}` : text(locale, "Некорректная запись", "Invalid record")}</p><p>{text(locale, "Повторений на задачу", "Repetitions per task")}: {s.repetitions}</p><p>{text(locale, "Корпус", "Corpus")}: {s.corpusVersion}</p><code>{s.tasksetHash}</code><p className={styles.hint}>{text(locale, "Здесь показаны счётчики задач. Интервал не рассчитывается автоматически: нужны подтверждённые независимые единицы и заранее заданная агрегация повторов.", "These are task counts. No interval is calculated automatically: confirmed independent units and a prespecified repetition aggregation rule are required.")}</p><p>{text(locale, "Зарегистрированные затраты", "Recorded costs")}: {s.costComplete && s.totalCost !== null && Number.isFinite(s.totalCost) && s.totalCost >= 0 ? `${numberDisplay(s.totalCost, locale, 4)} ${s.currency}` : text(locale, "Не установлена", "Unknown")}</p><p>{text(locale, "Основа учёта", "Accounting basis")}: {s.accountingBasis === "fully_loaded" ? text(locale, "Полная распределённая себестоимость", "Fully loaded cost") : s.accountingBasis === "marginal_cash" ? text(locale, "Предельные денежные расходы", "Marginal cash cost") : text(locale, "Не установлена", "Unknown")}</p>{s.repetitionAggregationRule && <p className={styles.hint}>{text(locale, "Правило повторов и затрат", "Repetition and cost rule")}: {s.repetitionAggregationRule}</p>}</article>;
      })}</div>}
    </section>
    <ExperimentPlanner catalog={catalog} locale={locale} />
    <section className={styles.section} aria-labelledby="learning-calculators"><div className={styles.sectionHeading}><h2 id="learning-calculators">{text(locale, "Калькуляторы протокола", "Protocol calculators")}</h2><p>{text(locale, "Ручной учебный ввод. Эти числа не публикуются как результаты моделей.", "Manual educational inputs. These numbers are not published as model results.")}</p></div><div className={styles.calculatorGrid}><WilsonCalculator locale={locale} /><CostCalculator locale={locale} /><BrierExample locale={locale} /></div></section>
  </>;
}

function ExperimentPlanner({ catalog, locale }: Shared) {
  const id = useId();
  const [projectId, setProjectId] = useState(catalog.projects[0]?.id ?? "");
  const [sliceId, setSliceId] = useState("");
  const [configId, setConfigId] = useState("");
  const [metricId, setMetricId] = useState("");
  const [acceptance, setAcceptance] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [taskHash, setTaskHash] = useState("");
  const [corpusHash, setCorpusHash] = useState("");
  const [corpusVersion, setCorpusVersion] = useState("");
  const [split, setSplit] = useState("held-out");
  const [seed, setSeed] = useState("");
  const [repetitions, setRepetitions] = useState("1");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [turns, setTurns] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedProject = catalog.projects.find(p => p.id === params.get("project"));
    if (!requestedProject) return;
    setProjectId(requestedProject.id);
    const requestedSlice = catalog.slices.find(s => s.id === params.get("slice") && s.projectId === requestedProject.id);
    if (requestedSlice) setSliceId(requestedSlice.id);
  }, [catalog.projects, catalog.slices]);
  const project = catalog.projects.find(p => p.id === projectId);
  const choices = catalog.slices.filter(s => s.projectId === projectId);
  const slice = choices.find(s => s.id === sliceId) ?? choices[0];
  const lens = catalog.lenses.find(l => l.id === slice?.lensId);
  const candidates = catalog.configs.filter(c => slice?.configIds.includes(c.id));
  const config = candidates.find(c => c.id === configId) ?? candidates[0];
  const metric = slice?.metrics.find(m => m.id === metricId) ?? slice?.metrics[0];
  const executor = catalog.executors.find(e => e.id === config?.executorId);
  const rep = strictInteger(repetitions);
  const budgetValue = budget.trim() ? nonnegativeNumber(budget) : null;
  const turnsValue = turns.trim() ? strictInteger(turns) : null;
  const timeValue = timeLimit.trim() ? nonnegativeNumber(timeLimit) : null;
  const hashOkay = (value: string) => !value.trim() || /^[a-f0-9]{64}$/i.test(value.trim());
  const inputValid = rep !== null && rep > 0 && (!budget.trim() || budgetValue !== null) && (!turns.trim() || (turnsValue !== null && turnsValue > 0)) && (!timeLimit.trim() || (timeValue !== null && timeValue > 0)) && hashOkay(taskHash) && hashOkay(corpusHash);
  const acceptanceRule = acceptance === null ? local(slice?.acceptance, locale) : acceptance;
  const winnerRule = winner === null ? text(locale,
    "До запуска зафиксировать порог приёмки и критические нарушения. Сравнить долю принятых уникальных задач с неопределённостью; среди допустимых кандидатов учитывать полную стоимость и время. При недостатке данных победитель не определён.",
    "Freeze acceptance thresholds and critical violations before running. Compare accepted unique-task rates with uncertainty; among eligible candidates, consider complete cost and latency. Insufficient evidence means no winner.") : winner;
  const canExport = Boolean(project && slice && config && metric && acceptanceRule.trim() && winnerRule.trim() && inputValid);
  function resetSlice(next: string) { setSliceId(next); setConfigId(""); setMetricId(""); setAcceptance(null); setDownloaded(false); }
  function downloadPlan() {
    if (!canExport || !project || !slice || !config || !metric || !rep) return;
    const hash = (value: string) => ({ algorithm: "sha256", value: value.trim() || null, status: value.trim() ? "provided-not-verified" : "placeholder-not-set" });
    const identityPinned = Boolean(config.modelId && config.provider && config.harnessVersion && config.runtimeVersion && config.tools.length && executor?.versionStatus === "installed-verified");
    const plan = {
      schemaVersion: "1.0", kind: "research-atlas-experiment-plan", status: "planned", evidenceStatus: "not-measured", createdAt: new Date().toISOString(), catalogVersion: catalog.version,
      project: { id: project.id, name: project.name }, lens: { id: lens?.id ?? slice.lensId, name: lens?.name ?? null }, sliceId: slice.id,
      task: { title: slice.title, specification: slice.task, proposedScope: slice.proposedScope ?? null, pilot: slice.pilot ?? null, tasksetHash: hash(taskHash), corpusHash: hash(corpusHash), corpusVersion: corpusVersion.trim() || null },
      configId: config.id,
      configuration: { label: config.label, executorId: config.executorId, executorName: executor?.name ?? null, catalogCandidateStatus: config.status, identityStatus: identityPinned ? "pinned-not-measured" : "needs-pin", model: config.model, modelId: config.modelId || null, provider: config.provider || null, effort: config.effort || null, harnessVersion: config.harnessVersion || null, runtimeVersion: config.runtimeVersion || null, executorVersionEvidence: executor?.versionStatus ?? "unknown", tools: [...config.tools], notes: config.notes },
      metric: { id: metric.id, name: metric.name, unit: metric.unit, direction: metric.direction }, metricUnit: metric.unit,
      split: { method: split, assignmentHash: null, note: "Freeze before evaluation; hold out related items together; use temporal separation where required." },
      seed: seed.trim() || null, seedSupportVerified: false, repetitions: rep,
      samplingUnit: "unique independent task", repetitionAggregationRule: "TO_BE_FIXED_BEFORE_RUN; repeated attempts are not independent tasks",
      budget: { totalMoney: budgetValue, currency, maxTurnsPerRun: turnsValue, maxMinutesPerRun: timeValue, tokenLimit: null, missingMeans: "unknown; not zero" },
      ...acceptancePlanFields(slice, acceptanceRule), winnerRules: winnerRule,
      requiredEvidence: ["pinned taskset and corpus hashes", "resolved exact model/provider/adapter", "runtime and tools manifest", "full event log including retries and auxiliary models", "independent acceptance record per unique task", "cost completeness and billing basis", ...(slice.acceptanceGates.some(gate => gate.comparison === "candidate_minus_baseline") ? ["baseline identity, version/hash and comparison protocol frozen before any run"] : [])],
      results: null,
    };
    const blob = new Blob([JSON.stringify(plan, null, 2) + "\n"], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `experiment-plan-${project.id.replace(/[^a-z0-9_-]/gi, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return <section className={styles.planner} aria-labelledby={`${id}-title`}>
    <div className={styles.sectionHeading}><div><span className={styles.cardKicker}>{text(locale, "Локальный план · без отправки данных", "Local plan · no data submission")}</span><h2 id={`${id}-title`}>{text(locale, "Спроектировать эксперимент", "Design an experiment")}</h2></div><span className={styles.status}>{text(locale, "Всегда status: planned", "Always status: planned")}</span></div>
    <p>{text(locale, "Экспорт создаёт JSON на вашем устройстве. Поля не запрашивают ключи, токены доступа или секреты; результаты в план не подставляются.", "Export creates a JSON file on your device. Fields do not request credentials or secrets, and the plan contains no measured results.")}</p>
    <div className={styles.formGrid}>
      <label htmlFor={`${id}-project`}>{text(locale, "Проект", "Project")}<select id={`${id}-project`} value={projectId} onChange={e => { setProjectId(e.target.value); resetSlice(""); }}>{catalog.projects.map(p => <option key={p.id} value={p.id}>{local(p.name, locale)}</option>)}</select></label>
      <label htmlFor={`${id}-slice`}>{text(locale, "Задача / призма", "Task / lens")}<select id={`${id}-slice`} value={slice?.id ?? ""} onChange={e => resetSlice(e.target.value)}>{choices.map(s => <option key={s.id} value={s.id}>{local(s.title, locale)}</option>)}</select></label>
      <label htmlFor={`${id}-config`}>{text(locale, "Конфигурация-кандидат", "Candidate configuration")}<select id={`${id}-config`} value={config?.id ?? ""} onChange={e => { setConfigId(e.target.value); setDownloaded(false); }}>{candidates.map(c => <option key={c.id} value={c.id}>{local(c.label, locale)}</option>)}</select></label>
      <label htmlFor={`${id}-metric`}>{text(locale, "Основная метрика", "Primary metric")}<select id={`${id}-metric`} value={metric?.id ?? ""} onChange={e => setMetricId(e.target.value)}>{slice?.metrics.map(m => <option key={m.id} value={m.id}>{local(m.name, locale)} ({m.unit})</option>)}</select></label>
    </div>
    {config && <details className={styles.details}><summary>{text(locale, "Полная идентичность выбранной конфигурации", "Full identity of the selected configuration")}</summary><ConfigIdentity config={config} catalog={catalog} locale={locale} /><p>{local(config.notes, locale)}</p></details>}
    {!config && <p className={styles.caution}>{text(locale, "Для этой задачи ещё не задан кандидат. Экспорт пока недоступен.", "No candidate is mapped to this task. Export is not available yet.")}</p>}
    <fieldset className={styles.fieldset}><legend>{text(locale, "Корпус, разделение и повторения", "Corpus, split, and repetitions")}</legend><div className={styles.formGrid}>
      <label htmlFor={`${id}-taskhash`}>Taskset SHA-256<input id={`${id}-taskhash`} value={taskHash} onChange={e => setTaskHash(e.target.value)} spellCheck={false} placeholder={text(locale, "Можно оставить незаполненным", "May remain unset")} aria-invalid={!hashOkay(taskHash)} /></label>
      <label htmlFor={`${id}-corpushash`}>Corpus SHA-256<input id={`${id}-corpushash`} value={corpusHash} onChange={e => setCorpusHash(e.target.value)} spellCheck={false} placeholder={text(locale, "64 hex-символа после фиксации", "64 hex characters after freezing")} aria-invalid={!hashOkay(corpusHash)} /></label>
      <label htmlFor={`${id}-corpusversion`}>{text(locale, "Версия корпуса", "Corpus version")}<input id={`${id}-corpusversion`} value={corpusVersion} onChange={e => setCorpusVersion(e.target.value)} placeholder="unassigned" /></label>
      <label htmlFor={`${id}-split`}>{text(locale, "Разделение данных", "Data split")}<select id={`${id}-split`} value={split} onChange={e => setSplit(e.target.value)}><option value="held-out">Held-out test</option><option value="group-held-out">Group-held-out</option><option value="temporal">Temporal holdout</option><option value="walk-forward">Walk-forward</option></select></label>
      <label htmlFor={`${id}-seed`}>Seed <span className={styles.muted}>({text(locale, "если поддерживается", "if supported")})</span><input id={`${id}-seed`} value={seed} onChange={e => setSeed(e.target.value)} placeholder={text(locale, "Не задан", "Unset")} /></label>
      <label htmlFor={`${id}-repetitions`}>{text(locale, "Повторений на уникальную задачу", "Repetitions per unique task")}<input id={`${id}-repetitions`} inputMode="numeric" value={repetitions} onChange={e => setRepetitions(e.target.value)} aria-invalid={rep === null || rep < 1} /></label>
    </div><p className={styles.hint}>{text(locale, "Незаполненный hash — явный placeholder. Seed не гарантирует детерминизм. Повторы одной задачи нельзя считать независимыми задачами; правило их агрегации фиксируется до запуска.", "An unset hash is an explicit placeholder. A seed does not guarantee determinism. Repetitions of one task are not independent tasks; freeze their aggregation rule before running.")}</p></fieldset>
    <fieldset className={styles.fieldset}><legend>{text(locale, "Бюджет и ограничения", "Budget and limits")}</legend><div className={styles.formGrid}>
      <label htmlFor={`${id}-budget`}>{text(locale, "Общий денежный лимит", "Total monetary limit")}<input id={`${id}-budget`} inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} placeholder={text(locale, "Не задан ≠ 0", "Unset ≠ 0")} aria-invalid={Boolean(budget.trim()) && budgetValue === null} /></label>
      <label htmlFor={`${id}-currency`}>{text(locale, "Валюта", "Currency")}<select id={`${id}-currency`} value={currency} onChange={e => setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>RUB</option></select></label>
      <label htmlFor={`${id}-turns`}>{text(locale, "Максимум turns на запуск", "Max turns per run")}<input id={`${id}-turns`} inputMode="numeric" value={turns} onChange={e => setTurns(e.target.value)} placeholder={text(locale, "Не задан", "Unset")} /></label>
      <label htmlFor={`${id}-time`}>{text(locale, "Лимит минут на запуск", "Minutes per run")}<input id={`${id}-time`} inputMode="decimal" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder={text(locale, "Не задан", "Unset")} /></label>
    </div></fieldset>
    <div className={styles.formGrid}>
      <label htmlFor={`${id}-acceptance`}>{text(locale, "Правило приёмки", "Acceptance rule")}<textarea id={`${id}-acceptance`} rows={5} value={acceptanceRule} onChange={e => setAcceptance(e.target.value)} /></label>
      <label htmlFor={`${id}-winner`}>{text(locale, "Правила выбора победителя", "Winner rules")}<textarea id={`${id}-winner`} rows={5} value={winnerRule} onChange={e => setWinner(e.target.value)} /></label>
    </div>
    {!inputValid && <p id={`${id}-error`} className={styles.error} role="alert">{text(locale, "Проверьте поля: SHA-256 — 64 hex-символа или пусто; повторения и turns — положительные целые; время > 0; денежный лимит ≥ 0.", "Check inputs: SHA-256 must be 64 hex characters or blank; repetitions and turns must be positive integers; time > 0; monetary limit ≥ 0.")}</p>}
    <div className={styles.exportRow}><button className={styles.primaryButton} type="button" onClick={downloadPlan} disabled={!canExport} aria-describedby={!inputValid ? `${id}-error` : undefined}>{text(locale, "Скачать план JSON", "Download JSON plan")} <span aria-hidden="true">↓</span></button><p className={styles.hint} role="status">{downloaded ? text(locale, "Файл подготовлен к скачиванию. Это план, не результат эксперимента.", "File prepared for download. This is a plan, not an experiment result.") : text(locale, "Локальное действие. Ничего не записывается на сервер.", "Local action. Nothing is written to the server.")}</p></div>
  </section>;
}

function WilsonCalculator({ locale }: { locale: AtlasLocale }) {
  const id = useId();
  const [nText, setNText] = useState("");
  const [kText, setKText] = useState("");
  const n = strictInteger(nText); const k = strictInteger(kText);
  const valid = n !== null && n > 0 && k !== null && k >= 0 && k <= n;
  const interval = useMemo(() => valid && n !== null && k !== null ? wilson(k, n) : null, [valid, n, k]);
  const touched = Boolean(nText || kText);
  return <article className={styles.calculator}><span className={styles.cardKicker}>WILSON 95% / n, k</span><h3>{text(locale, "Доля принятых задач и неопределённость", "Acceptance rate and uncertainty")}</h3><p>{text(locale, "n — независимые уникальные задачи; k — принятые. Вызовы LLM и повторы не увеличивают n.", "n counts independent unique tasks; k counts accepted tasks. LLM calls and repetitions do not increase n.")}</p><div className={styles.formGrid}>
    <label htmlFor={`${id}-n`}>n · {text(locale, "уникальных задач", "unique tasks")}<input id={`${id}-n`} value={nText} onChange={e => setNText(e.target.value)} inputMode="numeric" placeholder="n > 0" aria-invalid={Boolean(nText) && (n === null || n < 1)} /></label>
    <label htmlFor={`${id}-k`}>k · {text(locale, "принятых", "accepted")}<input id={`${id}-k`} value={kText} onChange={e => setKText(e.target.value)} inputMode="numeric" placeholder="0 ≤ k ≤ n" aria-invalid={Boolean(kText) && (k === null || (n !== null && k > n))} /></label>
    </div><div className={styles.calculatorResult} aria-live="polite">{interval && n !== null && k !== null ? <><strong>{numberDisplay(100 * k / n, locale)}%</strong><span>Wilson 95%: {numberDisplay(100 * interval[0], locale)}–{numberDisplay(100 * interval[1], locale)}%</span></> : <span>{n === 0 ? text(locale, "Нет измерений: n = 0. Интервал не определён.", "No measurements: n = 0. The interval is undefined.") : touched ? text(locale, "Нужны целые n > 0 и 0 ≤ k ≤ n.", "Enter integers n > 0 and 0 ≤ k ≤ n.") : text(locale, "Введите n и k для расчёта.", "Enter n and k to calculate.")}</span>}</div><p className={styles.hint}>{text(locale, "Интервал предполагает независимые испытания Бернулли с общей вероятностью успеха. Связанные задачи и повторные прогоны требуют другой модели неопределённости. Интервал не исправляет смещение набора задач.", "The interval assumes independent Bernoulli trials with a common success probability. Related tasks and repeated runs need a different uncertainty model. An interval does not correct taskset bias.")}</p></article>;
}
function CostCalculator({ locale }: { locale: AtlasLocale }) {
  const id = useId();
  const [costText, setCostText] = useState("");
  const [acceptedText, setAcceptedText] = useState("");
  const [complete, setComplete] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const cost = nonnegativeNumber(costText); const accepted = strictInteger(acceptedText);
  const result = complete && cost !== null && accepted !== null && accepted > 0 ? cost / accepted : null;
  return <article className={styles.calculator}><span className={styles.cardKicker}>TOTAL COST / ACCEPTED</span><h3>{text(locale, "Стоимость принятого результата", "Cost per accepted result")}</h3><p>{text(locale, "В числителе затраты всей когорты, включая неудачи, повторные попытки и вспомогательные модели.", "The numerator includes all cohort costs, including failures, retries, and auxiliary models.")}</p><div className={styles.formGrid}>
    <label htmlFor={`${id}-cost`}>{text(locale, "Полные затраты", "Complete cost")}<input id={`${id}-cost`} inputMode="decimal" value={costText} onChange={e => setCostText(e.target.value)} placeholder={text(locale, "Неизвестно ≠ 0", "Unknown ≠ 0")} aria-invalid={Boolean(costText) && cost === null} /></label>
    <label htmlFor={`${id}-accepted`}>{text(locale, "Принятых уникальных задач", "Accepted unique tasks")}<input id={`${id}-accepted`} inputMode="numeric" value={acceptedText} onChange={e => setAcceptedText(e.target.value)} aria-invalid={Boolean(acceptedText) && accepted === null} /></label>
    <label htmlFor={`${id}-currency`}>{text(locale, "Валюта", "Currency")}<select id={`${id}-currency`} value={currency} onChange={e => setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>RUB</option></select></label></div>
    <label className={styles.checkbox} htmlFor={`${id}-complete`}><input id={`${id}-complete`} type="checkbox" checked={complete} onChange={e => setComplete(e.target.checked)} /><span>{text(locale, "Полнота затрат проверена; числитель и знаменатель относятся к одной когорте.", "Cost completeness verified; numerator and denominator refer to the same cohort.")}</span></label>
    <div className={styles.calculatorResult} aria-live="polite">{result !== null ? <><strong>{numberDisplay(result, locale, 4)} {currency}</strong><span>{text(locale, "за принятый результат", "per accepted result")}</span></> : <span>{accepted === 0 ? text(locale, "Нет принятых задач. Стоимость на принятый результат не определена, а не равна нулю.", "No accepted tasks. Cost per accepted result is undefined, not zero.") : !complete ? text(locale, "Пока полнота затрат не подтверждена, результат неизвестен.", "Until cost completeness is confirmed, the result is unknown.") : text(locale, "Введите затраты ≥ 0 и положительное целое число принятых задач.", "Enter cost ≥ 0 and a positive integer count of accepted tasks.")}</span>}</div>
    <p className={styles.hint}>{text(locale, "Фактический счёт, API-equivalent estimate и распределённая стоимость подписки — разные основания расчёта. Для сравнения выберите одно и зафиксируйте его.", "Actual bills, API-equivalent estimates, and allocated subscription costs use different bases. Choose and record one basis for a comparison.")}</p></article>;
}
function BrierExample({ locale }: { locale: AtlasLocale }) {
  const id = useId();
  const [confidence, setConfidence] = useState(70);
  const [correct, setCorrect] = useState(1);
  const p = confidence / 100;
  const score = (p - correct) ** 2;
  return <article className={styles.calculator}><span className={styles.exampleBadge}>{text(locale, "УЧЕБНЫЙ ПРИМЕР · НЕ МОДЕЛЬНЫЙ РЕЗУЛЬТАТ", "EDUCATIONAL EXAMPLE · NOT A MODEL RESULT")}</span><h3>Brier · chosen-answer</h3><p>{text(locale, "p — заявленная вероятность, что выбранный ответ верен. y = 1, если независимая проверка признала его верным; иначе y = 0.", "p is the stated probability that the chosen answer is correct. y = 1 if independent verification confirms it; otherwise y = 0.")}</p>
    <label htmlFor={`${id}-confidence`}>{text(locale, "Уверенность p", "Confidence p")}: {confidence}%<input id={`${id}-confidence`} type="range" min="0" max="100" step="1" value={confidence} onChange={e => setConfidence(Number(e.target.value))} /></label>
    <label htmlFor={`${id}-correct`}>{text(locale, "Результат независимой проверки y", "Independent verification y")}<select id={`${id}-correct`} value={correct} onChange={e => setCorrect(Number(e.target.value))}><option value={1}>{text(locale, "Ответ верен · y = 1", "Correct answer · y = 1")}</option><option value={0}>{text(locale, "Ответ неверен · y = 0", "Incorrect answer · y = 0")}</option></select></label>
    <div className={styles.calculatorResult} aria-live="polite"><strong>{numberDisplay(score, locale, 4)}</strong><span>({numberDisplay(p, locale, 2)} − {correct})²</span></div><p className={styles.hint}>{text(locale, "Это бинарная оценка уверенности выбранного ответа, диапазон 0–1; ниже лучше. Для набора берут среднее. Один пример не доказывает калибровку, а многоклассовый Brier имеет другую постановку.", "This is the binary confidence score of a chosen answer, ranging from 0 to 1; lower is better. Average it over a set. One example does not establish calibration; multiclass Brier is a different formulation.")}</p></article>;
}

export { ResearchAtlas };
