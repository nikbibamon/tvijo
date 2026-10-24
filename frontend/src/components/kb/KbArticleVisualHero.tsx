'use client';

/**
 * KB Article Visual Hero — GEN-KB-HERO-VIZ-001
 *
 * Compact, premium entity-wheel shown at the very TOP of every KB article.
 * Replaces the "static SVG per article" anti-pattern.
 * Driven entirely by visualization_data.entities — works for ANY article.
 *
 * ─── SPEC FOR JUNIOR MODELS ───────────────────────────────────────────────
 * DATA CONTRACT:
 *   Props in  → entities[] from article.visualization_data.entities
 *   Output    → numbered color-coded grid (≤8 items) + key takeaways strip
 *
 * RULES (DO NOT BREAK):
 *   ✗ Never hardcode content for a specific article slug
 *   ✗ Never fetch data inside this component — receive via props
 *   ✗ Never add external dependencies (pure Tailwind + React only)
 *   ✓ Return null if entities.length === 0 (already guarded)
 *   ✓ Palette cycles: PALETTE[idx % PALETTE.length]
 *   ✓ Icons: keyword-match on entity.name, then fallback to entity.type
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from 'react';

interface Entity {
  id: string;
  name: string;
  type: 'concept' | 'metric' | 'tool' | 'strategy' | 'person';
  importance: number;
  connections: number;
}

export interface KbArticleVisualHeroProps {
  title: string;
  summary?: string;
  entities: Entity[];
  structureType?: string;
  locale?: string;
}

// 8-color cycling palette — mirrors the reference infographic wheel segments
const PALETTE = [
  { bg: 'bg-orange-500/15', border: 'border-orange-500/30', badge: 'bg-orange-500', label: 'text-orange-200', bar: '#f97316' },
  { bg: 'bg-blue-500/15',    border: 'border-blue-500/30',   badge: 'bg-blue-500',   label: 'text-blue-200',   bar: '#3b82f6' },
  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30',badge: 'bg-emerald-500',label: 'text-emerald-200',bar: '#10b981' },
  { bg: 'bg-violet-500/15',  border: 'border-violet-500/30', badge: 'bg-violet-500', label: 'text-violet-200', bar: '#8b5cf6' },
  { bg: 'bg-rose-500/15',    border: 'border-rose-500/30',   badge: 'bg-rose-500',   label: 'text-rose-200',   bar: '#f43f5e' },
  { bg: 'bg-cyan-500/15',    border: 'border-cyan-500/30',   badge: 'bg-cyan-500',   label: 'text-cyan-200',   bar: '#06b6d4' },
  { bg: 'bg-amber-500/15',   border: 'border-amber-500/30',  badge: 'bg-amber-500',  label: 'text-amber-200',  bar: '#f59e0b' },
  { bg: 'bg-teal-500/15',    border: 'border-teal-500/30',   badge: 'bg-teal-500',   label: 'text-teal-200',   bar: '#14b8a6' },
] as const;

// Pictogram assignment: keyword match first, then type fallback
function getEntityIcon(entity: Entity): string {
  const n = entity.name.toLowerCase();
  if (n.includes('ritual') || n.includes('culture')) return '🔄';
  if (n.includes('feedback') || n.includes('peer')) return '💬';
  if (n.includes('goal') || n.includes('okr') || n.includes('objective')) return '🎯';
  if (n.includes('learn') || n.includes('train') || n.includes('educat')) return '📚';
  if (n.includes('meeting') || n.includes('1:1') || n.includes('sync')) return '🤝';
  if (n.includes('pulse') || n.includes('check-in') || n.includes('health')) return '💓';
  if (n.includes('prais') || n.includes('recognit') || n.includes('reward')) return '⭐';
  if (n.includes('week') || n.includes('schedule') || n.includes('calendar')) return '📅';
  if (n.includes('metric') || n.includes('kpi') || n.includes('measure')) return '📊';
  if (n.includes('trust') || n.includes('transparenc')) return '🔓';
  if (n.includes('team') || n.includes('align') || n.includes('cohes')) return '🏆';
  if (n.includes('risk') || n.includes('threat')) return '⚠️';
  if (n.includes('data') || n.includes('analyt')) return '📈';
  if (n.includes('process') || n.includes('system') || n.includes('workflow')) return '⚙️';
  if (n.includes('innovat') || n.includes('idea') || n.includes('creat')) return '💡';
  if (n.includes('customer') || n.includes('client') || n.includes('user')) return '👥';
  if (n.includes('revenue') || n.includes('profit') || n.includes('growth')) return '💰';
  if (n.includes('leader') || n.includes('ceo') || n.includes('execut')) return '👔';
  if (n.includes('product') || n.includes('launch') || n.includes('feature')) return '🚀';
  if (n.includes('market') || n.includes('trading') || n.includes('trade')) return '📉';
  if (n.includes('securit') || n.includes('compliance')) return '🛡️';
  if (n.includes('network') || n.includes('connect') || n.includes('integrat')) return '🔗';
  if (n.includes('decision') || n.includes('choice') || n.includes('model') || n.includes('mental')) return '🧠';
  if (n.includes('communication') || n.includes('messag')) return '📣';
  if (n.includes('plan') || n.includes('roadmap') || n.includes('strateg')) return '🗺️';
  if (n.includes('budget') || n.includes('financ') || n.includes('cost')) return '💵';
  if (n.includes('focus') || n.includes('priorit') || n.includes('attention')) return '🔭';
  // Type-based fallback
  if (entity.type === 'metric')   return '📊';
  if (entity.type === 'tool')     return '🔧';
  if (entity.type === 'strategy') return '🎯';
  if (entity.type === 'person')   return '👤';
  return '💡';
}

// Smart verb for takeaway strip — context-aware, not generic
function getTakeawayVerb(entity: Entity, isRu: boolean): string {
  if (entity.type === 'metric')   return isRu ? 'Измеряйте' : 'Measure';
  if (entity.type === 'tool')     return isRu ? 'Используйте' : 'Use';
  if (entity.type === 'strategy') return isRu ? 'Внедрите' : 'Implement';
  if (entity.type === 'person')   return isRu ? 'Изучите' : 'Study';
  const n = entity.name.toLowerCase();
  if (n.includes('ritual') || n.includes('habit') || n.includes('practic')) return isRu ? 'Применяйте' : 'Adopt';
  if (n.includes('feedback') || n.includes('review') || n.includes('meeting')) return isRu ? 'Запланируйте' : 'Schedule';
  if (n.includes('goal') || n.includes('okr')) return isRu ? 'Установите' : 'Set';
  if (n.includes('leader') || n.includes('team') || n.includes('culture')) return isRu ? 'Стройте' : 'Build';
  if (n.includes('decision') || n.includes('mental')) return isRu ? 'Применяйте' : 'Apply';
  return isRu ? 'Применяйте' : 'Apply';
}

export function KbArticleVisualHero({
  summary,
  entities,
  structureType,
  locale = 'en',
}: KbArticleVisualHeroProps) {
  const isRu = locale === 'ru';
  const top = useMemo(
    () => [...entities].sort((a, b) => b.importance - a.importance).slice(0, 8),
    [entities],
  );

  const takeaways = useMemo(() => top.slice(0, 4), [top]);

  if (top.length === 0) return null;

  const gridCols =
    top.length <= 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : top.length <= 6
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
        : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="mb-8 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d1020] via-[#0c0f16] to-[#0a0d14] overflow-hidden">

      {/* ── Header strip ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400/80">
            {(structureType ?? (isRu ? 'Ключевые понятия' : 'Key Concepts')) + ' · ' + top.length + (isRu ? ' сущностей' : ' entities')}
          </p>
          {summary && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{summary}</p>
          )}
        </div>
      </div>

      {/* ── Numbered entity wheel (grid layout) ── */}
      <div className="p-4 sm:p-5">
        <div className={`grid gap-2.5 ${gridCols}`}>
          {top.map((entity, idx) => {
            const c = PALETTE[idx % PALETTE.length];
            const icon = getEntityIcon(entity);
            const pct = Math.round(entity.importance * 100);
            return (
              <div
                key={entity.id}
                className={`flex flex-col gap-1.5 rounded-xl p-3 border ${c.bg} ${c.border}
                            transition-all hover:scale-[1.025] hover:brightness-110 cursor-default select-none`}
              >
                {/* Number badge + icon */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 flex-shrink-0 rounded-full ${c.badge}
                                flex items-center justify-center text-[10px] font-bold text-white leading-none`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-base leading-none" role="img" aria-label={entity.name}>
                    {icon}
                  </span>
                </div>

                {/* Entity name */}
                <p className={`text-[11px] sm:text-xs font-semibold leading-tight ${c.label} line-clamp-2`}>
                  {entity.name}
                </p>

                {/* Importance bar */}
                <div className="flex items-center gap-1 mt-auto pt-0.5">
                  <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: c.bar, opacity: 0.65 }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-600 tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Key Takeaways strip ("How to put it into practice") ── */}
      {takeaways.length > 0 && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="border-t border-white/[0.05] pt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2.5">
              → {isRu ? 'Ключевые выводы' : 'Key Takeaways'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {takeaways.map((entity, i) => {
                const c = PALETTE[i % PALETTE.length];
                const verb = getTakeawayVerb(entity, isRu);
                return (
                  <div
                    key={entity.id}
                    className={`flex items-start gap-1.5 rounded-lg px-2.5 py-2 ${c.bg} border ${c.border}`}
                  >
                    <span
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 rounded-full ${c.badge}
                                  flex items-center justify-center text-[8px] font-bold text-white leading-none`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[10px] text-gray-300 leading-tight">
                      <span className="text-gray-500">{verb} </span>
                      <span className="font-medium">{entity.name}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
