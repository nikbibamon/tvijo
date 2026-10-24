'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { captureLead } from '@/services/trading-api';
import { parseLocale } from '@/i18n/config';

function getLocale(pathname: string | null) {
  return parseLocale(pathname);
}

const capabilityCards = [
  {
    icon: '🧭',
    title: 'AI governance layer',
    desc: 'Bring prompts, agents, model access, spend controls, and audit events into one operating layer before usage fragments across teams.',
  },
  {
    icon: '🔐',
    title: 'BYOK and access control',
    desc: 'Support customer-owned keys, scoped provider access, and safer handling of secrets across pilots, internal tools, and client workspaces.',
  },
  {
    icon: '💸',
    title: 'Budget and routing controls',
    desc: 'Route requests across models by quality, latency, cost, and policy so teams stop overspending on routine AI workloads.',
  },
  {
    icon: '📜',
    title: 'Audit-ready workflows',
    desc: 'Create evidence trails around who used which model, for what task, under which rule, and with what result.',
  },
  {
    icon: '🧩',
    title: 'Startup and service integrations',
    desc: 'Connect AI OS with internal tools, client delivery flows, onboarding steps, and domain-specific operational processes.',
  },
  {
    icon: '🚀',
    title: 'Pilot-to-production support',
    desc: 'Use Tvijo to move from a demo workflow to a governed production setup without rebuilding the operating model each time.',
  },
];

const audienceCards = [
  {
    title: 'AI startup founders',
    desc: 'For teams selling AI products that need routing, governance, BYOK and audit answers before enterprise rollout.',
  },
  {
    title: 'CTOs and technical operators',
    desc: 'For leaders who need visibility into prompts, providers, costs, and agent behavior across fast-moving teams.',
  },
  {
    title: 'Service and delivery teams',
    desc: 'For agencies, implementation teams, and operators serving multiple client environments with different risk boundaries.',
  },
  {
    title: 'Portfolio and platform teams',
    desc: 'For groups supporting multiple startups and needing a repeatable control model instead of one-off AI tooling decisions.',
  },
];

const serviceCards = [
  {
    name: 'AI OS pilot design',
    price: 'pilot',
    desc: 'Shape the first governed workflow, routing logic, and operator surface for a startup or service team.',
  },
  {
    name: 'AI risk and readiness review',
    price: 'advisory',
    desc: 'Map shadow AI, model spend, key ownership, policy gaps, and evidence readiness before broader rollout.',
  },
  {
    name: 'Custom integrations',
    price: 'custom',
    desc: 'Connect internal tools, client data paths, or operational systems to the AI OS control layer.',
  },
  {
    name: 'Operational support',
    price: 'retainer',
    desc: 'Help teams maintain routing rules, budget guardrails, onboarding flows, and governance hygiene over time.',
  },
];

