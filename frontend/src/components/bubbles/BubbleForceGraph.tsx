'use client';

/**
 * Force-graph: градиентные баблы, hover-подсветка связей, читаемый текст (обводка).
 */

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { mergeParentIdLinks, sanitizeLinksForGraph } from './bubbleGraphLinks';

const NODE_TYPES: Record<string, { color: string; icon: string }> = {
  IDEA: { color: '#3b82f6', icon: '💡' },
  TASK: { color: '#22c55e', icon: '✅' },
  PROBLEM: { color: '#ef4444', icon: '🔥' },
  SOLUTION: { color: '#8b5cf6', icon: '🧩' },
  QUESTION: { color: '#f59e0b', icon: '❓' },
  NOTE: { color: '#06b6d4', icon: '📝' },
};

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  active: '#22c55e',
  done: '#6b7280',
  archived: '#374151',
};

/** Лёгкий оттенок обводки по уровню вложенности */
const LEVEL_RING: Record<number, string> = {
  1: 'rgba(168, 85, 247, 0.75)',
  2: 'rgba(45, 212, 191, 0.7)',
  3: 'rgba(139, 92, 246, 0.65)',
};

function linkEndpoints(link: any): { s: string; t: string } {
  const s = typeof link.source === 'object' && link.source?.id != null ? link.source.id : link.source;
  const t = typeof link.target === 'object' && link.target?.id != null ? link.target.id : link.target;
  return { s: String(s), t: String(t) };
}

function strokeThenFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillStyle: string,
  strokeWidth = 2.5
) {
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = 'rgba(2, 6, 23, 0.92)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
}

export interface BubbleNodeFG {
  id: string;
  label: string;
  type: string;
  status: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  color?: string;
  role?: string;
  priority?: number;
  level?: number;
  parent_id?: string | null;
  detail?: string;
  kb_url?: string;
}

export interface BubbleLinkFG {
  source: string;
  target: string;
}

type FGNode = BubbleNodeFG & { x?: number; y?: number };

