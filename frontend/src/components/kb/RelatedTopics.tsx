"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, Target, Zap } from "lucide-react";

interface RelatedNode {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  icon?: string;
  color?: string;
  relationship_type?: string;
  relationship_weight?: number;
}

interface RelatedTopicsProps {
  articleSlug: string;
  maxItems?: number;
  className?: string;
}

export function RelatedTopics({ articleSlug, maxItems = 5, className = "" }: RelatedTopicsProps) {
  const [related, setRelated] = useState<RelatedNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<RelatedNode[] | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Fetch related nodes
        const response = await fetch(`/api/v1/knowledge-graph/nodes/${articleSlug}/related/`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setRelated(data.slice(0, maxItems));

        // Fetch learning path
        const pathResponse = await fetch(`/api/v1/knowledge-graph/nodes/${articleSlug}/learning_path/`);
        if (pathResponse.ok) {
          const pathData = await pathResponse.json();
          setLearningPath(pathData.path);
        }
      } catch (err) {
        console.error("Failed to load related topics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (articleSlug) {
      fetchRelated();
    }
  }, [articleSlug, maxItems]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-white/5 rounded w-32 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!related.length && !learningPath?.length) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "concept":
        return <Lightbulb className="w-4 h-4" />;
      case "technique":
        return <Zap className="w-4 h-4" />;
      case "framework":
        return <Target className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      concept: "text-blue-400 bg-blue-400/10",
      technique: "text-green-400 bg-green-400/10",
      framework: "text-purple-400 bg-purple-400/10",
      author: "text-amber-400 bg-amber-400/10",
      metric: "text-red-400 bg-red-400/10",
      tool: "text-cyan-400 bg-cyan-400/10",
    };
    return colors[type] || "text-gray-400 bg-gray-400/10";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Learning Path */}
      {learningPath && learningPath.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-400/10 to-teal-400/10 border border-emerald-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-emerald-400">Learning Path</h4>
          </div>
          <div className="space-y-2">
            {learningPath.map((node, index) => (
              <Link
                key={node.id}
                href={`/en/kb/management/${node.slug}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white flex-1 truncate">
                  {node.name}
                </span>
                {index === learningPath.length - 1 && (
                  <span className="text-xs text-emerald-400">Current</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Topics */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-400">Related Topics</h4>
          </div>
          <div className="space-y-2">
            {related.map((node) => (
              <Link
                key={node.id}
                href={`/en/kb/management/${node.slug}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(node.type)}`}>
                  {node.icon || getTypeIcon(node.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">
                      {node.name}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {node.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {node.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">
                      {node.type}
                    </span>
                    {node.relationship_type && (
                      <span className="text-[10px] text-gray-500">
                        {node.relationship_type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
