"use client";

/**
 * Article Visual Explorer
 * Generation: GEN-KB-AI-VIZ-002
 * 
 * Интеграция с существующими Bubbles и Mind Maps
 * + SEO keyword highlighting
 * + Entity extraction display
 */

import { useState, useEffect } from "react";
import Link from "next/link";

interface Entity {
  id: string;
  name: string;
  type: "concept" | "metric" | "tool" | "strategy" | "person";
  importance: number; // 0-1 for SEO weight
  connections: number;
}

interface VisualizationConfig {
  type: "bubbles" | "timeline" | "comparison" | "auto";
  entities: Entity[];
  structure_type: string;
  confidence: number;
  bubble_map_id?: string;
}

interface ArticleVisualExplorerProps {
  articleSlug: string;
  title: string;
  entities: Entity[];
  config: VisualizationConfig;
  visualEmbeds?: {
    bubble_map_id?: string;
    bubble_cta_label?: string;
  };
  locale: string;
}

export function ArticleVisualExplorer({
  articleSlug,
  title,
  entities,
  config,
  visualEmbeds,
  locale,
}: ArticleVisualExplorerProps) {
  const isRu = locale === 'ru';
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Sort entities by importance
  const sortedEntities = [...entities].sort((a, b) => b.importance - a.importance);
  const topEntities = sortedEntities.slice(0, 8);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span>{isRu ? 'Исследователь графа знаний' : 'Knowledge Graph Explorer'}</span>
            {config.confidence > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                config.confidence > 0.7 ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
              }`}>
                AI {Math.round(config.confidence * 100)}%
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {entities.length} {isRu ? 'сущностей извлечено' : 'entities extracted'} • {config.structure_type} {isRu ? 'структура' : 'structure'}
          </p>
        </div>
      </div>

      {/* Bubbles Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d14]/95 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-2">
            🫧 {isRu ? 'Пузырьковая карта' : 'Bubble Map'}
          </h4>
        </div>
        <BubblesView
          articleSlug={articleSlug}
          bubbleMapId={visualEmbeds?.bubble_map_id || `kb-${articleSlug}`}
          title={title}
          entities={topEntities}
          locale={locale}
        />
      </div>

      {/* Keywords Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d14]/95 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <h4 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
            🔑 {isRu ? 'SEO-ключевые слова' : 'SEO Keywords'}
          </h4>
        </div>
        <EntitiesView
          entities={sortedEntities}
          onSelect={setSelectedEntity}
          selected={selectedEntity}
          isRu={isRu}
        />
      </div>

      {/* Entity detail panel */}
      {selectedEntity && (
        <EntityDetailPanel
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          articleSlug={articleSlug}
          locale={locale}
        />
      )}
    </div>
  );
}

// ============ BUBBLES VIEW ============
function BubblesView({
  articleSlug,
  bubbleMapId,
  title,
  entities,
  locale
}: {
  articleSlug: string;
  bubbleMapId: string;
  title: string;
  entities: Entity[];
  locale: string;
}) {
  const isRu = locale === 'ru';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Info panel */}
        <div className="lg:w-1/3 space-y-4">
          <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-indigo-950/50 p-5">
            <div className="text-3xl mb-2">🫧</div>
            <h4 className="font-semibold text-white mb-2">{isRu ? 'Интерактивная пузырьковая карта' : 'Interactive Bubble Map'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {isRu ? `Изучите "${title}" — перетаскивайте, масштабируйте и обнаруживайте связи между понятиями.` : `Explore "${title}" - drag, zoom, and discover connections between concepts.`}
            </p>
            <Link
              href={`/${locale}/bubbles?map=${encodeURIComponent(bubbleMapId)}&article=${articleSlug}`}
              className="inline-flex items-center text-xs font-medium text-purple-300 hover:text-purple-200"
            >
              {isRu ? 'Открыть на весь экран →' : 'Open in Full Screen →'}
            </Link>
          </div>

          {/* Quick entity list */}
          <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
            <h5 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">{isRu ? 'Ключевые понятия' : 'Key Concepts'}</h5>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => (
                <span
                  key={e.id}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-white/5 text-slate-300 border border-white/10"
                  style={{ opacity: 0.5 + e.importance * 0.5 }}
                >
                  {e.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Bubble Map iframe */}
        <div className="lg:w-2/3">
          <div className="relative rounded-xl border border-white/10 bg-slate-950 overflow-hidden" style={{ minHeight: '400px' }}>
            <iframe
              src={`/${locale}/bubbles?map=${encodeURIComponent(bubbleMapId)}&article=${articleSlug}&embedded=true`}
              className="w-full h-[400px] border-0"
              title="Bubble Map"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
            {/* Decorative bubbles */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/3 w-20 h-20 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ENTITIES VIEW (SEO Keywords) ============
function EntitiesView({
  entities,
  onSelect,
  selected,
  isRu
}: {
  entities: Entity[];
  onSelect: (e: Entity) => void;
  selected: Entity | null;
  isRu: boolean;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "concept": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "metric": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "tool": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "strategy": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "person": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {entities.map((entity) => (
          <button
            key={entity.id}
            onClick={() => onSelect(entity)}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
              selected?.id === entity.id
                ? "border-white/30 bg-white/5"
                : "border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeColor(entity.type)}`}>
                {entity.type}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round(entity.importance * 100)}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-200">{entity.name}</p>
            <p className="mt-1 text-[10px] text-slate-500">
              {entity.connections} {isRu ? 'связей' : 'connections'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ ENTITY DETAIL PANEL ============
function EntityDetailPanel({ 
  entity, 
  onClose,
  articleSlug,
  locale 
}: { 
  entity: Entity;
  onClose: () => void;
  articleSlug: string;
  locale: string;
}) {
  const isRu = locale === 'ru';

  return (
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-slate-900/50">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-white">{entity.name}</h4>
          <p className="text-sm text-slate-400 capitalize">{entity.type} • {isRu ? 'Важность' : 'Importance'}: {Math.round(entity.importance * 100)}%</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
      </div>
      
      <div className="mt-4 flex gap-3">
        <Link
          href={`/${locale}/bubbles?entity=${encodeURIComponent(entity.name)}`}
          className="px-3 py-1.5 text-xs bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30"
        >
          🫧 {isRu ? 'Найти в Bubbles' : 'Find in Bubbles'}
        </Link>
        <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 rounded-lg border border-white/10 hover:bg-white/10">
          📖 {isRu ? 'Связанные статьи' : 'Related Articles'}
        </button>
      </div>
    </div>
  );
}
