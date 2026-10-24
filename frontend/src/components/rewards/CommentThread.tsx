'use client';

/**
 * CommentThread — threaded comments on a bundle node.
 */

import { useEffect, useState, useCallback } from 'react';
import type { NodeComment } from '@/services/decmap-api';
import { fetchNodeComments, createNodeComment } from '@/services/decmap-api';

function Comment({ comment, locale, onReply }: {
  comment: NodeComment;
  locale: string;
  onReply: (parentId: string) => void;
}) {
  const ru = locale === 'ru';
  const date = new Date(comment.created_at);
  const timeStr = date.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="group">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 mt-0.5">
          {comment.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">@{comment.username}</span>
            <span className="text-[10px] text-slate-600">{timeStr}</span>
            {!comment.is_confirmed && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {ru ? 'модерация' : 'pending'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{comment.text}</p>
          <button
            type="button"
            onClick={() => onReply(comment.id)}
            className="text-[10px] text-cyan-500/70 hover:text-cyan-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {ru ? 'Ответить' : 'Reply'}
          </button>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 pl-3 border-l border-slate-800/60 space-y-2">
          {comment.replies.map(r => (
            <Comment key={r.id} comment={r} locale={locale} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({
  bundleId,
  nodeId,
  locale = 'en',
}: {
  bundleId: string;
  nodeId: string;
  locale?: string;
}) {
  const [comments, setComments] = useState<NodeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const ru = locale === 'ru';

  const load = useCallback(() => {
    fetchNodeComments(bundleId, nodeId).then(data => { setComments(data); setLoading(false); });
  }, [bundleId, nodeId]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const result = await createNodeComment({
      bundle: bundleId,
      node_id: nodeId,
      text: text.trim(),
      parent_comment: replyTo,
    });
    if (result) {
      setText('');
      setReplyTo(null);
      load();
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800/50 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>💬</span> {ru ? 'Комментарии' : 'Comments'}
          {!loading && <span className="text-slate-600">({comments.length})</span>}
        </h4>
      </div>

      <div className="px-3 py-2 space-y-3 max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-3">
            {ru ? 'Пока нет комментариев' : 'No comments yet'}
          </p>
        ) : (
          comments.map(c => (
            <Comment key={c.id} comment={c} locale={locale} onReply={setReplyTo} />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-3 py-2 border-t border-slate-800/50">
        {replyTo && (
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-500">
            <span>{ru ? 'Ответ на' : 'Replying to'} #{replyTo.slice(0, 8)}</span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-slate-600 hover:text-white">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={ru ? 'Написать комментарий...' : 'Write a comment...'}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors disabled:opacity-40"
          >
            {submitting ? '...' : ru ? 'Отправить' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
