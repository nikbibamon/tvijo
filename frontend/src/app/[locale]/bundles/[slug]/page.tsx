'use client';

/**
 * Bundle Detail — interactive force-graph (same engine as Tvijo Bubbles).
 * Route: /{locale}/bundles/{slug}
 *
 * SEO-indexable page: each bundle gets its own slug URL.
 * Read-only graph; no node editing for public viewers.
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchBundleBySlug,
  updateBundleNodes,
  type DecMapBundle,
} from '@/services/decmap-api';
import { fetchCurrentUser, type CurrentUser } from '@/services/current-user';
import BubblesMapInfoPanel, { type InfoBubbleNode } from '@/components/bubbles/BubblesMapInfoPanel';
import BundleNodeSocial from '@/components/bubbles/BundleNodeSocial';
import { sanitizeLinksForApi } from '@/components/bubbles/bubbleGraphLinks';

const BubbleForceGraph = dynamic(
  () => import('@/components/bubbles/BubbleForceGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">
        Loading graph…
      </div>
    ),
  },
);

interface BubbleNode {
  id: string;
  label: string;
  type: 'IDEA' | 'TASK' | 'PROBLEM' | 'SOLUTION' | 'QUESTION' | 'NOTE';
  status: 'new' | 'active' | 'done' | 'archived';
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius: number;
  color: string;
  level?: number;
  parent_id?: string | null;
  role?: string;
  priority?: number;
  detail?: string;
  kb_url?: string;
}

interface BubbleLink {
  source: string;
  target: string;
}

function localizePortalPath(path: string, locale: string): string {
  if (!path.startsWith('/')) return `/${locale}/${path}`;
  const m = path.match(/^\/[a-z]{2}(\/.*)?$/);
  if (m) return `/${locale}${m[2] ?? ''}`;
  return `/${locale}${path}`;
}

function formatDetailLines(text: string | undefined) {
  if (!text?.trim()) return null;
  return text.split('\n').map((line, i) => {
    const bold = line.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      return (
        <p key={i} className="font-semibold text-white mt-2 first:mt-0">
          {bold[1]}
        </p>
      );
    }
    return (
      <p key={i} className="text-gray-300 text-sm leading-relaxed mt-1.5 first:mt-0">
        {line}
      </p>
    );
  });
}

function pickNeighborByDirection(
  nodes: BubbleNode[],
  links: BubbleLink[],
  currentId: string,
  dir: [number, number],
): string | null {
  const neighbors = links
    .filter(l => l.source === currentId || l.target === currentId)
    .map(l => (l.source === currentId ? l.target : l.source))
    .filter(id => id !== currentId);
  const cur = nodes.find(n => n.id === currentId);
  if (!cur || neighbors.length === 0) return null;

  let best: string | null = null;
  let bestDot = -2;
  for (const nid of neighbors) {
    const n = nodes.find(x => x.id === nid);
    if (!n) continue;
    const vx = (n.x ?? 0) - (cur.x ?? 0);
    const vy = (n.y ?? 0) - (cur.y ?? 0);
    const len = Math.hypot(vx, vy) || 1;
    const dot = (vx / len) * dir[0] + (vy / len) * dir[1];
    if (dot > bestDot) {
      bestDot = dot;
      best = nid;
    }
  }
  return best;
}

function pickFirstNodeByPriority(nodes: BubbleNode[]): string | null {
  if (!nodes.length) return null;
  const sorted = [...nodes].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  return sorted[0]?.id ?? null;
}

export default function BundleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = (params.locale as string) || 'en';

  const [bundle, setBundle] = useState<DecMapBundle | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [nodes, setNodes] = useState<BubbleNode[]>([]);
  const [links, setLinks] = useState<BubbleLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const nodePosRef = useRef<Record<string, { x: number; y: number }>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = useMemo(() => {
    if (!bundle || !me) return false;
    if (me.is_staff || me.is_superuser) return true;
    if (bundle.owner && bundle.owner === me.id) return true;
    return false;
  }, [bundle, me]);

  const onGraphPositions = useCallback(
    (m: Record<string, { x: number; y: number }>) => {
      nodePosRef.current = m;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchBundleBySlug(slug), fetchCurrentUser()])
      .then(([data, user]) => {
        if (cancelled) return;
        if (!data) {
          setError('Bundle not found');
          return;
        }
        setBundle(data);
        setMe(user);
        document.title = `${data.name} — Decision Bundle — Tvijo`;
        setNodes((data.nodes_json as BubbleNode[]) || []);
        setLinks(sanitizeLinksForApi((data.links_json as BubbleLink[]) || []));
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load bundle');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const scheduleAutosave = useCallback(
    (nextNodes: BubbleNode[], nextLinks: BubbleLink[]) => {
      if (!bundle || !canEdit) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveState('saving');
      saveTimerRef.current = setTimeout(async () => {
        const res = await updateBundleNodes(
          bundle.id,
          nextNodes,
          sanitizeLinksForApi(nextLinks),
        );
        setSaveState(res ? 'saved' : 'error');
        if (res) {
          setTimeout(() => setSaveState('idle'), 1500);
        }
      }, 800);
    },
    [bundle, canEdit],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleAddLink = useCallback(() => {
    if (!canEdit || !selectedNode) return;
    const source = selectedNode;
    const candidates = nodes
      .filter(n => n.id !== source)
      .map(n => `${n.label} [${n.id}]`)
      .slice(0, 20)
      .join('\n');
    const input = window.prompt(
      `Link from "${nodes.find(n => n.id === source)?.label ?? source}" to node id:\n\n${candidates}`,
    );
    const target = (input || '').trim();
    if (!target || target === source) return;
    if (!nodes.some(n => n.id === target)) {
      window.alert(`Node id "${target}" not found in this bundle.`);
      return;
    }
    setLinks(prev => {
      const exists = prev.some(
        l =>
          (l.source === source && l.target === target) ||
          (l.source === target && l.target === source),
      );
      if (exists) return prev;
      const next = [...prev, { source, target }];
      scheduleAutosave(nodes, next);
      return next;
    });
  }, [canEdit, selectedNode, nodes, scheduleAutosave]);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!canEdit) return;
      setNodes(prevNodes => {
        const nextNodes = prevNodes.filter(n => n.id !== nodeId);
        setLinks(prevLinks => {
          const nextLinks = prevLinks.filter(
            l => l.source !== nodeId && l.target !== nodeId,
          );
          scheduleAutosave(nextNodes, nextLinks);
          return nextLinks;
        });
        return nextNodes;
      });
      setSelectedNode(prev => (prev === nodeId ? null : prev));
    },
    [canEdit, scheduleAutosave],
  );

  // Keyboard navigation (arrows, F, Esc, ?)
  useEffect(() => {
    if (!bundle) return;
    const dirs: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable))
        return;

      if (e.key === 'Escape') {
        setSelectedNode(null);
        setShowHelp(false);
        setFullscreen(false);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFullscreen(f => !f);
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowHelp(h => !h);
        return;
      }
      const dir = dirs[e.key];
      if (!dir) return;
      e.preventDefault();
      setSelectedNode(prev => {
        if (!nodes.length) return null;
        const navNodes = nodes.map(n => ({
          ...n,
          x: nodePosRef.current[n.id]?.x ?? n.x ?? 0,
          y: nodePosRef.current[n.id]?.y ?? n.y ?? 0,
        }));
        if (!prev) return pickFirstNodeByPriority(navNodes);
        const next = pickNeighborByDirection(navNodes, links, prev, dir);
        return next ?? prev;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bundle, nodes, links]);

  const selectedNodeObj = useMemo(
    () => (selectedNode ? nodes.find(n => n.id === selectedNode) ?? null : null),
    [selectedNode, nodes],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f141e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-400">Loading bundle…</p>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-[#0f141e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error || 'Bundle not found'}</p>
          <Link
            href={`/${locale}/bundles`}
            className="mt-4 inline-block text-blue-400 hover:underline"
          >
            Back to Bundles
          </Link>
        </div>
      </div>
    );
  }

  const rootClass = fullscreen
    ? 'flex flex-col fixed inset-0 z-[200] h-[100dvh] overflow-hidden bg-[#0A0A0F]'
    : 'flex flex-col min-h-screen bg-[#0A0A0F] text-white';

  return (
    <div className={rootClass}>
      {/* Top bar */}
      <header className="shrink-0 backdrop-blur-xl border-b border-slate-800/50 bg-[#0A0A0F]/90">
        <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/bundles`}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              ← Bundles
            </Link>
            <div className="w-px h-5 bg-slate-700/50" />
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-black text-white truncate max-w-[300px]">
                {bundle.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {nodes.length} nodes
            </span>
            {canEdit && (
              <span
                className={`text-xs ml-2 px-2 py-0.5 rounded-full border ${
                  saveState === 'saving'
                    ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                    : saveState === 'saved'
                      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                      : saveState === 'error'
                        ? 'text-red-300 border-red-500/40 bg-red-500/10'
                        : 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
                }`}
                title={
                  saveState === 'error'
                    ? 'Autosave failed — check connection'
                    : 'You can edit this bundle'
                }
              >
                {saveState === 'saving'
                  ? 'saving…'
                  : saveState === 'saved'
                    ? 'saved ✓'
                    : saveState === 'error'
                      ? 'save failed'
                      : 'editable'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {bundle.kb_article_slug && (
              <Link
                href={`/${locale}/kb/${bundle.kb_article_category_slug || 'management'}/${bundle.kb_article_slug}`}
                className="px-2 py-1.5 text-cyan-300/90 hover:text-cyan-100 rounded-lg text-xs font-medium border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
              >
                KB Article →
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowHelp(h => !h)}
              className="px-2 py-1.5 text-gray-500 hover:text-amber-200 rounded-lg text-xs font-medium transition-colors"
              title="Shortcuts (?)"
            >
              ?
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(f => !f)}
              className="px-2 py-1.5 text-gray-400 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 hover:border-slate-500/50 transition-all"
              title="Fullscreen (F)"
            >
              {fullscreen ? 'Exit' : '⛶'}
            </button>
          </div>
        </div>
      </header>

      {/* Graph + sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <div className="flex-1 min-h-[45vh] lg:min-h-0 relative min-w-0">
          <BubbleForceGraph
            nodes={nodes}
            links={links}
            selectedNode={selectedNode}
            onNodeClick={setSelectedNode}
            onNodePositions={onGraphPositions}
            readonlySnapshot
            showGrid
          />
          {nodes.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/75 backdrop-blur-[2px]">
              <div className="text-center px-4">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-gray-400 mb-2 text-sm">
                  This bundle has no nodes yet.
                </p>
                <Link
                  href={`/${locale}/bundles`}
                  className="text-blue-400 hover:underline text-sm"
                >
                  ← Browse other bundles
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:w-[400px] shrink-0 min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <BubblesMapInfoPanel
              mapName={bundle.name}
              mapDescription={bundle.description || ''}
              nodeCount={nodes.length}
              linkCount={links.length}
              nodes={nodes as InfoBubbleNode[]}
              locale={locale}
              readonlySnapshot={!canEdit}
              activeVersionLabel={null}
              selectedNode={selectedNodeObj as InfoBubbleNode | null}
              formatDetailLines={formatDetailLines}
              localizeKb={path => localizePortalPath(path, locale)}
              onClearSelection={() => setSelectedNode(null)}
              onAddLink={handleAddLink}
              onDeleteNode={handleDeleteNode}
              canEdit={canEdit}
            />
          </div>
          <div className="shrink-0 border-t border-slate-800/90 bg-[#0b1020] px-4 py-3 max-h-[40vh] overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Social
            </div>
            <BundleNodeSocial
              bundleId={bundle.id}
              nodeId={selectedNode}
              isAuthed={!!me}
              currentUserId={me?.id ?? null}
              currentUserEmail={me?.email ?? null}
            />
          </div>
        </div>
      </div>

      {/* Shortcuts help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[240] bg-black/65 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Navigation</h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <span className="text-white font-medium">Arrow keys</span> — jump
                to the neighbor node in that direction.
              </li>
              <li>
                <span className="text-white font-medium">First press</span> —
                selects the hub (lowest priority number).
              </li>
              <li>
                <span className="text-white font-medium">F</span> — fullscreen
                map · <span className="text-white font-medium">Esc</span> — exit
                fullscreen / clear selection.
              </li>
              <li>
                <span className="text-white font-medium">?</span> — this help.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
