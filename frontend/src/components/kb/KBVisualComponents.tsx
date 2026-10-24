'use client';

/**
 * KB Visual Components - Infographics, Diagrams, Mini MindMaps
 * Generation: GEN-KB-VISUALS-001
 * 
 * Provides visual learning aids for KB articles:
 * - Formula cards with visual breakdown
 * - Process flow diagrams
 * - Mini mindmaps for concepts
 * - Comparison tables with icons
 * - Interactive checklists
 */

import { useState } from 'react';

// ============================================================================
// Formula Card - Visual breakdown of trading formulas
// ============================================================================

interface FormulaCardProps {
  title: string;
  formula: string;
  variables: { symbol: string; meaning: string; example?: string }[];
  example: { inputs: Record<string, string>; result: string; explanation: string };
  icon?: string;
}

export function FormulaCard({ title, formula, variables, example, icon = '📐' }: FormulaCardProps) {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-5 my-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      
      {/* Formula Display */}
      <div className="bg-[#0f1117] rounded-lg p-4 mb-4 font-mono text-lg text-center">
        <code className="text-cyan-400">{formula}</code>
      </div>
      
      {/* Variables */}
      <div className="grid gap-2 mb-4">
        {variables.map((v) => (
          <div key={v.symbol} className="flex items-start gap-3 text-sm">
            <span className="font-mono text-blue-400 font-bold min-w-[3ch]">{v.symbol}</span>
            <span className="text-gray-400">= {v.meaning}</span>
            {v.example && (
              <span className="text-gray-500 text-xs ml-auto">e.g., {v.example}</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Toggle Example */}
      <button
        onClick={() => setShowExample(!showExample)}
        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        {showExample ? '▼' : '▶'} Example Calculation
      </button>
      
      {showExample && (
        <div className="mt-3 p-4 bg-[#0f1117] rounded-lg border border-white/5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {Object.entries(example.inputs).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-500">{key}:</span>
                <span className="text-white ml-2">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="text-lg font-mono text-emerald-400">= {example.result}</div>
            <p className="text-xs text-gray-500 mt-1">{example.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Process Flow - Visual step-by-step diagram
// ============================================================================

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
  tips?: string[];
}

interface ProcessFlowProps {
  title: string;
  steps: ProcessStep[];
}

export function ProcessFlow({ title, steps }: ProcessFlowProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-5 my-6">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        🔄 {title}
      </h4>
      
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500" />
        
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div 
              key={s.step}
              className={`relative flex gap-4 p-3 rounded-lg transition-all cursor-pointer ${
                activeStep === s.step ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5'
              }`}
              onClick={() => setActiveStep(activeStep === s.step ? null : s.step)}
            >
              {/* Step number bubble */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {s.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 font-medium">Step {s.step}</span>
                </div>
                <h5 className="font-medium text-white mt-0.5">{s.title}</h5>
                <p className="text-sm text-gray-400 mt-1">{s.description}</p>
                
                {activeStep === s.step && s.tips && (
                  <div className="mt-3 space-y-1">
                    {s.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                        <span className="text-emerald-400">💡</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-gray-600">
                {activeStep === s.step ? '▼' : '▶'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mini MindMap - Small concept map for articles
// ============================================================================

interface MindMapNode {
  id: string;
  label: string;
  icon: string;
  color: string;
  connections: string[];
}

interface MiniMindMapProps {
  title: string;
  centralConcept: string;
  nodes: MindMapNode[];
}

export function MiniMindMap({ title, centralConcept, nodes }: MiniMindMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Simple radial layout
  const radius = 140;
  const centerX = 160;
  const centerY = 160;
  
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-5 my-6">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        🧠 {title}
      </h4>
      
      <div className="relative h-80 bg-[#0f1117] rounded-lg overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 320 320">
          {/* Connection lines */}
          {nodes.map((node, i) => {
            const pos = getPosition(i, nodes.length);
            return (
              <line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={hoveredNode === node.id ? node.color : '#334155'}
                strokeWidth={hoveredNode === node.id ? 2 : 1}
                strokeDasharray={hoveredNode === node.id ? undefined : "4,4"}
              />
            );
          })}
          
          {/* Central node */}
          <circle cx={centerX} cy={centerY} r={35} fill="#3b82f6" />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {centralConcept}
          </text>
          
          {/* Outer nodes */}
          {nodes.map((node, i) => {
            const pos = getPosition(i, nodes.length);
            const isHovered = hoveredNode === node.id;
            
            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={isHovered ? 28 : 24}
                  fill={node.color}
                  opacity={isHovered ? 1 : 0.9}
                  transition="all 0.2s"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="16"
                >
                  {node.icon}
                </text>
                <text
                  y={35}
                  textAnchor="middle"
                  fill={isHovered ? "#fff" : "#94a3b8"}
                  fontSize="10"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 text-xs">
          {nodes.map((node) => (
            <div 
              key={`legend-${node.id}`}
              className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <span>{node.icon}</span>
              <span className="text-gray-400">{node.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Comparison Table - Side-by-side comparison with icons
// ============================================================================

interface ComparisonItem {
  feature: string;
  optionA: { value: string; highlight?: boolean };
  optionB: { value: string; highlight?: boolean };
  icon?: string;
}

interface ComparisonTableProps {
  title: string;
  optionALabel: string;
  optionBLabel: string;
  items: ComparisonItem[];
}

export function ComparisonTable({ title, optionALabel, optionBLabel, items }: ComparisonTableProps) {
  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-5 my-6 overflow-x-auto">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        ⚖️ {title}
      </h4>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2 px-3 text-gray-500 font-medium">Feature</th>
            <th className="text-center py-2 px-3 text-blue-400 font-medium">{optionALabel}</th>
            <th className="text-center py-2 px-3 text-cyan-400 font-medium">{optionBLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span className="text-gray-300">{item.feature}</span>
                </div>
              </td>
              <td className={`py-3 px-3 text-center ${item.optionA.highlight ? 'bg-blue-500/10 text-blue-300' : 'text-gray-400'}`}>
                {item.optionA.value}
              </td>
              <td className={`py-3 px-3 text-center ${item.optionB.highlight ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-400'}`}>
                {item.optionB.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Checklist - Interactive checklist with progress
// ============================================================================

interface ChecklistItem {
  id: string;
  text: string;
  subtext?: string;
}

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
  variant?: 'pretrade' | 'risk' | 'analysis';
}

export function Checklist({ title, items, variant = 'pretrade' }: ChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  
  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };
  
  const progress = Math.round((checked.size / items.length) * 100);
  
  const colors = {
    pretrade: { bg: 'from-emerald-500/20 to-emerald-500/5', accent: 'emerald' },
    risk: { bg: 'from-amber-500/20 to-amber-500/5', accent: 'amber' },
    analysis: { bg: 'from-blue-500/20 to-blue-500/5', accent: 'blue' },
  };
  
  const c = colors[variant];

  return (
    <div className={`bg-gradient-to-br ${c.bg} border border-white/5 rounded-xl p-5 my-6`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          ✅ {title}
        </h4>
        <span className={`text-sm text-${c.accent}-400 font-medium`}>
          {checked.size}/{items.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full bg-${c.accent}-500 transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isChecked ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                isChecked 
                  ? `bg-${c.accent}-500 border-${c.accent}-500` 
                  : 'border-gray-600 hover:border-gray-500'
              }`}>
                {isChecked && <span className="text-white text-xs">✓</span>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={isChecked}
                onChange={() => toggle(item.id)}
              />
              <div className="flex-1">
                <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {item.text}
                </span>
                {item.subtext && (
                  <p className="text-xs text-gray-600 mt-1">{item.subtext}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Key Takeaways - Visual summary cards
// ============================================================================

interface Takeaway {
  icon: string;
  title: string;
  description: string;
}

interface KeyTakeawaysProps {
  items: Takeaway[];
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600/20 via-cyan-600/10 to-blue-600/20 border border-blue-500/20 rounded-xl p-5 my-6">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        🎯 Key Takeaways
      </h4>
      
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div 
            key={i} 
            className="flex gap-3 p-3 bg-[#0f1117] rounded-lg border border-white/5"
          >
            <span className="text-xl">{item.icon}</span>
            <div>
              <h5 className="font-medium text-white text-sm">{item.title}</h5>
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Warning Box - Important alerts with visual hierarchy
// ============================================================================

interface WarningBoxProps {
  type: 'warning' | 'danger' | 'info' | 'tip';
  title: string;
  children: React.ReactNode;
}

export function WarningBox({ type, title, children }: WarningBoxProps) {
  const styles = {
    warning: { bg: 'from-amber-500/10 to-amber-500/5', border: 'amber-500/30', icon: '⚠️', title: 'amber-400' },
    danger: { bg: 'from-red-500/10 to-red-500/5', border: 'red-500/30', icon: '🛑', title: 'red-400' },
    info: { bg: 'from-blue-500/10 to-blue-500/5', border: 'blue-500/30', icon: 'ℹ️', title: 'blue-400' },
    tip: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'emerald-500/30', icon: '💡', title: 'emerald-400' },
  };
  
  const s = styles[type];

  return (
    <div className={`bg-gradient-to-br ${s.bg} border border-${s.border} rounded-xl p-4 my-6`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{s.icon}</span>
        <div>
          <h5 className={`font-semibold text-${s.title} mb-1`}>{title}</h5>
          <div className="text-sm text-gray-400">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example Box - Code/Scenario examples with tabs
// ============================================================================

interface Example {
  label: string;
  content: React.ReactNode;
}

interface ExampleBoxProps {
  title: string;
  examples: Example[];
}

export function ExampleBox({ title, examples }: ExampleBoxProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-5 my-6">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        📊 {title}
      </h4>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeTab === i
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="bg-[#0f1117] rounded-lg p-4">
        {examples[activeTab]?.content}
      </div>
    </div>
  );
}
