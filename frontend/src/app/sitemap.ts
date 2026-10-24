import type { MetadataRoute } from 'next';
import connectedKnowledge from '@/data/connected-knowledge.json';
import {fetchPublicRelease} from '@/lib/tvijo-extension-release';
import { comparisons } from '@/data/compare';
import { solutions } from '@/data/solutions';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/config';
import { MARKETING_LOCALES, ENGLISH_ONLY_LOCALES } from '@/lib/seo/marketing';
import { fetchCatalog } from '@/services/seo-geo-api';
import { MODULE_SLUGS } from '@/data/module-slugs';
import { AGENT_SKILL_INDEX_LOCALES } from '@/data/agent-skills';

const BASE = 'https://tvijo.com';

// Reuse published KB records; unknown translation coverage must not create
// language duplicates. Existing curated locale URLs remain below.
export const revalidate = 3600;
const KB_MAX_PAGES = 5;
const KB_MAX_ITEMS = 1000;
const KB_LAST_GOOD_MS = 24 * 60 * 60 * 1000;
let lastKnowledgeSitemap: { at: number; pages: MetadataRoute.Sitemap } | undefined;

async function knowledgeSitemap(): Promise<MetadataRoute.Sitemap> {
  const apiBase = process.env.NEXT_PUBLIC_DJANGO_API_URL
    || process.env.NEXT_PUBLIC_API_URL || 'https://api.tvijo.com/api/v1';
  const feed = new URL(`${apiBase.replace(/\/$/, '')}/knowledge/articles/?lang=en`, BASE);
  const rows: Record<string, unknown>[] = [];
  const visited = new Set<string>();
  const deadline = Date.now() + 12000;
  let next: URL | null = feed;
  try {
    for (let page = 0; next && page < KB_MAX_PAGES; page += 1) {
      if (next.origin !== feed.origin || next.pathname !== feed.pathname || visited.has(next.href)) {
        throw new Error('Unexpected KB pagination');
      }
      visited.add(next.href);
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error('KB sitemap deadline');
      const response = await fetch(next.href, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(Math.min(3000, remaining)),
      });
      if (!response.ok) throw new Error('KB feed unavailable');
      const payload: unknown = await response.json();
      const object = payload && typeof payload === 'object' ? payload as Record<string, unknown> : null;
      const entries = Array.isArray(payload) ? payload : object?.results;
      if (!Array.isArray(entries)) throw new Error('Invalid KB feed');
      if (!entries.every(entry => entry !== null && typeof entry === 'object' && !Array.isArray(entry))) {
        throw new Error('Malformed KB article');
      }
      rows.push(...entries as Record<string, unknown>[]);
      if (rows.length > KB_MAX_ITEMS) throw new Error('KB sitemap item budget');
      next = !Array.isArray(payload) && typeof object?.next === 'string' && object.next
        ? new URL(object.next, next.href) : null;
    }
    if (next) throw new Error('KB sitemap page budget');
    if (!rows.length) throw new Error('Empty KB feed');
    const pages: MetadataRoute.Sitemap = [];
    const categories = new Map<string, Date | undefined>();
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const seen = new Set<string>();
    for (const row of rows) {
      const slug = typeof row.slug === 'string' ? row.slug : '';
      const category = typeof row.category_slug === 'string' ? row.category_slug : '';
      if (!slugPattern.test(slug) || !slugPattern.test(category)) {
        throw new Error('Invalid KB article path');
      }
      const url = `${BASE}/en/kb/${category}/${slug}`;
      if (seen.has(url)) continue;
      seen.add(url);
      // Source timestamps only: never imply that a request refreshed an article.
      const modified = [row.updated_at, row.published_at]
        .filter((value): value is string => typeof value === 'string')
        .map(value => new Date(value))
        .find(value => Number.isFinite(value.getTime()) && value.getTime() <= Date.now());
      pages.push({ url, ...(modified ? { lastModified: modified } : {}),
        changeFrequency: 'weekly', priority: 0.7 });
      const previous = categories.get(category);
      if (!categories.has(category) || (modified && (!previous || modified > previous))) {
        categories.set(category, modified);
      }
    }
    for (const [category, modified] of categories) {
      pages.push({ url: `${BASE}/en/kb/${category}`,
        ...(modified ? { lastModified: modified } : {}), changeFrequency: 'weekly', priority: 0.8 });
    }
    lastKnowledgeSitemap = { at: Date.now(), pages };
    return pages;
  } catch {
    console.warn('KB sitemap feed unavailable; preserving curated URLs and recent cached KB entries');
    return lastKnowledgeSitemap && Date.now() - lastKnowledgeSitemap.at <= KB_LAST_GOOD_MS
      ? lastKnowledgeSitemap.pages : [];
  }
}

