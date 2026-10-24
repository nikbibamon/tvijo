"use client";

/**
 * Article Visualization Component
 * Generation: GEN-KB-AI-VIZ-001
 * 
 * Displays AI-generated visualizations for KB articles.
 * Automatically selects the best renderer based on visualization type.
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { MermaidRenderer } from "./MermaidRenderer";
import { CytoscapeRenderer } from "./CytoscapeRenderer";

interface VisualizationData {
  structure_type: string;
  confidence: number;
  title: string;
  summary: string;
  primary: {
    format: "mermaid" | "cytoscape" | "d3" | "table";
    type: string;
    data: any;
    config: any;
  };
  alternatives: Array<{
    format: "mermaid" | "cytoscape" | "d3" | "table";
    type: string;
    data: any;
    config: any;
  }>;
  metadata: {
    node_count: number;
    edge_count: number;
    analysis_source: string;
  };
}

interface ArticleVisualizationProps {
  /** Visualization data from API */
  data?: VisualizationData | null;
  /** Fallback visual_embeds from article */
  visualEmbeds?: {
    variant?: string;
    show_mindmap?: boolean;
    mindmap_cta_label?: string;
    bubble_map_id?: string;
    bubble_cta_label?: string;
  };
  /** Article slug for linking */
  articleSlug?: string;
  /** CSS class */
  className?: string;
}

export function ArticleVisualization({
  data,
  visualEmbeds,
  articleSlug,
  className = "",
}: ArticleVisualizationProps) {
  const [activeTab, setActiveTab] = useState<"primary" | "mindmap" | "graph">("primary");
  const [showDetails, setShowDetails] = useState(false);

  // If no AI visualization data, show fallback embeds
  if (!data) {
    return <FallbackVisualization embeds={visualEmbeds} articleSlug={articleSlug} />;
  }

  const { primary, alternatives, metadata, confidence, structure_type } = data;

  // Determine which renderer to use
  const renderVisualization = () => {
    switch (primary.format) {
      case "mermaid":
        return (
          <MermaidRenderer
            content={primary.data}
            type={primary.type === "mindmap" ? "mindmap" : "flowchart"}
            height={450}
          />
        );
      case "cytoscape":
        return (
          <CytoscapeRenderer
            elements={primary.data}
            config={primary.config}
            height={450}
          />
        );
      case "d3":
      case "table":
        // For now, fall back to showing as JSON
        return (
          <div className="bg-[#0a0d14] rounded-xl border border-white/5 p-4">
            <p className="text-sm text-slate-400 mb-2">
              📊 {primary.type === "bubble" ? "Bubble Chart" : "Table"} visualization
            </p>
            <pre className="text-[10px] text-slate-600 overflow-auto max-h-60">
              {JSON.stringify(primary.data, null, 2)}
            </pre>
          </div>
        );
      default:
        return (
          <div className="bg-[#0a0d14] rounded-xl border border-white/5 p-8 text-center">
            <p className="text-slate-500">Unsupported visualization format</p>
          </div>
        );
    }
  };

  // Find alternative visualizations
  const graphAlt = alternatives.find((a) => a.type === "graph");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            🧠 AI-Generated Visualization
          </h3>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              confidence > 0.8
                ? "bg-green-500/10 text-green-400"
                : confidence > 0.6
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            Confidence: {Math.round(confidence * 100)}%
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("primary")}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
            activeTab === "primary"
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {structure_type === "mind_map"
            ? "🧠 Mind Map"
            : structure_type === "flow"
            ? "🔄 Flow"
            : structure_type === "timeline"
            ? "📅 Timeline"
            : "🕸️ Graph"}
        </button>

        {graphAlt && (
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === "graph"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🕸️ Network
          </button>
        )}
      </div>

      {/* Visualization */}
      <div className="space-y-4">
        {activeTab === "primary" && renderVisualization()}

        {activeTab === "graph" && graphAlt && (
          <CytoscapeRenderer
            elements={graphAlt.data}
            config={graphAlt.config}
            height={450}
          />
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="bg-[#0a0d14] rounded-lg border border-white/5 p-4 space-y-3">
          <p className="text-sm text-slate-300">{data.summary}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span>Nodes: {metadata.node_count}</span>
            <span>•</span>
            <span>Edges: {metadata.edge_count}</span>
            <span>•</span>
            <span>Source: {metadata.analysis_source}</span>
            <span>•</span>
            <span>Type: {structure_type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback component when no AI visualization data
function FallbackVisualization({
  embeds,
  articleSlug,
}: {
  embeds?: ArticleVisualizationProps["visualEmbeds"];
  articleSlug?: string;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  if (!embeds?.bubble_map_id) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <span>🧭</span>
        Explore visually
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {embeds.bubble_map_id && (
          <a
            href={`/${locale}/bubbles?map=${encodeURIComponent(embeds.bubble_map_id)}`}
            className="group relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-indigo-950/50 p-5 transition-all hover:border-purple-400/45"
          >
            <div className="text-2xl mb-2">🫧</div>
            <div className="font-semibold text-white text-sm">
              {embeds.bubble_cta_label || "Interactive graph"}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Explore connections in Tvijo Bubbles
            </p>
          </a>
        )}
      </div>
    </div>
  );
}
