import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  FileJson2,
  Github,
  ListChecks,
  LockKeyhole,
  Power,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

const BASE_URL = 'https://tvijo.com';
const GITHUB_URL = 'https://github.com/nikbibamon/tvijoaios';

const copy = {
  en: {
    eyebrow: 'Open source · MIT licensed · local-first',
    title: 'Audit your AI agents before they reach production',
    lede:
      'The Tvijo AI Ops Starter Kit checks whether every agent declares the controls an operator needs: ownership, data boundaries, approval rules, budget limits, a kill switch, and an audit trail.',
    github: 'View the code on GitHub',
    review: 'Review your findings with Tvijo',
    reportLabel: 'Example report · illustrative data',
    controlsEyebrow: 'AI agent readiness audit',
    controlsTitle: 'Seven declarations that expose expensive gaps early',
    controlsIntro:
      'A small registry gives engineering, security, and operations teams one reviewable record before an agent receives production access.',
    controls: [
      ['Named owner', 'Someone is accountable for changes, incidents, and retirement.'],
      ['Purpose and status', 'The intended job and lifecycle state are explicit.'],
      ['Data classification', 'The registry declares what information the agent may handle.'],
      ['Human approval', 'High-impact actions have a documented approval policy.'],
      ['Budget limit', 'Spend is bounded before loops or retries become costly.'],
      ['Kill switch', 'Operators know how to stop the agent quickly.'],
      ['Audit log', 'The declaration identifies where evidence should be recorded.'],
    ],
    howEyebrow: 'From inventory to review',
    howTitle: 'A three-step, local workflow',
    steps: [
      ['1', 'Register', 'Describe agents in a version-controlled YAML registry.'],
      ['2', 'Audit', 'Run one local command in a laptop workflow or CI pipeline.'],
      ['3', 'Review', 'Share the text or JSON report and assign remediation owners.'],
    ],
    boundaryTitle: 'What this audit does — and what it does not',
    boundaryBody:
      'The starter kit validates declared governance controls. It does not observe runtime behavior, verify that a kill switch works, certify security or legal compliance, or prove production readiness. Treat the report as a structured starting point for evidence collection and human review.',
    sourceTitle: 'Start with the open source baseline',
    sourceBody:
      'Clone the repository, adapt the sample registry, and keep the resulting evidence in your own environment. The CLI sends no telemetry and makes no network calls.',
    article: 'Read the governance checklist',
    ctaTitle: 'Need runtime controls after the declaration audit?',
    ctaBody:
      'Tvijo AI OS adds the operating layer around model routing, budgets, approvals, policy, and audit evidence. Bring the starter-kit findings to a focused readiness review.',
    cta: 'Request an AI readiness review',
  },
  ru: {
    eyebrow: 'Open source · лицензия MIT · local-first',
    title: 'Проверьте AI-агентов до выхода в продакшен',
    lede:
      'Tvijo AI Ops Starter Kit проверяет, задекларированы ли для каждого агента необходимые контролы: владелец, границы данных, правила согласования, бюджет, аварийная остановка и аудит-трейл.',
    github: 'Открыть код на GitHub',
    review: 'Разобрать результаты с Tvijo',
    reportLabel: 'Пример отчёта · демонстрационные данные',
    controlsEyebrow: 'Аудит готовности AI-агентов',
    controlsTitle: 'Семь деклараций, которые заранее показывают дорогие пробелы',
    controlsIntro:
      'Небольшой реестр даёт разработке, безопасности и эксплуатации единую проверяемую запись до выдачи агенту доступа к продакшену.',
    controls: [
      ['Назначенный владелец', 'Понятно, кто отвечает за изменения, инциденты и вывод из эксплуатации.'],
      ['Назначение и статус', 'Задача агента и этап его жизненного цикла указаны явно.'],
      ['Класс данных', 'В реестре указано, с какой информацией разрешено работать агенту.'],
      ['Согласование человеком', 'Для действий с высоким влиянием описано правило одобрения.'],
      ['Лимит бюджета', 'Расход ограничен до того, как циклы или повторы станут дорогими.'],
      ['Kill switch', 'Операторы знают, как быстро остановить агента.'],
      ['Аудит-лог', 'Декларация указывает, где должны сохраняться доказательства.'],
    ],
    howEyebrow: 'От инвентаризации к разбору',
    howTitle: 'Локальный процесс из трёх шагов',
    steps: [
      ['1', 'Зарегистрировать', 'Описать агентов в версионируемом YAML-реестре.'],
      ['2', 'Проверить', 'Запустить одну локальную команду на ноутбуке или в CI.'],
      ['3', 'Разобрать', 'Передать текстовый или JSON-отчёт и назначить владельцев исправлений.'],
    ],
    boundaryTitle: 'Что этот аудит делает — и чего не доказывает',
    boundaryBody:
      'Starter kit проверяет задекларированные governance-контролы. Он не наблюдает поведение агента в runtime, не проверяет фактическую работу kill switch, не сертифицирует безопасность или юридическое соответствие и не доказывает готовность к продакшену. Отчёт — структурированная отправная точка для сбора доказательств и проверки человеком.',
    sourceTitle: 'Начните с открытого базового слоя',
    sourceBody:
      'Клонируйте репозиторий, адаптируйте пример реестра и храните результаты в своей среде. CLI не отправляет телеметрию и не делает сетевых запросов.',
    article: 'Читать governance-чеклист',
    ctaTitle: 'Нужны runtime-контролы после аудита деклараций?',
    ctaBody:
      'Tvijo AI OS добавляет операционный слой: маршрутизацию моделей, бюджеты, согласования, политики и аудит-доказательства. Принесите результаты starter kit на предметный разбор готовности.',
    cta: 'Запросить разбор AI readiness',
  },
} as const;

