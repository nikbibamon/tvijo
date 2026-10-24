'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Cpu,
  DatabaseZap,
  ExternalLink,
  Eye,
  FileCheck2,
  GitBranch,
  KeyRound,
  Layers3,
  Lock,
  Menu,
  Network,
  Radar,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/config';
import { getPublicCta } from '@/i18n/public-surface';
import {
  fetchHomePageContent,
  getHomePageBlock,
  getStringField,
  type HomePageContent,
} from '@/services/homepage-api';
import { fetchAIRadar, type AIRadarOverview } from '@/services/ai-radar-api';
import LeadCaptureForm from '@/components/home/LeadCaptureForm';
import ExposureScanEntry from '@/components/home/ExposureScanEntry';
import KnowledgeLearnSection from '@/components/home/KnowledgeLearnSection';
import ExecutionContractBand from '@/components/home/ExecutionContractBand';
import ReadinessBand from '@/components/home/ReadinessBand';
import HomeLanguageSwitcher from '@/components/home/HomeLanguageSwitcher';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

const asset = (name: string) => `/images/aios-landing/${name}`;

// Everything below is layout-only: icons, colours and illustrative numbers. Every
// user-facing string lives in `t.home.*` (en.ts is the source of truth) and is joined
// in by index at render time, so the arrays here must stay the same length as theirs.

const kpiVisuals = [
  { value: '$47,200', tone: 'text-red-400' },
  { value: '2.4M', tone: 'text-white' },
  { value: '$39.6K / $42K', tone: 'text-white' },
  { value: '92%', tone: 'text-emerald-300' },
];

const dashboardTiles = [
  { value: '0.0M', icon: Lock, tone: 'text-fuchsia-300' },
  { value: '96', icon: ShieldCheck, tone: 'text-slate-200' },
  { value: '0.0', icon: DatabaseZap, tone: 'text-cyan-300' },
  { value: '22', icon: Users, tone: 'text-emerald-300' },
];


const benefitIcons = [Network, GitBranch, ShieldCheck, BarChart3, Boxes];

// Metrics here are status tokens, not counters: the architecture section states
// which layers run today and which are design (i18n `home.architecture.layers`),
// so the badges must not put a number on a layer that does not exist.
const architectureLayers = [
  { icon: KeyRound, label: { en: 'Identity & BYOK', ru: 'Идентичность и BYOK', uk: 'Ідентичність і BYOK' }, metric: 'design' },
  { icon: ShieldCheck, label: { en: 'Policy Runtime', ru: 'Политики в рантайме', uk: 'Політики в рантаймі' }, metric: 'design' },
  { icon: Workflow, label: { en: 'Smart Routing', ru: 'Умная маршрутизация', uk: 'Розумна маршрутизация' }, metric: 'live' },
  { icon: Radar, label: { en: 'Observability', ru: 'Наблюдаемость', uk: 'Спостережуваність' }, metric: 'live' },
  { icon: FileCheck2, label: { en: 'Audit Evidence', ru: 'Доказательства аудита', uk: 'Докази аудиту' }, metric: 'live' },
  { icon: ServerCog, label: { en: 'Connectors', ru: 'Коннекторы', uk: 'Конектори' }, metric: 'live' },
];

/** Readiness badge next to an architecture layer. */
const METRIC_LABELS: Record<string, { en: string; ru: string; uk: string }> = {
  live: { en: 'live', ru: 'в проде', uk: 'у проді' },
  design: { en: 'in design', ru: 'в проекте', uk: 'у проєкті' },
};

const agentCards = [
  { icon: Bot, app: 'Customer Support Bot', lane: 'Support', model: 'GLM 5.3 Flash', policy: 'Budget capped', cost: '-42%', latency: '1.2s' },
  { icon: Users, app: 'HR Assistant', lane: 'People Ops', model: 'Claude Opus 5', policy: 'Call recorded', cost: '-18%', latency: '1.6s' },
  { icon: Cpu, app: 'Code Copilot', lane: 'Engineering', model: 'Kimi K3', policy: 'Budget capped', cost: '-61%', latency: '0.9s' },
  { icon: BrainCircuit, app: 'Research Agent', lane: 'Strategy', model: 'Claude Fable 5.1', policy: 'Call recorded', cost: '-23%', latency: '2.1s' },
];

const automationTitles = ['Detect', 'Mask', 'Route', 'Approve', 'Audit'];

const costBars = [
  // Illustrative spend split. The rows must sum to the $39.6K headline chip below —
  // they used to total $43.6K under a "$39.6K of $42K limit" label, which any reader
  // adding the column would catch. This dated spend mix is intentionally wider
  // than the three recommended task lanes below.
  ['GPT-5.6 Sol', '$11.9k', 'w-[72%]', 'bg-cyan-300'],
  ['Claude Fable 5.1', '$9.4k', 'w-[57%]', 'bg-cyan-300'],
  ['Claude Opus 5', '$6.8k', 'w-[41%]', 'bg-violet-300'],
  ['GLM 5.3', '$4.3k', 'w-[26%]', 'bg-violet-300'],
  ['DeepSeek V4 Flash', '$3.2k', 'w-[19%]', 'bg-violet-300'],
  ['Kimi K3', '$2.4k', 'w-[15%]', 'bg-violet-300'],
  ['MiniMax M3', '$1.6k', 'w-[10%]', 'bg-amber-300'],
];

/** Columns after the request cell — the request label comes from `t.home.routing.requests`. */
const routingRows = [
  ['Customer Support Bot', 'GLM 5.3 Flash', 'eu-west-1', 'Budget-Cap', '$0.012', '99.9%', '1.2s'],
  ['HR Assistant', 'Claude Opus 5', 'eu-west-1', 'Budget-Cap, Call-Record', '$0.021', '99.8%', '1.6s'],
  ['Code Copilot', 'Kimi K3', 'us-east-1', 'Budget-Cap, Call-Record', '$0.008', '99.7%', '0.9s'],
  ['Research Agent', 'Claude Fable 5.1', 'eu-west-1', 'Budget-Cap, Call-Record', '$0.019', '99.3%', '2.1s'],
  ['Marketing Studio', 'GLM 5.3', 'us-east-1', 'Budget-Cap', '$0.013', '99.8%', '1.3s'],
  ['Ops Digest', 'DeepSeek V4 Flash', 'eu-west-1', 'Budget-Cap', '$0.004', '99.6%', '1.1s'],
];

