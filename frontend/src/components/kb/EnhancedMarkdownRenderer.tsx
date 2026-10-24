'use client';

/**
 * Enhanced Markdown Renderer for KB Articles
 * Supports visual components embedded in markdown via special syntax
 * Generation: GEN-KB-RENDERER-001
 * 
 * Special syntax:
 * :::formula{title="Position Sizing" icon="📐"}
 * formula: Position Size = Risk Amount / Stop Loss Distance
 * variables:
 *   R: Risk Amount (e.g., $100)
 *   D: Stop Loss % (e.g., 5%)
 * example:
 *   R=100, D=5%, Result=$2000 position
 * :::
 */

import { useMemo } from 'react';
import {
  FormulaCard,
  ProcessFlow,
  ComparisonTable,
  Checklist,
  KeyTakeaways,
  WarningBox,
} from './KBVisualComponents';
import { AnalyticsEmbed } from '@/components/analytics/AnalyticsEmbed';
import { ScannerBlock } from './blocks/ScannerBlock';
import { RatingsBlock } from './blocks/RatingsBlock';
import { RiskBlock } from './blocks/RiskBlock';

// ============================================================================
// Parse special blocks from markdown content
// ============================================================================

interface ParsedBlock {
  type: 'html' | 'formula' | 'process' | 'mindmap' | 'comparison' | 'checklist' | 'takeaways' | 'warning' | 'example' | 'analytics' | 'scanner' | 'ratings' | 'risk';
  content: string;
  props?: Record<string, any>;
}

export function parseEnhancedMarkdown(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const specialBlockRegex = /:::(\w+)\{([^}]*)\}([\s\S]*?):::/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = specialBlockRegex.exec(content)) !== null) {
    // Add HTML content before this block
    if (match.index > lastIndex) {
      blocks.push({
        type: 'html',
        content: content.slice(lastIndex, match.index),
      });
    }
    
    const [, blockType, propsString, blockContent] = match;
    
    // Parse props
    const props: Record<string, any> = {};
    propsString.split(/\s+(?=[\w-]+=)/).forEach((prop) => {
      const [key, ...valueParts] = prop.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      props[key] = value;
    });
    
    blocks.push({
      type: blockType as ParsedBlock['type'],
      content: blockContent.trim(),
      props,
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining HTML content
  if (lastIndex < content.length) {
    blocks.push({
      type: 'html',
      content: content.slice(lastIndex),
    });
  }
  
  return blocks;
}

// ============================================================================
// Parse formula block content
// ============================================================================

function parseFormulaContent(content: string) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const formula = lines.find(l => l.startsWith('formula:'))?.replace('formula:', '').trim() || '';
  
  const variables: { symbol: string; meaning: string; example?: string }[] = [];
  let inVariables = false;
  
  for (const line of lines) {
    if (line === 'variables:') {
      inVariables = true;
      continue;
    }
    if (line === 'example:') {
      inVariables = false;
      continue;
    }
    if (inVariables && line.startsWith('-')) {
      const varLine = line.replace('-', '').trim();
      const match = varLine.match(/^(\w+):\s*(.+?)\s*(?:\(e\.g\.?[,\s]*([^)]+)\))?$/i);
      if (match) {
        variables.push({
          symbol: match[1],
          meaning: match[2].trim(),
          example: match[3],
        });
      }
    }
  }
  
  // Parse example
  const exampleSection = content.split('example:')[1];
  let example = { inputs: {} as Record<string, string>, result: '', explanation: '' };
  
  if (exampleSection) {
    const exampleLines = exampleSection.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of exampleLines) {
      if (line.includes('=')) {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key === 'Result') {
          example.result = value;
        } else {
          example.inputs[key] = value;
        }
      }
    }
    example.explanation = exampleLines[exampleLines.length - 1] || '';
  }
  
  return { formula, variables, example };
}

// ============================================================================
// Parse process steps
// ============================================================================

function parseProcessContent(content: string) {
  const steps: { step: number; title: string; description: string; icon: string; tips: string[] }[] = [];
  const lines = content.split('\n');
  
  let currentStep: any = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match: 1️⃣ Title - Description
    const stepMatch = trimmed.match(/^(\d+)[️\s]*([\w\s]+)[-\s]+(.+)$/);
    if (stepMatch) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        step: parseInt(stepMatch[1]),
        title: stepMatch[2].trim(),
        description: stepMatch[3].trim(),
        icon: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][parseInt(stepMatch[1]) - 1] || '📍',
        tips: [],
      };
    } else if (trimmed.startsWith('💡') && currentStep) {
      currentStep.tips.push(trimmed.replace('💡', '').trim());
    }
  }
  
  if (currentStep) steps.push(currentStep);
  return steps;
}

// ============================================================================
// Parse comparison table
// ============================================================================

function parseComparisonContent(content: string) {
  const items: { feature: string; optionA: { value: string; highlight: boolean }; optionB: { value: string; highlight: boolean }; icon: string }[] = [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
  
  for (const line of lines) {
    // Match: - Feature | Option A | Option B | icon
    const match = line.replace('-', '').trim().match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)(?:\s*\|\s*(.+))?$/);
    if (match) {
      const [, feature, aVal, bVal, icon] = match;
      items.push({
        feature: feature.trim(),
        optionA: { 
          value: aVal.trim().replace(/[*✓]/, ''), 
          highlight: aVal.includes('✓') || aVal.includes('*')
        },
        optionB: { 
          value: bVal.trim().replace(/[*✓]/, ''), 
          highlight: bVal.includes('✓') || bVal.includes('*')
        },
        icon: icon?.trim() || '',
      });
    }
  }
  
  return items;
}

