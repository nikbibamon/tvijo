'use client';

/**
 * Правая панель «Инфо»: метаданные карты, легенда уровней/типов, выбранный узел.
 */

import type { ReactNode } from 'react';

type NodeTypeKey = 'IDEA' | 'TASK' | 'PROBLEM' | 'SOLUTION' | 'QUESTION' | 'NOTE';

export interface InfoBubbleNode {
  id: string;
  label: string;
  type: NodeTypeKey;
  status: string;
  role?: string;
  priority?: number;
  level?: number;
  detail?: string;
  kb_url?: string;
}

const NODE_TYPES: Record<string, { color: string; icon: string; labelEn: string; labelRu: string }> = {
  IDEA: { color: '#3b82f6', icon: '\u{1F4A1}', labelEn: 'Idea', labelRu: '\u0418\u0434\u0435\u044F' },
  TASK: { color: '#22c55e', icon: '\u2705', labelEn: 'Task', labelRu: '\u0417\u0430\u0434\u0430\u0447\u0430' },
  PROBLEM: { color: '#ef4444', icon: '\u{1F525}', labelEn: 'Problem', labelRu: '\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430' },
  SOLUTION: { color: '#8b5cf6', icon: '\u{1F9E9}', labelEn: 'Solution', labelRu: '\u0420\u0435\u0448\u0435\u043D\u0438\u0435' },
  QUESTION: { color: '#f59e0b', icon: '\u2753', labelEn: 'Question', labelRu: '\u0412\u043E\u043F\u0440\u043E\u0441' },
  NOTE: { color: '#06b6d4', icon: '\u{1F4DD}', labelEn: 'Note', labelRu: '\u0417\u0430\u043C\u0435\u0442\u043A\u0430' },
};

function levelMeta(locale: string): { lv: number; label: string; hint: string; bar: string }[] {
  const ru = locale === 'ru';
  return [
    {
      lv: 1,
      label: ru ? 'L1 \u2014 \u0425\u0430\u0431' : 'L1 \u2014 Hub',
      hint: ru ? '\u0426\u0435\u043D\u0442\u0440 \u043A\u0430\u0440\u0442\u044B' : 'Map center',
      bar: 'bg-indigo-500',
    },
    {
      lv: 2,
      label: ru ? 'L2 \u2014 \u0420\u043E\u043B\u0438 / \u0434\u043E\u043C\u0435\u043D\u044B' : 'L2 \u2014 Roles / domains',
      hint: ru ? '\u0412\u0442\u043E\u0440\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C' : 'Second level',
      bar: 'bg-teal-500',
    },
    {
      lv: 3,
      label: ru ? 'L3 \u2014 \u041F\u043E\u0434\u0441\u0438\u0441\u0442\u0435\u043C\u044B' : 'L3 \u2014 Subsystems',
      hint: ru ? '\u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F' : 'Detail layer',
      bar: 'bg-violet-500',
    },
  ];
}

