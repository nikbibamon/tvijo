'use client';

/**
 * KB Radial Mind Map — GEN-KB-RADIAL-MAP-001
 *
 * Premium interactive SVG radial visualization.
 * Replaces flat Mermaid mindmap with:
 *   ✓ Type-coded color palette (concept/metric/tool/strategy/person)
 *   ✓ Importance-scaled node radius
 *   ✓ Curved bezier connection lines
 *   ✓ Hover glow + tooltip
 *   ✓ Emoji icons (same mapping as KbArticleVisualHero)
 *   ✓ Zero external deps — pure React + SVG
 */

import { useMemo, useState } from 'react';

interface Entity {
  id: string;
  name: string;
  type: 'concept' | 'metric' | 'tool' | 'strategy' | 'person';
  importance: number;
  connections: number;
}

export interface KbRadialMindmapProps {
  entities: Entity[];
  height?: number;
  locale?: string;
  articleSlug?: string;
}

// === Type palette ===
const TYPE_PALETTE = {
  concept:  { stroke: '#60a5fa', fill: '#0f2044', label: 'Concept'  },
  metric:   { stroke: '#fb923c', fill: '#2c0f00', label: 'Metric'   },
  tool:     { stroke: '#22d3ee', fill: '#00222b', label: 'Tool'     },
  strategy: { stroke: '#a78bfa', fill: '#1e0b3d', label: 'Strategy' },
  person:   { stroke: '#f472b6', fill: '#2d0015', label: 'Person'   },
} as const;
type EType = keyof typeof TYPE_PALETTE;
const DEFAULT_COLOR = { stroke: '#34d399', fill: '#001f14', label: 'Other' };

function getColor(type: string) {
  return (TYPE_PALETTE as Record<string, typeof DEFAULT_COLOR>)[type] ?? DEFAULT_COLOR;
}

// === Emoji icons ===
function getIcon(entity: Entity): string {
  const n = entity.name.toLowerCase();
  if (n.includes('ritual') || n.includes('culture'))               return '🔄';
  if (n.includes('feedback') || n.includes('peer'))                return '💬';
  if (n.includes('goal') || n.includes('okr') || n.includes('objective')) return '🎯';
  if (n.includes('learn') || n.includes('train') || n.includes('educat')) return '📚';
  if (n.includes('meeting') || n.includes('1:1') || n.includes('sync')) return '🤝';
  if (n.includes('pulse') || n.includes('check-in') || n.includes('health')) return '💓';
  if (n.includes('prais') || n.includes('recognit') || n.includes('reward')) return '⭐';
  if (n.includes('week') || n.includes('schedule') || n.includes('calendar')) return '📅';
  if (n.includes('metric') || n.includes('kpi') || n.includes('measure')) return '📊';
  if (n.includes('trust') || n.includes('transparenc'))            return '🔓';
  if (n.includes('team') || n.includes('align'))                   return '🏆';
  if (n.includes('data') || n.includes('analyt'))                  return '📈';
  if (n.includes('process') || n.includes('system') || n.includes('workflow')) return '⚙️';
  if (n.includes('innovat') || n.includes('idea') || n.includes('creat')) return '💡';
  if (n.includes('customer') || n.includes('client') || n.includes('user')) return '👥';
  if (n.includes('revenue') || n.includes('profit') || n.includes('growth')) return '💰';
  if (n.includes('leader') || n.includes('ceo') || n.includes('execut')) return '👔';
  if (n.includes('product') || n.includes('launch') || n.includes('feature')) return '🚀';
  if (n.includes('securit') || n.includes('compliance'))           return '🛡️';
  if (n.includes('decision') || n.includes('mental'))              return '🧠';
  if (n.includes('communication') || n.includes('messag'))         return '📣';
  if (n.includes('plan') || n.includes('roadmap') || n.includes('strateg')) return '🗺️';
  if (n.includes('focus') || n.includes('priorit'))                return '🔭';
  if (entity.type === 'metric')   return '📊';
  if (entity.type === 'tool')     return '🔧';
  if (entity.type === 'strategy') return '🎯';
  if (entity.type === 'person')   return '👤';
  return '💡';
}

