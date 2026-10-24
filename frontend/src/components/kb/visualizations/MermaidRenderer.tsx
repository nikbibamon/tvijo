"use client";

/**
 * Mermaid Renderer Component
 * Generation: GEN-KB-AI-VIZ-001
 * 
 * Renders Mermaid diagrams (mindmaps, flowcharts) from AI-generated syntax.
 */

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  /** Mermaid diagram syntax */
  content: string;
  /** Diagram type for styling */
  type?: "mindmap" | "flowchart" | "graph";
  /** Container height */
  height?: number;
  /** CSS class */
  className?: string;
}

export function MermaidRenderer({
  content,
  type = "mindmap",
  height = 400,
  className = "",
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !content) return;

      try {
        setLoading(true);
        setError(null);

        // Dynamically import mermaid
        const mermaid = (await import("mermaid")).default;

        // Configure mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#3b82f6",
            primaryTextColor: "#fff",
            primaryBorderColor: "#60a5fa",
            lineColor: "#94a3b8",
            secondaryColor: "#8b5cf6",
            tertiaryColor: "#10b981",
          },
          mindmap: {
            padding: 16,
          },
          flowchart: {
            curve: "basis",
            padding: 16,
          },
          securityLevel: "loose",
        });

        // Generate unique ID
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render
        const { svg } = await mermaid.render(id, content);

        // Insert SVG
        containerRef.current.innerHTML = svg;

        // Add interactivity
        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.style.maxWidth = "100%";
          svgElement.style.height = "auto";
          svgElement.style.cursor = "grab";

          // Simple pan/zoom behavior
          let scale = 1;
          let isDragging = false;
          let startX = 0;
          let startY = 0;
          let translateX = 0;
          let translateY = 0;

          const updateTransform = () => {
            svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          };

          // Wheel zoom
          svgElement.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.max(0.3, Math.min(3, scale * delta));
            updateTransform();
          });

          // Pan
          svgElement.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svgElement.style.cursor = "grabbing";
          });

          window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
          });

          window.addEventListener("mouseup", () => {
            isDragging = false;
            svgElement.style.cursor = "grab";
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(err instanceof Error ? err.message : "Render failed");
        setLoading(false);
      }
    };

    renderMermaid();
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <div
      className={`bg-[#0a0d14] rounded-xl border border-white/5 overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          {type === "mindmap" ? "🧠 Mind Map" : "🔄 Flowchart"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">Scroll to zoom • Drag to pan</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full overflow-hidden p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Rendering diagram...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-sm">Failed to render diagram</p>
              <p className="text-slate-500 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`h-full flex items-center justify-center ${loading || error ? "opacity-0" : "opacity-100"}`}
        />
      </div>

      {/* Raw code (collapsible) */}
      <details className="border-t border-white/5">
        <summary className="px-4 py-2 text-xs text-slate-500 cursor-pointer hover:text-slate-400">
          View source
        </summary>
        <pre className="px-4 py-3 text-[10px] text-slate-600 bg-black/30 overflow-x-auto">
          {content}
        </pre>
      </details>
    </div>
  );
}
