'use client';

/**
 * AI reference — the OpenRouter BYOK guide, read from the Knowledge Base.
 *
 * Two things this page got wrong before (spec 2026-09-workspace-data-and-design-pass §4.C):
 *
 * 1. It never sent `?lang=`, and the eight articles were seeded as Russian text
 *    under `base_language='en'`, so an English reader got English chrome around
 *    a Russian body. The articles now carry real `en`/`uk`/`ru` variants and
 *    this component asks for the reader's own language.
 * 2. It injected `content_html` directly while the backend was storing raw
 *    markdown (the `markdown` package was missing, so the renderer fell back to
 *    wrapping the source in a div). The backend is fixed; the guard for the
 *    regression is `manage.py rerender_kb_html --check`.
 *
 * The scoped stylesheet also used a lime-on-near-black palette left over from
 * an older theme, which made this the one workspace page that looked like a
 * different product. It now uses the same `--twk-*` tokens as everything else.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';

// Same-origin by default. This is a client component, so the fallback ends up
// in the browser bundle: a loopback URL here means every visitor's browser
// tries to reach ITS OWN port 8000, which Chrome now blocks outright as a
// private-network request ("Permission was denied for this request to access
// the `loopback` address space"). The relative path is resolved by the
// Next.js rewrite in next.config.js, which is what every other client service
// in this codebase uses.
const API_BASE = (
  process.env.NEXT_PUBLIC_DJANGO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '/api/v1'
).replace(/\/+$/, '');

/** Languages the KB actually stores translations for; others fall back to base. */
const KB_LANGS = ['en', 'ru', 'uk'];

function langQuery(locale: string, separator: '?' | '&'): string {
  // `en` is the canonical language, so asking for it is a no-op round trip.
  if (!KB_LANGS.includes(locale) || locale === 'en') return '';
  return `${separator}lang=${encodeURIComponent(locale)}`;
}

type RefArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  reading_time: number;
  content_type: string;
};

type RefDetail = {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  reading_time: number;
};

