'use client';

/**
 * Tvijo Bubbles — Interactive Bubble Mind Maps
 * Route: /en/bubbles/ or /ru/bubbles/
 * 
 * Force-graph (react-force-graph-2d) в духе legacy Decision Map + версии снимков.
 * Users create maps, add nodes, connect ideas, save to Django API.
 * Generation: GEN-DECMAP-001
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchBubbleMaps, fetchBubbleMap, createBubbleMap,
  updateBubbleNodes, fetchBubbleTemplates, fetchPublicBubbles,
  saveBubbleMapVersion,
  type BubbleMap,
} from '@/services/decmap-api';
import BubblesMapInfoPanel, { type InfoBubbleNode } from '@/components/bubbles/BubblesMapInfoPanel';

/** react-force-graph-2d трогает window при импорте — без ssr:false Next даёт 500 на /bubbles */
const BubbleForceGraph = dynamic(
  () => import('@/components/bubbles/BubbleForceGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">
        Loading graph…
      </div>
    ),
  }
);
import { linkEndpointId, sanitizeLinksForApi } from '@/components/bubbles/bubbleGraphLinks';

// ============================================================
// TYPES
// ============================================================

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
  /** 1 — хаб, 2 — роли, 3 — подсистемы */
  level?: number;
  parent_id?: string | null;
  /** Роль на суперкарте (Trader, Developer, …) */
  role?: string;
  /** 1 = главный узел, 5 = второстепенный */
  priority?: number;
  /** Развёрнутое описание для панели */
  detail?: string;
  /** Ссылка в KB или на раздел портала */
  kb_url?: string;
}

interface BubbleLink {
  source: string;
  target: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const NICK_KEY = 'decmap-nickname';

const PORTAL_API =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

function nickFromProfile(p: {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}): string {
  const full = typeof p.full_name === 'string' && p.full_name.trim() ? p.full_name.trim() : '';
  if (full.length >= 2) return full.slice(0, 50);
  const parts = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
  if (parts.length >= 2) return parts.slice(0, 50);
  if (typeof p.email === 'string' && p.email.includes('@')) {
    return p.email.split('@')[0]!.slice(0, 50);
  }
  return '';
}

const NODE_TYPES: Record<string, { color: string; icon: string; label: string }> = {
  IDEA:     { color: '#3b82f6', icon: '💡', label: 'Idea' },
  TASK:     { color: '#22c55e', icon: '✅', label: 'Task' },
  PROBLEM:  { color: '#ef4444', icon: '🔥', label: 'Problem' },
  SOLUTION: { color: '#8b5cf6', icon: '🧩', label: 'Solution' },
  QUESTION: { color: '#f59e0b', icon: '❓', label: 'Question' },
  NOTE:     { color: '#06b6d4', icon: '📝', label: 'Note' },
};

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
  dir: [number, number]
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
    const vx = n.x - cur.x;
    const vy = n.y - cur.y;
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

// ============================================================
// ADD NODE MODAL
// ============================================================

function AddNodeModal({
  onAdd,
  onClose,
}: {
  onAdd: (label: string, type: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('IDEA');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-bold text-white mb-4">Add Bubble</h3>

        <input
          type="text"
          placeholder="Bubble label..."
          value={label}
          onChange={e => setLabel(e.target.value)}
          autoFocus
          maxLength={60}
          className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 mb-4"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(NODE_TYPES).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={`p-2 rounded-lg text-center text-xs transition-all border ${
                type === key
                  ? 'border-blue-500/50 bg-blue-500/10 text-white'
                  : 'border-slate-700/30 bg-slate-800/40 text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="text-lg">{info.icon}</div>
              <div className="mt-0.5">{info.label}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-700/30 text-gray-400 rounded-lg hover:text-white transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (label.trim()) { onAdd(label.trim(), type); onClose(); } }}
            disabled={!label.trim()}
            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all text-sm disabled:opacity-30"
          >
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAP LIST VIEW
// ============================================================

const SUPER_MAP_FALLBACK: Record<string, string> = {
  en: 'Roles, priorities, and ecosystem links — click a node for details; arrow keys move through the graph (like gaze-style navigation in VR).',
  ru: 'Роли, приоритеты и связи экосистемы — клик по узлу открывает описание; стрелки ведут по графу (как навигация взглядом в VR).',
};

function MapList({
  nickname,
  locale,
  onSelectMap,
  onCreateMap,
}: {
  nickname: string;
  locale: string;
  onSelectMap: (id: string) => void;
  onCreateMap: (name: string, template: string) => void;
}) {
  const [maps, setMaps] = useState<BubbleMap[]>([]);
  const [publicMaps, setPublicMaps] = useState<BubbleMap[]>([]);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchBubbleMaps(nickname).then(setMaps);
    fetchPublicBubbles().then(setPublicMaps);
  }, [nickname]);