const controlIcons = [UserCheck, BadgeCheck, LockKeyhole, ShieldCheck, CircleDollarSign, Power, ListChecks];

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const language = params.locale === 'ru' ? 'ru' : 'en';
  const canonicalLocale = language;
  const title = language === 'ru'
    ? 'Open Source аудит готовности AI-агентов | Tvijo'
    : 'Open Source AI Agent Readiness Audit | Tvijo';
  const description = language === 'ru'
    ? 'Бесплатный local-first CLI для проверки владельца, данных, human approval, бюджета, kill switch и audit trail AI-агентов.'
    : 'Free local-first CLI for auditing AI agent ownership, data class, human approval, budgets, kill switches, and audit trails.';

  return {
    title: { absolute: title },
    description,
    keywords: [
      'open source AI agent audit tool',
      'AI agent readiness audit',
      'AI agent governance checklist',
      'AI agent production readiness checklist',
      'AI agent risk assessment template',
    ],
    alternates: {
      canonical: `${BASE_URL}/${canonicalLocale}/tools/ai-agent-readiness-audit`,
      languages: {
        en: `${BASE_URL}/en/tools/ai-agent-readiness-audit`,
        ru: `${BASE_URL}/ru/tools/ai-agent-readiness-audit`,
        'x-default': `${BASE_URL}/en/tools/ai-agent-readiness-audit`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/${canonicalLocale}/tools/ai-agent-readiness-audit`,
      siteName: 'Tvijo',
    },
    twitter: { card: 'summary', title, description },
  };
}

function TerminalPreview({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#020a0e] shadow-2xl shadow-emerald-950/30">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <div className="space-y-5 p-5 font-mono text-xs leading-6 sm:p-7 sm:text-sm">
        <p className="break-all text-slate-300"><span className="text-emerald-300">$</span> ai-ops-kit audit --registry agents.yaml</p>
        <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-4 text-center">
          <div><strong className="block text-xl text-white">40/100</strong><span className="text-slate-500">score</span></div>
          <div><strong className="block text-xl text-red-300">1</strong><span className="text-slate-500">critical</span></div>
          <div><strong className="block text-xl text-amber-300">2</strong><span className="text-slate-500">high</span></div>
        </div>
        <div className="space-y-2 text-slate-400">
          <p><span className="text-red-300">CRITICAL</span> support-agent: kill switch is missing</p>
          <p><span className="text-amber-300">HIGH</span> support-agent: monthly budget is not declared</p>
          <p><span className="text-amber-300">HIGH</span> support-agent: approval policy is missing</p>
          <p className="pt-2 text-emerald-300">Report written to audit-report.json</p>
        </div>
      </div>
    </div>
  );
}

export default function AiAgentReadinessAuditPage({ params }: { params: { locale: string } }) {
  const language = params.locale === 'ru' ? 'ru' : 'en';
  const c = copy[language];
  const locale = params.locale;
  const articleHref = `/${language}/kb/ai-governance/ai-agent-governance-checklist`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tvijo AI Ops Starter Kit',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Cross-platform',
    description: copy.en.lede,
    url: `${BASE_URL}/en/tools/ai-agent-readiness-audit`,
    codeRepository: GITHUB_URL,
    license: 'https://opensource.org/license/mit',
    softwareVersion: '0.1.0',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'Tvijo', url: BASE_URL },
  };

  return (
    <div className="min-h-screen bg-[#031117] text-white">
      <Navbar />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.15),transparent_36%),radial-gradient(circle_at_80%_15%,rgba(251,146,60,0.12),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <Github className="h-3.5 w-3.5" /> {c.eyebrow}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                {c.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{c.lede}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-bold text-[#001b18] transition hover:bg-emerald-300">
                  <Github className="h-4 w-4" /> {c.github}
                </a>
                <Link href={`/${locale}/#cta`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                  {c.review} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <TerminalPreview label={c.reportLabel} />
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[#041922] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">{c.controlsEyebrow}</p>
            <div className="mt-3 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.controlsTitle}</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-400 lg:justify-self-end">{c.controlsIntro}</p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
              {c.controls.map(([title, description], index) => {
                const Icon = controlIcons[index];
                return (
                  <div key={title} className={`bg-[#041922] p-6 ${index === 6 ? 'lg:col-span-2' : ''}`}>
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <h3 className="mt-5 text-base font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">{c.howEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{c.howTitle}</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {c.steps.map(([step, title, description]) => (
                <div key={step} className="border-t border-white/15 pt-5">
                  <span className="font-mono text-sm text-orange-300">0{step}</span>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-7 sm:p-9">
              <ShieldCheck className="h-6 w-6 text-amber-300" />
              <h2 className="mt-5 text-2xl font-bold">{c.boundaryTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{c.boundaryBody}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-7 sm:p-9">
              <FileJson2 className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-5 text-2xl font-bold">{c.sourceTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{c.sourceBody}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200">GitHub ↗</a>
                <Link href={articleHref} className="inline-flex items-center gap-2 text-white hover:text-emerald-200"><BookOpen className="h-4 w-4" /> {c.article}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.07] bg-[#041922] px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">{c.ctaBody}</p>
            <Link href={`/${locale}/#cta`} className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-400 px-6 py-3 text-sm font-bold text-[#211005] transition hover:bg-orange-300">
              {c.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
