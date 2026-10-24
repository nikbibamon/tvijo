'use client';

/**
 * HowItWorksModal — explains the reward system, ranks, token rates, and contribution workflow.
 */

import { useState } from 'react';

const RANKS = [
  { rank: 'Novice',      emoji: '🌱', threshold: 0,    rate: '0.30x', limit: '50k',  color: 'border-slate-600' },
  { rank: 'Contributor', emoji: '⭐', threshold: 100,  rate: '0.50x', limit: '100k', color: 'border-sky-500/40' },
  { rank: 'Expert',      emoji: '🔥', threshold: 500,  rate: '0.70x', limit: '250k', color: 'border-amber-500/40' },
  { rank: 'Master',      emoji: '👑', threshold: 1000, rate: '0.90x', limit: '500k', color: 'border-purple-500/40' },
];

export default function HowItWorksModal({ locale = 'en' }: { locale?: string }) {
  const [open, setOpen] = useState(false);
  const ru = locale === 'ru';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        {ru ? 'Как это работает?' : 'How it works?'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-slate-700/60 bg-[#0d1117] shadow-2xl shadow-black/40 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-[#0d1117]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎁</span> {ru ? 'Система наград' : 'Reward System'}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white text-lg px-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {ru ? 'Как заработать токены' : 'How to earn tokens'}
                </h3>
                <ul className="space-y-1.5 text-[13px] text-slate-400">
                  <li>💡 {ru ? 'Предлагайте идеи — suggestion' : 'Suggest ideas — suggestion'}</li>
                  <li>✏️ {ru ? 'Редактируйте узлы — edit' : 'Edit nodes — edit'}</li>
                  <li>🗳️ {ru ? 'Голосуйте за решения — vote' : 'Vote on decisions — vote'}</li>
                  <li>💬 {ru ? 'Комментируйте — comment' : 'Comment — comment'}</li>
                  <li>🔍 {ru ? 'Проводите ревью — review' : 'Review contributions — review'}</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {ru ? 'Ранги и ставки' : 'Ranks & Rates'}
                </h3>
                <div className="grid gap-2">
                  {RANKS.map(r => (
                    <div
                      key={r.rank}
                      className={`flex items-center gap-3 rounded-xl border ${r.color} bg-slate-900/40 px-3 py-2.5`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{r.rank}</p>
                        <p className="text-[10px] text-slate-500">
                          {ru ? `от ${r.threshold} очков` : `from ${r.threshold} pts`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{r.rate}</p>
                        <p className="text-[10px] text-slate-500">{r.limit}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {ru ? 'Процесс одобрения' : 'Approval Process'}
                </h3>
                <ol className="space-y-1 text-[13px] text-slate-400 list-decimal list-inside">
                  <li>{ru ? 'Вы создаёте contribution' : 'You create a contribution'}</li>
                  <li>{ru ? 'Модератор проверяет и ставит quality_score (0-100)' : 'Moderator reviews & sets quality_score (0-100)'}</li>
                  <li>{ru ? 'Очки добавляются к вашему профилю' : 'Points are added to your profile'}</li>
                  <li>{ru ? 'При достижении порога — автоматический апгрейд ранга' : 'Rank upgrades automatically at thresholds'}</li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