function panelStrings(locale: string) {
  const ru = locale === 'ru';
  return {
    info: ru ? '\u0418\u043D\u0444\u043E' : 'Info',
    mapDescPlaceholder: ru
      ? '\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043A\u0430\u0440\u0442\u044B \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u0434\u0430\u0442\u044C \u0432 \u0430\u0434\u043C\u0438\u043D\u043A\u0435 \u0438\u043B\u0438 \u043F\u0440\u0438 \u0441\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438.'
      : 'Map description can be set in admin or when seeding.',
    nodesLinks: (n: number, l: number) =>
      ru ? `${n} \u0443\u0437\u043B\u043E\u0432 \u00B7 ${l} \u0441\u0432\u044F\u0437\u0435\u0439` : `${n} nodes \u00B7 ${l} links`,
    sectionLevels: ru ? '\u0423\u0440\u043E\u0432\u043D\u0438 \u043A\u0430\u0440\u0442\u044B' : 'Map levels',
    sectionTypes: ru ? '\u0422\u0438\u043F\u044B \u0443\u0437\u043B\u043E\u0432' : 'Node types',
    sectionSelected: ru ? '\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0443\u0437\u0435\u043B' : 'Selected node',
    hoverHint1: ru
      ? '\u041D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430 \u043F\u0443\u0437\u044B\u0440\u044C \u2014 \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u044F\u0442\u0441\u044F \u0441\u0432\u044F\u0437\u0438.'
      : 'Hover a bubble \u2014 linked edges highlight.',
    hoverHint2: ru
      ? '\u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0437\u0434\u0435\u0441\u044C.'
      : 'Click to show details here.',
    clearAria: ru ? '\u0421\u043D\u044F\u0442\u044C \u0432\u044B\u0431\u043E\u0440' : 'Clear selection',
    openKb: ru ? '\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0432 \u043F\u043E\u0440\u0442\u0430\u043B\u0435 / KB \u2192' : 'Open in portal / KB \u2192',
    type: ru ? '\u0422\u0438\u043F' : 'Type',
    status: ru ? '\u0421\u0442\u0430\u0442\u0443\u0441' : 'Status',
    addLink: ru ? '+ \u0421\u0432\u044F\u0437\u044C' : '+ Link',
    delete: ru ? '\u0423\u0434\u0430\u043B\u0438\u0442\u044C' : 'Delete',
    controls: ru ? '\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435' : 'Controls',
    keyNav: ru ? '\u2014 \u0441\u043E\u0441\u0435\u0434 \u043F\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044E' : '\u2014 neighbor in that direction',
    keyFull: ru
      ? '\u2014 \u043F\u043E\u043B\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D \u00B7 Esc \u2014 \u0441\u043D\u044F\u0442\u044C \u0432\u044B\u0431\u043E\u0440'
      : '\u2014 fullscreen \u00B7 Esc \u2014 clear selection',
    keyHelp: ru ? '\u2014 \u0432\u0441\u0435 \u0441\u043E\u0447\u0435\u0442\u0430\u043D\u0438\u044F' : '\u2014 all shortcuts',
    wheelPan: ru
      ? '\u041A\u043E\u043B\u0451\u0441\u0438\u043A\u043E \u2014 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 \u00B7 \u043F\u0435\u0440\u0435\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435 \u2014 \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430'
      : 'Wheel \u2014 zoom \u00B7 drag \u2014 pan',
  };
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-600/80 text-[10px] font-mono text-slate-300">
      {children}
    </kbd>
  );
}

