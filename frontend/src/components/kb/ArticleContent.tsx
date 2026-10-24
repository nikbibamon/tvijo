"use client";

/**
 * Article Content Component
 * Generation: GEN-KB-AI-VIZ-002-MEDIUM
 * 
 * Medium-style typography with proper formatting
 * SEO keyword highlighting
 */

import { useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ArticleContentProps {
  contentHtml: string;
  contentMd?: string;
  seoKeywords: string[];
  entities: Array<{
    name: string;
    importance: number;
    type: string;
  }>;
}

export function ArticleContent({
  contentHtml,
  contentMd,
  seoKeywords,
  entities,
}: ArticleContentProps) {
  // Build keyword map for highlighting
  const keywordMap = useMemo(() => {
    const map = new Map<string, { importance: number; type: string }>();
    
    seoKeywords.forEach((k) => {
      map.set(k.toLowerCase(), { importance: 0.95, type: "seo" });
    });
    
    entities.forEach((e) => {
      const key = e.name.toLowerCase();
      const existing = map.get(key);
      if (!existing || e.importance > existing.importance) {
        map.set(key, { importance: e.importance, type: e.type });
      }
    });
    
    return map;
  }, [seoKeywords, entities]);

  // Process HTML to add highlighting
  const processedHtml = useMemo(() => {
    if (!keywordMap.size || !contentHtml) return contentHtml;
    
    let html = contentHtml;
    
    // Sort keywords by length (longest first)
    const sortedKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[0].length - a[0].length)
      .slice(0, 20);
    
    // Process text content only (inside tags)
    const textRegex = />([^<]+)</g;
    
    html = html.replace(textRegex, (match, text) => {
      let processedText = text;
      
      sortedKeywords.forEach(([keyword, data]) => {
        const regex = new RegExp(
          `\\b(${escapeRegExp(keyword)})\\b`,
          "gi"
        );
        
        const intensity = data.importance > 0.8 ? "high" : data.importance > 0.5 ? "medium" : "low";
        const typeClass = data.type === "seo" ? "seo-keyword" : `entity-${data.type}`;
        
        processedText = processedText.replace(regex, (m: string) => {
          return `<span class="highlight-${intensity} ${typeClass}">${m}</span>`;
        });
      });
      
      return `>${processedText}<`;
    });
    
    return html;
  }, [contentHtml, keywordMap]);

  // Use markdown if available, otherwise HTML
  const useMarkdown = Boolean(contentMd);

  const headingId = (children: ReactNode): string =>
    childrenToText(children)
      .toLowerCase()
      .replace(/['"`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="article-content">
      <style jsx global>{`
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 18px;
          line-height: 1.7;
          color: #e2e8f0;
        }
        
        /* Headings - Medium style */
        .article-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin: 48px 0 24px;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        
        .article-content h2 {
          font-size: 26px;
          font-weight: 600;
          color: #f8fafc;
          margin: 40px 0 20px;
          line-height: 1.35;
          letter-spacing: -0.01em;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 12px;
        }
        
        .article-content h3 {
          font-size: 22px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 32px 0 16px;
          line-height: 1.4;
        }
        
        .article-content h4 {
          font-size: 19px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 24px 0 12px;
        }
        
        /* Paragraphs */
        .article-content p {
          margin: 0 0 24px;
          color: #cbd5e1;
        }
        
        /* Lists */
        .article-content ul,
        .article-content ol {
          margin: 0 0 24px;
          padding-left: 28px;
        }
        
        .article-content li {
          margin: 8px 0;
          color: #cbd5e1;
        }
        
        .article-content li::marker {
          color: #6366f1;
        }
        
        /* Links */
        .article-content a {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        
        .article-content a:hover {
          color: #a5b4fc;
        }
        
        /* Bold and strong */
        .article-content strong,
        .article-content b {
          color: #fff;
          font-weight: 600;
        }
        
        /* Blockquotes */
        .article-content blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: #94a3b8;
        }
        
        /* Code */
        .article-content code {
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: "SF Mono", Monaco, monospace;
          font-size: 15px;
          color: #e2e8f0;
        }
        
        .article-content pre {
          background: rgba(0,0,0,0.3);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 24px 0;
        }
        
        .article-content pre code {
          background: none;
          padding: 0;
        }
        
        /* Tables */
        .article-content table {
          display: block;
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .article-content th,
        .article-content td {
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }
        
        .article-content th {
          background: rgba(255,255,255,0.05);
          font-weight: 600;
          color: #fff;
        }
        
        /* SEO Highlighting */
        .highlight-high {
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%);
          border-bottom: 2px solid #22c55e;
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 600;
          color: #4ade80;
        }
        
        .highlight-medium {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.08) 100%);
          border-bottom: 1px solid #8b5cf6;
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 500;
          color: #a78bfa;
        }
        
        .highlight-low {
          border-bottom: 1px dashed #6b7280;
          padding: 0 2px;
          color: #9ca3af;
        }
        
        .seo-keyword {
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.12) 100%) !important;
          border-bottom: 2px solid #22c55e !important;
          color: #4ade80 !important;
        }
        
        .entity-concept { border-left: 2px solid #3b82f6; padding-left: 4px; }
        .entity-tool { border-left: 2px solid #8b5cf6; padding-left: 4px; }
        .entity-metric { border-left: 2px solid #22c55e; padding-left: 4px; }
        .entity-strategy { border-left: 2px solid #f59e0b; padding-left: 4px; }
        .entity-person { border-left: 2px solid #eab308; padding-left: 4px; }
      `}</style>
      
      {useMarkdown ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1>{children}</h1>,
            h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
            h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
            h4: ({ children }) => <h4 id={headingId(children)}>{children}</h4>,
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul>{children}</ul>,
            ol: ({ children }) => <ol>{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            a: ({ href, children }) => <a href={href}>{children}</a>,
            strong: ({ children }) => <strong>{children}</strong>,
            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
            code: ({ children }) => <code>{children}</code>,
            pre: ({ children }) => <pre>{children}</pre>,
          }}
        >
          {contentMd || ""}
        </ReactMarkdown>
      ) : (
        <div 
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: processedHtml }} 
        />
      )}
    </div>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function childrenToText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childrenToText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    return childrenToText((node as { props?: { children?: ReactNode } }).props?.children ?? "");
  }
  return "";
}

// Entity Legend Component
export function EntityLegend({ entities, seoKeywords, locale = 'en' }: { entities: Array<{ type: string; name: string }>; seoKeywords: string[]; locale?: string }) {
  const isRu = locale === 'ru';
  const typeColors: Record<string, { bg: string; border: string; text: string }> = {
    concept: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    tool: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
    metric: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
    strategy: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    person: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
    company: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    seo: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  };

  // Get unique types
  const allItems = [
    ...seoKeywords.map(k => ({ type: "seo", name: k })),
    ...entities,
  ];
  const uniqueTypes = [...new Set(allItems.map(e => e.type))];

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-slate-500 mr-2 text-[11px] uppercase tracking-wider">{isRu ? 'Ключевые слова:' : 'Keywords:'}</span>
      {uniqueTypes.slice(0, 4).map((type) => {
        const colors = typeColors[type] || typeColors.concept;
        return (
          <span
            key={type}
            className={`px-2 py-1 rounded border ${colors.bg} ${colors.border} ${colors.text}`}
          >
            {type === "seo" ? "🎯 SEO" : type}
          </span>
        );
      })}
    </div>
  );
}