function fetchList(locale: string): Promise<RefArticle[]> {
  return fetch(
    `${API_BASE}/knowledge/articles/?category=ai-reference${langQuery(locale, '&')}`,
    { cache: 'no-store', headers: { Accept: 'application/json' } },
  ).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

function fetchDetail(slug: string, locale: string): Promise<RefDetail> {
  return fetch(
    `${API_BASE}/knowledge/articles/${slug}/${langQuery(locale, '?')}`,
    { cache: 'no-store', headers: { Accept: 'application/json' } },
  ).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

const PROSE_CSS = `
.twk-ref-list { display: grid; gap: 10px; padding: 16px; }
.twk-ref-item {
  width: 100%; text-align: left; cursor: pointer;
  display: grid; gap: 6px; padding: 14px 16px;
  border: 1px solid var(--twk-border); border-radius: 10px;
  background: var(--twk-panel-soft);
  transition: border-color 140ms ease, background 140ms ease;
}
.twk-ref-item:hover { border-color: var(--twk-violet-2); background: rgba(52, 211, 153, .05); }
.twk-ref-item:focus-visible { outline: 2px solid var(--twk-violet-2); outline-offset: 2px; }
.twk-ref-item-title { color: var(--twk-text); font-weight: 620; font-size: 14px; }
.twk-ref-item-excerpt { color: var(--twk-muted); font-size: 12.5px; line-height: 1.5; }
.twk-ref-item-meta {
  display: flex; align-items: center; gap: 8px;
  color: var(--twk-faint); font-size: 9px; font-weight: 730;
  letter-spacing: .1em; text-transform: uppercase;
}
.twk-ref-item-meta span:not(:first-child)::before { content: '· '; }

.twk-ref-back {
  padding: 0 0 12px; border: none; background: none; cursor: pointer;
  color: var(--twk-violet-2); font-size: 13px;
}
.twk-ref-back:hover { text-decoration: underline; }

.twk-ref-prose { padding: 20px 24px; color: var(--twk-text); line-height: 1.65; font-size: 14px; }
.twk-ref-prose h1, .twk-ref-prose h2, .twk-ref-prose h3 { color: var(--twk-text); margin: 1.2em 0 .5em; }
.twk-ref-prose h1 { font-size: 20px; }
.twk-ref-prose h2 { font-size: 17px; border-bottom: 1px solid var(--twk-border-soft); padding-bottom: .4em; }
.twk-ref-prose h3 { font-size: 15px; }
.twk-ref-prose p { margin: .6em 0; color: #c9d3e0; }
.twk-ref-prose code {
  padding: 1px 5px; border: 1px solid var(--twk-border); border-radius: 4px;
  background: var(--twk-panel-soft); color: #a7f3d0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px;
}
.twk-ref-prose pre {
  margin: 1em 0; padding: 12px; overflow-x: auto;
  border: 1px solid var(--twk-border); border-radius: 8px; background: #070c16;
}
.twk-ref-prose pre code { padding: 0; border: none; background: none; }
/* Wide tables scroll inside their own box; the page must never scroll sideways. */
.twk-ref-prose table {
  width: 100%; margin: 1em 0; border-collapse: collapse;
  font-size: 12.5px; display: block; overflow-x: auto;
}
.twk-ref-prose th, .twk-ref-prose td {
  padding: 8px 10px; border: 1px solid var(--twk-border); text-align: left;
}
.twk-ref-prose th { background: var(--twk-panel-soft); color: var(--twk-text); }
.twk-ref-prose td { color: #c9d3e0; }
.twk-ref-prose a { color: var(--twk-violet-2); }
.twk-ref-prose ul, .twk-ref-prose ol { margin: .6em 0 .6em 1.4em; color: #c9d3e0; }
.twk-ref-prose li { margin: .25em 0; }
.twk-ref-prose blockquote {
  margin: .8em 0; padding-left: 12px;
  border-left: 2px solid var(--twk-violet-2); color: var(--twk-muted);
}
.twk-ref-prose strong { color: var(--twk-text); }

@media (max-width: 640px) {
  .twk-ref-prose { padding: 16px; }
  .twk-ref-list { padding: 13px; }
}
`;

export default function WorkspaceReferenceLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).reference;
  // Re-fetch when the reader switches language: the list is language-specific.
  const list = useWorkspaceData(() => fetchList(locale), [locale]);
  const [article, setArticle] = useState<RefDetail | null>(null);
  const [lastSlug, setLastSlug] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const open = (slug: string) => {
    setLastSlug(slug);
    setDetailLoading(true);
    setDetailError(null);
    setArticle(null);
    fetchDetail(slug, locale)
      .then(setArticle)
      .catch((error) => setDetailError(error instanceof Error ? error.message : 'Request failed'))
      .finally(() => setDetailLoading(false));
  };

  if (article) {
    return (
      <div className="twk-admin-page">
        <header className="twk-admin-heading">
          <div>
            <p className="twk-eyebrow">{t.eyebrow}</p>
            <h1>{article.title}</h1>
          </div>
        </header>
        <button type="button" className="twk-ref-back" onClick={() => setArticle(null)}>
          ← {t.backToList}
        </button>
        <section
          className="twk-admin-panel twk-ref-prose"
          // Server-rendered markdown from our own seeded articles; no user input.
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
        <style>{PROSE_CSS}</style>
      </div>
    );
  }

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      {list.loading ? <WsSnippet kind="table" rows={3} /> : null}
      {list.error ? <WsError message={list.error} onRetry={list.reload} /> : null}
      {list.data && list.data.length === 0 ? (
        <WsEmpty title={t.emptyTitle} copy={t.emptyCopy} />
      ) : null}
      {list.data && list.data.length > 0 ? (
        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head">
            <div><h2>{t.listTitle}</h2></div>
          </header>
          <div className="twk-ref-list">
            {list.data.map((item) => (
              <button key={item.slug} type="button" className="twk-ref-item" onClick={() => open(item.slug)}>
                {/* content_type and reading_time already came from the API and
                    were dropped on the floor; they are the fastest way to tell
                    a quickstart from a roadmap note. */}
                <span className="twk-ref-item-meta">
                  <span>{item.content_type}</span>
                  {item.reading_time ? (
                    <span>{item.reading_time} {t.minutes}</span>
                  ) : null}
                </span>
                <span className="twk-ref-item-title">{item.title}</span>
                <span className="twk-ref-item-excerpt">{item.excerpt}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {detailLoading ? <WsSnippet kind="table" rows={2} /> : null}
      {detailError ? (
        <WsError message={detailError} onRetry={() => lastSlug && open(lastSlug)} />
      ) : null}

      <style>{PROSE_CSS}</style>
    </div>
  );
}
