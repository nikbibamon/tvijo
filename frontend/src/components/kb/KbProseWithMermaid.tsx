'use client';

/**
 * Wraps KB HTML body and renders Mermaid diagrams from:
 * - <pre><code class="language-mermaid">...</code></pre> (common markdown export)
 * - <pre class="mermaid">...</pre>
 */

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

let mermaidReady = false;

function initMermaidOnce() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
      darkMode: true,
      background: '#0f1117',
      primaryColor: '#2563eb',
      primaryTextColor: '#f3f4f6',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      lineColor: '#64748b',
      textColor: '#e5e7eb',
      mainBkg: '#111827',
      nodeBorder: '#3b82f6',
      clusterBkg: '#0f172a',
      titleColor: '#f8fafc',
    },
  });
  mermaidReady = true;
}

export function KbProseWithMermaid({
  contentKey,
  children,
}: {
  contentKey: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    initMermaidOnce();

    const toRemove: HTMLDivElement[] = [];

    root.querySelectorAll('pre code.language-mermaid').forEach((code) => {
      const pre = code.parentElement;
      if (!pre || pre.tagName !== 'PRE') return;
      const text = code.textContent?.trim() || '';
      if (!text) return;
      const div = document.createElement('div');
      div.className = 'mermaid my-8 flex justify-center overflow-x-auto';
      div.textContent = text;
      pre.replaceWith(div);
      toRemove.push(div);
    });

    root.querySelectorAll('pre.mermaid').forEach((pre) => {
      if (pre.querySelector('code')) return;
      const text = pre.textContent?.trim() || '';
      if (!text) return;
      const div = document.createElement('div');
      div.className = 'mermaid my-8 flex justify-center overflow-x-auto';
      div.textContent = text;
      pre.replaceWith(div);
    });

    const nodes = root.querySelectorAll<HTMLElement>('.mermaid');
    if (nodes.length === 0) return;

    (async () => {
      try {
        await mermaid.run({ nodes: Array.from(nodes) });
      } catch {
        /* invalid diagram */
      }
    })();
  }, [contentKey]);

  return <div ref={rootRef}>{children}</div>;
}
