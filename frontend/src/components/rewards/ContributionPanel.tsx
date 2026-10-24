'use client';

/**
 * ContributionPanel — list of user's contributions with status badges.
 */

import { useEffect, useState } from 'react';
import type { NodeContribution, ContributionStatus } from '@/services/decmap-api';
import { fetchContributions } from '@/services/decmap-api';

const STATUS_STYLE: Record<ContributionStatus, { bg: string; text: string; label_en: string; label_ru: string }> = {
  pending:  { bg: 'bg-amber-500/15', text: 'text-amber-300', label_en: 'Pending',  label_ru: 'На рассмотрении' },
  approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', label_en: 'Approved', label_ru: 'Одобрено' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-300', label_en: 'Rejected', label_ru: 'Отклонено' },
};

const TYPE_EMOJI: Record<string, string> = {
  suggestion: '💡',
  edit: '✏️',
  vote: '🗳️',
  comment: '💬',
  review: '🔍',
};

export default function ContributionPanel({ locale = 'en' }: { locale?: string }) {
  const [items, setItems] = useState<NodeContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const ru = locale === 'ru';

  useEffect(() => {
    fetchContributions().then(data => { setItems(data); setLoading(false); });
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/60">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-lg">📋</span>
          {ru ? 'Мои вклады' : 'My Contributions'}
        </h3>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          {ru ? 'У вас ещё нет вкладов' : 'You have no contributions yet'}
        </div>
      ) : (
        <ul className="divide-y divide-slate-800/40 max-h-[400px] overflow-y-auto">
          {items.map(c => {
            const ss = STATUS_STYLE[c.status];
            return (
              <li key={c.id} className="px-4 py-3 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-base">{TYPE_EMOJI[c.contribution_type] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{c.bundle_name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {c.contribution_type}
                      {c.node_id ? ` · ${c.node_id.slice(0, 8)}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${ss.bg} ${ss.text} border border-current/25`}>
                    {ru ? ss.label_ru : ss.label_en}
                  </span>
                </div>
                {c.status === 'approved' && c.quality_score > 0 && (
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{ru ? 'Качество' : 'Quality'}: <strong className="text-slate-300">{c.quality_score}</strong></span>
                    <span>{ru ? 'Награда' : 'Reward'}: <strong className="text-emerald-400">{c.user_reward}</strong></span>
                  </div>
                )}
                {c.status === 'rejected' && c.rejection_reason && (
                  <p className="mt-1.5 text-[11px] text-red-400/80 truncate">
                    {c.rejection_reason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