  const superMap = publicMaps.find(m => m.slug === 'biba-super-map');

  return (
    <div className="max-w-3xl mx-auto">
      {superMap && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelectMap(superMap.id)}
          className="w-full text-left mb-8 rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-950/50 via-slate-900/80 to-indigo-950/40 p-5 hover:border-amber-400/50 transition-all shadow-lg shadow-amber-900/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1">
                Super Map
              </p>
              <h3 className="text-lg font-black text-white">{superMap.name}</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xl">
                {superMap.description || SUPER_MAP_FALLBACK[locale === 'ru' ? 'ru' : 'en']}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                by {superMap.owner_nick} · {superMap.node_count} nodes · {superMap.view_count} views
              </p>
            </div>
            <span className="text-3xl shrink-0" aria-hidden>🗺️</span>
          </div>
        </motion.button>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Your Bubble Maps</h2>
          <p className="text-gray-500 text-sm mt-1">Create visual mind maps, connect ideas with AI</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all"
        >
          + New Map
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
              <input
                type="text"
                placeholder="Map name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-slate-700/30 text-gray-400 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      onCreateMap(newName.trim(), 'empty');
                      setNewName('');
                      setShowCreate(false);
                    }
                  }}
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium disabled:opacity-30"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Maps */}
      <div className="space-y-3 mb-8">
        {maps.length > 0 ? maps.map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelectMap(m.id)}
            className="cursor-pointer bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🫧</span>
                <div>
                  <h3 className="font-bold text-white">{m.name}</h3>
                  <p className="text-xs text-gray-500">
                    {m.node_count} nodes · {m.template} · {m.is_public ? '🌐 public' : '🔒 private'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-600">{new Date(m.updated_at).toLocaleDateString()}</span>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🫧</div>
            <p>No maps yet — create your first bubble map!</p>
          </div>
        )}
      </div>

      {/* Public Maps (без дубля суперкарты сверху) */}
      {publicMaps.filter(m => m.slug !== 'biba-super-map').length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Public Maps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicMaps.filter(m => m.slug !== 'biba-super-map').map(m => (
              <div
                key={m.id}
                onClick={() => onSelectMap(m.id)}
                className="cursor-pointer bg-slate-800/30 border border-slate-700/20 rounded-xl p-3 hover:border-slate-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>🫧</span>
                  <span className="text-sm text-white font-medium">{m.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  by {m.owner_nick} · {m.node_count} nodes · {m.view_count} views
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function BubblesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [nickname, setNickname] = useState<string | null>(null);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
  const [links, setLinks] = useState<BubbleLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mapName, setMapName] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [readonlySnapshot, setReadonlySnapshot] = useState(false);
  const [mapVersions, setMapVersions] = useState<BubbleMap['versions']>([]);
  const [viewVersionId, setViewVersionId] = useState<string | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const nodePosRef = useRef<Record<string, { x: number; y: number }>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if embedded mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsEmbedded(urlParams.get('embedded') === 'true');
    }
  }, []);

  const onGraphPositions = useCallback((m: Record<string, { x: number; y: number }>) => {
    nodePosRef.current = m;
  }, []);

  // Hydrate: local nick + sync from Django profile when JWT present (owner FK on BubbleMap)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(NICK_KEY) || '' : '';
      let next = stored;
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        try {
          const res = await fetch(`${PORTAL_API}/auth/me/`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            const p = await res.json();
            const fromP = nickFromProfile(p);
            if (fromP.length >= 2) {
              next = fromP;
              localStorage.setItem(NICK_KEY, next);
            }
          }
        } catch {
          /* keep stored */
        }
      }
      if (!cancelled) {
        if (next) setNickname(next);
        setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-save to API on changes (nick required for private maps in queryset)
  const autoSave = useCallback(() => {
    if (!currentMapId || !nickname || nodes.length === 0 || readonlySnapshot) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateBubbleNodes(currentMapId, nodes, sanitizeLinksForApi(links), nickname);
    }, 2000);
  }, [currentMapId, nodes, links, nickname, readonlySnapshot]);

  useEffect(() => { autoSave(); }, [nodes, links, autoSave]);

  // Клавиатура: стрелки = сосед в стороне экрана (аналог gaze/VR), Esc / F / ?
  useEffect(() => {
    if (!currentMapId) return;
    const dirs: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

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
  }, [currentMapId, nodes, links]);

  const applyMapPayload = useCallback((map: BubbleMap) => {
    setMapName(map.name);
    setMapDescription(map.description || '');
    setNodes((map.nodes_json as BubbleNode[]) || []);
    setLinks(sanitizeLinksForApi((map.links_json as BubbleLink[]) || []));
    setMapVersions(map.versions ?? []);
    setViewVersionId(map.active_version?.id ?? null);
    setReadonlySnapshot(!!map.readonly_snapshot);
  }, []);

  const handleSelectMap = useCallback(async (id: string) => {
    const map = await fetchBubbleMap(id, nickname || undefined);
    if (map) {
      setCurrentMapId(id);
      applyMapPayload(map);
    }
  }, [nickname, applyMapPayload]);

  /** Deep-link from KB articles: /bubbles?map=<uuid> */
  const openedMapFromQuery = useRef(false);
  useEffect(() => {
    if (!isHydrated || !nickname || openedMapFromQuery.current) return;
    if (typeof window === 'undefined') return;
    const mapId = new URLSearchParams(window.location.search).get('map');
    if (!mapId) return;
    openedMapFromQuery.current = true;
    handleSelectMap(mapId).catch(() => {
      openedMapFromQuery.current = false;
    });
  }, [isHydrated, nickname, handleSelectMap]);

  const handleVersionSelect = useCallback(async (versionId: string) => {
    if (!currentMapId) return;
    if (versionId === '') {
      const map = await fetchBubbleMap(currentMapId, nickname || undefined);
      if (map) applyMapPayload(map);
      return;
    }
    const map = await fetchBubbleMap(currentMapId, nickname || undefined, { version: versionId });
    if (map) applyMapPayload(map);
  }, [currentMapId, nickname, applyMapPayload]);

  const handleSaveSnapshot = useCallback(async () => {
    if (!currentMapId || !nickname || readonlySnapshot) return;
    const label = `snapshot ${new Date().toISOString().slice(0, 10)}`;
    const created = await saveBubbleMapVersion(currentMapId, { label }, nickname);
    if (created) {
      const map = await fetchBubbleMap(currentMapId, nickname || undefined);
      if (map) setMapVersions(map.versions ?? []);
    }
  }, [currentMapId, nickname, readonlySnapshot]);

  const handleCreateMap = useCallback(async (name: string, template: string) => {
    if (!nickname) return;
    const map = await createBubbleMap({
      name, template, owner_nick: nickname,
      nodes_json: [], links_json: [],
    });
    if (map) {
      setCurrentMapId(map.id);
      setMapName(map.name);
      setMapDescription(map.description || '');
      setNodes([]);
      setLinks([]);
    }
  }, [nickname]);

  const handleAddNode = useCallback((label: string, type: string) => {
    /** Старт рядом с выбранным узлом (или хабом), иначе force-graph разносит граф */
    let x = 480;
    let y = 360;
    if (selectedNode) {
      const live = nodePosRef.current[selectedNode];
      const fromState = nodes.find(n => n.id === selectedNode);
      const ax = live?.x ?? fromState?.x;
      const ay = live?.y ?? fromState?.y;
      if (typeof ax === 'number' && typeof ay === 'number' && !Number.isNaN(ax) && !Number.isNaN(ay)) {
        const ang = Math.random() * Math.PI * 2;
        const r = 55 + Math.random() * 35;
        x = ax + Math.cos(ang) * r;
        y = ay + Math.sin(ang) * r;
      }
    } else {
      const hub = [...nodes].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0];
      const live = hub ? nodePosRef.current[hub.id] : undefined;
      const hx = live?.x ?? hub?.x;
      const hy = live?.y ?? hub?.y;
      if (typeof hx === 'number' && typeof hy === 'number') {
        x = hx + (Math.random() - 0.5) * 100;
        y = hy + (Math.random() - 0.5) * 100;
      }
    }

    const newNode: BubbleNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      type: type as BubbleNode['type'],
      status: 'new',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 32 + Math.random() * 12,
      color: NODE_TYPES[type]?.color || '#3b82f6',
    };
    setNodes(prev => [...prev, newNode]);

    if (selectedNode) {
      setLinks(prev => [...prev, { source: selectedNode, target: newNode.id }]);
    }
  }, [selectedNode, nodes]);

  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y, vx: 0, vy: 0 } : n));
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setLinks(prev =>
      prev.filter(l => linkEndpointId(l.source) !== id && linkEndpointId(l.target) !== id)
    );
    setSelectedNode(null);
  }, []);

  const handleNickSubmit = useCallback((nick: string) => {
    localStorage.setItem(NICK_KEY, nick);
    setNickname(nick);
  }, []);

  const activeVersionLabel = useMemo(
    () => mapVersions?.find(v => v.id === viewVersionId)?.label ?? null,
    [mapVersions, viewVersionId]
  );

  const selectedNodeObj = useMemo(
    () => (selectedNode ? nodes.find(n => n.id === selectedNode) ?? null : null),
    [selectedNode, nodes]
  );

  if (!isHydrated) {
    return (
      <div className="bm-page flex items-center justify-center">
        <div className="text-gray-500 animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  // Nick screen — skip in embedded mode
  if (!nickname && !isEmbedded) {
    return (
      <div className="bm-page flex items-center justify-center p-4">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🫧</div>
            <h1 className="text-2xl font-black text-white">Tvijo Bubbles</h1>
            <p className="text-gray-500 text-sm mt-1">Interactive bubble mind maps</p>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).elements.namedItem('nick') as HTMLInputElement;
            if (input.value.trim().length >= 2) handleNickSubmit(input.value.trim());
          }}>
            <input
              name="nick"
              type="text"
              placeholder="Your nick..."
              autoFocus
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Enter Tvijo Bubbles
            </button>
          </form>
          <p className="text-center text-gray-500 text-xs mt-4 leading-relaxed">
            <a
              href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/bubbles`)}`}
              className="text-purple-400 hover:text-purple-300 underline-offset-2 hover:underline"
            >
              Log in with your Tvijo account
            </a>
            {' '}to sync private maps (JWT + owner in API). Or use a local nick only.
          </p>
        </div>
      </div>
    );
  }

  const rootClass =
    fullscreen && currentMapId
      ? 'bm-page flex flex-col fixed inset-0 z-[200] h-[100dvh] overflow-hidden'
      : isEmbedded
        ? 'flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#0A0A0F] dark:text-white'
        : 'bm-page flex flex-col';

  return (
    <div className={rootClass}>
      {/* Top Bar - hide in embedded mode */}
      {!isEmbedded && (
        <header className="bm-sticky-header shrink-0 backdrop-blur-xl dark:border-slate-800/50">
          <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentMapId ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMapId(null);
                    setNodes([]);
                    setLinks([]);
                    setFullscreen(false);
                    setShowHelp(false);
                    setSelectedNode(null);
                    setReadonlySnapshot(false);
                    setViewVersionId(null);
                    setMapVersions([]);
                    setMapDescription('');
                  }}
                  className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                >
                  ← Maps
                </button>
              ) : (
                <a href={`/${locale}/decmap`} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                  ← DecMap
                </a>
              )}
              <div className="w-px h-5 bg-slate-700/50" />
              <div className="flex items-center gap-2">
                <span className="text-lg">🫧</span>
                <span className="font-black text-white">
                  {currentMapId ? mapName : 'Tvijo Bubbles'}
                </span>
              </div>
              {currentMapId && (
                <span className="text-xs text-gray-500 ml-2">{nodes.length} bubbles</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentMapId && (
              <>
                {(mapVersions?.length ?? 0) > 0 && (
                  <select
                    aria-label="Map version"
                    value={viewVersionId ?? ''}
                    onChange={e => handleVersionSelect(e.target.value)}
                    className="max-w-[200px] text-xs bg-slate-800/90 border border-slate-600/50 rounded-lg px-2 py-1.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                  >
                    <option value="">Current (live)</option>
                    {mapVersions?.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.label} · {new Date(v.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
                {!readonlySnapshot && (
                  <button
                    type="button"
                    onClick={() => handleSaveSnapshot()}
                    className="px-2 py-1.5 text-amber-200/90 hover:text-amber-100 rounded-lg text-xs font-medium border border-amber-500/30 hover:border-amber-400/50 transition-all"
                    title={locale === 'ru' ? 'Сохранить снимок графа в историю версий' : 'Save graph snapshot to version history'}
                  >
                    Save snapshot
                  </button>
                )}
                {readonlySnapshot && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-400/90 px-2">
                    Read-only
                  </span>
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
                {!readonlySnapshot && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-all"
                  >
                    + Add Bubble
                  </button>
                )}
              </>
            )}
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-white">{nickname}</span>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Content */}
      {currentMapId ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          <div className="flex-1 min-h-[45vh] lg:min-h-0 relative min-w-0">
            <BubbleForceGraph
              nodes={nodes}
              links={links}
              selectedNode={selectedNode}
              onNodeClick={setSelectedNode}
              onNodeDragEnd={handleNodeDrag}
              onNodePositions={onGraphPositions}
              readonlySnapshot={readonlySnapshot}
              showGrid
            />
            {nodes.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/75 backdrop-blur-[2px]">
                <div className="text-center px-4">
                  <div className="text-5xl mb-3">🫧</div>
                  <p className="text-gray-400 mb-4 text-sm">
                    {locale === 'ru' ? 'Пустая карта — добавьте первый пузырь' : 'Empty map — add your first bubble'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
                  >
                    {locale === 'ru' ? '+ Добавить пузырь' : '+ Add bubble'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isEmbedded && (
            <BubblesMapInfoPanel
            mapName={mapName}
            mapDescription={mapDescription}
            nodeCount={nodes.length}
            linkCount={links.length}
            nodes={nodes as InfoBubbleNode[]}
            locale={locale}
            readonlySnapshot={readonlySnapshot}
            activeVersionLabel={activeVersionLabel}
            selectedNode={selectedNodeObj as InfoBubbleNode | null}
            formatDetailLines={formatDetailLines}
            localizeKb={path => localizePortalPath(path, locale)}
            onClearSelection={() => setSelectedNode(null)}
            onAddLink={() => setShowAddModal(true)}
            onDeleteNode={handleDeleteNode}
            canEdit={!readonlySnapshot}
          />
          )}
        </div>
      ) : (
        <main className="flex-1 px-4 py-8">
          <MapList
            nickname={nickname}
            locale={locale}
            onSelectMap={handleSelectMap}
            onCreateMap={handleCreateMap}
          />
        </main>
      )}

      {/* Add Node Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddNodeModal
            onAdd={handleAddNode}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Shortcuts help (VR/gaze-style nav описание) */}
      <AnimatePresence>
        {showHelp && currentMapId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[240] bg-black/65 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
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
                  <span className="text-white font-medium">Arrow keys</span> — jump to the neighbor bubble that lies most in that direction (same idea as “look left/right/up/down” in VR).
                </li>
                <li>
                  <span className="text-white font-medium">First press</span> — selects the hub (lowest priority number).
                </li>
                <li>
                  <span className="text-white font-medium">F</span> — fullscreen map · <span className="text-white font-medium">Esc</span> — close panel / exit fullscreen.
                </li>
                <li>
                  <span className="text-white font-medium">?</span> — this help.
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4 border-t border-slate-800 pt-3">
                WebXR: later you can bind gaze/dwell or controller rays to the same neighbor logic.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
