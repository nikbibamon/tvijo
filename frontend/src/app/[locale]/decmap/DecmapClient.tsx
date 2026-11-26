'use client';

/**
 * Decision Center — the hub for collective decision-making + community forum.
 * Route: /{locale}/decmap
 *
 * - Lists all public Decision Bundles (each = a decision map you can open,
 *   vote on nodes, and discuss).
 * - Shows a live "Community activity" feed (recent comments + votes across all
 *   public bundles) — the forum layer built on the decmap social models.
 *
 * Replaces the legacy personal nick-based task tool (empty in prod; backed up in
 * /.backups/decmap-page.legacy-nicktool-20260530.tsx.bak).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLocale } from '@/i18n/useLocale';
import {
  fetchPublicBundles,
  fetchDecmapActivity,
  fetchCommunityStats,
  createBundle,
  type DecMapBundle,
  type DecmapActivity,
  type CommunityStats,
} from '@/services/decmap-api';

function timeAgo(iso: string, t: any): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t.decmap.justNow;
  if (m < 60) return t.decmap.minutesAgo.replace('{m}', String(m));
  const h = Math.floor(m / 60);
  if (h < 24) return t.decmap.hoursAgo.replace('{h}', String(h));
  return t.decmap.daysAgo.replace('{d}', String(Math.floor(h / 24)));
}

const VOTE_EMOJI: Record<string, string> = {
  approve: '👍',
  reject: '👎',
  discuss: '💬',
};

export default function DecisionCenterPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const { user } = useCurrentUser();
  const { t } = useLocale();

  const [bundles, setBundles] = useState<DecMapBundle[]>([]);
  const [activity, setActivity] = useState<DecmapActivity[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  // New-decision modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setCreateError(t.decmap.giveTitle);
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const ownerNick = (user?.email || '').split('@')[0] || 'me';
      const rootId = 'root';
      const created = await createBundle({
        name,
        description: newDesc.trim(),
        template: 'architecture',
        owner_nick: ownerNick,
        is_public: true,
        is_published: true,
        nodes_json: [
          {
            id: rootId,
            label: name,
            type: 'decision_gate',
            status: 'open_for_vote',
            x: 400,
            y: 120,
            radius: 26,
            color: '#f59e0b',
            priority: 1,
            detail: newDesc.trim(),
          },
        ],
        links_json: [],
      });
      if (created?.slug) {
        router.push(`/${locale}/bundles/${encodeURIComponent(created.slug)}`);
      } else {
        setCreateError(t.decmap.createError);
        setCreating(false);
      }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : t.decmap.createErrorGeneric);
      setCreating(false);
    }
  };

  useEffect(() => {
    document.title = `${t.decmap.title} — Tvijo`;
    let cancelled = false;
    Promise.all([
      fetchPublicBundles().catch(() => []),
      fetchDecmapActivity(30).catch(() => []),
      fetchCommunityStats().catch(() => null),
    ]).then(([b, a, s]) => {
      if (cancelled) return;
      // Hide per-article auto bundles from the curated hub list.
      setBundles((b || []).filter((x) => !String(x.slug || '').startsWith('kb-bundle-')));
      setActivity(a || []);
      setStats(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bm-page">
      <Navbar />

      {/* Hero */}
      <div className="border-b border-white/5 bg-gradient-to-b from-amber-500/5 to-transparent pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            {t.decmap.subtitle}
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {t.decmap.title.split(' ')[0]} <span className="text-amber-400">{t.decmap.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            {t.decmap.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setShowCreate(true);
                  setCreateError(null);
                }}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400"
              >
                {t.decmap.newDecision}
              </button>
            ) : (
              <Link
                href={`/${locale}/login?redirect=/${locale}/decmap`}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400"
              >
                {t.decmap.signInToStart}
              </Link>
            )}
            <Link
              href={`/${locale}/bundles`}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t.decmap.browseAllBundles}
            </Link>
            <Link
              href={`/${locale}/bubbles`}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t.decmap.knowledgeBubbles}
            </Link>
            <Link
              href={`/${locale}/learn/decision-bundles-for-governance-reviews`}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {t.decmap.howItWorks}
            </Link>
          </div>

          {/* Community stats */}
          {stats && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { v: stats.decisions, l: t.decmap.openDecisions },
                { v: stats.discussions, l: t.decmap.discussions },
                { v: stats.maps, l: t.decmap.knowledgeMaps },
                { v: stats.members, l: t.decmap.members },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="text-xl font-bold text-amber-400">{s.v.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-500">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Bundles */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {t.decmap.openDecisions}
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]" />
                ))}
              </div>
            ) : bundles.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                <div className="mb-2 text-4xl">🎯</div>
                <p className="text-sm text-gray-400">{t.decmap.noPublicBundles}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {bundles.map((b) => (
                  <Link
                    key={b.id}
                    href={`/${locale}/bundles/${encodeURIComponent(b.slug)}`}
                    className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-amber-400/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-2xl">🎯</div>
                      <span className="text-[11px] text-gray-500">{b.node_count ?? 0} {t.decmap.nodes}</span>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-amber-300">
                      {b.name}
                    </div>
                    {b.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400">{b.description}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">{t.decmap.decisionBundle}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Community activity / forum feed */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {t.decmap.communityActivity}
              </h2>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {t.decmap.live}
              </span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg border border-white/5 bg-white/[0.03]" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
                <p className="text-sm text-gray-400">{t.decmap.noDiscussion}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {t.decmap.noDiscussionDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((a) => (
                  <Link
                    key={`${a.kind}-${a.id}`}
                    href={`/${locale}/bundles/${encodeURIComponent(a.bundle_slug)}`}
                    className="block rounded-lg border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{a.kind === 'vote' ? VOTE_EMOJI[a.vote_type || 'discuss'] : '💬'}</span>
                      <span className="font-medium text-gray-200">{a.username}</span>
                      <span>{a.kind === 'vote' ? t.decmap.voted : t.decmap.commented} {t.decmap.on}</span>
                      <span className="ml-auto text-[11px] text-gray-600">{timeAgo(a.created_at, t)}</span>
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs font-medium text-amber-300/90">
                      {a.bundle_name}
                    </div>
                    {a.kind === 'comment' && a.text && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400">“{a.text}”</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* New-decision modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4"
          onClick={() => !creating && setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121A] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{t.decmap.startNewDecision}</h3>
              <button
                type="button"
                onClick={() => !creating && setShowCreate(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              {t.decmap.startNewDecisionDesc}
            </p>
            <label className="mb-1 block text-xs text-gray-400">{t.decmap.decisionTitle}</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.decmap.decisionTitlePlaceholder}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
              autoFocus
            />
            <label className="mb-1 block text-xs text-gray-400">{t.decmap.context}</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder={t.decmap.contextPlaceholder}
              className="mb-3 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
            />
            {createError && (
              <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {createError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !creating && setShowCreate(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                {t.decmap.cancel}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                {creating ? t.decmap.creating : t.decmap.createDecision}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
