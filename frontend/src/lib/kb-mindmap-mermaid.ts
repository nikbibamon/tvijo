/**
 * Shared Mermaid mindmap text from KB entities (Mermaid 10.x).
 * FontAwesome ::icon(...) before labels breaks the mindmap parser; use plain outline nodes.
 */

export interface KbMindmapEntity {
  id?: string;
  name: string;
  type: string;
  importance: number;
}

export function sanitizeMindmapLabel(raw: string): string {
  return (
    raw
      .replace(/[\n\r]/g, " ")
      .replace(/["'`]/g, "")
      .replace(/[[\]{}:;|/\\<>@#&]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[()]/g, "")
      .slice(0, 120) || "Topic"
  );
}

/** Build mindmap diagram source for MermaidRenderer. */
export function kbEntitiesToMindmapMermaid(entities: KbMindmapEntity[]): string {
  if (!entities?.length) return "";

  const sorted = [...entities].sort((a, b) => b.importance - a.importance);
  const root = sorted[0];
  const children = sorted.slice(1, 8);

  const rootText = sanitizeMindmapLabel(root.name);
  let mermaid = `mindmap\n  root((${rootText}))\n`;

  children.forEach((child) => {
    mermaid += `    ${sanitizeMindmapLabel(child.name)}\n`;
  });

  return mermaid;
}