const marketRadarCopy = {
  en: {
    title: 'Live model radar',
    lead: 'Models move. Your control plane should not.',
    text: 'Tvijo sits between your apps and the model market, routing each task by cost, quality, latency and risk. When models shift, your operating rules stay in place.',
    snapshot: 'Snapshot · 03 Sep 2026',
    openRouter: 'OpenRouter usage',
    github: 'GitHub momentum',
    rail: 'Tvijo policy + budget + audit',
    spendNote: 'Illustrative spend · market signals are dated',
    signalTitle: 'What agent adoption is rewarding',
    signalNote: 'Persistent memory · reusable skills · parallel agents · human approval',
    spendTitle: 'Model spend allocation',
    live: 'Live data',
    catalogOnly: 'Catalog only',
    adoptionTitle: 'Models by token usage',
    adoptionNote: 'Public OpenRouter adoption · tokens are not a quality score',
    topModels: 'Top models',
    trendingApps: 'Trending apps',
    fullRadar: 'Explore the full AI radar',
  },
  ru: {
    title: 'Живой радар моделей',
    lead: 'Модели меняются. Контроль-плейн — нет.',
    text: 'Tvijo стоит между приложениями и рынком моделей: выбирает маршрут по стоимости, качеству, задержке и риску. Модель можно заменить, а правила работы сохраняются.',
    snapshot: 'Снимок · 03 сентября 2026',
    openRouter: 'Использование OpenRouter',
    github: 'Динамика GitHub',
    rail: 'Политики + бюджет + аудит Tvijo',
    spendNote: 'Расходы — пример · рыночные сигналы имеют дату',
    signalTitle: 'За что рынок выбирает агентов',
    signalNote: 'Постоянная память · навыки · параллельные агенты · согласование человеком',
    spendTitle: 'Распределение расходов по моделям',
    live: 'Живые данные',
    catalogOnly: 'Только каталог',
    adoptionTitle: 'Модели по использованию токенов',
    adoptionNote: 'Публичное использование OpenRouter · токены не равны качеству',
    topModels: 'Лидеры',
    trendingApps: 'Растущие приложения',
    fullRadar: 'Открыть полный AI-радар',
  },
} as const;

// Labels and notes carry all three languages: the previous `labelRu` pair left
// the note in English even on the Russian page.
const modelLanes = [
  { icon: BarChart3, label: { en: 'Routine / high volume', ru: 'Рутина / большой объём', uk: 'Рутина / великий обсяг' }, model: 'GLM 5.3 Flash', note: { en: 'cost + throughput', ru: 'цена + пропускная способность', uk: 'ціна + пропускна здатність' } },
  { icon: Code2, label: { en: 'Code / long context', ru: 'Код / длинный контекст', uk: 'Код / довгий контекст' }, model: 'Kimi K3', note: { en: 'tools + repository context', ru: 'инструменты + контекст репозитория', uk: 'інструменти + контекст репозиторію' } },
  { icon: ShieldCheck, label: { en: 'High-stakes reasoning', ru: 'Ответственные решения', uk: 'Відповідальні рішення' }, model: 'Claude Fable 5.1', note: { en: 'quality + verification', ru: 'качество + проверка', uk: 'якість + перевірка' } },
];

const riskCounts = ['312', '157', '84', '45'];

/** Three-locale pick for copy that lives outside the i18n bundles.
 *
 * WHY inline instead of keys in src/i18n/locales/*: those files are typed as
 * `Translations = typeof en`, so a new key must be added to all eleven locales
 * before the build passes. This helper covers the three languages the site
 * actually serves for content, and falls back to English for the rest.
 */
type Trio = { en: string; ru: string; uk: string };
const pick = (value: Trio, locale: string): string =>
  locale === 'ru' ? value.ru : locale === 'uk' ? value.uk : value.en;

const SECTION_EYEBROWS = {
  cms: { en: 'From Django CMS', ru: 'Из Django CMS', uk: 'З Django CMS' },
  marketData: { en: 'Market data block', ru: 'Блок рыночных данных', uk: 'Блок ринкових даних' },
  controlRoom: { en: 'Live control room', ru: 'Живая диспетчерская', uk: 'Жива диспетчерська' },
  architecture: { en: 'AI OS Architecture', ru: 'Архитектура AI OS', uk: 'Архітектура AI OS' },
  agentOps: { en: 'Agent Operations', ru: 'Операции агентов', uk: 'Операції агентів' },
  guardrails: { en: 'Runtime Guardrails', ru: 'Guardrails в рантайме', uk: 'Guardrails у рантаймі' },
  routingConsole: { en: 'Model routing console', ru: 'Консоль маршрутизации моделей', uk: 'Консоль маршрутизації моделей' },
  auditEvidence: { en: 'Audit evidence pack', ru: 'Пакет доказательств аудита', uk: 'Пакет доказів аудиту' },
  rollout: { en: 'Enterprise rollout', ru: 'Внедрение в компании', uk: 'Упровадження в компанії' },
};

const SECTION_TITLES = {
  compliance: { en: 'AI Governance & Compliance', ru: 'Управление ИИ и комплаенс', uk: 'Управління ШІ та комплаєнс' },
};

const personaImages = ['persona-ciso.webp', 'persona-startup.webp', 'persona-vc.webp', 'persona-regulated.webp'];

// Model/cloud providers first, then the channels teams actually reach people
// through (messengers and social), then work tools. Brand names stay in
// Latin script in every locale — they are product names, not copy.
const integrations = [
  'OpenAI', 'Anthropic', 'DeepSeek', 'Google', 'Meta', 'co:here', 'Mistral AI',
  'Azure', 'AWS', 'OpenRouter', 'Groq', 'DeepInfra', 'databricks', 'snowflake',
  'Telegram', 'WhatsApp', 'Viber', 'Instagram', 'Threads', 'Facebook', 'X',
  'Discord', 'Signal', 'LinkedIn',
  'slack', 'Microsoft Teams', 'Google Chat', 'Jira', 'salesforce', 'HubSpot',
  'Zendesk', 'Notion', 'okta', 'Bitrix24', 'AmoCRM',
];

const rolloutSteps = [
  { phase: '01', title: { en: 'Map', ru: 'Карта', uk: 'Карта' }, time: { en: 'Day 1-3', ru: 'День 1-3', uk: 'День 1-3' } },
  { phase: '02', title: { en: 'Connect', ru: 'Подключение', uk: 'Підключення' }, time: { en: 'Week 1', ru: 'Неделя 1', uk: 'Тиждень 1' } },
  { phase: '03', title: { en: 'Enforce', ru: 'Правила', uk: 'Правила' }, time: { en: 'Week 2', ru: 'Неделя 2', uk: 'Тиждень 2' } },
  { phase: '04', title: { en: 'Optimize', ru: 'Оптимизация', uk: 'Оптимізація' }, time: { en: 'Week 3+', ru: 'Неделя 3+', uk: 'Тиждень 3+' } },
];

