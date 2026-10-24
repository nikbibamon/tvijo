'use client';

/**
 * Decision Bundles — интеграция с Node.js Decision Map сервером
 * Route: /en/bundles/ or /ru/bundles/
 *
 * Эта страница использует nginx проксирование к Decision Map
 * Generation: GEN-DECMAP-BUNDLE-005
 */

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { fetchPublicBundles, type DecMapBundle } from '@/services/decmap-api';

function BundlesPageInner() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bundles, setBundles] = useState<DecMapBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!bundles.length) return;
    const bundleRaw = searchParams?.get('bundle') || '';
    if (!bundleRaw) return;

    const match = bundles.find((b) => b.id === bundleRaw || b.slug === bundleRaw);
    if (!match?.slug) return;

    router.replace(`/${locale}/bundles/${encodeURIComponent(match.slug)}`);
  }, [bundles, searchParams, router, locale]);

  useEffect(() => {
    document.title = 'Decision Bundles - Tvijo';

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

  // Hide per-article auto-generated bundles from the main "Decision Bundles" catalog.
  // These are useful, but were confusing in the main list.
  const curatedBundles = useMemo(() => {
    return bundles.filter((b) => typeof b.slug === 'string' && !b.slug.startsWith('kb-bundle-'));
  }, [bundles]);

  return (
    <div className="min-h-screen bg-[#0f141e]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Decision Bundles</h1>
            <p className="text-sm text-gray-400 mt-1">
              Public decision maps — nodes, votes & AI workflow.
            </p>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : err ? (
              <div className="text-sm text-red-400">{err}</div>
            ) : (
              <div className="text-sm text-gray-500">
                {curatedBundles.length} bundle{curatedBundles.length !== 1 ? 's' : ''}
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
            {curatedBundles.map((b) => (
              <Link
                key={b.id}
                href={`/${locale}/bundles/${encodeURIComponent(b.slug)}`}
                className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:border-amber-400/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl">🎯</div>
                    <div className="mt-1 text-sm font-semibold text-white line-clamp-2">
                      {b.name}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-gray-500 whitespace-nowrap">
                    {b.node_count ?? 0} nodes
                  </div>
                </div>
                {b.description ? (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3">{b.description}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Decision bundle</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-gray-400">
          Open any card to view a bundle directly. Legacy <code>?bundle=id-or-slug</code> links are auto-resolved to the stable bundle page.
        </div>
      </div>
    </div>
  );
}

export default function BundlesPage() {
  return (
    <Suspense fallback={null}>
      <BundlesPageInner />
    </Suspense>
  );
}