// === Wrap text to max 2 lines ===
function wrap(text: string, maxW = 11): string[] {
  if (text.length <= maxW) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxW) {
      if (cur) { lines.push(cur); cur = w; }
      else { lines.push(w.slice(0, maxW)); cur = ''; }
    } else {
      cur = next;
    }
    if (lines.length >= 2) break;
  }
  if (cur && lines.length < 2) lines.push(cur);
  return lines.slice(0, 2);
}

// ============================================================
export function KbRadialMindmap({
  entities,
  height = 440,
  locale,
  articleSlug,
}: KbRadialMindmapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { root, children } = useMemo(() => {
    const sorted = [...entities].sort((a, b) => b.importance - a.importance);
    return { root: sorted[0] ?? null, children: sorted.slice(1, 9) };
  }, [entities]);

  if (!root) return null;

  // Canvas
  const W = 720;
  const H = 390;
  const cx = W / 2;
  const cy = H / 2;
  const OUTER_R = 158;
  const ROOT_R = 46;

  const rootColor = getColor(root.type);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/[0.06]"
      style={{ height, background: '#050810' }}
    >
      {/* Ambient center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 280, height: 280,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rootColor.stroke}1a 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          🧠 Radial Mind Map
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          {/* Root gradient */}
          <radialGradient id="rmRootGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={rootColor.stroke} stopOpacity="0.4" />
            <stop offset="100%" stopColor={rootColor.fill} stopOpacity="1" />
          </radialGradient>

          {/* Per-type node gradients */}
          {(Object.keys(TYPE_PALETTE) as EType[]).map((t) => (
            <radialGradient key={t} id={`rmGrad-${t}`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor={TYPE_PALETTE[t].stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={TYPE_PALETTE[t].fill} stopOpacity="1" />
            </radialGradient>
          ))}
          <radialGradient id="rmGrad-other" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={DEFAULT_COLOR.stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={DEFAULT_COLOR.fill} stopOpacity="1" />
          </radialGradient>

          {/* Glow filters */}
          <filter id="rmGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rmGlowRoot" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Decorative orbit rings */}
        <circle cx={cx} cy={cy} r={OUTER_R + 20} stroke="white" strokeOpacity="0.02" strokeWidth="1" fill="none" strokeDasharray="3 8" />
        <circle cx={cx} cy={cy} r={OUTER_R - 18} stroke="white" strokeOpacity="0.015" strokeWidth="1" fill="none" strokeDasharray="2 10" />

        {/* ── Connection lines ─────────────────────────────── */}
        {children.map((e, i) => {
          const angle = (i / children.length) * 2 * Math.PI - Math.PI / 2;
          const ex = cx + OUTER_R * Math.cos(angle);
          const ey = cy + OUTER_R * Math.sin(angle);
          const c1x = cx + OUTER_R * 0.35 * Math.cos(angle);
          const c1y = cy + OUTER_R * 0.35 * Math.sin(angle);
          const c2x = cx + OUTER_R * 0.70 * Math.cos(angle);
          const c2y = cy + OUTER_R * 0.70 * Math.sin(angle);
          const col = getColor(e.type);
          const isHov = hovered === e.id;
          return (
            <path
              key={`line-${e.id}`}
              d={`M ${cx} ${cy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`}
              stroke={col.stroke}
              strokeWidth={isHov ? 2.5 : 1.5}
              strokeOpacity={isHov ? 0.9 : 0.28}
              fill="none"
              strokeDasharray={isHov ? undefined : '4 4'}
              style={{ transition: 'stroke-opacity 0.18s, stroke-width 0.18s' }}
            />
          );
        })}

        {/* ── Child nodes ──────────────────────────────────── */}
        {children.map((e, i) => {
          const angle = (i / children.length) * 2 * Math.PI - Math.PI / 2;
          const ex = cx + OUTER_R * Math.cos(angle);
          const ey = cy + OUTER_R * Math.sin(angle);
          const col = getColor(e.type);
          const r = Math.round(24 + e.importance * 13);
          const isHov = hovered === e.id;
          const icon = getIcon(e);
          const lines = wrap(e.name, 10);
          const gradId = (TYPE_PALETTE as Record<string, unknown>)[e.type]
            ? `rmGrad-${e.type}`
            : 'rmGrad-other';

          // Tooltip offset (relative to node center)
          const tox = ex < W / 3 ? r + 6 : ex > (2 * W) / 3 ? -(r + 108) : -50;
          const toy = ey < 90 ? r + 6 : -(r + 44);

          return (
            <g
              key={e.id}
              transform={`translate(${ex}, ${ey})`}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
              filter={isHov ? 'url(#rmGlow)' : undefined}
            >
              {/* Hover halo */}
              <circle r={r + 10} fill={col.stroke} opacity={isHov ? 0.1 : 0} style={{ transition: 'opacity 0.18s' }} />

              {/* Node body */}
              <circle
                r={r}
                fill={`url(#${gradId})`}
                stroke={col.stroke}
                strokeWidth={isHov ? 2.2 : 1.5}
                strokeOpacity={isHov ? 1 : 0.55}
                style={{ transition: 'stroke-width 0.18s, stroke-opacity 0.18s' }}
              />

              {/* Emoji icon */}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={lines.length > 1 ? 12 : 14}
                y={lines.length > 1 ? -(r * 0.3) : -(r * 0.1)}
                style={{ userSelect: 'none' }}
              >
                {icon}
              </text>

              {/* Name label */}
              {lines.map((ln, li) => (
                <text
                  key={li}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={8.5}
                  fontWeight="600"
                  fill={col.stroke}
                  fillOpacity={isHov ? 1 : 0.82}
                  y={(r * 0.3) + li * 10}
                  style={{ transition: 'fill-opacity 0.18s' }}
                >
                  {ln}
                </text>
              ))}

              {/* Tooltip */}
              {isHov && (
                <g transform={`translate(${tox}, ${toy})`}>
                  <rect x={0} y={0} width={100} height={38} rx={7}
                    fill="#080c1e" stroke={col.stroke} strokeOpacity={0.6} strokeWidth={1} />
                  <text x={50} y={14} textAnchor="middle" fontSize={9} fontWeight="700" fill={col.stroke}>
                    {col.label} · {Math.round(e.importance * 100)}%
                  </text>
                  <text x={50} y={27} textAnchor="middle" fontSize={8.5} fill="#64748b">
                    {e.connections ?? 0} connections
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Root node ────────────────────────────────────── */}
        <g transform={`translate(${cx}, ${cy})`} filter="url(#rmGlowRoot)">
          <circle r={ROOT_R + 20} fill={rootColor.stroke} opacity={0.05} />
          <circle r={ROOT_R + 10} fill={rootColor.stroke} opacity={0.09} />
          <circle
            r={ROOT_R}
            fill="url(#rmRootGrad)"
            stroke={rootColor.stroke}
            strokeWidth={2.2}
            strokeOpacity={0.85}
          />
          {/* Root icon */}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={22}
            y={-10}
            style={{ userSelect: 'none' }}
          >
            {getIcon(root)}
          </text>
          {/* Root name */}
          {wrap(root.name, 12).map((ln, li) => (
            <text
              key={li}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9.5}
              fontWeight="700"
              fill={rootColor.stroke}
              fillOpacity={0.95}
              y={10 + li * 11}
            >
              {ln}
            </text>
          ))}
        </g>
      </svg>

      {/* Type legend */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center flex-wrap gap-x-3 gap-y-0.5 px-4 py-1.5 bg-gradient-to-t from-black/60 to-transparent border-t border-white/[0.03]">
        {(Object.entries(TYPE_PALETTE) as [EType, typeof TYPE_PALETTE[EType]][]).map(([t, c]) => (
          <div key={t} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.stroke }} />
            <span className="text-[9px] text-gray-600">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
