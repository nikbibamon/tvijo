'use client';

/**
 * EntityEngagement — likes + comments for any directory entity (company / fund).
 * Public read; actions require auth (redirects to login with return path).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchEntitySummary,
  fetchEntityComments,
  addEntityComment,
  toggleEntityLike,
  type EntityComment,
  type EntitySummary,
  type EntityTargetType,
} from '@/services/engagement-api';
import { parseLocale } from '@/i18n/config';

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function goLogin() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  const locale = parseLocale(path);
  window.location.href = `/${locale}/login?redirect=${encodeURIComponent(path)}`;
}

export default function EntityEngagement({
  targetType,
  targetId,
  title = 'Community',
}: {
  targetType: EntityTargetType;
  targetId: string;
  title?: string;
}) {
  const [summary, setSummary] = useState<EntitySummary | null>(null);
  const [comments, setComments] = useState<EntityComment[]>([]);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchEntitySummary(targetType, targetId).then(setSummary);
    fetchEntityComments(targetType, targetId).then(setComments);
  }, [targetType, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLike = async () => {
    const res = await toggleEntityLike(targetType, targetId);
    if (res && '__unauth' in res) return goLogin();
    if (res) setSummary((s) => (s ? { ...s, user_liked: res.liked, like_count: res.like_count } : s));
  };

  const handleSubmit = async () => {
    const text = body.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    const res = await addEntityComment({ target_type: targetType, target_id: targetId, body: text });
    setSubmitting(false);
    if (res && '__unauth' in res) return goLogin();
    if (res) {
      setComments((prev) => [res as EntityComment, ...prev]);
      setBody('');
      setSummary((s) => (s ? { ...s, comment_count: s.comment_count + 1 } : s));
    } else {
      setError('Could not post your comment. Please try again.');
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
            summary?.user_liked
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-white/10 bg-white/5 text-gray-400 hover:border-red-500/20 hover:text-red-400'
          }`}
          aria-label="Like"
        >
          <svg className="h-4 w-4" fill={summary?.user_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium">{summary?.like_count ?? 0}</span>
        </button>
      </div>

      {/* Composer */}
      <div className="mb-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Share your take, ask a question, or add a fact…"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-400/50 focus:outline-none"
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-[#001b18] transition hover:bg-emerald-300 disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </div>

      {/* Comments */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-gray-200">{c.author_name}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-600">{timeAgo(c.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-300">{c.body}</p>
              {c.replies?.length > 0 && (
                <div className="mt-2 space-y-2 border-l border-white/10 pl-3">
                  {c.replies.map((r) => (
                    <div key={r.id}>
                      <div className="mb-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-medium text-gray-300">{r.author_name}</span>
                        <span>·</span>
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-gray-400">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