export default function BubbleForceGraph({
  nodes,
  links,
  selectedNode,
  onNodeClick,
  onNodeDragEnd,
  onNodePositions,
  readonlySnapshot = false,
  showGrid = true,
}: {
  nodes: BubbleNodeFG[];
  links: BubbleLinkFG[];
  selectedNode: string | null;
  onNodeClick: (id: string) => void;
  onNodeDragEnd?: (id: string, x: number, y: number) => void;
  onNodePositions?: (positions: Record<string, { x: number; y: number }>) => void;
  readonlySnapshot?: boolean;
  showGrid?: boolean;
}) {
  const fgRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 900, h: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* Узлы — те же ссылки (d3 пишет x/y). Связи — всегда новые {source,target} по id,
     иначе d3 подменяет строки на объекты и React/автосохранение портят links_json. */
  const graphData = useMemo(() => {
    const base = sanitizeLinksForGraph(nodes, links);
    const merged = mergeParentIdLinks(nodes, base);
    return {
      nodes,
      links: merged.map(l => ({ source: l.source, target: l.target })),
    };
  }, [nodes, links]);

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      setDim({ w: el.clientWidth || 900, h: el.clientHeight || 600 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const ch = fg.d3Force('charge');
    if (ch) ch.strength(-150);
    const lk = fg.d3Force('link');
    if (lk) {
      lk.distance(92);
      lk.strength(0.55);
    }
    const collide = fg.d3Force('collide');
    if (collide) {
      collide.radius((n: FGNode) => Math.max(20, (n.radius ?? 32) + 8));
    }
    const ctr = fg.d3Force('center');
    if (ctr) ctr.strength(0.035);
  }, [dim, graphData]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      fgRef.current?.zoomToFit?.(400, 80);
    }, 400);
    return () => window.clearTimeout(t);
  }, [graphData, dim.w, dim.h]);

  const nodeCanvasObject = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D) => {
      if (typeof node.x !== 'number' || typeof node.y !== 'number' || Number.isNaN(node.x) || Number.isNaN(node.y)) {
        return;
      }

      const pr = node.priority ?? 5;
      const typeColor = NODE_TYPES[node.type]?.color || node.color || '#3b82f6';
      const statusColor = STATUS_COLORS[node.status] || '#94a3b8';
      const baseR = Math.max(22, node.radius ?? 50 - (Math.min(pr, 5) - 1) * 6);
      const isSelected = node.id === selectedNode;
      const isHovered = node.id === hoveredId;
      const lv = node.level ?? 2;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseR + 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseR + 22, 0, Math.PI * 2);
        ctx.strokeStyle = `${statusColor}35`;
        ctx.lineWidth = 10;
        ctx.stroke();
      } else if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseR + 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseR + 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      const ringW = Math.max(1, Math.min(5, 8 - pr));
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseR + 6 + ringW * 0.4, 0, Math.PI * 2);
      if (pr <= 2) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
      } else {
        ctx.strokeStyle = LEVEL_RING[lv] ?? 'rgba(100, 116, 139, 0.45)';
      }
      ctx.lineWidth = ringW;
      ctx.stroke();

      const glow = ctx.createRadialGradient(node.x, node.y, baseR, node.x, node.y, baseR + 12);
      glow.addColorStop(0, `${statusColor}${isHovered ? '70' : '55'}`);
      glow.addColorStop(1, `${statusColor}00`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseR + 12, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      const bubbleGradient = ctx.createRadialGradient(
        node.x - baseR * 0.35,
        node.y - baseR * 0.35,
        0,
        node.x,
        node.y,
        baseR
      );
      bubbleGradient.addColorStop(0, isHovered ? '#ffffff55' : '#ffffff45');
      bubbleGradient.addColorStop(0.35, `${typeColor}dd`);
      bubbleGradient.addColorStop(1, typeColor);

      ctx.beginPath();
      ctx.arc(node.x, node.y, baseR, 0, Math.PI * 2);
      ctx.fillStyle = bubbleGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x - baseR * 0.35, node.y - baseR * 0.35, baseR * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();

      const icon = NODE_TYPES[node.type]?.icon || '💡';
      ctx.font = `${Math.max(14, baseR * 0.34)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, node.x, node.y - baseR * 0.35);

      const label = typeof node.label === 'string' ? node.label : '';
      const fontSize = Math.max(11, baseR * 0.22);
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const words = label.split(/\s+/);
      const lines: string[] = [];
      let line = '';
      const maxW = baseR * 2.45;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = test;
      }
      if (line) lines.push(line);
      const display = lines.slice(0, 3);
      const lh = fontSize * 1.28;
      const startY = node.y - ((display.length - 1) * lh) / 2 + 2;
      display.forEach((ln, i) => {
        const y = startY + i * lh;
        strokeThenFillText(ctx, ln, node.x, y, isHovered ? '#f8fafc' : '#f1f5f9', isHovered ? 3 : 2.5);
      });

      if (node.role) {
        const rs = Math.max(9, fontSize * 0.78);
        ctx.font = `500 ${rs}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        const roleText = node.role.length > 22 ? `${node.role.slice(0, 21)}…` : node.role;
        strokeThenFillText(ctx, roleText, node.x, node.y + baseR * 0.72, 'rgba(226, 232, 240, 0.95)', 2);
      }

      if (node.level != null) {
        ctx.font = `700 ${Math.max(9, fontSize * 0.68)}px ui-sans-serif, sans-serif`;
        ctx.textAlign = 'center';
        const tag = `L${node.level}`;
        const tx = node.x + baseR - 2;
        const ty = node.y - baseR + 10;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.lineWidth = 3;
        ctx.strokeText(tag, tx, ty);
        ctx.fillStyle = LEVEL_RING[node.level] ?? '#e2e8f0';
        ctx.fillText(tag, tx, ty);
      }

      ctx.beginPath();
      ctx.arc(node.x + baseR - 6, node.y + baseR - 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    [selectedNode, hoveredId]
  );

  const linkColor = useCallback(
    (link: any) => {
      const { s, t } = linkEndpoints(link);
      if (hoveredId && (s === hoveredId || t === hoveredId)) return 'rgba(34, 211, 238, 0.75)';
      if (selectedNode && (s === selectedNode || t === selectedNode)) return 'rgba(251, 191, 36, 0.65)';
      return 'rgba(148, 163, 184, 0.22)';
    },
    [hoveredId, selectedNode]
  );

  const linkWidth = useCallback(
    (link: any) => {
      const { s, t } = linkEndpoints(link);
      if (hoveredId && (s === hoveredId || t === hoveredId)) return 2.4;
      if (selectedNode && (s === selectedNode || t === selectedNode)) return 2;
      return 1;
    },
    [hoveredId, selectedNode]
  );

  const bgPattern = showGrid
    ? 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)'
    : 'none';

  return (
    <div
      ref={wrapRef}
      className="w-full h-full min-h-[50vh] cursor-grab active:cursor-grabbing"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: bgPattern,
        backgroundSize: '22px 22px',
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dim.w}
        height={dim.h}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: FGNode, color, ctx) => {
          const baseR = Math.max(22, node.radius ?? 40);
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, baseR + 10, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeClick={(n: FGNode) => onNodeClick(n.id)}
        onNodeHover={(n: FGNode | null) => setHoveredId(n?.id ?? null)}
        onNodeDragEnd={(n: FGNode) => {
          if (readonlySnapshot) return;
          onNodeDragEnd?.(n.id, n.x ?? 0, n.y ?? 0);
        }}
        onEngineTick={() => {
          if (!onNodePositions) return;
          const map: Record<string, { x: number; y: number }> = {};
          for (const n of nodes) {
            if (typeof n.x === 'number' && typeof n.y === 'number' && !Number.isNaN(n.x) && !Number.isNaN(n.y)) {
              map[n.id] = { x: n.x, y: n.y };
            }
          }
          onNodePositions(map);
        }}
        enableNodeDrag={!readonlySnapshot}
        enableZoomInteraction
        enablePanInteraction
        warmupTicks={Math.min(120, 40 + nodes.length * 2)}
        cooldownTicks={Infinity}
        d3AlphaDecay={0.022}
        d3VelocityDecay={0.55}
      />
    </div>
  );
}
