'use client';

import { useState } from 'react';
import type { SampleStep } from '@/services/demo-sample-api';
import type { DemoCopy } from '@/i18n/public-surface';

/**
 * Deterministic playback of steps that already happened.
 *
 * The button walks the list the server already rendered. It sends no prompt,
 * starts no run and writes nothing — the spec calls this "Replay example" for
 * that reason. With JavaScript disabled the full list still renders; only the
 * button goes quiet, which is the correct degradation for a control that
 * only re-reads what is on screen.
 */
export default function DemoReplay({ steps, copy }: { steps: SampleStep[]; copy: DemoCopy['steps'] }) {
  // -1 means "everything is shown", which is also the server-rendered state.
  const [upTo, setUpTo] = useState(-1);
  const replaying = upTo >= 0;

  const advance = () => {
    setUpTo((current) => (current + 1 >= steps.length ? -1 : current + 1));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={advance}
          className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        >
          {copy.replay}
        </button>
        {replaying && (
          <button
            type="button"
            onClick={() => setUpTo(-1)}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            {copy.replayReset}
          </button>
        )}
        <p className="text-xs text-slate-500">{copy.replayNote}</p>
      </div>

      <ol className="space-y-3" aria-live="polite">
        {steps.map((step, index) => {
          const dimmed = replaying && index > upTo;
          return (
            <li
              key={step.state}
              className={`flex gap-4 rounded-2xl border p-4 transition ${
                dimmed
                  ? 'border-white/5 bg-white/[0.01] opacity-40'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block font-mono text-sm font-semibold text-emerald-200">{step.state}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-300">{step.note}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
