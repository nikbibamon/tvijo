"use client";

/**
 * SEO Content Highlighter
 * Generation: GEN-KB-AI-VIZ-002
 * 
 * Выделяет SEO ключевые слова в тексте статьи
 * Добавляет структурированную подачу для студентов
 */

import { useMemo } from "react";

interface SEOContentHighlighterProps {
  content: string;
  seoKeywords: string[];
  entities: Array<{
    name: string;
    importance: number;
    type: string;
  }>;
  className?: string;
}

export function SEOContentHighlighter({
  content,
  seoKeywords,
  entities,
  className = "",
}: SEOContentHighlighterProps) {
  // Combine and prioritize keywords
  const allKeywords = useMemo(() => {
    const keywords = new Map<string, { importance: number; type: string }>();
    
    // Add SEO keywords with high importance
    seoKeywords.forEach((k) => {
      keywords.set(k.toLowerCase(), { importance: 0.9, type: "seo" });
    });
    
    // Add entities with their importance
    entities.forEach((e) => {
      const key = e.name.toLowerCase();
      const existing = keywords.get(key);
      if (!existing || e.importance > existing.importance) {
        keywords.set(key, { importance: e.importance, type: e.type });
      }
    });
    
    // Sort by importance and length (longer phrases first to avoid partial matches)
    return Array.from(keywords.entries())
      .sort((a, b) => {
        if (Math.abs(a[1].importance - b[1].importance) > 0.1) {
          return b[1].importance - a[1].importance;
        }
        return b[0].length - a[0].length;
      })
      .slice(0, 15); // Limit to top 15
  }, [seoKeywords, entities]);

  // Create highlighted HTML
  const highlightedContent = useMemo(() => {
    if (!allKeywords.length) return content;
    
    let html = content;
    const usedRanges: Array<[number, number]> = [];
    
    // Sort keywords by length (longest first) to avoid overlapping
    const sortedKeywords = [...allKeywords].sort((a, b) => b[0].length - a[0].length);
    
    sortedKeywords.forEach(([keyword, data]) => {
      const regex = new RegExp(
        `\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`,
        "gi"
      );
      
      // Determine highlight intensity based on importance
      const intensity = data.importance > 0.8 ? "high" : data.importance > 0.5 ? "medium" : "low";
      const typeClass = data.type === "seo" ? "seo-keyword" : `entity-${data.type}`;
      
      html = html.replace(regex, (match) => {
        // Check if already wrapped
        if (match.includes('<span class="highlight')) return match;
        
        return `<span class="highlight-${intensity} ${typeClass}" data-entity="${keyword}">${match}</span>`;
      });
    });
    
    return html;
  }, [content, allKeywords]);

  return (
    <div className={`prose prose-invert prose-slate max-w-none ${className}`}>
      <style jsx global>{`
        .highlight-high {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
          border-bottom: 2px solid #3b82f6;
          padding: 0 4px;
          border-radius: 3px;
          font-weight: 600;
          color: #60a5fa;
        }
        .highlight-medium {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-bottom: 1px solid #8b5cf6;
          padding: 0 3px;
          border-radius: 3px;
          font-weight: 500;
          color: #a78bfa;
        }
        .highlight-low {
          border-bottom: 1px dashed #6b7280;
          padding: 0 2px;
          color: #9ca3af;
        }
        .seo-keyword {
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%) !important;
          border-bottom: 2px solid #22c55e !important;
          color: #4ade80 !important;
        }
        .entity-concept {
          border-left: 3px solid #3b82f6;
          padding-left: 6px;
        }
        .entity-tool {
          border-left: 3px solid #8b5cf6;
          padding-left: 6px;
        }
        .entity-metric {
          border-left: 3px solid #22c55e;
          padding-left: 6px;
        }
        .entity-strategy {
          border-left: 3px solid #f59e0b;
          padding-left: 6px;
        }
      `}</style>
      <div 
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        className="leading-relaxed text-slate-300 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-200 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-blue-500 [&_h2]:pl-3
          [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-slate-300 [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:leading-7
          [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2
          [&_li]:before:content-['▸'] [&_li]:before:text-blue-400 [&_li]:before:mt-1
          [&_strong]:text-white [&_strong]:font-semibold
          [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-300"
      />
    </div>
  );
}

// Entity Legend component
export function EntityLegend({ entities }: { entities: Array<{ type: string; name: string }> }) {
  const typeColors: Record<string, string> = {
    concept: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    tool: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    metric: "bg-green-500/20 text-green-400 border-green-500/30",
    strategy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    person: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    company: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    seo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const uniqueTypes = [...new Set(entities.map((e) => e.type))];

  return (
    <div className="flex flex-wrap gap-2 text-[10px] my-4 p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-slate-500 mr-2">Legend:</span>
      {uniqueTypes.map((type) => (
        <span
          key={type}
          className={`px-2 py-1 rounded border ${typeColors[type] || typeColors.concept}`}
        >
          {type}
        </span>
      ))}
      <span className="px-2 py-1 rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        SEO Keywords
      </span>
    </div>
  );
}
