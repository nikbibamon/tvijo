'use client';

/**
 * Bundles list — show auto-generated per-article decision bundles (kb-bundle-*).
 * Route: /en/bundleslist or /ru/bundleslist
 */

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchPublicBundles, type DecMapBundle } from '@/services/decmap-api';

function BundlesListPageInner() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const searchParams = useSearchParams();

  const [bundles, setBundles] = useState<DecMapBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState('/bundles/');

  useEffect(() => {
    document.title = 'Decision Bundles (Topic Bundles) - Tvijo';

    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetchPublicBundles()
      .then((list) => {
        if (cancelled) return;
        setBundles(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : 'Failed to load bundles');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const curatedKbBundles = useMemo(() => {
    return bundles.filter(
      (b) => typeof b.slug === 'string' && b.slug.startsWith('kb-bundle-')
    );
  }, [bundles]);

  const q = searchParams?.toString() || '';

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!q) {
        setIframeSrc('/bundles/');
        return;
      }

      const sp = new URLSearchParams(q);
      const bundleRaw = sp.get('bundle');
      if (!bundleRaw) {
        setIframeSrc(`/bundles/?${q}`);
        return;
      }

      const byId = bundles.find((b) => b.id === bundleRaw);
      if (byId) {
        if (!cancelled) setIframeSrc(`/bundles/?${sp.toString()}`);
        return;
      }

      const bySlug = bundles.find((b) => b.slug === bundleRaw);
      if (bySlug) {
        sp.set('bundle', bySlug.id);
        if (!cancelled) setIframeSrc(`/bundles/?${sp.toString()}`);
        return;
      }

      // Legacy: bundle=<KBArticle slug> -> resolve via KB API.
      try {
        const r = await fetch(`/api/v1/knowledge/articles/${encodeURIComponent(bundleRaw)}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (r.ok) {
          const data = await r.json();
          const bundleId =
            (data?.visual_embeds && data.visual_embeds.bundle_id) ||
            data?.linked_bundles?.[0]?.id;
          if (typeof bundleId === 'string' && bundleId.trim()) {
            sp.set('bundle', bundleId);
            if (!cancelled) setIframeSrc(`/bundles/?${sp.toString()}`);
            return;
          }
        }
      } catch {
        // ignore resolve errors; fallback below
      }

      if (!cancelled) setIframeSrc(`/bundles/?${sp.toString()}`);
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [q, bundles]);

  return (
    <div className="min-h-screen bg-[#0f141e]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Topic Bundles</h1>
            <p className="text-sm text-gray-400 mt-1">
              Auto-generated decision bundles derived from KB articles.
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <Link href={`/${locale}/bundles`} className="text-amber-300 hover:underline">
                ← Back to Decision Bundles
              </Link>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : err ? (
              <div className="text-sm text-red-400">{err}</div>
            ) : (
              <div className="text-sm text-gray-500">
                {curatedKbBundles.length} bundle
                {curatedKbBundles.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-4 animate-pulse h-28"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {curatedKbBundles.map((b) => (
              <Link
                key={b.id}
                href={`/${locale}/bundleslist?bundle=${encodeURIComponent(b.id)}`}
                className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:border-purple-400/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl">📌</div>
                    <div className="mt-1 text-sm font-semibold text-white line-clamp-2">
                      {b.name}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-gray-500 whitespace-nowrap">
                    {b.node_count ?? 0} nodes
                  </div>
                </div>
                {b.description ? (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                    {b.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Topic bundle</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-white/5 overflow-hidden bg-black/20">
          <iframe
            src={iframeSrc}
            className="w-full min-h-[70vh] border-0"
            title="Decision Map"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function BundlesListPage() {
  return (
    <Suspense fallback={null}>
      <BundlesListPageInner />
    </Suspense>
  );
}