const AGENT_FABRIC_KB_SLUGS = [
  'tvijo-agent-fabric-controlled-ai-workers',
  'collective-ai-engineering-workflow',
] as const;

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/kb', changeFrequency: 'daily', priority: 0.9 },
  { path: '/kb/ai-governance', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/kb/ai-governance/metr-agent-risk-monitorability-ai-os', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/kb/ai-governance/agent-risk-score-for-enterprise-ai', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/kb/ai-governance/monitorability-layer-for-frontier-agents', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/kb/ai-governance/ai-productivity-uplift-and-task-substitution', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/learn', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/finai', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/demo', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/scan', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/achievements', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/bubbles', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/bundles', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/decmap', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/market-intelligence', changeFrequency: 'daily', priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const knowledgePagesPromise = knowledgeSitemap();

  // Generate URLs for all locales
  const staticPages: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    const isDefault = locale === DEFAULT_LOCALE;
    for (const { path, changeFrequency, priority } of STATIC_PATHS) {
      staticPages.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority: isDefault ? priority : priority * 0.6,
      });
    }
  }

  // The open-source launch is authored in English and Russian. Other locale
  // routes intentionally canonicalize to English until translated.
  for (const locale of ['en', 'ru']) {
    staticPages.push({
      url: `${BASE}/${locale}/tools/ai-agent-readiness-audit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === 'en' ? 0.95 : 0.75,
    });
    staticPages.push({
      url: `${BASE}/${locale}/kb/ai-governance/ai-agent-governance-checklist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === 'en' ? 0.9 : 0.7,
    });
    for (const slug of AGENT_FABRIC_KB_SLUGS) {
      staticPages.push({
        url: `${BASE}/${locale}/kb/ai-governance/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: locale === 'en' ? 0.9 : 0.75,
      });
    }
  }

  // /ai-radar — daily-updated public radar with unique en + ru copy; the other
  // locales render English and are served noindex, so only en/ru are listed.
  // Spec: bibamoney-backend/specs/2026-09-ai-market-radar.md.
  const radarPages: MetadataRoute.Sitemap = [];
  for (const locale of MARKETING_LOCALES) {
    radarPages.push({
      url: `${BASE}/${locale}/ai-radar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: locale === DEFAULT_LOCALE ? 0.85 : 0.7,
    });
  }

  // /compare/* — English-only content, so only `en` is listed (addendum §2).
  const comparePages: MetadataRoute.Sitemap = [];
  for (const locale of ENGLISH_ONLY_LOCALES) {
    comparePages.push({
      url: `${BASE}/${locale}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    for (const c of comparisons) {
      comparePages.push({
        url: `${BASE}/${locale}/compare/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Marketing funnel — only the locales carrying unique copy (en, ru); the other
  // nine render English and are served noindex, so they stay out of the sitemap.
  // Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §2.
  const funnelPages: MetadataRoute.Sitemap = [];
  for (const locale of MARKETING_LOCALES) {
    const weight = locale === DEFAULT_LOCALE ? 1 : 0.85;
    funnelPages.push(
      {
        url: `${BASE}/${locale}/solutions`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8 * weight,
      },
      {
        url: `${BASE}/${locale}/proof`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8 * weight,
      },
      {
        url: `${BASE}/${locale}/security`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8 * weight,
      },
      {
        url: `${BASE}/${locale}/seo-geo`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9 * weight,
      },
      {
        url: `${BASE}/${locale}/domains`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8 * weight,
      },
      {
        url: `${BASE}/${locale}/crawler-policy`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.3 * weight,
      },
    );
    for (const s of solutions) {
      funnelPages.push({
        url: `${BASE}/${locale}/solutions/${s.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8 * weight,
      });
    }
  }

  // /agent-skills — public skill-pack showcase. Only the locales carrying unique
  // copy are listed; the rest render English under noindex (honest-indexing rule).
  // Spec: bibamoney-backend/specs/2026-08-hermes-skills-plugins-agents-roadmap.md,
  // «Решение по публичной витрине (одобрено 2026-08-31)».
  const agentSkillPages: MetadataRoute.Sitemap = [];
  for (const locale of AGENT_SKILL_INDEX_LOCALES) {
    agentSkillPages.push({
      url: `${BASE}/${locale}/agent-skills`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === DEFAULT_LOCALE ? 0.9 : 0.75,
    });
  }

  const modulePages: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    const isDefault = locale === DEFAULT_LOCALE;
    modulePages.push({
      url: `${BASE}/${locale}/modules`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: isDefault ? 0.9 : 0.6,
    });
    for (const slug of MODULE_SLUGS) {
      modulePages.push({
        url: `${BASE}/${locale}/modules/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: isDefault ? 0.8 : 0.5,
      });
    }
  }

  // Partner ecosystem pages live at the apex, non-localized (mutual backlink
  // target with bibamoney.com/partnership); /partners/terms/ is served by Django.
  const partnerPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/partners/terms/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Domain cards, but only the ones that passed the publication gate: a thin
  // or contested card is reachable by link and stays out of the index.
  // Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.7.
  const domainPages: MetadataRoute.Sitemap = [];
  const catalogue = await fetchCatalog({ page_size: 50, ordering: 'recent' }, 3600);
  for (const profile of catalogue?.results ?? []) {
    if (profile.coverage < 70 || profile.is_stale) continue;
    for (const locale of MARKETING_LOCALES) {
      domainPages.push({
        url: `${BASE}/${locale}/domains/${profile.slug}`,
        lastModified: profile.last_scanned_at ? new Date(profile.last_scanned_at) : now,
        changeFrequency: 'monthly',
        priority: locale === DEFAULT_LOCALE ? 0.6 : 0.5,
      });
    }
  }

  const knowledgePages = await knowledgePagesPromise;
  const pages = new Map([...staticPages, ...radarPages, ...partnerPages, ...comparePages, ...funnelPages,
    ...agentSkillPages, ...domainPages, ...modulePages].map(page => [page.url, page]));
  for (const page of knowledgePages) {
    // Keep curated metadata, but prefer the article's dated source over now.
    const existing = pages.get(page.url);
    pages.set(page.url, existing ? { ...existing, lastModified: page.lastModified } : page);
  }
  // Editorial source dates stay stable across rebuilds and status checks.
  for (const locale of ['en', 'ru']) {
    const entries = [{slug:'', verified_at:connectedKnowledge.verified_at}, ...connectedKnowledge.articles];
    for (const article of entries) {
      const url = `${BASE}/${locale}/knowledge${article.slug ? '/' + article.slug : ''}`;
      pages.set(url, {url, lastModified:new Date(article.verified_at), changeFrequency:'monthly', priority:0.6});
    }
  }
  const extensionRelease = await fetchPublicRelease();
  for (const locale of ['en', 'ru']) {
    const url = `${BASE}/${locale}/products/dshrem`;
    pages.set(url,{url,lastModified:new Date(extensionRelease?.asOf || connectedKnowledge.verified_at),changeFrequency:'weekly',priority:0.7});
  }
  return [...pages.values()];
}