const evidenceTitles = [
  { en: 'Access matrix', ru: 'Матрица доступа', uk: 'Матриця доступу' },
  { en: 'Policy ledger', ru: 'Журнал политик', uk: 'Журнал політик' },
  { en: 'Cost trail', ru: 'История расходов', uk: 'Історія витрат' },
  { en: 'Incident export', ru: 'Экспорт инцидентов', uk: 'Експорт інцидентів' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-lg font-black text-[#001b18]">T</span>
      <span className="text-lg font-bold tracking-tight">Tvijo</span>
    </Link>
  );
}

function Header({ locale }: { locale: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();
  const cta = getPublicCta(locale);
  const allNavItems = [
    { label: t.home.nav.product, href: '#product' },
    { label: locale === 'ru' ? 'AI-радар' : 'AI Radar', href: `/${locale}/ai-radar` },
    { label: t.home.nav.agentSkills, href: `/${locale}/agent-skills` },
    { label: t.home.nav.architecture, href: '#architecture' },
    { label: t.home.nav.agents, href: '#agents' },
    { label: t.home.nav.routing, href: '#routing' },
    { label: t.home.nav.compliance, href: '#compliance' },
    { label: t.home.nav.integrations, href: '#integrations' },
    { label: t.home.navKnowledge, href: '#knowledge' },
    { label: t.home.navCompare, href: `/${locale}/compare` },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#031117]/92 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {allNavItems.map((item) => (
            <a key={item.label} href={item.href} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
              {item.label}
            </a>
          ))}
          <HomeLanguageSwitcher />
        </nav>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/login`} className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-white sm:inline-flex">
            {t.home.nav.login}
          </Link>
          {/* One primary CTA per screen. The header used to carry four
              equal buttons, two of them labelled "demo" and neither
              leading to one (Gate F review §3). Demo is now secondary and
              points at the sample; talking to a person lives in the
              closing section rather than competing up here. */}
          <Link href={`/${locale}/demo`} className="hidden rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/[0.06] sm:inline-flex">
            {cta.demo}
          </Link>
          <Link
            href={`/${locale}/workspace`}
            onClick={() => trackEvent('cta_click', { location: 'header' })}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-[#001b18] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
          >
            {cta.openWorkspace}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] lg:hidden"
            aria-label={t.home.nav.openMenu}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/[0.07] bg-[#031117] px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {allNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mx-auto mt-3 max-w-7xl">
            <HomeLanguageSwitcher className="w-full [&>button]:w-full [&>button]:justify-center [&>button]:border [&>button]:border-white/[0.07] [&>button]:bg-white/[0.035] [&>button]:py-3" />
          </div>
        </div>
      )}
    </header>
  );
}

function GlowShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-emerald-400/20 bg-[#071d24]/78 shadow-[0_0_55px_rgba(16,185,129,0.08)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>;
}

function Sparkline({ active = true }: { active?: boolean }) {
  const stroke = active ? '#10f5a3' : '#2dd4bf';
  return (
    <svg className="h-12 w-full" viewBox="0 0 140 46" fill="none" aria-hidden="true">
      <path d="M0 35 L8 34 L16 22 L24 30 L32 18 L40 25 L48 15 L56 22 L64 26 L72 12 L80 18 L88 15 L96 24 L104 20 L112 27 L120 18 L128 22 L140 13" stroke={stroke} strokeWidth="2" />
      <path d="M0 45 L0 35 L8 34 L16 22 L24 30 L32 18 L40 25 L48 15 L56 22 L64 26 L72 12 L80 18 L88 15 L96 24 L104 20 L112 27 L120 18 L128 22 L140 13 L140 45 Z" fill="url(#spark)" opacity="0.2" />
      <defs>
        <linearGradient id="spark" x1="70" x2="70" y1="10" y2="45">
          <stop stopColor={stroke} />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const heroPlaneRows = [
  { label: 'Routing', status: 'active' },
  { label: 'Guardrails', status: 'enforced' },
  { label: 'Observability', status: 'live' },
  { label: 'Audit', status: 'sealed' },
];

function HeroVisual() {
  const { t } = useLocale();
  return (
    <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]">
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-white/[0.06] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
        <Image
          src={asset('hero-people-v2.png')}
          alt={t.home.hero.visualAlt}
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031117] via-[#031117]/12 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#031117]/70 via-transparent to-transparent" />
      </div>

      {/* Control-plane card: bottom-left, over the scrim */}
      <GlowShell className="absolute bottom-4 left-3 w-[62%] rounded-2xl p-4 sm:left-5 sm:w-[54%] lg:w-[50%]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">AI OS Control Plane</span>
        </div>
        <div className="space-y-2">
          {heroPlaneRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10">
                  <Check className="h-3 w-3 text-emerald-300" />
                </span>
                {row.label}
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.12em] text-slate-500 sm:inline">{row.status}</span>
            </div>
          ))}
        </div>
      </GlowShell>

      {/* Floating live-throughput chip */}
      <GlowShell className="absolute left-3 top-4 hidden rounded-xl px-3.5 py-2.5 sm:left-5 sm:block">
        <div className="flex items-center gap-3">
          <Radar className="h-4 w-4 shrink-0 text-emerald-300" />
          <div>
            <div className="text-sm font-bold leading-none text-white">14,204</div>
            <div className="mt-1 text-[10px] leading-none text-slate-500">{t.home.hero.throughput}</div>
          </div>
        </div>
      </GlowShell>

      <div className="absolute bottom-4 right-3 hidden w-[190px] space-y-2.5 sm:block">
        {[ShieldCheck, Eye, BarChart3].map((Icon, index) => {
          const label = t.home.hero.chips[index];
          return (
            <GlowShell key={label} className="rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2.5 text-[11px] font-semibold leading-4 text-emerald-50">
                <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                {label}
              </div>
            </GlowShell>
          );
        })}
      </div>
    </div>
  );
}

function Hero({ locale, page }: { locale: Locale; page: HomePageContent | null }) {
  const { t } = useLocale();
  const heroBlock = getHomePageBlock(page, 'hero');
  // The CMS (Wagtail) has no locale awareness — it always returns whatever's stored,
  // which is stale Russian copy from before the i18n/EN-default migration. Only trust
  // it for the CTA URL; all visible text comes from t.home.* so it matches the locale.
  const subtitle = t.home.hero.subtitle;
  const cta = getPublicCta(locale);
  const contactUrl = getStringField(heroBlock, 'cta_url', '#cta');

  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(20,184,166,0.22),transparent_28%),linear-gradient(180deg,#031117_0%,#031018_48%,#041922_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(45,212,191,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-xs font-semibold text-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            {t.home.hero.badge}
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.home.hero.title}
            <span className="block text-emerald-400">{t.home.hero.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/workspace`}
              onClick={() => trackEvent('cta_click', { location: 'hero' })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-bold text-[#001b18] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300"
            >
              {cta.openWorkspace} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/${locale}/demo`} className="inline-flex items-center justify-center rounded-lg border border-white/18 bg-white/[0.03] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]">
              {cta.exploreDemo}
            </Link>
            <a
              href={contactUrl}
              onClick={() => trackEvent('cta_click', { location: 'hero_contact' })}
              className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              {cta.talkToUs}
            </a>
          </div>
          {/* External AI Exposure Check — the free, no-email entry point (GEN-AISCAN-001). */}
          <ExposureScanEntry />
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-400">
            {/* Bare "SOC 2 / ISO 27001" badges read as attestations we do not
                hold — /security states plainly that we hold neither. Labels
                carry their real status instead. */}
            {['SOC 2 — roadmap', 'ISO 27001 — roadmap', 'GDPR — EU hosting', t.home.hero.sovereignStandards].map((item) => (
              <Link key={item} href={`/${locale}/security`} className="inline-flex items-center gap-1.5 transition hover:text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-300" /> {item}
              </Link>
            ))}
          </div>
          {/* Three headline numbers used to sit here — a cost saving, a
              turnaround and an incident count — with no measurement
              behind any of them. A labelled sample run says more than an
              invented percentage, so the readiness band below carries
              this space instead. */}
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function cmsText(value: unknown): string {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return '';
}

function CmsManagedContent({ page }: { page: HomePageContent | null }) {
  const { t, locale } = useLocale();
  const blocks = page?.source === 'wagtail' ? page.content.filter((block) => block.type !== 'hero') : [];
  if (!blocks.length) return null;

  return (
    <section className="border-y border-white/[0.05] bg-[#03141c] py-10 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:px-8 md:grid-cols-2">
        {blocks.map((block, index) => {
          const value = block.value;
          const heading = typeof value.heading === 'string' ? value.heading : '';
          const text = cmsText(value.content ?? value.text);
          const buttonText = typeof value.button_text === 'string' ? value.button_text : '';
          const buttonUrl = typeof value.button_url === 'string' ? value.button_url : '#cta';

          if (block.type === 'cta') {
            return (
              <GlowShell key={`${block.type}-${index}`} className="rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{pick(SECTION_EYEBROWS.cms, locale)}</p>
                <h2 className="mt-3 text-xl font-bold text-white">{heading || t.home.cms.ctaHeading}</h2>
                {text && <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>}
                {buttonText && (
                  <a href={buttonUrl} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-bold text-[#001b18]">
                    {buttonText} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </GlowShell>
            );
          }

          if (block.type === 'chart') {
            return (
              <GlowShell key={`${block.type}-${index}`} className="rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{pick(SECTION_EYEBROWS.marketData, locale)}</p>
                <h2 className="mt-3 text-xl font-bold text-white">{heading || t.home.cms.chartHeading}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {String(value.symbol || 'AI OS')} · {String(value.timeframe || '1d')} · {String(value.chart_type || 'line')}
                </p>
              </GlowShell>
            );
          }

          if (block.type === 'image') {
            const image = value.image;
            const imageUrl = typeof image === 'string'
              ? image
              : image && typeof image === 'object' && 'url' in image && typeof image.url === 'string'
                ? image.url
                : '';
            const alt = typeof value.alt_text === 'string' ? value.alt_text : heading || 'Tvijo AI OS';
            if (imageUrl) {
              return (
                <GlowShell key={`${block.type}-${index}`} className="relative overflow-hidden rounded-2xl p-2">
                  <img src={imageUrl} alt={alt} className="h-56 w-full rounded-xl object-cover" />
                  {typeof value.caption === 'string' && value.caption && (
                    <p className="px-3 py-2 text-xs text-slate-400">{value.caption}</p>
                  )}
                </GlowShell>
              );
            }
          }

          return (
            <GlowShell key={`${block.type}-${index}`} className="rounded-2xl p-5 sm:p-6">
              {heading && <h2 className="text-xl font-bold text-white">{heading}</h2>}
              {text && <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>}
            </GlowShell>
          );
        })}
      </div>
    </section>
  );
}

function DashboardPanel() {
  const { t } = useLocale();
  return (
    <section id="product" className="relative bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.8fr_1fr] lg:px-8">
        <GlowShell className="rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Network className="h-5 w-5 text-emerald-300" />
              {t.home.dashboard.title}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiVisuals.map((card, index) => (
              <div key={t.home.dashboard.kpi[index].title} className="rounded-lg border border-white/[0.08] bg-[#081f28]/80 p-4">
                <p className="min-h-8 text-xs leading-4 text-slate-400">{t.home.dashboard.kpi[index].title}</p>
                <div className={`mt-3 text-2xl font-bold ${card.tone}`}>{card.value}</div>
                <p className="mt-1 text-[11px] text-slate-500">{t.home.dashboard.kpi[index].note}</p>
                {index === 1 && <Sparkline />}
                {index === 2 && <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-emerald-400" /></div>}
                {index === 3 && (
                  <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-emerald-400/80 text-center text-lg font-bold text-white">
                    92%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {dashboardTiles.map(({ icon: Icon, ...tile }, index) => (
              <div key={t.home.dashboard.tiles[index]} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <Icon className={`h-5 w-5 ${tile.tone}`} />
                </span>
                <div>
                  <div className="font-semibold text-white">{tile.value}</div>
                  <p className="text-[11px] leading-4 text-slate-500">{t.home.dashboard.tiles[index]}</p>
                </div>
              </div>
            ))}
          </div>
        </GlowShell>

        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#020b14] lg:min-h-[440px]">
          <Image
            src={asset('control-plane-core-v3.png')}
            alt={t.home.dashboard.coreAlt}
            fill
            sizes="(min-width: 1024px) 32vw, 100vw"
            quality={90}
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,transparent_0%,rgba(2,11,20,0.05)_45%,rgba(2,11,20,0.62)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04151d] to-transparent p-5">
            <div className="text-sm font-semibold text-white">Tvijo AI OS</div>
            <p className="mt-1 text-xs text-slate-400">{t.home.dashboard.coreCaption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommandCenter() {
  const { locale } = useLocale();
  const copy = locale === 'ru' ? marketRadarCopy.ru : marketRadarCopy.en;
  const [radar, setRadar] = useState<AIRadarOverview | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchAIRadar(controller.signal)
      .then((data) => setRadar(data))
      .catch(() => {
        // Static, explicitly labelled market snapshot remains visible.
      });
    return () => controller.abort();
  }, []);

  const liveModels = radar?.status === 'live' ? radar.trending_models : [];
  const liveApps = radar?.status === 'live' ? radar.trending_apps : [];
  const radarDate = radar?.as_of
    ? new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(radar.as_of))
    : null;
  const snapshotLabel = radarDate
    ? `${radar?.status === 'live' ? copy.live : copy.catalogOnly} · ${radarDate}`
    : copy.snapshot;
  const maxTokens = Math.max(
    1,
    liveModels.reduce((maximum, model) => Math.max(maximum, model.total_tokens), 0),
  );
  const compactNumber = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return (
    <section className="relative overflow-hidden border-y border-cyan-300/[0.08] bg-[#020f18] py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(16,185,129,0.09),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[0.86fr_1.08fr_1.12fr] xl:items-center">
          <div className="max-w-lg">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/[0.05] text-cyan-300 shadow-[0_0_36px_rgba(34,211,238,0.08)]">
              <Radar className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{copy.title}</h2>
            <div className="mt-6 h-px w-10 bg-cyan-300" />
            <p className="mt-6 text-lg font-semibold leading-7 text-white">{copy.lead}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{copy.text}</p>

            <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Clock3 className="h-4 w-4" /> {snapshotLabel}
            </div>
            <div className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              <a
                href="https://openrouter.ai/rankings"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-4 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                {copy.openRouter} <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/topics/ai-agents"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-4 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                {copy.github} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_104px] xl:grid-cols-[1fr_116px]">
            <div className="space-y-3">
              {modelLanes.map(({ icon: Icon, label, model, note }) => (
                <div key={model} className="group relative border border-cyan-300/25 bg-[#041922]/85 p-4 transition hover:border-cyan-300/45 sm:p-5">
                  <div className="flex items-start gap-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">{pick(label, locale)}</h3>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">{pick(note, locale)}</span>
                      </div>
                      <div className="mt-4 border-t border-white/[0.07] pt-4 text-lg font-bold text-cyan-300">{model}</div>
                    </div>
                  </div>
                  <div className="absolute right-[-25px] top-1/2 hidden h-px w-6 bg-emerald-300/60 sm:block" />
                </div>
              ))}
            </div>
            <div className="relative flex min-h-32 items-center justify-center border border-emerald-300/70 bg-emerald-400/[0.08] px-3 py-6 text-center shadow-[0_0_42px_rgba(16,185,129,0.10)]">
              <div className="absolute inset-y-5 left-0 w-px bg-emerald-300/35" />
              <div>
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-300" />
                <div className="mx-auto my-5 h-px w-10 bg-emerald-300/60" />
                <p className="text-xs font-bold leading-5 text-white">{copy.rail}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs leading-5 text-slate-500">
              {liveModels.length ? copy.adoptionNote : copy.spendNote}
            </p>
            <div className="mb-5 flex items-end justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-base font-semibold text-white">
                {liveModels.length ? copy.adoptionTitle : copy.spendTitle}
              </h3>
              {liveModels.length ? (
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-300">{copy.topModels}</div>
                  <a
                    href={radar?.attribution.url ?? 'https://openrouter.ai/rankings'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-300 transition hover:text-cyan-200"
                  >
                    {radar?.attribution.label}
                  </a>
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-300">$39.6K</div>
                  <div className="text-[10px] text-slate-600">$42K cap</div>
                </div>
              )}
            </div>
            <div className="divide-y divide-white/[0.08]">
              {liveModels.length
                ? liveModels.map((model) => (
                    <div key={`${model.date}:${model.id}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300/30 text-[11px] font-bold text-emerald-300">{model.rank}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-200">{model.name}</div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-cyan-300"
                            style={{ width: `${Math.max(8, (model.total_tokens / maxTokens) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-300">{compactNumber.format(model.total_tokens)}</span>
                    </div>
                  ))
                : costBars.map(([model, spend, width, color], index) => (
                    <div key={model} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/25 text-[11px] font-bold text-cyan-300">{index + 1}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-200">{model}</div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className={`h-full rounded-full ${color} ${width}`} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-300">{spend}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t border-white/[0.08] pt-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.signalTitle}</span>
          <span className="text-sm text-slate-300 md:text-right">
            {liveApps.length
              ? `${copy.trendingApps}: ${liveApps.slice(0, 4).map((app) => app.name).join(' · ')}`
              : copy.signalNote}
          </span>
          <Link
            href={`/${locale}/ai-radar`}
            className="mt-2 inline-flex w-fit items-center gap-2 border border-cyan-300/30 bg-cyan-300/[0.05] px-4 py-2 text-xs font-bold text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-white md:mt-0"
          >
            {copy.fullRadar}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const controlRoomValues = ['2.4M', '37', '< 40ms'];

function ControlRoomBand() {
  const { t, locale } = useLocale();
  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-[#03141c]">
      <div className="absolute inset-0">
        <Image
          src={asset('control-room-ops.webp')}
          alt={t.home.controlRoom.imageAlt}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03141c] via-[#03141c]/72 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03141c]/85 via-transparent to-[#03141c]/45" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{pick(SECTION_EYEBROWS.controlRoom, locale)}</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {t.home.controlRoom.title}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            {t.home.controlRoom.text}
          </p>
        </div>

        <div>
          <p className="mb-3 text-[11px] leading-4 text-amber-300/80">{t.home.demoDataNote}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {controlRoomValues.map((value, index) => (
              <GlowShell key={value} className="rounded-xl p-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <p className="mt-2 text-[11px] leading-4 text-slate-400">{t.home.controlRoom.stats[index]}</p>
              </GlowShell>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureOrbit() {
  const { t, locale } = useLocale();
  const orbitNodes = architectureLayers.map(({ icon: Icon, label, metric }, index) => ({ Icon, label, metric, index }));

  return (
    <section id="architecture" className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.05] bg-[#03141c] py-10 sm:py-12 lg:py-14">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{pick(SECTION_EYEBROWS.architecture, locale)}</p>
            <SectionHeading title={t.home.architecture.title} />
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            {t.home.architecture.subtitle}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.25fr_0.82fr]">
          <div className="grid gap-3">
            {architectureLayers.slice(0, 3).map(({ icon: Icon, ...layer }, index) => (
              <GlowShell key={index} className="rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{pick(layer.label, locale)}</h3>
                      <span className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{pick(METRIC_LABELS[layer.metric], locale)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{t.home.architecture.layers[index]}</p>
                  </div>
                </div>
              </GlowShell>
            ))}
          </div>

          {/* Orbit uses absolutely-positioned nodes that only have room at lg+;
              below that the same six layers already render as cards above and below. */}
          <GlowShell className="relative hidden min-h-[430px] overflow-hidden rounded-2xl p-6 lg:block">
            <div className="absolute inset-6 rounded-full border border-emerald-300/10" />
            <div className="absolute inset-16 rounded-full border border-cyan-300/10" />
            <div className="absolute inset-28 rounded-full border border-emerald-300/15" />
            <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/35 bg-emerald-300/10 shadow-[0_0_70px_rgba(16,185,129,0.28)]" />
            <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-emerald-300/40 bg-[#06222b] text-center">
              <Layers3 className="mb-2 h-8 w-8 text-emerald-300" />
              <div className="text-lg font-black text-white">Tvijo AI OS</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Control Plane</div>
            </div>

            <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 640 430" fill="none" aria-hidden="true">
              <path d="M92 216 C160 86 480 82 548 216 C479 348 160 349 92 216Z" stroke="rgba(45,212,191,0.22)" strokeWidth="1.2" />
              <path d="M320 53 C424 115 426 313 320 377 C215 313 214 116 320 53Z" stroke="rgba(16,185,129,0.2)" strokeWidth="1.2" />
              <path d="M126 330 C226 210 412 209 514 330" stroke="rgba(94,234,212,0.16)" strokeDasharray="6 7" />
              <path d="M126 102 C226 220 412 221 514 102" stroke="rgba(94,234,212,0.16)" strokeDasharray="6 7" />
            </svg>

            <div className="absolute inset-0">
              {orbitNodes.map(({ Icon, label, metric, index }) => {
                const positions = [
                  'left-[9%] top-[18%]',
                  'right-[13%] top-[16%]',
                  'left-[5%] top-[53%]',
                  'right-[6%] top-[54%]',
                  'left-[23%] bottom-[9%]',
                  'right-[24%] bottom-[9%]',
                ];
                return (
                  <div key={index} className={`absolute ${positions[index]} w-36 rounded-xl border border-emerald-300/20 bg-[#06222b]/90 p-3 shadow-[0_0_35px_rgba(16,185,129,0.08)] backdrop-blur`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-emerald-300" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">{pick(METRIC_LABELS[metric], locale)}</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-white">{pick(label, locale)}</div>
                  </div>
                );
              })}
            </div>
          </GlowShell>

          <div className="grid gap-3">
            {architectureLayers.slice(3).map(({ icon: Icon, ...layer }, index) => (
              <GlowShell key={index} className="rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{pick(layer.label, locale)}</h3>
                      <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">{pick(METRIC_LABELS[layer.metric], locale)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{t.home.architecture.layers[index + 3]}</p>
                  </div>
                </div>
              </GlowShell>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const { t } = useLocale();
  return (
    <section className="bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t.home.benefits.title} />
        {/* On phones these collapse to icon + text rows: five identical CTA cards in a
            column were the main source of the "endless ribbon" feel. */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {benefitIcons.map((Icon, index) => (
            <GlowShell key={t.home.benefits.items[index].title} className="flex items-start gap-4 rounded-xl p-4 sm:block sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 sm:mb-4 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent">
                <Icon className="h-5 w-5 text-emerald-300 sm:h-7 sm:w-7" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-5 text-white sm:min-h-14">{t.home.benefits.items[index].title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400 sm:mt-3">{t.home.benefits.items[index].text}</p>
                <a href="#routing" className="mt-5 hidden items-center gap-1 text-xs font-semibold text-emerald-300 sm:inline-flex">
                  {t.home.benefits.learnMore} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </GlowShell>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentOpsWall() {
  const { t, locale } = useLocale();
  return (
    <section id="agents" className="scroll-mt-24 border-y border-white/[0.05] bg-[#03141c] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{pick(SECTION_EYEBROWS.agentOps, locale)}</p>
            <SectionHeading title={t.home.agentWall.title} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['Policy OK', 'Budget OK', 'Audit ON', 'EU region'].map((item) => (
              <span key={item} className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 font-semibold text-emerald-200">{item}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {agentCards.map(({ icon: Icon, ...agent }, index) => (
            <GlowShell key={agent.app} className="relative overflow-hidden rounded-xl p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-emerald-300/8" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
                    <Icon className="h-6 w-6 text-emerald-300" />
                  </span>
                  <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">{agent.lane}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{agent.app}</h3>
                <p className="mt-1 text-xs text-slate-400">{t.home.agentWall.requests[index]}</p>
                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Model lane</span>
                    <span className="font-semibold text-slate-200">{agent.model}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Policy</span>
                    <span className="font-semibold text-emerald-300">{agent.policy}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="rounded-lg bg-white/[0.04] p-3">
                      <div className="text-lg font-bold text-emerald-300">{agent.cost}</div>
                      <div className="text-[10px] text-slate-500">cost delta</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-3">
                      <div className="text-lg font-bold text-white">{agent.latency}</div>
                      <div className="text-[10px] text-slate-500">latency</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlowShell>
          ))}
        </div>

        <GlowShell className="mt-4 overflow-hidden rounded-xl p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {['Input guard', 'Context router', 'Model gateway', 'Evidence log'].map((step, index) => (
              <div key={step} className="contents">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.035] px-4 py-3">
                  <div className="text-xs font-semibold text-white">{step}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {index === 0 ? 'PII + secret scan' : index === 1 ? 'cost / quality / region' : index === 2 ? 'provider failover' : 'hash + export'}
                  </div>
                </div>
                {index < 3 && <ArrowRight className="hidden h-5 w-5 text-emerald-300 md:block" />}
              </div>
            ))}
          </div>
        </GlowShell>
      </div>
    </section>
  );
}

function RealtimeControl() {
  const { t } = useLocale();
  const liveMetrics = [
    { label: t.home.realtime.metrics[0], value: '$3.76', delta: t.home.realtime.deltaVsLastMonth, tone: 'text-emerald-300' },
    { label: t.home.realtime.metrics[1], value: '2.4M', delta: '+18%', tone: 'text-white' },
    { label: t.home.realtime.metrics[2], value: '8.7K', delta: '+14%', tone: 'text-white' },
    { label: t.home.realtime.metrics[3], value: '99.9%', delta: '+0.3%', tone: 'text-white' },
    { label: t.home.realtime.metrics[4], value: '0', delta: t.home.realtime.deltaNoCritical, tone: 'text-white' },
  ];

  return (
    <section className="bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading title={t.home.realtime.title} />
        </div>
        <p className="mb-3 text-[11px] leading-4 text-amber-300/80">{t.home.demoDataNote}</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_1.18fr]">
          {liveMetrics.map((metric) => (
            <GlowShell key={metric.label} className="rounded-xl p-4">
              <p className="min-h-8 text-[11px] leading-4 text-slate-400">{metric.label}</p>
              <div className={`mt-3 text-2xl font-bold ${metric.tone}`}>{metric.value}</div>
              <p className="mt-1 text-[11px] text-emerald-300">{metric.delta}</p>
              {/* Sparklines read as noise when the cards go 2-up on a phone */}
              <div className="hidden sm:block">
                <Sparkline active={metric.value !== '0'} />
              </div>
            </GlowShell>
          ))}
          <GlowShell className="col-span-2 rounded-xl p-4 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-white">{t.home.realtime.systemsTitle}</h3>
            {t.home.realtime.systems.map((item, index) => (
              <div key={item} className="flex items-center justify-between border-t border-white/[0.06] py-2 text-xs">
                <span className="inline-flex items-center gap-2 text-slate-300"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> {item}</span>
                <span className="text-emerald-300">{index === 3 ? '99.9%' : '100%'}</span>
              </div>
            ))}
          </GlowShell>
        </div>
      </div>
    </section>
  );
}

function PolicyAutomation() {
  const { t, locale } = useLocale();
  return (
    <section className="bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlowShell className="rounded-2xl p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{pick(SECTION_EYEBROWS.guardrails, locale)}</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t.home.policy.title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              {t.home.policy.text}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                ['$5/day', t.home.policy.statP0],
                ['every call', t.home.policy.statPii],
                ['design', t.home.policy.statPolicy],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-[11px] leading-4 text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </GlowShell>

          <GlowShell className="rounded-2xl p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-5">
              {automationTitles.map((title, index) => (
                <div key={title} className="relative rounded-xl border border-white/[0.07] bg-[#061b24] p-4">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-sm font-black text-[#001b18]">{index + 1}</div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-slate-400">{t.home.policy.steps[index]}</p>
                  {index < automationTitles.length - 1 && <div className="absolute -right-2 top-8 hidden h-px w-4 bg-emerald-300/50 sm:block" />}
                </div>
              ))}
            </div>
          </GlowShell>
        </div>
      </div>
    </section>
  );
}

const routingConsoleValues = ['-37%', '94%', '$42K'];

function RoutingTable() {
  const { t, locale } = useLocale();
  const [appFilter, setAppFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [policyFilter, setPolicyFilter] = useState('');
  const [search, setSearch] = useState('');

  const apps = Array.from(new Set(routingRows.map((r) => r[0])));
  const models = Array.from(new Set(routingRows.map((r) => r[1])));
  const regions = Array.from(new Set(routingRows.map((r) => r[2])));
  const policies = Array.from(new Set(routingRows.flatMap((r) => r[3].split(', '))));

  const visibleRows = routingRows
    .map((row, rowIndex) => ({ row, rowIndex }))
    .filter(({ row }) => {
      const [app, model, region, policy] = row;
      const q = search.trim().toLowerCase();
      return (
        (!appFilter || app === appFilter) &&
        (!modelFilter || model === modelFilter) &&
        (!regionFilter || region === regionFilter) &&
        (!policyFilter || policy.split(', ').includes(policyFilter)) &&
        (!q || app.toLowerCase().includes(q) || model.toLowerCase().includes(q))
      );
    });

  return (
    <section id="routing" className="scroll-mt-24 bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlowShell className="overflow-hidden rounded-2xl">
          {/* Console header — the routing scene sits behind the copy at lg+ */}
          <div className="relative">
            <div className="absolute inset-0 hidden lg:block">
              <Image
                src={asset('routing-console.webp')}
                alt={t.home.routing.imageAlt}
                fill
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#061b24] via-[#061b24]/88 to-[#061b24]/35" />
            </div>

            <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10 lg:p-9">
              <div className="max-w-xl">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{pick(SECTION_EYEBROWS.routingConsole, locale)}</p>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t.home.routing.title}</h2>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {t.home.routing.text}
                </p>
              </div>

              <div className="lg:w-[390px]">
                {/* These three numbers are an illustration of the console, not
                    a measured result. Unlabelled they read as our outcome,
                    which is the same problem the hero counters had. */}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/80">
                  {t.home.demoData}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {routingConsoleValues.map((value, index) => (
                    <div key={value} className="rounded-xl border border-white/[0.08] bg-[#04151d]/85 p-3 backdrop-blur sm:p-4">
                      <div className="text-lg font-black text-emerald-300 sm:text-xl">{value}</div>
                      <p className="mt-1.5 text-[11px] leading-4 text-slate-400">{t.home.routing.stats[index]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Console filters — filter/search the routing table below */}
          <div className="hidden gap-2 border-t border-white/[0.06] bg-[#04151d]/60 p-4 md:grid md:grid-cols-[1fr_1fr_1fr_1fr_2fr]">
            {[
              { value: appFilter, set: setAppFilter, all: t.home.routing.filters[0], options: apps },
              { value: modelFilter, set: setModelFilter, all: t.home.routing.filters[1], options: models },
              { value: regionFilter, set: setRegionFilter, all: t.home.routing.filters[2], options: regions },
              { value: policyFilter, set: setPolicyFilter, all: t.home.routing.filters[3], options: policies },
            ].map((f) => (
              <div key={f.all} className="relative">
                <select
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#061b24] px-3 text-xs text-slate-300 transition hover:border-emerald-300/25 focus:border-emerald-300/40 focus:outline-none"
                >
                  <option value="">{f.all}</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </div>
            ))}
            <label className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#061b24] px-3 text-xs text-slate-500 focus-within:border-emerald-300/40">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.home.routing.search}
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="overflow-x-auto border-t border-white/[0.06]">
            <table className="min-w-[920px] w-full border-collapse text-left text-xs">
              <thead className="bg-white/[0.035] text-slate-400">
                <tr>
                  {t.home.routing.headers.map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {visibleRows.map(({ row: [app, ...rest], rowIndex }) => {
                  const cells = [app, t.home.routing.requests[rowIndex], ...rest];
                  return (
                    <tr key={app} className="transition hover:bg-white/[0.035]">
                      {cells.map((cell, index) => (
                        <td key={`${app}-${cell}`} className={`px-4 py-3 ${index === 6 ? 'font-semibold text-emerald-300' : ''}`}>
                          {index === 0 || index === 1 || index === 2 ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" /> {cell}
                            </span>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={t.home.routing.headers.length} className="px-4 py-6 text-center text-slate-500">
                      {t.home.routing.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlowShell>
      </div>
    </section>
  );
}

function Compliance() {
  const { t, locale } = useLocale();
  return (
    <section id="compliance" className="scroll-mt-24 border-y border-white/[0.05] bg-[#03141c] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{pick(SECTION_EYEBROWS.auditEvidence, locale)}</p>
          <SectionHeading title={pick(SECTION_TITLES.compliance, locale)} />
          <p className="text-sm leading-6 text-slate-400">
            {t.home.compliance.text}
          </p>
        </div>

        {/* One scene + one grouped evidence column, instead of four look-alike tiles */}
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <GlowShell className="relative min-h-[380px] overflow-hidden rounded-2xl lg:min-h-[460px]">
            <Image
              src={asset('compliance-officer-v2.png')}
              alt={t.home.compliance.imageAlt}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-[30%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04151d] via-[#04151d]/35 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-white sm:text-4xl">124,842</span>
                <span className="text-xs text-slate-400">{t.home.compliance.eventsToday}</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Must sum to the 124,842 headline above; the blocks figure used to be
                    11,842, which overshot the total by exactly 10,000. */}
                {['1,842', '3,421', '119,579'].map((value, index) => (
                  <div key={value} className="rounded-xl border border-white/[0.08] bg-[#04151d]/80 p-3 backdrop-blur">
                    <div className="text-sm font-bold text-white">{value}</div>
                    <div className="mt-1 text-[10px] leading-4 text-slate-400">{t.home.compliance.eventStats[index]}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlowShell>

          <div className="grid gap-4">
            <GlowShell className="rounded-2xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">{t.home.compliance.policiesTitle}</h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {t.home.compliance.policies.map((item) => (
                  <div key={item} className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> {item}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-300">on</span>
                  </div>
                ))}
              </div>
            </GlowShell>

            <div className="grid gap-4 sm:grid-cols-2">
              <GlowShell className="rounded-2xl p-5">
                <h3 className="mb-4 flex items-center justify-between text-sm font-semibold text-white">
                  {t.home.compliance.topRisks} <ArrowRight className="h-4 w-4 text-slate-500" />
                </h3>
                <div className="space-y-3">
                  {t.home.compliance.risks.map((risk, index) => (
                    <div key={risk} className="flex items-center justify-between gap-3 text-xs">
                      <span className="inline-flex items-center gap-2 text-slate-300">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" /> {risk}
                      </span>
                      <span className="font-semibold text-amber-300">{riskCounts[index]}</span>
                    </div>
                  ))}
                </div>
              </GlowShell>

              <GlowShell className="rounded-2xl p-5">
                <h3 className="mb-4 text-sm font-semibold text-white">{t.home.compliance.certificationsTitle}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'SOC 2', status: 'Roadmap' },
                    { label: 'ISO 27001', status: 'Roadmap' },
                    { label: 'GDPR', status: 'EU hosting' },
                    { label: 'HIPAA', status: 'Not offered' },
                  ].map(({ label, status }) => (
                    <Link
                      key={label}
                      href={`/${locale}/security`}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-center transition hover:border-emerald-400/25 hover:bg-white/[0.05]"
                    >
                      <FileCheck2 className="mx-auto mb-2 h-5 w-5 text-slate-300" />
                      <div className="text-xs font-semibold text-white">{label}</div>
                      <div className="text-[10px] text-slate-500">{status}</div>
                    </Link>
                  ))}
                </div>
              </GlowShell>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Personas() {
  const { t } = useLocale();
  return (
    <section className="bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t.home.personas.title} />
        <div className="grid gap-4 lg:grid-cols-4">
          {t.home.personas.items.map((persona, index) => (
            <GlowShell key={persona.role} className="rounded-xl p-5 transition hover:border-emerald-400/35">
              <div className="flex items-start gap-4">
                <span className="relative shrink-0 rounded-full p-[2px] ring-1 ring-emerald-300/25">
                  <Image
                    src={asset(personaImages[index])}
                    alt={persona.role}
                    width={160}
                    height={160}
                    loading="eager"
                    className="h-[68px] w-[68px] rounded-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">{persona.role}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-400">{persona.text}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold text-white">{t.home.personas.focusTitle}</div>
                <ul className="space-y-2">
                  {persona.focus.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-3.5 w-3.5 text-emerald-300" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowShell>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  const { t } = useLocale();
  return (
    <section id="integrations" className="relative scroll-mt-24 overflow-hidden bg-[#041922] py-10 sm:py-12 lg:py-14">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.18),transparent_58%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <SectionHeading title={t.home.integrations.title} />
          <a href="#cta" className="hidden items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.06] sm:inline-flex">
            {t.home.integrations.all} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {integrations.map((name) => (
            <div
              key={name}
              className="flex h-16 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-center text-sm font-semibold tracking-tight text-slate-300 transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.06] hover:text-white"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolloutPlan() {
  const { t, locale } = useLocale();
  return (
    <section className="border-y border-white/[0.05] bg-[#03141c] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <GlowShell className="rounded-2xl p-5 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{pick(SECTION_EYEBROWS.rollout, locale)}</p>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t.home.rollout.title}</h2>
              </div>
              <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-xs font-bold text-emerald-200">{t.home.rollout.badge}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {rolloutSteps.map((step, index) => (
                <div key={step.phase} className="relative rounded-xl border border-white/[0.07] bg-[#061b24] p-4">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-300">{step.phase}</span>
                    <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-slate-400">{pick(step.time, locale)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{pick(step.title, locale)}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.home.rollout.steps[index]}</p>
                </div>
              ))}
            </div>

            {/* The "Outcome by week 4: 100% / -37% / <24h" panel used to sit here. It was the
                only place the page promised a measurable result, and nothing backs those
                numbers. The rollout steps above describe the process, which is what we can
                actually stand behind. */}
          </GlowShell>

          <GlowShell className="rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">{pick(SECTION_EYEBROWS.auditEvidence, locale)}</p>
                <h2 className="text-xl font-bold tracking-tight text-white">{t.home.rollout.evidenceTitle}</h2>
              </div>
              <FileCheck2 className="h-7 w-7 shrink-0 text-emerald-300" />
            </div>
            <div className="relative mb-4 h-32 overflow-hidden rounded-xl border border-white/[0.07]">
              <Image src={asset('boardroom-governance.webp')} alt={t.home.rollout.evidenceAlt} fill sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d24] via-transparent to-transparent" />
            </div>
            <div className="space-y-3">
              {evidenceTitles.map((title, index) => (
                <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {pick(title, locale)}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.home.rollout.evidence[index]}</p>
                </div>
              ))}
            </div>
          </GlowShell>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ locale }: { locale: Locale; page: HomePageContent | null }) {
  const { t } = useLocale();
  const ctaHeading = t.home.finalCta.heading;

  return (
    <section id="cta" className="bg-[#041922] px-4 py-10 sm:py-12 lg:py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-emerald-400/25 bg-[#07202a] shadow-[0_0_70px_rgba(16,185,129,0.1)] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {ctaHeading}
            </h2>
            <ul className="mt-6 space-y-3">
              {t.home.finalCta.bullets.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:w-52">
            <Link href={`/${locale}/demo`} className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-black/20 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]">
              {getPublicCta(locale).exploreDemo}
            </Link>
          </div>
        </div>
        <div className="border-t border-emerald-400/15 bg-black/15 lg:border-l lg:border-t-0">
          <LeadCaptureForm source="demo_signup" />
        </div>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: Locale }) {
  const { t } = useLocale();
  const prefix = `/${locale}`;

  // Product links point to verified public surfaces; the owner console still
  // enforces its staff and configured-owner gate after sign-in.
  const columns: { head: string; links: { label: string; href: string }[] }[] = [
    {
      head: t.footer.productLinks[0],
      links: [
        { label: t.footer.productLinks[0], href: '#product' },
        { label: t.footer.productLinks[3], href: `${prefix}/compare` },
        { label: t.footer.securityLinks[0], href: `${prefix}/security` },
        { label: t.footer.securityLinks[1], href: `${prefix}/pricing` },
        { label: locale === 'ru' ? 'Расширение и терминал' : 'Extension & terminal', href: 'https://dsh.tvijo.com/download' },
        { label: locale === 'ru' ? 'Рабочая область DSH' : 'DSH workspace', href: 'https://dsh.tvijo.com/' },
        { label: locale === 'ru' ? 'Ключи платформы' : 'Platform keys', href: 'https://platform.tvijo.com/keys' },
        { label: locale === 'ru' ? 'Предпросмотр исходников Cursortvijo' : 'Cursortvijo source preview', href: 'https://github.com/nikbibamon/cursortvijo' },
        { label: locale === 'ru' ? 'Центр команд владельца' : 'Owner command center', href: `${prefix}/login?redirect=${encodeURIComponent(`${prefix}/agentroy`)}` },
      ],
    },
    {
      head: t.footer.learn,
      links: [
        { label: t.footer.learnLinks[0], href: `${prefix}/learn` },
        { label: t.footer.learnLinks[1], href: `${prefix}/learn/ai-agent-governance-foundations` },
        { label: t.footer.learnLinks[2], href: `${prefix}/faq` },
        { label: locale === 'ru' ? 'Оси и наборы правил' : 'Axes · agent skills', href: `${prefix}/agent-skills/axes` },
        { label: locale === 'ru' ? 'Наборы правил агента' : 'Agent skill packs', href: `${prefix}/agent-skills` },
      ],
    },
    {
      head: t.footer.kb,
      links: [
        { label: t.footer.kbLinks[0], href: `${prefix}/kb` },
        { label: t.footer.kbLinks[1], href: `${prefix}/kb/ai-governance` },
        { label: t.footer.kbLinks[3], href: `${prefix}/bubbles` },
      ],
    },
    {
      head: t.home.leadForm.submitContact,
      links: [
        { label: t.footer.productLinks[4], href: `${prefix}/demo` },
        { label: t.home.leadForm.submitDemo, href: '#cta' },
        { label: t.footer.securityLinks[2], href: `${prefix}/faq` },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.07] bg-[#031117] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-xs leading-5 text-slate-500">{t.home.siteFooter.tagline}</p>
        </div>
        {columns.map((column) => (
          <div key={column.head}>
            <h3 className="mb-3 text-xs font-semibold text-white">{column.head}</h3>
            <div className="space-y-2">
              {column.links.map((link) =>
                link.href.startsWith('#') ? (
                  <a key={link.label} href={link.href} className="block text-xs text-slate-500 transition hover:text-slate-200">{link.label}</a>
                ) : link.href.startsWith('https://') ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="block text-xs text-slate-500 transition hover:text-slate-200">{link.label}</a>
                ) : (
                  <Link key={link.label} href={link.href} className="block text-xs text-slate-500 transition hover:text-slate-200">{link.label}</Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-7xl text-xs text-slate-600">{t.home.siteFooter.rights}</div>
    </footer>
  );
}

function MobileCTA() {
  const { locale } = useLocale();
  const cta = getPublicCta(locale);
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-400/15 bg-[#031117]/94 px-4 py-3 backdrop-blur-xl sm:hidden">
      <Link
        href={`/${locale}/workspace`}
        onClick={() => trackEvent('cta_click', { location: 'mobile_sticky' })}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-bold text-[#001b18]"
      >
        {cta.openWorkspace} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const { locale, t } = useLocale();
  const [pageContent, setPageContent] = useState<HomePageContent | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchHomePageContent(controller.signal)
      .then(setPageContent)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // The visual fallback is intentionally complete; API availability
        // must never make the public landing page blank.
        console.warn('Homepage CMS content is unavailable', error);
      });
    return () => controller.abort();
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Tvijo',
        url: 'https://tvijo.com',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Tvijo AI OS',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t.home.jsonLdDescription,
      },
    ],
  };

  return (
    <>
      <Header locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#041922] pb-16 text-white sm:pb-0">
        <Hero locale={locale} page={pageContent} />
        <ReadinessBand />
        <ExecutionContractBand />
        <CmsManagedContent page={pageContent} />
        <DashboardPanel />
        <CommandCenter />
        <ControlRoomBand />
        <ArchitectureOrbit />
        <Benefits />
        <AgentOpsWall />
        <RealtimeControl />
        <PolicyAutomation />
        <RoutingTable />
        <Compliance />
        <Personas />
        <Integrations />
        <RolloutPlan />
        <KnowledgeLearnSection />
        <FinalCTA locale={locale} page={pageContent} />
      </main>
      <Footer locale={locale} />
      <MobileCTA />
    </>
  );
}