export default function BubblesMapInfoPanel({
  mapName,
  mapDescription,
  nodeCount,
  linkCount,
  nodes,
  locale,
  readonlySnapshot,
  activeVersionLabel,
  selectedNode,
  formatDetailLines,
  localizeKb,
  onClearSelection,
  onAddLink,
  onDeleteNode,
  canEdit,
}: {
  mapName: string;
  mapDescription: string;
  nodeCount: number;
  linkCount: number;
  nodes: InfoBubbleNode[];
  locale: string;
  readonlySnapshot: boolean;
  activeVersionLabel?: string | null;
  selectedNode: InfoBubbleNode | null;
  formatDetailLines: (text: string | undefined) => React.ReactNode;
  localizeKb: (path: string) => string;
  onClearSelection: () => void;
  onAddLink: () => void;
  onDeleteNode: (id: string) => void;
  canEdit: boolean;
}) {
  const t = panelStrings(locale);
  const levelsMeta = levelMeta(locale);
  const typeLabel = (key: string) =>
    (locale === 'ru' ? NODE_TYPES[key]?.labelRu : NODE_TYPES[key]?.labelEn) ?? NODE_TYPES[key]?.labelEn ?? key;
  const levelsPresent = new Set(nodes.map(n => n.level).filter((x): x is number => x != null));
  const l1 = nodes.filter(n => n.level === 1).length;
  const l2 = nodes.filter(n => n.level === 2).length;
  const l3 = nodes.filter(n => n.level === 3).length;

  return (
    <aside className="flex flex-col h-full min-h-0 w-full lg:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800/90 bg-gradient-to-b from-[#0b1020] via-[#0a0e18] to-[#080c14] shadow-[-8px_0_24px_rgba(0,0,0,0.35)]">
      <div className="px-4 py-3 border-b border-slate-800/80 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-500/90">{t.info}</p>
        <h2 className="text-lg font-bold text-white leading-tight mt-0.5 truncate" title={mapName}>
          {mapName}
        </h2>
        {mapDescription ? (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{mapDescription}</p>
        ) : (
          <p className="text-xs text-slate-500 mt-2 italic">{t.mapDescPlaceholder}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {readonlySnapshot && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/35">
              Read-only · {activeVersionLabel || 'snapshot'}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {t.nodesLinks(nodeCount, linkCount)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 min-h-0">
        <section>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-indigo-500" />
            {t.sectionLevels}
          </h3>
          <ul className="space-y-2">
            {levelsMeta.map(({ lv, label, hint, bar }) => (
              <li
                key={lv}
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 border ${
                  levelsPresent.has(lv)
                    ? 'border-slate-600/50 bg-slate-900/50'
                    : 'border-slate-800/40 opacity-50'
                }`}
              >
                <span className={`w-1.5 h-8 rounded-full ${bar}`} />
                <div>
                  <p className="text-xs font-medium text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-500">{hint}</p>
                </div>
                <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                  {lv === 1 ? l1 : lv === 2 ? l2 : l3}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-sky-500" />
            {t.sectionTypes}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(NODE_TYPES).map(([key, info]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 rounded-md px-2 py-1 bg-slate-900/40 border border-slate-800/60"
              >
                <span>{info.icon}</span>
                <span className="truncate">{typeLabel(key)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-amber-500" />
            {t.sectionSelected}
          </h3>
          {!selectedNode ? (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-3 py-6 text-center">
              <p className="text-sm text-slate-400">{t.hoverHint1}</p>
              <p className="text-xs text-slate-500 mt-2">{t.hoverHint2}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-cyan-500/25 bg-slate-900/60 p-3 shadow-inner shadow-black/20">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{NODE_TYPES[selectedNode.type]?.icon}</span>
                  <span className="font-semibold text-white text-sm leading-snug">{selectedNode.label}</span>
                </div>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-slate-500 hover:text-white text-xs shrink-0 px-1"
                  aria-label={t.clearAria}
                >
                  {'\u2715'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedNode.level != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-200">
                    L{selectedNode.level}
                  </span>
                )}
                {selectedNode.role && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/25">
                    {selectedNode.role}
                  </span>
                )}
                {selectedNode.priority != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-200 border border-amber-500/25">
                    P{selectedNode.priority}
                  </span>
                )}
              </div>
              {selectedNode.detail && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-sm">{formatDetailLines(selectedNode.detail)}</div>
              )}
              {selectedNode.kb_url && (
                <a
                  href={localizeKb(selectedNode.kb_url)}
                  className="inline-flex mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  {t.openKb}
                </a>
              )}
              <dl className="mt-3 space-y-1 text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between gap-2">
                  <dt>{t.type}</dt>
                  <dd className="text-slate-300">{typeLabel(selectedNode.type)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t.status}</dt>
                  <dd className="text-slate-300 capitalize">{selectedNode.status}</dd>
                </div>
              </dl>
              {canEdit && (
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={onAddLink}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/25 hover:bg-sky-500/25 transition-colors"
                  >
                    {t.addLink}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNode(selectedNode.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                  >
                    {t.delete}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-slate-900/40 border border-slate-800/70 p-3">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">{t.controls}</h3>
          <ul className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
            <li>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> {t.keyNav}
            </li>
            <li>
              <Kbd>F</Kbd> {t.keyFull}
            </li>
            <li>
              <Kbd>?</Kbd> {t.keyHelp}
            </li>
            <li className="text-slate-600 pt-1">{t.wheelPan}</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}
