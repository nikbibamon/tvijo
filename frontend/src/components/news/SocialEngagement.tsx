'use client';

/**
 * Social Engagement Bar — likes, comments, bookmarks, share for news articles.
 * Fetches engagement data from /api/v1/news/articles/{id}/engagement/
 * Actions (like, bookmark, comment) require auth token.
 */

import { useState, useEffect } from 'react';
import { articlesApi } from '@/services/news-api';
import type { EngagementData, ArticleCommentData } from '@/types/news';
import { parseLocale } from '@/i18n/config';

interface Props {
  articleId: number;
  articleTitle: string;
  articleUrl: string;
}

export default function SocialEngagement({ articleId, articleTitle, articleUrl }: Props) {
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [comments, setComments] = useState<ArticleCommentData[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    articlesApi.engagement(articleId).then(setEngagement).catch(() => {});
  }, [articleId]);

  const loadComments = async () => {
    try {
      const data = await articlesApi.comments(articleId);
      setComments(data);
    } catch { /* ignore */ }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('access_token') || '';
  };

  /** Returns a token, or sends the user to login (with return path) and returns ''. */
  const requireAuth = (): string => {
    const token = getToken();
    if (!token && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const locale = parseLocale(path);
      window.location.href = `/${locale}/login?redirect=${encodeURIComponent(path)}`;
    }
    return token;
  };

  const handleLike = async () => {
    const token = requireAuth();
    if (!token) return;
    if (!engagement) return;
    try {
      if (engagement.user_liked) {
        const res = await articlesApi.unlike(articleId, token);
        setEngagement({ ...engagement, user_liked: false, like_count: res.like_count });
      } else {
        const res = await articlesApi.like(articleId, token);
        setEngagement({ ...engagement, user_liked: true, like_count: res.like_count });
      }
    } catch { /* ignore */ }
  };

  const handleBookmark = async () => {
    const token = requireAuth();
    if (!token) return;
    if (!engagement) return;
    try {
      if (engagement.user_bookmarked) {
        const res = await articlesApi.unbookmark(articleId, token);
        setEngagement({ ...engagement, user_bookmarked: false, bookmark_count: res.bookmark_count });
      } else {
        const res = await articlesApi.bookmark(articleId, token);
        setEngagement({ ...engagement, user_bookmarked: true, bookmark_count: res.bookmark_count });
      }
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${articleUrl}`;
    if (navigator.share) {
      navigator.share({ title: articleTitle, url: fullUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = requireAuth();
    if (!token) return;
    setSubmitting(true);
    try {
      const comment = await articlesApi.addComment(articleId, newComment.trim(), token);
      setComments([comment, ...comments]);
      setNewComment('');
      if (engagement) {
        setEngagement({ ...engagement, comment_count: engagement.comment_count + 1 });
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (!engagement) return null;

  return (
    <div className="mt-8 pt-6 border-t border-white/5">
      {/* Engagement Bar */}
      <div className="flex items-center gap-4 mb-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            engagement.user_liked
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-white/5 text-gray-400 border border-white/5 hover:border-red-500/20 hover:text-red-400'
          }`}
        >
          <svg className="w-4 h-4" fill={engagement.user_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium">{engagement.like_count}</span>
        </button>

        {/* Comments */}
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            showComments
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'bg-white/5 text-gray-400 border border-white/5 hover:border-blue-500/20 hover:text-blue-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-medium">{engagement.comment_count}</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            engagement.user_bookmarked
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-white/5 text-gray-400 border border-white/5 hover:border-amber-500/20 hover:text-amber-400'
          }`}
        >
          <svg className="w-4 h-4" fill={engagement.user_bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="font-medium">{engagement.bookmark_count}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 border border-white/5 hover:border-green-500/20 hover:text-green-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="font-medium">{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Views */}
        <span className="ml-auto text-xs text-gray-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {engagement.view_count}
        </span>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-[#12121A] rounded-xl border border-white/5 p-5 mt-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            Comments ({engagement.comment_count})
          </h3>

          {/* Add Comment */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              maxLength={2000}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-[#0A0A0F] dark:text-white dark:placeholder:text-gray-600"
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-500/20 disabled:opacity-40 transition-all"
            >
              {submitting ? '...' : 'Post'}
            </button>
          </div>

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{c.user_name}</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {c.reply_count > 0 && (
                        <span className="text-[10px] text-gray-500">{c.reply_count} replies</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
