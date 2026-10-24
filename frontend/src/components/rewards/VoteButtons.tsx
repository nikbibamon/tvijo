'use client';

/**
 * VoteButtons — inline approve/reject/discuss buttons for a bundle node.
 */

import { useState } from 'react';
import type { NodeVote } from '@/services/decmap-api';
import { castNodeVote, fetchNodeVotes } from '@/services/decmap-api';

const VOTE_META: Record<string, { emoji: string; label_en: string; label_ru: string; color: string }> = {
  approve: { emoji: '👍', label_en: 'Approve', label_ru: 'За', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25' },
  reject:  { emoji: '👎', label_en: 'Reject',  label_ru: 'Против', color: 'bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25' },
  discuss: { emoji: '💬', label_en: 'Discuss', label_ru: 'Обсудить', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25' },
};

export default function VoteButtons({
  bundleId,
  nodeId,
  locale = 'en',
  initialVotes = [],
}: {
  bundleId: string;
  nodeId: string;
  locale?: string;
  initialVotes?: NodeVote[];
}) {
  const [votes, setVotes] = useState<NodeVote[]>(initialVotes);
  const [submitting, setSubmitting] = useState(false);
  const ru = locale === 'ru';

  const counts: Record<string, number> = { approve: 0, reject: 0, discuss: 0 };
  votes.forEach(v => { counts[v.vote_type] = (counts[v.vote_type] || 0) + 1; });

  async function handleVote(voteType: 'approve' | 'reject' | 'discuss') {
    if (submitting) return;
    setSubmitting(true);
    const result = await castNodeVote({ bundle: bundleId, node_id: nodeId, vote_type: voteType });
    if (result) {
      const fresh = await fetchNodeVotes(bundleId, nodeId);
      setVotes(fresh);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      {Object.entries(VOTE_META).map(([type, meta]) => (
        <button
          key={type}
          type="button"
          disabled={submitting}
          onClick={() => handleVote(type as 'approve' | 'reject' | 'discuss')}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${meta.color} disabled:opacity-50`}
        >
          <span>{meta.emoji}</span>
          <span>{ru ? meta.label_ru : meta.label_en}</span>
          {counts[type] > 0 && (
            <span className="ml-0.5 text-[10px] opacity-70">{counts[type]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
