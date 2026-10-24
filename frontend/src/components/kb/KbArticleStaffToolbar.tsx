'use client';

/**
 * Staff-only toolbar on KB article pages: regenerate AI visualization / open mind map.
 * GEN-KB-STAFF-TOOLBAR-001
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { portalApiFetch } from '@/lib/portal-auth-fetch';
import type { KBArticleDetail } from '@/types/knowledge';

const TOOLBAR_UI_REV = 'kb-staff-toolbar 2026-04-16';

type PublicationHints = NonNullable<
  NonNullable<KBArticleDetail['visualization_data']>['publication_hints']
>;

export function KbArticleStaffToolbar({
  locale,
  articleSlug,
  articleId,
  onRegenerated,
  savedContentProfile,
  savedPublicationHints,
}: {
  locale: string;
  articleSlug: string;
  articleId: string;
  onRegenerated: () => void | Promise<void>;
  savedContentProfile?: Record<string, unknown> | null;
  savedPublicationHints?: PublicationHints | null;
}) {
  const [staff, setStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [panel, setPanel] = useState<{
    content_profile: Record<string, unknown>;
    publication_hints: PublicationHints;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStaff() {
      if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
        if (!cancelled) setStaff(false);
        return;
      }
      try {
        const u = await portalApiFetch<{ is_staff?: boolean | string; is_superuser?: boolean | string }>(
          '/auth/me/'
        );
        const st =
          u?.is_staff === true ||
          u?.is_staff === 'true' ||
          u?.is_superuser === true ||
          u?.is_superuser === 'true';
        if (!cancelled) setStaff(st);
      } catch {
        if (!cancelled) setStaff(false);
      }
    }
    loadStaff();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') loadStaff();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', loadStaff);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', loadStaff);
    };
  }, []);

  const regen = useCallback(
    async (vizType: 'auto', bubbleDepth: 1 | 2 | 3 = 1) => {
      setBusy(true);
      setMsg('');
      try {
        await portalApiFetch<{ success?: boolean; error?: string }>(
          `/knowledge/articles/${encodeURIComponent(articleSlug)}/visualize/`,
          {
            method: 'POST',
            body: JSON.stringify({ viz_type: vizType, bubble_depth: bubbleDepth }),
          }
        );
        if (bubbleDepth === 1) {
          setMsg('Visualization regenerated (1 level: topic → concepts).');
        } else if (bubbleDepth === 2) {
          setMsg('Visualization regenerated (2 levels: topic → themes → concepts).');
        } else {
          setMsg('Visualization regenerated (3 levels: topic → themes → sub-themes → concepts).');
        }
        await onRegenerated();
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : 'Failed';
        setMsg(err);
      } finally {
        setBusy(false);
      }
    },
    [articleSlug, onRegenerated]
  );

  const translateToEnglish = useCallback(async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await portalApiFetch<{ success?: boolean; message?: string; error?: string }>(
        `/knowledge/articles/${encodeURIComponent(articleSlug)}/translate-to-english/`,
        { method: 'POST', body: '{}' }
      );
      setMsg(res?.message || 'Translated to English.');
      await onRegenerated();
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Failed';
      setMsg(err);
    } finally {
      setBusy(false);
    }
  }, [articleSlug, onRegenerated]);

  const translateToRussian = useCallback(async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await portalApiFetch<{ success?: boolean; message?: string; error?: string }>(
        `/knowledge/articles/${encodeURIComponent(articleSlug)}/translate-to-russian/`,
        { method: 'POST', body: '{}' }
      );
      setMsg(res?.message || 'Translated to Russian.');
      await onRegenerated();
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Failed';
      setMsg(err);
    } finally {
      setBusy(false);
    }
  }, [articleSlug, onRegenerated]);

  const runContentProfile = useCallback(async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await portalApiFetch<{
        success?: boolean;
        message?: string;
        error?: string;
        content_profile?: Record<string, unknown>;
        publication_hints?: PublicationHints;
      }>(
        `/knowledge/articles/${encodeURIComponent(articleSlug)}/content-profile/`,
        { method: 'POST', body: '{}' }
      );
      if (res?.content_profile && res?.publication_hints) {
        setPanel({ content_profile: res.content_profile, publication_hints: res.publication_hints });
      }
      setMsg(res?.message || 'Content profile saved.');
      await onRegenerated();
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Failed';
      setMsg(err);
    } finally {
      setBusy(false);
    }
  }, [articleSlug, onRegenerated]);

  const publishAndCreateDecmapBundle = useCallback(async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await portalApiFetch<{
        success?: boolean;
        message?: string;
        error?: string;
        bundle?: { id: string; slug: string; name: string };
      }>(
        `/knowledge/articles/${encodeURIComponent(articleSlug)}/publish-create-decmap-bundle/`,
        { method: 'POST', body: '{}' }
      );
      setMsg(res?.message || 'DecMap bundle created/updated.');
      await onRegenerated();
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Failed';
      setMsg(err);
    } finally {
      setBusy(false);
    }
  }, [articleSlug, onRegenerated]);

  const showSavedHints = useCallback(() => {
    if (savedContentProfile && savedPublicationHints) {
      setPanel({ content_profile: savedContentProfile, publication_hints: savedPublicationHints });
    }
  }, [savedContentProfile, savedPublicationHints]);

  if (!staff) return null;

  const ph = panel?.publication_hints;
  const checklist = ph?.editorial_checklist;
  const embeds = ph?.embed_ideas;
  const vizTry = ph?.suggested_viz_types_to_try;
  const entityNotes = ph?.entity_notes;

  const btn =
    'inline-flex items-center justify-center min-h-[2.25rem] px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 text-center';

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
      <div className="flex flex-col gap-1 mb-3 border-b border-amber-500/20 pb-2">
        <span className="text-sm font-semibold text-amber-300">Staff — действия с этой статьёй</span>
        <span className="text-[11px] text-amber-200/60 font-mono break-all">{TOOLBAR_UI_REV}</span>
        <span className="text-[10px] text-amber-200/45">
          Нет строки с ревизией выше = старый JS (деплой фронта + жёсткое обновление / Cloudflare purge).
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => regen('auto', 1)}
          title="Bubble map: topic → concepts (звезда)"
          className={`${btn} bg-amber-500/25 hover:bg-amber-500/35 text-amber-50 border border-amber-400/30`}
        >
          Regenerate AI visualization
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => regen('auto', 2)}
          title="Два уровня: темы → концепты"
          className={`${btn} bg-amber-500/15 hover:bg-amber-500/25 text-amber-100 border border-amber-400/20`}
        >
          AI viz — 2 levels
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => regen('auto', 3)}
          title="Три уровня: столпы → подтемы → листья"
          className={`${btn} bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 border border-amber-400/15`}
        >
          AI viz — 3 levels
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runContentProfile()}
          className={`${btn} bg-violet-500/25 hover:bg-violet-500/35 text-violet-50 border border-violet-400/30`}
        >
          Content profile & ideas
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void publishAndCreateDecmapBundle()}
          className={`${btn} bg-amber-500/25 hover:bg-amber-500/35 text-amber-50 border border-amber-400/30`}
          title="Publish article + create/update linked DecMap Bundle"
        >
          Publish + Create DecMap Bundle
        </button>
        {savedPublicationHints ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => showSavedHints()}
            className={`${btn} bg-violet-500/12 hover:bg-violet-500/22 text-violet-100 border border-violet-400/18`}
          >
            Show saved ideas
          </button>
        ) : (
          <div
            className={`${btn} bg-white/[0.03] text-gray-500 border border-white/5 cursor-default`}
            title="Сначала нажмите «Content profile & ideas»"
          >
            Show saved ideas (нет данных)
          </div>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void translateToEnglish()}
          className={`${btn} bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-50 border border-emerald-400/25`}
        >
          Translate into English
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void translateToRussian()}
          className={`${btn} bg-sky-500/20 hover:bg-sky-500/30 text-sky-50 border border-sky-400/25`}
        >
          Translate into Russian
        </button>
        <a
          href={`/admin/knowledge/kbarticle/${articleId}/change/`}
          className={`${btn} bg-white/10 hover:bg-white/15 text-gray-200 border border-white/15`}
        >
          Django admin
        </a>
        <Link
          href={`/${locale}/profile#profile-staff-panel`}
          className={`${btn} bg-orange-500/20 hover:bg-orange-500/30 text-orange-50 border border-orange-400/25`}
        >
          KB: догон (все статьи)
        </Link>
      </div>

      {msg && <p className="mt-3 text-xs text-amber-100/80">{msg}</p>}

      {panel && ph && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-gray-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-violet-200">Publication ideas (from content profile)</span>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded"
            >
              Close
            </button>
          </div>
          {ph.profile_confidence != null && typeof ph.profile_confidence === 'number' && (
            <p className="text-gray-500">
              Model confidence: {(ph.profile_confidence * 100).toFixed(0)}% · primary viz:{' '}
              {ph.primary_visualization_type} · mental model: {ph.mental_model}
            </p>
          )}
          {Array.isArray(vizTry) && vizTry.length > 0 && (
            <div>
              <p className="text-gray-400 font-medium mb-1">Try regenerating / embedding (viz order)</p>
              <p className="text-gray-300">{vizTry.join(' → ')}</p>
            </div>
          )}
          {Array.isArray(checklist) && checklist.length > 0 && (
            <div>
              <p className="text-gray-400 font-medium mb-1">Editorial checklist</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {checklist.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(embeds) && embeds.length > 0 && (
            <div>
              <p className="text-gray-400 font-medium mb-1">Embed ideas</p>
              <ul className="space-y-2">
                {embeds.map((row, i) => (
                  <li key={i} className="border-l-2 border-violet-500/40 pl-2">
                    <span className="text-violet-200/90 font-medium">{row.title}</span>
                    <span className="text-gray-400"> — </span>
                    <span className="text-gray-300">{row.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(entityNotes) && entityNotes.length > 0 && (
            <div>
              <p className="text-gray-400 font-medium mb-1">Entities to surface</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {entityNotes.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          <details className="text-gray-500">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300">Raw content profile JSON</summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/40 p-2 text-[11px] leading-relaxed">
              {JSON.stringify(panel.content_profile, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
