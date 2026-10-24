"use client";

/**
 * Cytoscape Renderer Component
 * Generation: GEN-KB-AI-VIZ-001
 * 
 * Renders interactive network graphs using Cytoscape.js.
 */

import { useEffect, useRef, useState } from "react";

interface CytoscapeElement {
  data: {
    id: string;
    label?: string;
    source?: string;
    target?: string;
    type?: string;
    size?: number;
    color?: string;
    weight?: number;
    width?: number;
  };
}

interface CytoscapeConfig {
  layout?: string;
  animate?: boolean;
  padding?: number;
  minZoom?: number;
  maxZoom?: number;
}

interface CytoscapeRendererProps {
  /** Cytoscape elements (nodes + edges) */
  elements: CytoscapeElement[];
  /** Rendering configuration */
  config?: CytoscapeConfig;
  /** Container height */
  height?: number;
  /** CSS class */
  className?: string;
  /** Callback when node is clicked */
  onNodeClick?: (nodeId: string, label: string) => void;
}

export function CytoscapeRenderer({
  elements,
  config = {},
  height = 400,
  className = "",
  onNodeClick,
}: CytoscapeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const {
    layout = "cose",
    animate = true,
    padding = 50,
    minZoom = 0.3,
    maxZoom = 3,
  } = config;

  useEffect(() => {
    const initCytoscape = async () => {
      if (!containerRef.current || !elements?.length) return;

      try {
        setLoading(true);
        setError(null);

        // Dynamically import cytoscape
        const cytoscape = (await import("cytoscape")).default;

        // Destroy existing instance
        if (cyRef.current) {
          cyRef.current.destroy();
        }

        // Initialize
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements,
          style: [
            {
              selector: "node",
              style: {
                "background-color": "data(color)",
                "width": "data(size)",
                "height": "data(size)",
                "label": "data(label)",
                "font-size": "12px",
                "font-family": "Inter, system-ui, sans-serif",
                "color": "#fff",
                "text-outline-color": "#1e293b",
                "text-outline-width": 2,
                "text-valign": "center",
                "text-halign": "center",
                "border-width": 2,
                "border-color": "#334155",
              },
            },
            {
              selector: "edge",
              style: {
                "width": "data(width)",
                "line-color": "#475569",
                "target-arrow-color": "#475569",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                "label": "data(label)",
                "font-size": "10px",
                "color": "#64748b",
                "text-background-color": "#0a0d14",
                "text-background-opacity": 0.8,
                "text-background-padding": 3,
              },
            },
            {
              selector: ".selected",
              style: {
                "background-color": "#f97316",
                "border-color": "#fb923c",
                "border-width": 3,
              },
            },
            {
              selector: ".highlighted",
              style: {
                "line-color": "#f97316",
                "target-arrow-color": "#f97316",
                "width": 3,
              },
            },
          ],
          layout: {
            name: layout,
            padding,
            animate,
            animationDuration: 500,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0,
          },
          minZoom,
          maxZoom,
          wheelSensitivity: 0.3,
        });

        // Add click handler
        cyRef.current.on("tap", "node", (evt: any) => {
          const node = evt.target;
          const nodeId = node.id();
          const label = node.data("label");

          // Toggle selection
          cyRef.current.nodes().removeClass("selected");
          cyRef.current.edges().removeClass("highlighted");

          if (selectedNode === nodeId) {
            setSelectedNode(null);
          } else {
            node.addClass("selected");
            setSelectedNode(nodeId);

            // Highlight connected edges
            node.connectedEdges().addClass("highlighted");

            // Callback
            onNodeClick?.(nodeId, label);
          }
        });

        // Click background to deselect
        cyRef.current.on("tap", (evt: any) => {
          if (evt.target === cyRef.current) {
            cyRef.current.nodes().removeClass("selected");
            cyRef.current.edges().removeClass("highlighted");
            setSelectedNode(null);
          }
        });

        // Fit after layout
        cyRef.current.on("layoutstop", () => {
          cyRef.current?.fit(padding);
          setLoading(false);
        });

        // Set timeout for layout
        setTimeout(() => {
          if (loading) {
            setLoading(false);
          }
        }, 2000);

      } catch (err) {
        console.error("Cytoscape init error:", err);
        setError(err instanceof Error ? err.message : "Failed to load graph");
        setLoading(false);
      }
    };

    initCytoscape();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, layout, padding, animate, minZoom, maxZoom]);

  const handleFit = () => {
    cyRef.current?.fit(50);
  };

  const handleReset = () => {
    cyRef.current?.reset();
    cyRef.current?.fit(50);
  };

  if (!elements?.length) {
    return (
      <div
        className={`bg-[#0a0d14] rounded-xl border border-white/5 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-slate-500 text-sm">No graph data available</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0a0d14] rounded-xl border border-white/5 overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            🕸️ Knowledge Graph
          </span>
          {selectedNode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
              Selected: {cyRef.current?.getElementById(selectedNode).data("label")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFit}
            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
          >
            Fit
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative flex-1" style={{ height: height - 80 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0d14]">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Loading graph...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0d14]">
            <div className="text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full h-full ${loading ? "opacity-0" : "opacity-100"}`}
        />
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-[10px] text-slate-600">
          Wheel to zoom • Drag to pan • Click nodes to select • Drag nodes to rearrange
        </p>
      </div>
    </div>
  );
}
