'use client';

/**
 * AI OS Tvijo Pricing — copy lives in src/i18n/locales/*.ts (`pricingPage`).
 * English is the source of truth; every locale file is typed against it.
 */

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { captureLead } from '@/services/trading-api';
import { useLocale } from '@/i18n/useLocale';
import type { Translations } from '@/i18n';

type PricingCopy = Translations['pricingPage'];
type Plan = PricingCopy['plans'][number];

const TIER_COLORS: Record<string, string> = {
  starter: 'border-blue-500',
  professional: 'border-indigo-500 ring-2 ring-indigo-500/20',
  enterprise: 'border-slate-500',
};

const TIER_GRADIENT: Record<string, string> = {
  starter: 'from-blue-500 to-blue-700',
  professional: 'from-indigo-500 to-purple-700',
  enterprise: 'from-slate-500 to-slate-700',
};

const CHECK = (
  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function PlanCard({ plan, c, onSubscribe }: { plan: Plan; c: PricingCopy; onSubscribe: (id: string) => void }) {
  const isEnterprise = plan.id === 'enterprise';

  return (
    <div className={`relative bg-slate-900/80 border-2 ${TIER_COLORS[plan.id] || 'border-slate-700'} rounded-2xl p-6 flex flex-col`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r ${TIER_GRADIENT[plan.id]} text-white text-xs font-bold rounded-full`}>
          {plan.badge}
        </div>
      )}

      <h3 className="text-xl font-bold text-white mt-1">{plan.name}</h3>
      <p className="text-xs text-gray-500 mt-1 min-h-[36px]">{plan.description}</p>

      <div className="mt-4 mb-4">
        <span className="text-3xl font-black text-white">{plan.price}</span>
        {isEnterprise ? (
          <div className="text-xs text-gray-600">{c.talkToSales}</div>
        ) : (
          <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
        )}
      </div>

      {/* Best-for line — makes the tier's purpose explicit */}
      <div className="mb-5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-gray-500">{c.bestForLabel}</div>
        <div className="text-xs text-gray-300 mt-0.5">{plan.bestFor}</div>
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            {CHECK}
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan.id)}
        className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
          isEnterprise
            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            : `bg-gradient-to-r ${TIER_GRADIENT[plan.id]} text-white hover:opacity-90 shadow-lg`
        }`}
      >
        {isEnterprise ? c.contactSales : c.getStarted}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const { locale, t } = useLocale();
  const c = t.pricingPage;
  const plans = c.plans;

  const [inquiryPlan, setInquiryPlan] = useState<Plan | null>(null);
  const [inqEmail, setInqEmail] = useState('');
  const [inqTg, setInqTg] = useState('');
  const [inqNote, setInqNote] = useState('');
  const [inqSending, setInqSending] = useState(false);
  const [inqError, setInqError] = useState<string | null>(null);
  const [inqDone, setInqDone] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadTg, setLeadTg] = useState('');
  const [leadSent, setLeadSent] = useState(false);

  const handleSubscribe = (planId: string) => {
    const plan = plans.find((p) => p.id === planId) || null;
    setInquiryPlan(plan);
    setInqError(null);
    setInqDone(false);
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('user_email') : '';
      if (saved && !inqEmail) setInqEmail(saved);
    } catch {
      /* ignore */
    }
  };

  const submitInquiry = async () => {
    if (!inquiryPlan) return;
    if (!inqEmail.trim() && !inqTg.trim()) {
      setInqError(c.addContact);
      return;
    }
    setInqSending(true);
    setInqError(null);
    const ok = await captureLead({
      email: inqEmail.trim() || undefined,
      telegram_username: inqTg.trim() || undefined,
      source: 'pricing_inquiry',
      message: `Plan: ${inquiryPlan.name} (${inquiryPlan.price} ${inquiryPlan.period}). ${inqNote.trim()}`.trim(),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    setInqSending(false);
    if (ok) setInqDone(true);
    else setInqError(c.sendFail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {c.heroTitle}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {c.heroAccent}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">{c.heroSub}</p>
          <p className="text-gray-600 text-xs mt-4">{c.billedNote}</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 mt-10">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} c={c} onSubscribe={handleSubscribe} />
          ))}
        </div>

        {/* Glossary — "what am I paying for" */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">{c.glossaryTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {c.glossary.map((g) => (
              <div key={g.term} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-5">
                <h3 className="font-bold text-white text-sm">{g.term}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Program */}
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{c.partnerTitle}</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-4">{c.partnerDesc}</p>
            <a
              href="/partners"
              className="inline-block mt-6 px-6 py-3 bg-emerald-400 text-[#001b18] font-bold rounded-xl hover:bg-emerald-300 transition-all"
            >
              {c.learnMore}
            </a>
          </div>
        </div>

        {/* Platform features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">{c.featuresTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.features.map((f) => (
              <div key={f.title} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-5">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-white text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">{c.ctaTitle}</h2>
          <p className="text-gray-400 mb-6">{c.ctaDesc}</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <a href={`/${locale}/login`} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-all">
              {c.getStartedFree}
            </a>
            <a href="/partners" className="px-8 py-3 border border-slate-600 text-gray-300 font-bold rounded-xl hover:border-slate-400 transition-all">
              {c.partnerProgram}
            </a>
          </div>

          {/* Quick lead capture */}
          <div className="max-w-md mx-auto bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-3">{c.quotePrompt}</p>
            {leadSent ? (
              <div className="text-green-400 font-semibold py-2">{c.quoteThanks}</div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!leadEmail && !leadTg) return;
                  await captureLead({
                    email: leadEmail,
                    telegram_username: leadTg,
                    source: 'pricing_inquiry',
                    page_url: '/pricing',
                    utm_source: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('utm_source') || '' : '',
                  });
                  setLeadSent(true);
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  placeholder={c.emailPh}
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  type="text"
                  placeholder={c.tgPh}
                  value={leadTg}
                  onChange={(e) => setLeadTg(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={!leadEmail && !leadTg}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-40"
                >
                  {c.getQuote}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Plan inquiry modal — guest-friendly, saves a lead + alerts admin */}
      {inquiryPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={() => !inqSending && setInquiryPlan(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{c.modalTitle.replace('{plan}', inquiryPlan.name)}</h3>
                <p className="mt-1 text-xs text-gray-400">
                  {inquiryPlan.id === 'enterprise' ? c.modalCustom : `${inquiryPlan.price} ${inquiryPlan.period}`}. {c.modalLeaveContact}
                </p>
              </div>
              <button type="button" onClick={() => !inqSending && setInquiryPlan(null)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            {inqDone ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <div className="mb-1 text-2xl">✅</div>
                <p className="text-sm font-semibold text-white">{c.requestReceived}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {c.teamReach}{' '}
                  <a href="https://t.me/bibamon" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
                    @bibamon
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setInquiryPlan(null)}
                  className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200 hover:bg-white/10"
                >
                  {c.close}
                </button>
              </div>
            ) : (
              <>
                <label className="mb-1 block text-xs text-gray-400">{c.emailLabel}</label>
                <input
                  type="email"
                  value={inqEmail}
                  onChange={(e) => setInqEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mb-3 w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  autoFocus
                />
                <label className="mb-1 block text-xs text-gray-400">{c.tgLabel}</label>
                <input
                  type="text"
                  value={inqTg}
                  onChange={(e) => setInqTg(e.target.value)}
                  placeholder="@username"
                  className="mb-3 w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                />
                <label className="mb-1 block text-xs text-gray-400">{c.noteLabel}</label>
                <textarea
                  value={inqNote}
                  onChange={(e) => setInqNote(e.target.value)}
                  rows={2}
                  placeholder={c.notePh}
                  className="mb-3 w-full resize-none rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                />
                {inqError && <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{inqError}</p>}
                <button
                  type="button"
                  onClick={submitInquiry}
                  disabled={inqSending}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {inqSending ? c.sending : c.sendRequest}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {locale === 'ru' ? 'Прежде чем платить' : 'Before you buy'}
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href={`/${locale}/solutions`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
            {locale === 'ru' ? 'Решения по задачам' : 'Solutions by problem'}
          </Link>
          <Link href={`/${locale}/proof`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
            {locale === 'ru' ? 'Что содержит запись доказательства' : 'What an evidence record contains'}
          </Link>
          <Link href={`/${locale}/security`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
            {locale === 'ru' ? 'Безопасность и известные пробелы' : 'Security and known gaps'}
          </Link>
          <Link href={`/${locale}/scan`} className="font-medium text-emerald-400 underline-offset-2 hover:underline">
            {locale === 'ru' ? 'Бесплатная внешняя проверка' : 'Free external check'}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
