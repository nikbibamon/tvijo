'use client';

/**
 * Interactive + static visuals for KB articles (GEN-KB-VISUAL-001).
 * Data: KBArticle.visual_embeds (JSON from API).
 */

import Link from 'next/link';
import type { KBVisualEmbeds } from '@/types/knowledge';

function isNonEmpty(v: KBVisualEmbeds | Record<string, unknown> | undefined): v is KBVisualEmbeds {
  if (!v || typeof v !== 'object') return false;
  const o = v as KBVisualEmbeds;
  return !!(
    o.bubble_map_id ||
    o.bundle_id ||
    (o.infographics && o.infographics.length > 0)
  );
}

export default function KbArticleVisualEmbeds({
  visualEmbeds,
  locale,
}: {
  visualEmbeds?: KBVisualEmbeds | Record<string, unknown>;
  locale: string;
}) {
  if (!isNonEmpty(visualEmbeds)) return null;

  const v = visualEmbeds as KBVisualEmbeds;
  const variant = v.variant || 'network';
  const isRu = locale === 'ru';
  const isUk = locale === 'uk';
  const variantLabel =
    variant === 'rating'
      ? (isRu ? 'Рейтинг / сравнение' : isUk ? 'Рейтинг / порівняння' : 'Rating / comparison')
      : variant === 'timeline'
        ? (isRu ? 'Таймлайн' : isUk ? 'Таймлайн' : 'Timeline')
        : variant === 'compare'
          ? (isRu ? 'Сравнение' : isUk ? 'Порівняння' : 'Compare')
          : (isRu ? 'Граф знаний' : isUk ? 'Граф знань' : 'Knowledge graph');

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
        <span className="text-base">🧭</span>
        <span>{isRu ? 'Изучить визуально' : isUk ? 'Дослідити візуально' : 'Explore visually'}</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-600">{variantLabel}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {v.bubble_map_id && (
          <Link
            href={`/${locale}/bubbles?map=${encodeURIComponent(v.bubble_map_id)}`}
            className="group relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-indigo-950/50 p-5 transition-all hover:border-purple-400/45 hover:shadow-lg hover:shadow-purple-900/20"
          >
            <div className="text-2xl mb-2">🫧</div>
            <div className="font-semibold text-white group-hover:text-purple-100">
              {v.bubble_cta_label || (isRu ? 'Интерактивная пузырьковая карта' : 'Interactive bubble map')}
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {isRu ? 'Силовой граф: масштаб, перетаскивание, изучение узлов. Те же карты, что и в Tvijo Bubbles — добавляйте данные после входа.' : 'Force-graph: zoom, drag, explore nodes. Same maps as Tvijo Bubbles — contribute when you\'re logged in.'}
            </p>
            <span className="mt-3 inline-flex text-xs font-medium text-purple-300">
              {isRu ? 'Открыть Tvijo Bubbles →' : 'Open Tvijo Bubbles →'}
            </span>
          </Link>
        )}

        {v.bundle_id && (
          <Link
            href={`/${locale}/bundles?bundle=${encodeURIComponent(v.bundle_id)}`}
            className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-orange-950/50 p-5 transition-all hover:border-amber-400/45 hover:shadow-lg hover:shadow-amber-900/20"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold text-white group-hover:text-amber-100">
              {v.bundle_cta_label || (isRu ? 'Бандл решений' : isUk ? 'Пакет рішень' : 'Decision Bundle')}
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {isRu ? 'Интерактивная карта решений — узлы, голосования и AI-воркфлоу. Сотрудничайте и развивайте идеи.' : isUk ? 'Інтерактивна карта рішень — вузли, голосування та AI-воркфлоу. Співпрацюйте й розвивайте ідеї.' : 'Interactive decision map — nodes, votes, and AI-powered workflow. Collaborate and evolve ideas.'}
            </p>
            <span className="mt-3 inline-flex text-xs font-medium text-amber-300">
              {isRu ? 'Открыть бандл →' : 'Open Bundle →'}
            </span>
          </Link>
        )}
      </div>

      {v.infographics && v.infographics.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d14] p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">{isRu ? 'Инфографика' : 'Infographics'}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {v.infographics.map((src, i) => (
              <figure key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-white/5 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
