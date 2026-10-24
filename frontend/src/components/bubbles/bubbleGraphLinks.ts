/**
 * Связи для force-graph: d3-force мутирует link.source/target в объекты узлов.
 * Держим в React только { source: id, target: id } и при отдаче в граф — копии.
 */

export function linkEndpointId(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string' && v.length > 0) return v;
  if (typeof v === 'object' && v !== null && 'id' in (v as object)) {
    const id = (v as { id?: unknown }).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  return null;
}

/** Плоские рёбра по id; только если оба конца есть среди узлов. */
export function sanitizeLinksForGraph(
  nodeList: { id: string }[],
  rawLinks: { source?: unknown; target?: unknown }[]
): { source: string; target: string }[] {
  const ids = new Set(nodeList.map(n => n.id));
  const seen = new Set<string>();
  const out: { source: string; target: string }[] = [];

  for (const l of rawLinks) {
    const s = linkEndpointId(l.source);
    const t = linkEndpointId(l.target);
    if (!s || !t || s === t) continue;
    if (!ids.has(s) || !ids.has(t)) continue;
    const k = `${s}\0${t}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ source: s, target: t });
  }
  return out;
}

/**
 * Если в links_json пусто или бито, восстанавливает древовые рёбра из parent_id.
 */
export function mergeParentIdLinks(
  nodeList: { id: string; parent_id?: string | null }[],
  base: { source: string; target: string }[]
): { source: string; target: string }[] {
  const ids = new Set(nodeList.map(n => n.id));
  const seen = new Set(base.map(l => `${l.source}\0${l.target}`));
  const out = [...base];
  for (const n of nodeList) {
    const p = n.parent_id;
    if (!p || typeof p !== 'string') continue;
    if (!ids.has(p) || !ids.has(n.id)) continue;
    const k = `${p}\0${n.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ source: p, target: n.id });
  }
  return out;
}

/** Перед отправкой в API — только строковые id, без вложенных узлов. */
export function sanitizeLinksForApi(rawLinks: { source?: unknown; target?: unknown }[]): {
  source: string;
  target: string;
}[] {
  const seen = new Set<string>();
  const out: { source: string; target: string }[] = [];
  for (const l of rawLinks) {
    const s = linkEndpointId(l.source);
    const t = linkEndpointId(l.target);
    if (!s || !t || s === t) continue;
    const k = `${s}\0${t}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ source: s, target: t });
  }
  return out;
}
