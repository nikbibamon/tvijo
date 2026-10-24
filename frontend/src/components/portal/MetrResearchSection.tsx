'use client';

import Image from 'next/image';
import Link from 'next/link';

const METR_IMAGES = {
  frontierRisk: '/images/metr/2026-05-27_161037.png',
  taskSubstitution: '/images/metr/2026-05-27_161055.png',
  monitorability: '/images/metr/2026-05-27_161230.png',
} as const;

const pillars = [
  {
    title: 'Agent risk & rogue deployment',
    body: 'METR documents that minimal rogue deployment is already plausible for frontier agents, while surviving active security investigation is not. TVIJO AI OS maps this to permissions, sandboxing, approval gates, and kill switches.',
    metric: '44',
    metricLabel: 'documented misalignment incidents reviewed',
  },
  {
    title: 'Productivity uplift',
    body: 'Technical workers self-report 1.6–2.1× more valuable work in early 2026, with higher expectations for 2027. AI OS should measure value uplift, not chat volume.',
    metric: '1.4–2×',
    metricLabel: 'median perceived value multiplier (self-report)',
  },
  {
    title: 'Task substitution',
    body: 'AI changes which tasks teams take on. Uplift on old tasks ≤ uplift in value ≤ uplift on new tasks — so governance must track new task classes, not only speed.',
    metric: '+33–50%',
    metricLabel: 'uplift range across old vs new tasks',
  },
  {
    title: 'Monitorability',
    body: 'Stronger agents evade weaker monitors more often. A cheap model cannot reliably police a frontier executor — layered rules plus strong judges are required.',
    metric: '14.4%',
    metricLabel: 'uncaught runs even with matched monitor (METR eval)',
  },
];

const osModules = [
  { name: 'Agent Risk Score', desc: 'Access scope, action class, blast radius' },
  { name: 'Monitorability Layer', desc: 'Rules, strong judge, human approval' },
  { name: 'Uplift Analytics', desc: 'Speed, value, and new-task uplift' },
];

export default function MetrResearchSection({ locale }: { locale: string }) {
  return (
    <section id="metr-research" className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-[#08080d] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600 dark:text-orange-400">
            Research-backed governance
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What METR teaches enterprise AI OS teams
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
            METR evaluates frontier models for capabilities and risk — not marketing claims. Tvijo AI OS turns
            their findings into control-plane modules: risk scoring, monitorability, and uplift measurement.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{p.metric}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                {p.metricLabel}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101018]">
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
              Frontier risk · May 2026
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={METR_IMAGES.frontierRisk}
                alt="METR frontier risk chart: severity vs investigation difficulty"
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <figcaption className="px-4 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-500">
              Source: METR research summaries. Charts shown for education; Tvijo interprets implications for AI OS controls.
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101018]">
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
              Productivity uplift · May 2026
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={METR_IMAGES.frontierRisk}
                alt="METR productivity uplift box plot"
                fill
                className="object-cover object-top p-2"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <figcaption className="px-4 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-500">
              Self-reported multipliers; treat as directional signal, not guaranteed ROI.
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101018]">
            <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
              Monitorability heatmap · Jan 2026
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={METR_IMAGES.monitorability}
                alt="METR monitorability heatmap: percent uncaught runs by agent and monitor model"
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <figcaption className="px-4 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-500">
              Stronger agents need stronger monitors — not a single cheap classifier.
            </figcaption>
          </figure>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101018]">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
            Task substitution · May 2026
          </div>
          <div className="relative mx-auto max-w-4xl">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={METR_IMAGES.taskSubstitution}
                alt="METR task substitution uplift diagrams"
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-orange-200/80 bg-orange-50/80 p-6 dark:border-orange-500/20 dark:bg-orange-500/5 sm:p-8">
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Three AI OS modules from METR</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {osModules.map((m) => (
              <div key={m.name} className="rounded-xl border border-orange-200/60 bg-white/80 p-4 dark:border-orange-500/20 dark:bg-white/[0.04]">
                <div className="text-sm font-semibold text-slate-950 dark:text-white">{m.name}</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/learn/ai-agent-governance-foundations`}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600"
            >
              Start learning path
            </Link>
            <Link
              href={`/${locale}/#cta`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Request demo
            </Link>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-500">
            Full research write-ups live in Tvijo Knowledge Base for staff. Public lessons start in Learn.
          </p>
        </div>
      </div>
    </section>
  );
}
