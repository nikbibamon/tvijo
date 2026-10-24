'use client';

/**
 * Tools Hub — copy lives in src/i18n/locales/*.ts (`toolsPage`).
 * English is the source of truth; every locale file is typed against it.
 */

import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { useLocale } from '@/i18n/useLocale';
import type { Translations } from '@/i18n';

type ToolsCopy = Translations['toolsPage'];
type Tool = ToolsCopy['tools'][number];

function ToolCard({ tool, locale, c }: { tool: Tool; locale: string; c: ToolsCopy }) {
  const badge =
    tool.status === 'live'
      ? { label: c.statusLive, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' }
      : tool.status === 'beta'
      ? { label: c.statusBeta, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' }
      : { label: c.statusComing, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' };

  const isClickable = tool.status !== 'coming';

  const content = (
    <div
      className={`group relative rounded-2xl border p-6 transition-all duration-300 h-full flex flex-col ${
        isClickable
          ? 'border-white/10 bg-white/[0.02] hover:border-orange-500/30 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer'
          : 'border-white/5 bg-white/[0.01] opacity-70'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{tool.icon}</div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${badge.bg} ${badge.color}`}>
          {tool.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
          {badge.label}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">{tool.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-grow">{tool.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.features.slice(0, 4).map((f) => (
          <span key={f} className="px-2 py-0.5 text-[10px] text-gray-500 bg-white/5 rounded-md">
            {f}
          </span>
        ))}
        {tool.features.length > 4 && (
          <span className="px-2 py-0.5 text-[10px] text-gray-600 bg-white/5 rounded-md">
            +{tool.features.length - 4} {c.more}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[11px] text-gray-600 uppercase tracking-wider">{tool.category}</span>
        {isClickable && (
          <span className="text-xs text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            {c.explore}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );

  if (!isClickable) return content;

  return <Link href={`/${locale}${tool.href}`}>{content}</Link>;
}

export default function ToolsPage() {
  const { locale, t } = useLocale();
  const c = t.toolsPage;

  const openSourceAudit = locale === 'ru'
    ? {
        eyebrow: 'OPEN SOURCE · MIT',
        title: 'Аудит готовности AI-агентов',
        description: 'Local-first CLI проверяет владельца, класс данных, human approval, бюджет, kill switch и audit trail до выхода агента в продакшен.',
        action: 'Запустить аудит',
      }
    : {
        eyebrow: 'OPEN SOURCE · MIT',
        title: 'AI Agent Readiness Audit',
        description: 'A local-first CLI checks ownership, data class, human approval, budgets, kill switches, and audit trails before production.',
        action: 'Run the audit',
      };

  const categories = Array.from(new Set(c.tools.map((tool) => tool.category)));
  const liveCount = c.tools.filter((tool) => tool.status === 'live').length + 1;
  const betaCount = c.tools.filter((tool) => tool.status === 'beta').length;

  const statsBar = c.statsBar
    .replace('{live}', String(liveCount))
    .replace('{beta}', String(betaCount))
    .replace('{total}', String(c.tools.length + 1));

  return (
    <div className="bm-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs text-gray-400">{statsBar}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">{c.titlePre}</span>
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              {c.titleAccent}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{c.subtitle}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {c.stats.map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/tools/ai-agent-readiness-audit`}
          className="group mb-12 grid overflow-hidden rounded-2xl border border-emerald-300/20 bg-[linear-gradient(110deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02),rgba(251,146,60,0.08))] transition hover:border-emerald-300/40 md:grid-cols-[1fr_auto]"
        >
          <div className="p-7 sm:p-9">
            <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-300">{openSourceAudit.eyebrow}</span>
            <h2 className="mt-3 text-2xl font-bold text-white transition group-hover:text-emerald-200">{openSourceAudit.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{openSourceAudit.description}</p>
          </div>
          <div className="flex items-center border-t border-white/10 px-7 py-5 text-sm font-semibold text-emerald-300 md:border-l md:border-t-0 sm:px-9">
            {openSourceAudit.action}
            <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </Link>

        {/* Categories */}
        {categories.map((cat) => {
          const catTools = c.tools.filter((tool) => tool.category === cat);
          return (
            <div key={cat} className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent rounded-full" />
                {cat}
                <span className="text-xs text-gray-600 font-normal">({catTools.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} locale={locale} c={c} />
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="text-center mt-16 pt-12 border-t border-white/5">
          <h3 className="text-xl font-semibold text-white mb-3">{c.ctaTitle}</h3>
          <p className="text-gray-400 text-sm mb-6">{c.ctaDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={`/${locale}/kb`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/20"
            >
              {c.ctaKb}
            </Link>
            <Link
              href={`/${locale}/learn`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-gray-200 font-medium rounded-xl hover:bg-white/5 transition-all"
            >
              {c.ctaCourses}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
