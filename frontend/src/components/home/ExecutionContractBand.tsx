'use client';

/**
 * Execution Contract marketing band (Part C3, 05_ARTIFACTS §2).
 * Self-contained copy via src/i18n/home-contract.ts (EN/RU/UK, fallback EN).
 */

import { FileCheck2, GitBranch, KeyRound } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { getHomeContract } from '@/i18n/home-contract';

const SPLIT_ICONS = [FileCheck2, GitBranch, KeyRound];

export default function ExecutionContractBand() {
  const { locale } = useLocale();
  const c = getHomeContract(locale);

  return (
    <section className="relative overflow-hidden border-y border-emerald-300/15 bg-[#061a20] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          {c.eyebrow}
        </p>
        <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {c.title}
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {c.subtitle}
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {c.splitTitle.map((title, index) => {
            const Icon = SPLIT_ICONS[index];
            return (
              <div key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                <Icon className="h-5 w-5 text-emerald-300" />
                <h3 className="mt-3 text-base font-bold text-white">{title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-slate-400">{c.splitText[index]}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-9 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {c.statusTitle}
          </p>
          <p className="mt-2 font-mono text-sm font-bold text-emerald-200 sm:text-base">
            {c.statusLine}
          </p>
        </div>

        <p className="mt-6 text-xs leading-5 text-amber-300/90">{c.trustLine}</p>
      </div>
    </section>
  );
}