// ============================================================================
// Parse checklist items
// ============================================================================

function parseChecklistContent(content: string) {
  const items: { id: string; text: string; subtext: string }[] = [];
  const lines = content.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('- [') || line.startsWith('- ')) {
      const text = line.replace(/^- \[.\]\s*/, '').replace(/^- /, '');
      let subtext = '';
      
      // Check next line for subtext (indented)
      if (i + 1 < lines.length && lines[i + 1].match(/^\s{2,}/)) {
        subtext = lines[i + 1].trim();
        i++;
      }
      
      items.push({
        id: `item-${items.length}`,
        text,
        subtext,
      });
    }
    i++;
  }
  
  return items;
}

// ============================================================================
// Parse takeaways
// ============================================================================

function parseTakeawaysContent(content: string) {
  const items: { icon: string; title: string; description: string }[] = [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
  
  for (const line of lines) {
    // Match: - 🎯 Title: Description
    const match = line.replace('-', '').trim().match(/^(.+?)\s+(.+?):\s*(.+)$/);
    if (match) {
      items.push({
        icon: match[1],
        title: match[2],
        description: match[3],
      });
    }
  }
  
  return items;
}

// ============================================================================
// Render parsed blocks to components
// ============================================================================

interface EnhancedContentProps {
  content: string;
  className?: string;
}

export function EnhancedMarkdownContent({ content, className = '' }: EnhancedContentProps) {
  const blocks = useMemo(() => parseEnhancedMarkdown(content), [content]);
  
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'html':
            return (
              <div 
                key={i}
                className="prose prose-invert prose-lg max-w-none kb-article-prose
                  prose-headings:text-white prose-headings:font-semibold prose-headings:scroll-mt-28 prose-headings:tracking-tight
                  prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-2xl md:prose-h2:text-[1.65rem] prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-300/95 prose-p:leading-[1.75] prose-p:text-[1.0625rem]
                  prose-a:text-sky-400 prose-a:font-medium prose-a:no-underline hover:prose-a:text-sky-300 hover:prose-a:underline underline-offset-2
                  prose-strong:text-white prose-strong:font-semibold
                  prose-code:text-sky-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.9em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[#0c1018] prose-pre:border prose-pre:border-white/[0.07] prose-pre:rounded-xl prose-pre:shadow-inner
                  prose-blockquote:border-l-4 prose-blockquote:border-sky-500/50 prose-blockquote:bg-sky-500/[0.06] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-300
                  prose-table:text-sm prose-table:border-collapse
                  prose-th:text-gray-200 prose-th:bg-white/[0.06] prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold
                  prose-td:text-gray-400 prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-white/[0.06]
                  prose-li:text-gray-300 prose-li:marker:text-sky-500/80
                  prose-ul:my-4 prose-ol:my-4
                  prose-hr:border-white/10 prose-hr:my-10
                  prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            );
            
          case 'formula': {
            const { formula, variables, example } = parseFormulaContent(block.content);
            return (
              <FormulaCard
                key={i}
                title={block.props?.title || 'Formula'}
                formula={formula}
                variables={variables}
                example={example}
                icon={block.props?.icon}
              />
            );
          }
          
          case 'process': {
            const steps = parseProcessContent(block.content);
            return (
              <ProcessFlow
                key={i}
                title={block.props?.title || 'Process'}
                steps={steps}
              />
            );
          }
          
          case 'comparison': {
            const items = parseComparisonContent(block.content);
            return (
              <ComparisonTable
                key={i}
                title={block.props?.title || 'Comparison'}
                optionALabel={block.props?.a || 'Option A'}
                optionBLabel={block.props?.b || 'Option B'}
                items={items}
              />
            );
          }
          
          case 'checklist': {
            const checklistItems = parseChecklistContent(block.content);
            return (
              <Checklist
                key={i}
                title={block.props?.title || 'Checklist'}
                items={checklistItems}
                variant={block.props?.variant as any}
              />
            );
          }
          
          case 'takeaways': {
            const takeaways = parseTakeawaysContent(block.content);
            return <KeyTakeaways key={i} items={takeaways} />;
          }
          
          case 'warning':
            return (
              <WarningBox key={i} type={block.props?.type as any || 'warning'} title={block.props?.title || 'Note'}>
                {block.content}
              </WarningBox>
            );

          case 'analytics':
            return (
              <AnalyticsEmbed
                key={i}
                scriptSlug={block.props?.script}
                title={block.props?.title}
                params={block.props || {}}
              />
            );

          case 'scanner':
            return (
              <ScannerBlock
                key={i}
                pairs={block.props?.pairs}
                className="my-6"
              />
            );

          case 'ratings':
            return (
              <RatingsBlock
                key={i}
                exchange={block.props?.exchange}
                limit={block.props?.limit ? parseInt(block.props.limit) : undefined}
                className="my-6"
              />
            );

          case 'risk':
            return (
              <RiskBlock
                key={i}
                exchange={block.props?.exchange}
                strategy={block.props?.strategy}
                className="my-6"
              />
            );
          
          default:
            return <div key={i} dangerouslySetInnerHTML={{ __html: block.content }} />;
        }
      })}
    </div>
  );
}