export default function AboutPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [leadForm, setLeadForm] = useState({ email: '', telegram: '', name: '', message: '' });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24">
        <section className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">About Tvijo</p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            TVIJO AI OS for startups,
            <br />
            service teams and operator-led growth
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-400">
            Tvijo is building an AI OS control plane for teams that need governed AI operations, customer-owned keys,
            model routing, budget controls, and audit evidence across real business workflows.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/demo`}
              className="rounded-xl bg-emerald-400 px-8 py-3 font-bold text-[#001b18] shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-300"
            >
              Open AI OS Workspace
            </a>
            <a
              href={`/${locale}/faq`}
              className="rounded-xl border border-slate-600 px-8 py-3 font-bold text-gray-300 transition-all hover:border-emerald-400 hover:text-white"
            >
              Read FAQ
            </a>
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-900/40 p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">What Tvijo is</h2>
            <div className="space-y-4 leading-relaxed text-gray-300">
              <p>
                <strong>Tvijo</strong> is not being positioned as a trading or crypto platform anymore. The core idea is an
                operating layer for organizations that are already using AI and need structure before that usage becomes messy,
                expensive, or impossible to audit.
              </p>
              <p>
                We focus on AI-native startups, implementation teams, and service operators who need one place to manage how AI
                requests are routed, which models are allowed, how spend is controlled, how keys are handled, and what evidence
                remains after each workflow runs.
              </p>
              <p>
                The product direction matches the homepage: AI OS first, operational control second, and domain-specific modules
                only as supporting surfaces rather than the company story.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Core capabilities</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {capabilityCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-5">
                <div className="mb-2 text-2xl">{card.icon}</div>
                <h3 className="font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Who we build for</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {audienceCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-5">
                <h3 className="font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-white">How we support teams</h2>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-400">
            Tvijo is both a product direction and a service layer around rollout. We help teams define the first governed AI
            workflows, shape the control model, and connect it to real operating environments.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {serviceCards.map((service) => (
              <div key={service.name} className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-5">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-white">{service.name}</h3>
                  <span className="text-sm font-bold uppercase text-emerald-300">{service.price}</span>
                </div>
                <p className="text-sm text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-8">
            <h2 className="mb-3 text-2xl font-bold text-white text-center">Talk to the Tvijo team</h2>
            <p className="mx-auto mb-6 max-w-2xl text-center text-gray-400">
              Reach out if you are building an AI startup, operating AI services for clients, or need an AI OS layer for routing,
              budget controls, BYOK, and audit readiness.
            </p>

            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`/${locale}/demo`}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:opacity-90"
              >
                Open Demo Workspace
              </a>
              <a
                href="https://t.me/bibamon"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-600 px-8 py-3 font-bold text-gray-300 transition-all hover:border-slate-400"
              >
                Telegram @bibamon
              </a>
            </div>

            <div className="mx-auto max-w-lg rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="mb-1 text-center text-lg font-semibold text-white">Contact us</h3>
              <p className="mb-4 text-center text-sm text-gray-500">Pilot, partnership, integration, or support request</p>

              {leadSent ? (
                <div className="py-6 text-center">
                  <div className="mb-2 text-3xl">✅</div>
                  <div className="font-semibold text-green-400">Message sent!</div>
                  <div className="mt-1 text-sm text-gray-500">We&apos;ll get back to you shortly.</div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!leadForm.email && !leadForm.telegram) return;
                    setLeadLoading(true);
                    await captureLead({
                      email: leadForm.email,
                      telegram_username: leadForm.telegram,
                      name: leadForm.name,
                      source: 'about_aios',
                      message: leadForm.message,
                      page_url: `/${locale}/about`,
                      utm_source: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('utm_source') || '' : '',
                      utm_campaign: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('utm_campaign') || '' : '',
                      referrer: typeof document !== 'undefined' ? document.referrer : '',
                    });
                    setLeadSent(true);
                    setLeadLoading(false);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Telegram @username"
                    value={leadForm.telegram}
                    onChange={(e) => setLeadForm((f) => ({ ...f, telegram: e.target.value }))}
                    className="w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  />
                  <textarea
                    placeholder="Tell us what you are building or operating"
                    value={leadForm.message}
                    onChange={(e) => setLeadForm((f) => ({ ...f, message: e.target.value }))}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-600/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={leadLoading || (!leadForm.email && !leadForm.telegram)}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {leadLoading ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-700/30 pt-6 text-center text-sm sm:grid-cols-3">
              <div>
                <div className="text-gray-500">Contact</div>
                <a href="https://t.me/bibamon" className="font-medium text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                  t.me/bibamon
                </a>
              </div>
              <div>
                <div className="text-gray-500">Website</div>
                <a href="https://tvijo.com" className="font-medium text-blue-400 hover:text-blue-300">
                  tvijo.com
                </a>
              </div>
              <div>
                <div className="text-gray-500">Focus</div>
                <div className="font-medium text-gray-300">AI OS, startups, service operations</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-2 text-xs leading-relaxed text-gray-600/60">
          <p>
            Tvijo AI OS, AI operations platform, AI governance layer, model routing, BYOK, AI audit trail,
            AI startup infrastructure, AI service operations, prompt governance, budget guardrails, enterprise AI controls.
          </p>
          <p>
            AI control plane for startups, AI workflow governance, LLM routing, AI compliance readiness support,
            customer-owned model keys, governed AI pilots, operator tooling for AI teams, audit evidence for AI workflows.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
