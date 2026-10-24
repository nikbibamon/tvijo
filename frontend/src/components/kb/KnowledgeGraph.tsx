"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GraphNode {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  icon?: string;
  color?: string;
  weight?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
  label?: string | null;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    total_nodes: number;
    total_edges: number;
    category?: string;
  };
}

interface KnowledgeGraphProps {
  category?: string;
  centerNode?: string;
  height?: number;
  className?: string;
  onNodeClick?: (node: GraphNode) => void;
}

export function KnowledgeGraph({
  category,
  centerNode,
  height = 400,
  className = "",
  onNodeClick,
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const router = useRouter();
  const animationRef = useRef<number>();
  const nodesRef = useRef<GraphNode[]>([]);
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<string | null>(null);

  // Fetch graph data
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const url = centerNode
          ? `/api/v1/knowledge-graph/graph/neighborhood/?node=${centerNode}`
          : `/api/v1/knowledge-graph/graph/full/${category ? `?category=${category}` : ""}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load graph");
        
        const data = await response.json();
        
        // Initialize positions for force layout
        const nodes = (data.nodes || []).map((n: GraphNode, i: number) => ({
          ...n,
          x: 200 + Math.cos((i / (data.nodes.length || 1)) * Math.PI * 2) * 150,
          y: height / 2 + Math.sin((i / (data.nodes.length || 1)) * Math.PI * 2) * 100,
          vx: 0,
          vy: 0,
        }));
        
        nodesRef.current = nodes;
        setGraphData({
          nodes,
          edges: data.edges || [],
          meta: data.meta || { total_nodes: nodes.length, total_edges: data.edges?.length || 0 },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [category, centerNode, height]);

  // Force simulation
  const runForceLayout = useCallback(() => {
    if (!nodesRef.current.length) return;

    const nodes = nodesRef.current;
    const edges = graphData?.edges || [];
    const width = svgRef.current?.clientWidth || 800;
    
    // Constants
    const repulsionForce = 2000;
    const springLength = 100;
    const springStrength = 0.05;
    const centerForce = 0.02;
    const damping = 0.9;
    
    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x! - nodes[i].x!;
        const dy = nodes[j].y! - nodes[i].y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionForce / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        
        nodes[i].vx! -= fx;
        nodes[i].vy! -= fy;
        nodes[j].vx! += fx;
        nodes[j].vy! += fy;
      }
    }
    
    // Spring forces along edges
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) return;
      
      const dx = target.x! - source.x!;
      const dy = target.y! - source.y!;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - springLength) * springStrength * edge.weight;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      source.vx! += fx;
      source.vy! += fy;
      target.vx! -= fx;
      target.vy! -= fy;
    });
    
    // Center gravity
    const cx = width / 2;
    const cy = height / 2;
    nodes.forEach((node) => {
      node.vx! += (cx - node.x!) * centerForce;
      node.vy! += (cy - node.y!) * centerForce;
      
      // Apply velocity with damping
      if (!isDraggingRef.current || draggedNodeRef.current !== node.id) {
        node.vx! *= damping;
        node.vy! *= damping;
        node.x! += node.vx!;
        node.y! += node.vy!;
        
        // Boundaries
        node.x = Math.max(40, Math.min(width - 40, node.x!));
        node.y = Math.max(40, Math.min(height - 40, node.y!));
      }
    });
    
    setGraphData((prev) => (prev ? { ...prev, nodes: [...nodes] } : null));
  }, [graphData?.edges, height]);

  // Animation loop
  useEffect(() => {
    if (loading || !graphData) return;
    
    const animate = () => {
      runForceLayout();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, graphData, runForceLayout]);

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
    
    // Navigate to article if exists
    if (node.slug) {
      router.push(`/en/kb/management/${node.slug}`);
    }
  };

  // Get node radius based on weight
  const getNodeRadius = (node: GraphNode) => {
    const baseRadius = 20;
    const weightBonus = Math.min((node.weight || 1) * 2, 15);
    return baseRadius + weightBonus;
  };

  // Get color based on node type
  const getNodeColor = (node: GraphNode) => {
    if (node.color && node.color !== "#3b82f6") return node.color;
    
    const colors: Record<string, string> = {
      concept: "#3b82f6",      // blue
      technique: "#10b981",    // green
      framework: "#8b5cf6",    // purple
      author: "#f59e0b",       // amber
      metric: "#ef4444",       // red
      tool: "#06b6d4",         // cyan
      category: "#6366f1",     // indigo
      skill: "#ec4899",        // pink
    };
    return colors[node.type] || "#6b7280";
  };

  if (loading) {
    return (
      <div 
        className={`bg-[#1A1A2E]/50 rounded-xl border border-white/5 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm">Loading knowledge graph...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-red-400 text-sm">Failed to load graph</p>
          <p className="text-red-400/60 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!graphData || !graphData.nodes.length) {
    return (
      <div 
        className={`bg-white/5 rounded-xl border border-white/5 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const width = svgRef.current?.clientWidth || 800;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Graph Stats */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <div className="px-2 py-1 bg-black/50 rounded text-xs text-gray-400">
          {graphData.meta.total_nodes} nodes
        </div>
        <div className="px-2 py-1 bg-black/50 rounded text-xs text-gray-400">
          {graphData.meta.total_edges} connections
        </div>
      </div>

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges */}
        {graphData.edges.map((edge) => {
          const source = graphData.nodes.find((n) => n.id === edge.source);
          const target = graphData.nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;

          const isHighlighted = 
            hoveredNode === edge.source || 
            hoveredNode === edge.target ||
            selectedNode?.id === edge.source ||
            selectedNode?.id === edge.target;

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isHighlighted ? "#f97316" : "#475569"}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeOpacity={isHighlighted ? 0.8 : 0.3}
            />
          );
        })}

        {/* Nodes */}
        {graphData.nodes.map((node) => {
          const radius = getNodeRadius(node);
          const color = getNodeColor(node);
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              {/* Glow effect */}
              {(isSelected || isHovered) && (
                <circle
                  r={radius + 8}
                  fill={color}
                  opacity={0.2}
                />
              )}
              
              {/* Node circle */}
              <circle
                r={radius}
                fill={color}
                stroke={isSelected ? "#f97316" : "#1e293b"}
                strokeWidth={isSelected ? 3 : 2}
              />
              
              {/* Icon */}
              {node.icon && (
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={radius * 0.8}
                >
                  {node.icon}
                </text>
              )}
              
              {/* Label */}
              <text
                y={radius + 16}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize={11}
                fontWeight={500}
                style={{ pointerEvents: "none" }}
              >
                {node.name.length > 15 ? node.name.slice(0, 15) + "..." : node.name}
              </text>
              
              {/* Type badge */}
              <text
                y={radius + 28}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={9}
                style={{ pointerEvents: "none" }}
              >
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-2 left-2 right-2 bg-[#1A1A2E]/95 border border-white/10 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${getNodeColor(selectedNode)}20` }}
            >
              {selectedNode.icon || "📚"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">
                {selectedNode.name}
              </h4>
              <p className="text-gray-400 text-xs mt-0.5 capitalize">
                {selectedNode.type}
              </p>
              {selectedNode.description && (
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {selectedNode.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
