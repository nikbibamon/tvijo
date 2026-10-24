'use client';

/**
 * Social panel for a selected bundle node: votes + comments.
 *
 * Backend endpoints (wired through services/decmap-api.ts):
 *  - GET  /api/v1/decmap/social/votes/?bundle=<id>&node_id=<id>
 *  - POST /api/v1/decmap/social/votes/
 *  - GET  /api/v1/decmap/social/comments/?bundle=<id>&node_id=<id>
 *  - POST /api/v1/decmap/social/comments/
 *
 * Auth-gated: backend requires IsAuthenticated for POST. Unauthenticated
 * viewers see a disabled state with a login hint.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  castNodeVote,
  createNodeComment,
  fetchNodeComments,
  fetchNodeVotes,
  type NodeComment,
  type NodeVote,
} from '@/services/decmap-api';

type VoteType = 'approve' | 'reject' | 'discuss';

interface BundleNodeSocialProps {
  bundleId: string;
  nodeId: string | null;
  /** Whether the visitor is logged in (JWT present). */
  isAuthed: boolean;
  /** Current user id, used to highlight their own vote. */
  currentUserId?: string | null;
  /** Current user email, used to dedupe their own comments in optimistic UI. */
  currentUserEmail?: string | null;
}

const VOTE_LABELS: Record<VoteType, { emoji: string; title: string }> = {
  approve: { emoji: '👍', title: 'Approve' },
  reject: { emoji: '👎', title: 'Reject' },
  discuss: { emoji: '💬', title: 'Needs discussion' },
};

export default function BundleNodeSocial({
  bundleId,
  nodeId,
  isAuthed,
  currentUserId: _currentUserId,
  currentUserEmail,
}: BundleNodeSocialProps) {
  const [votes, setVotes] = useState<NodeVote[]>([]);
  const [comments, setComments] = useState<NodeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<VoteType | 'comment' | null>(null);
  const [newComment, setNewComment] = useState('');

  const reload = useCallback(async () => {
    if (!bundleId || !nodeId) {
      setVotes([]);
      setComments([]);
      return;
    }
    setLoading(true);
    try {
      const [v, c] = await Promise.all([
        fetchNodeVotes(bundleId, nodeId),
        fetchNodeComments(bundleId, nodeId),
      ]);
      setVotes(v);
      setComments(c);
    } finally {
      setLoading(false);
    }
  }, [bundleId, nodeId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const tally = (type: VoteType) =>
    votes.filter(v => v.vote_type === type).length;

  const myVote = votes.find(
    v => !!currentUserEmail && v.username === currentUserEmail?.split('@')[0],
  );

  const handleVote = useCallback(
    async (vote_type: VoteType) => {
      if (!bundleId || !nodeId || !isAuthed) return;
      setSubmitting(vote_type);
      const res = await castNodeVote({ bundle: bundleId, node_id: nodeId, vote_type });
      setSubmitting(null);
      if (res) {
        await reload();
      }
    },
    [bundleId, nodeId, isAuthed, reload],
  );

  const handleComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = newComment.trim();
      if (!text || !bundleId || !nodeId || !isAuthed) return;
      setSubmitting('comment');
      const res = await createNodeComment({
        bundle: bundleId,
        node_id: nodeId,
        text,
      });
      setSubmitting(null);
      if (res) {
        setNewComment('');
        await reload();
      }
    },
    [newComment, bundleId, nodeId, isAuthed, reload],
  );

  if (!nodeId) {
    return (
      <div className="text-[11px] text-slate-500 italic px-1 py-2">
        Select a node to see votes and comments.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(VOTE_LABELS) as VoteType[]).map(type => {
          const label = VOTE_LABELS[type];
          const n = tally(type);
          const mine = myVote?.vote_type === type;
          return (
            <button
              key={type}
              type="button"
              disabled={!isAuthed || submitting === type}
              onClick={() => handleVote(type)}
              title={
                isAuthed
                  ? label.title
                  : 'Log in to vote'
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                mine
                  ? 'bg-cyan-500/25 text-cyan-100 border-cyan-400/60'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60'
              } ${!isAuthed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{label.emoji}</span>
              <span className="tabular-nums">{n}</span>
              {submitting === type && <span className="ml-1 animate-pulse">…</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Comments {comments.length > 0 && <span className="text-slate-500">({comments.length})</span>}
        </h4>

        {loading ? (
          <div className="text-[11px] text-slate-500 italic">Loading…</div>
        ) : comments.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">No comments yet.</div>
        ) : (
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {comments.map(c => (
              <li
                key={c.id}
                className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-200">{c.username}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                  {c.is_confirmed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      confirmed
                    </span>
                  )}
                </div>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{c.text}</p>
              </li>
            ))}
          </ul>
        )}

        {isAuthed ? (
          <form onSubmit={handleComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              maxLength={2000}
              className="w-full text-xs bg-slate-900/60 border border-slate-700/60 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none resize-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting === 'comment'}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting === 'comment' ? 'Posting…' : 'Post comment'}
            </button>
          </form>
        ) : (
          <div className="text-[11px] text-slate-500 italic">
            Log in to post a comment.
          </div>
        )}
      </div>
    </div>
  );
}
