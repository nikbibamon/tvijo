'use client';

/**
 * Knowledge Base — Article Detail Page
 * Generation: GEN-KB-002
 *
 * Full article with rendered HTML, Table of Contents sidebar,
 * reading progress bar, share buttons, prev/next navigation,
 * related articles, and JSON-LD structured data for SEO.
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { KBArticleDetail, KBArticleListItem } from '@/types/knowledge';
import { DIFFICULTY_CONFIG, CONTENT_TYPE_CONFIG } from '@/types/knowledge';
import { kbArticlesApi, type KBComment } from '@/services/kb-api';
import { EnhancedMarkdownContent } from '@/components/kb/EnhancedMarkdownRenderer';
import { KbProseWithMermaid } from '@/components/kb/KbProseWithMermaid';
import KbArticleVisualEmbeds from '@/components/kb/KbArticleVisualEmbeds';
import { ArticleVisualExplorer } from '@/components/kb/ArticleVisualExplorer';
import { KbArticleStaffToolbar } from '@/components/kb/KbArticleStaffToolbar';
import { ArticleContent, EntityLegend } from '@/components/kb/ArticleContent';
import { KbArticleVisualHero } from '@/components/kb/KbArticleVisualHero';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ConnectedArticleGraph from '@/components/kb/ConnectedArticleGraph';

// ============================================================================
// Types
// ============================================================================

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Siblings {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

// ============================================================================
// Hooks
// ============================================================================

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return progress;
}

function slugifyHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function useTocFromHtml(html: string, md?: string): TocItem[] {
  return useMemo(() => {
    if (!html && !md) return [];
    const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi;
    const items: TocItem[] = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      items.push({
        level: parseInt(match[1], 10),
        id: match[2],
        text: match[3].replace(/<[^>]+>/g, ''),
      });
    }
    if (items.length === 0) {
      const fallback = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
      while ((match = fallback.exec(html)) !== null) {
        const text = match[2].replace(/<[^>]+>/g, '');
        items.push({
          level: parseInt(match[1], 10),
          id: slugifyHeadingId(text),
          text,
        });
      }
    }

    if (items.length === 0 && md) {
      const mdLines = md.split('\n');
      for (const line of mdLines) {
        const mdMatch = line.match(/^(#{2,3})\s+(.+?)\s*$/);
        if (!mdMatch) continue;
        const text = mdMatch[2].trim();
        const id = slugifyHeadingId(text);
        if (!id) continue;
        items.push({
          level: mdMatch[1].length,
          id,
          text,
        });
      }
    }
    return items;
  }, [html, md]);
}

// ============================================================================
// Sub-components
// ============================================================================

function ReadingProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-white/5">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function TocList({ items, activeId }: { items: TocItem[]; activeId: string }) {
  return (
    <ul className="space-y-1 border-l border-white/5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`block text-[13px] transition-colors border-l -ml-px py-1 ${
              item.level === 3 ? 'pl-6' : 'pl-4'
            } ${
              activeId === item.id
                ? 'text-blue-400 border-blue-400 font-medium'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function TableOfContents({ items, activeId, isRu }: { items: TocItem[]; activeId: string; isRu: boolean }) {
  if (items.length === 0) return null;
  return (
    <nav className="hidden xl:block w-64 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
          {isRu ? 'На этой странице' : 'On this page'}
        </h4>
        <TocList items={items} activeId={activeId} />
      </div>
    </nav>
  );
}

function MobileToc({ items, activeId, isRu }: { items: TocItem[]; activeId: string; isRu: boolean }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="xl:hidden mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 bg-[#1a1f2e] rounded-xl border border-white/5 text-sm text-gray-300 hover:border-blue-500/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {isRu ? 'На этой странице' : 'On this page'} ({items.length})
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 px-2 py-3 bg-[#1a1f2e] rounded-xl border border-white/5 max-h-64 overflow-y-auto">
          <TocList items={items} activeId={activeId} />
        </div>
      )}
    </div>
  );
}

function ShareButtons({ title, url, isRu }: { title: string; url: string; isRu: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [url]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">{isRu ? 'Поделиться:' : 'Share:'}</span>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" title={isRu ? 'Поделиться в X/Twitter' : 'Share on X/Twitter'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm">
        𝕏
      </a>
      <a href={telegramUrl} target="_blank" rel="noopener noreferrer" title={isRu ? 'Поделиться в Telegram' : 'Share on Telegram'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm">
        ✈
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title={isRu ? 'Поделиться в LinkedIn' : 'Share on LinkedIn'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm">
        in
      </a>
      <button onClick={copyLink} title={isRu ? 'Копировать ссылку' : 'Copy link'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm">
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  );
}

function DifficultyBadge({ difficulty, isRu }: { difficulty: string; isRu: boolean }) {
  const cfg = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];
  if (!cfg) return null;
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}
    >
      {isRu ? cfg.labelRu : cfg.label}
    </span>
  );
}

function AccessBadge({ level }: { level: string }) {
  if (level === 'free') return null;
  const colors: Record<string, string> = {
    basic: 'text-blue-400 bg-blue-500/10',
    premium: 'text-purple-400 bg-purple-500/10',
    pro: 'text-yellow-400 bg-yellow-500/10',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${colors[level] || ''}`}>
      {level.toUpperCase()}
    </span>
  );
}

function RelatedCard({ article, locale }: { article: KBArticleListItem; locale: string }) {
  const isRu = locale === 'ru';
  const typeCfg = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.article;
  return (
    <Link
      href={`/${locale}/kb/${article.category_slug}/${article.slug}`}
      className="group block bg-[#1a1f2e] rounded-lg border border-white/5 p-4 hover:border-blue-500/30 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{typeCfg.icon}</span>
        <span className="text-[10px] text-gray-500 uppercase">{isRu ? typeCfg.labelRu : typeCfg.label}</span>
      </div>
      <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
        {article.title}
      </h4>
      <div className="mt-2 flex items-center gap-2">
        <DifficultyBadge difficulty={article.difficulty} isRu={isRu} />
        <span className="text-[10px] text-gray-500">{article.reading_time} {isRu ? 'мин' : 'min'}</span>
      </div>
    </Link>
  );
}

function PrevNextNav({ siblings, categorySlug, locale }: { siblings: Siblings; categorySlug: string; locale: string }) {
  const isRu = locale === 'ru';
  if (!siblings.prev && !siblings.next) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/5">
      {siblings.prev ? (
        <Link
          href={`/${locale}/kb/${categorySlug}/${siblings.prev.slug}`}
          className="group flex flex-col gap-1 p-4 bg-[#1a1f2e] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all"
        >
          <span className="text-[11px] text-gray-500">← {isRu ? 'Предыдущая' : 'Previous'}</span>
          <span className="text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {siblings.prev.title}
          </span>
        </Link>
      ) : <div />}
      {siblings.next ? (
        <Link
          href={`/${locale}/kb/${categorySlug}/${siblings.next.slug}`}
          className="group flex flex-col gap-1 p-4 bg-[#1a1f2e] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all text-right"
        >
          <span className="text-[11px] text-gray-500">{isRu ? 'Следующая' : 'Next'} →</span>
          <span className="text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {siblings.next.title}
          </span>
        </Link>
      ) : <div />}
    </div>
  );
}

function JsonLd({ article, locale }: { article: KBArticleDetail; locale: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author_name || 'Tvijo Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tvijo',
      url: 'https://tvijo.com',
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    ...(article.cover_image_url ? { image: [article.cover_image_url] } : {}),
    mainEntityOfPage: `https://tvijo.com/${locale}/kb/${article.category?.slug}/${article.slug}`,
    articleSection: article.category?.name,
    keywords: article.tags?.map((t) => t.name).join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ article, locale }: { article: KBArticleDetail; locale: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Knowledge Base',
        item: `https://tvijo.com/${locale}/kb`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category?.name,
        item: `https://tvijo.com/${locale}/kb/${article.category?.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function ArticleClient() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const categorySlug = params?.categorySlug as string;
  const articleSlug = params?.articleSlug as string;

  const [article, setArticle] = useState<KBArticleDetail | null>(null);
  const [siblings, setSiblings] = useState<Siblings>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress();

  // Likes & Comments state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState<KBComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [commentNick, setCommentNick] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);

  const isRu = locale === 'ru';
  const isUk = locale === 'uk';

  const reloadArticle = useCallback(async () => {
    const [data, sibs] = await Promise.all([
      kbArticlesApi.get(articleSlug, locale),
      kbArticlesApi.siblings(articleSlug, locale).catch(() => ({ prev: null, next: null })),
    ]);
    setArticle(data);
    setSiblings(sibs);
    setLikeCount(data.like_count || 0);
  }, [articleSlug, locale]);

  useEffect(() => {
    async function load() {
      try {
        await reloadArticle();
        const nick = typeof window !== 'undefined' ? localStorage.getItem('kb_nick') || '' : '';
        if (nick) setCommentNick(nick);
        kbArticlesApi.likeStatus(articleSlug, nick).then(s => setLiked(s.liked)).catch(() => {});
        kbArticlesApi.getComments(articleSlug).then(setComments).catch(() => {});
      } catch (e: any) {
        setError(e.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [articleSlug, reloadArticle]);

  useEffect(() => {
    if (!article || loading || window.location.hash !== '#article-top') return;
    document.getElementById('article-top')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [article, loading]);

  const handleLike = async () => {
    if (liking || !article) return;
    setLiking(true);
    try {
      const nick = commentNick || 'anon';
      const res = await kbArticlesApi.toggleLike(articleSlug, nick);
      setLiked(res.liked);
      setLikeCount(res.like_count);
    } catch { /* ignore */ }
    setLiking(false);
  };

  const handleComment = async () => {
    if (posting || !commentBody.trim() || !article) return;
    const nick = commentNick.trim();
    if (!nick) { alert(isRu ? 'Пожалуйста, введите ваше имя' : 'Please enter your name'); return; }
    setPosting(true);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('kb_nick', nick);
      const c = await kbArticlesApi.addComment(articleSlug, commentBody.trim(), nick, replyTo || undefined);
      if (replyTo) {
        setComments(prev => prev.map(top =>
          top.id === replyTo ? { ...top, replies: [...(top.replies || []), c] } : top
        ));
      } else {
        setComments(prev => [c, ...prev]);
      }
      setCommentBody('');
      setReplyTo(null);
    } catch { alert(isRu ? 'Не удалось отправить комментарий' : 'Failed to post comment'); }
    setPosting(false);
  };

  const tocItems = useTocFromHtml(article?.content_html || '', article?.content_md);

  // Update document title + OG meta tags
  useEffect(() => {
    if (!article) return;
    const title = `${article.meta_title || article.title} | Tvijo Knowledge Base`;
    document.title = title;
    const ogUrl = `https://tvijo.com/${locale}/kb/${article.category?.slug}/${article.slug}`;
    const desc = article.meta_description || article.excerpt || '';
    const metas: Record<string, string> = {
      'og:title': article.meta_title || article.title,
      'og:description': desc,
      'og:url': ogUrl,
      'og:type': 'article',
      'og:site_name': 'Tvijo',
      'twitter:card': 'summary_large_image',
      'twitter:title': article.meta_title || article.title,
      'twitter:description': desc,
      'article:published_time': article.published_at || '',
      'article:modified_time': article.updated_at || '',
      'article:section': article.category?.name || '',
      'article:tag': article.tags?.map((t) => t.name).join(',') || '',
    };
    if (article.cover_image_url) {
      metas['og:image'] = article.cover_image_url;
      metas['twitter:image'] = article.cover_image_url;
    }
    Object.entries(metas).forEach(([prop, content]) => {
      if (!content) return;
      const attr = prop.startsWith('og:') || prop.startsWith('article:') ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });
    // Also set description meta
    let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.setAttribute('name', 'description');
      document.head.appendChild(descEl);
    }
    descEl.setAttribute('content', desc);
  }, [article, locale]);

  // Intersection observer for active ToC heading
  useEffect(() => {
    if (!contentRef.current || tocItems.length === 0) return;
    const headings = contentRef.current.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    // Add IDs to headings that don't have them
    headings.forEach((h) => {
      if (!h.id) {
        h.id = slugifyHeadingId(h.textContent || '');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [tocItems, article]);

  if (loading) {
    return (
      <div className="bm-page">
        <Navbar />
        <div className="pt-24 px-4 max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-10 w-full max-w-2xl bg-white/10 rounded-lg" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-5/6 bg-white/5 rounded" />
          <div className="mt-10 space-y-3">
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-11/12 max-w-xl bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bm-page flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pt-24">
          <p className="text-gray-400">{error || (locale === 'ru' ? 'Статья не найдена' : 'Article not found')}</p>
          <Link href={`/${locale}/kb`} className="text-sky-400 hover:underline">
            ← {locale === 'ru' ? 'Назад в базу знаний' : 'Back to Knowledge Base'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const typeCfg = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.article;
  const publishDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const articleUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://tvijo.com/${locale}/kb/${categorySlug}/${articleSlug}`;
  const visualEmbeds = (article.visual_embeds || {}) as any;
  const visualBundleId =
    typeof visualEmbeds?.bundle_id === 'string' && visualEmbeds.bundle_id.trim()
      ? visualEmbeds.bundle_id
      : undefined;
  const visualBundleCtaLabel =
    typeof visualEmbeds?.bundle_cta_label === 'string' && visualEmbeds.bundle_cta_label.trim()
      ? visualEmbeds.bundle_cta_label
      : undefined;

  // Prefer `visual_embeds.bundle_id` because it is the deterministic CTA mapping we control.
  // Some legacy/auto-generated bundles may exist in `linked_bundles` and lead to wrong map.
  const primaryBundleId = visualBundleId || article.linked_bundles?.[0]?.id || '';
  const termCandidates = [
    ...(article.visualization_data?.seo_keywords || []),
    ...((article.visualization_data?.entities || []).map((e: any) => e?.name).filter(Boolean)),
  ].slice(0, 12);

  return (
    <div className="bm-page flex flex-col">
      <Navbar />

      {/* Reading progress — below fixed navbar */}
      <ReadingProgressBar progress={progress} />

      {/* SEO */}
      <JsonLd article={article} locale={locale} />
      <BreadcrumbJsonLd article={article} locale={locale} />

      {/* Header */}
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-sky-500/[0.07] via-[#080a0f] to-[#080a0f] pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href={`/${locale}/kb`} className="hover:text-blue-400 transition-colors">
              {isRu ? 'База знаний' : 'Knowledge Base'}
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/kb/${article.category?.slug}`}
              className="hover:text-blue-400 transition-colors"
            >
              {article.category?.name}
            </Link>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-[200px]">{article.title}</span>
          </nav>

          <KbArticleStaffToolbar
            locale={locale}
            articleSlug={articleSlug}
            articleId={article.id}
            onRegenerated={reloadArticle}
            savedContentProfile={
              article.visualization_data?.content_profile as Record<string, unknown> | undefined
            }
            savedPublicationHints={article.visualization_data?.publication_hints ?? null}
          />

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm">{typeCfg.icon}</span>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">{isRu ? typeCfg.labelRu : typeCfg.label}</span>
            <DifficultyBadge difficulty={article.difficulty} isRu={isRu} />
            <AccessBadge level={article.access_level} />
            {article.is_pinned && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">{isRu ? 'Закреплено' : 'Pinned'}</span>
            )}
          </div>

          {/* Title */}
          <h1 id="article-top" tabIndex={-1} className="scroll-mt-24 text-3xl md:text-[2.35rem] font-bold text-white leading-[1.15] tracking-tight max-w-4xl">
            {article.title}
          </h1>

          {/* Subtitle / excerpt */}
          {article.excerpt && (
            <p className="text-lg md:text-xl text-gray-400/95 mt-5 leading-relaxed max-w-3xl font-light border-l-2 border-sky-500/40 pl-4 md:pl-5">
              {article.excerpt}
            </p>
          )}


          {/* Author & date bar + share */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>{isRu ? 'Автор' : locale === 'uk' ? 'Автор' : 'By'} <span className="text-gray-300">{categorySlug === 'airadar-learning' && (!article.author_name || ['BibaMoney Team', 'Tvijo Team'].includes(article.author_name)) ? (locale === 'ru' ? 'Команда обучения Tvijo' : locale === 'uk' ? 'Команда навчання Tvijo' : 'Tvijo Learning Team') : article.author_name || 'Tvijo Team'}</span></span>
              {publishDate && <span>{isRu ? 'Опубликовано' : 'Published'} {publishDate}</span>}
              <span>{article.reading_time} {isRu ? 'мин' : 'min read'}</span>
              <span>{article.view_count} {isRu ? 'просмотров' : 'views'}</span>
              {article.target_roles && article.target_roles.length > 0 && (
                <span className="flex items-center gap-1">
                  {article.target_roles.map((r: string) => {
                    const icons: Record<string, string> = { trader:'📈', investor:'💰', manager:'📋', devops:'⚙️', boss:'👔', designer:'🎨', admin_mod:'🛡️', architect:'🏗️', developer:'💻', data_analyst:'📊', qa:'✅', content:'✍️' };
                    return <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{icons[r] || '👤'} {r}</span>;
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  liked
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30'
                }`}
              >
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{likeCount}</span>
              </button>
              <ShareButtons title={article.title} url={articleUrl} isRu={isRu} />
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/${locale}/kb?tag=${tag.slug}`}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content + ToC sidebar */}
      <div className="max-w-6xl mx-auto w-full min-w-0 px-4 sm:px-6 py-10 md:py-12 flex gap-10 lg:gap-12">
        {/* Main content */}
        <article className="flex-1 min-w-0" ref={contentRef}>
          {/* Mobile ToC */}
          <MobileToc items={tocItems} activeId={activeHeading} isRu={isRu} />

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c0f16]/90 backdrop-blur-sm shadow-[0_24px_80px_-20px_rgba(0,0,0,0.55)] p-5 sm:p-8 md:p-10">

            {/* 1. Visual Hero — numbered entity wheel + key takeaways (GEN-KB-HERO-VIZ-001) */}
            {article.visualization_data && (
              <KbArticleVisualHero
                title={article.title}
                summary={article.visualization_data.summary}
                entities={article.visualization_data.entities || []}
                structureType={article.visualization_data.structure_type}
                locale={locale}
              />
            )}

            {/* 2. Bubble map + Bundle CTAs */}
            <KbArticleVisualEmbeds
              visualEmbeds={{
                ...(article.visual_embeds || {}),
                bubble_map_id:
                  article.viz_override?.bubble_map_id ||
                  article.visualization_data?.config?.bubble_map_id ||
                  (article.visual_embeds as { bubble_map_id?: string } | undefined)?.bubble_map_id,
                bubble_cta_label: isRu
                  ? `Откройте ${article.title} в Bubbles`
                  : isUk
                    ? `Відкрийте ${article.title} у Bubbles`
                    : `Explore ${article.title} in Bubbles`,
                // Include first linked bundle if available
                bundle_id: visualBundleId || article.linked_bundles?.[0]?.id,
                bundle_cta_label: visualBundleCtaLabel || (article.linked_bundles?.[0]?.name
                  ? (isRu
                    ? `Пакет решений: ${article.linked_bundles?.[0]?.name}`
                    : isUk
                      ? `Пакет рішень: ${article.linked_bundles?.[0]?.name}`
                      : `Open Decision Bundle: ${article.linked_bundles?.[0]?.name}`)
                  : (isRu
                    ? `Изучите ${article.title} в пакете решений`
                    : isUk
                      ? `Дослідіть ${article.title} у пакеті рішень`
                      : `Explore ${article.title} in Decision Bundle`)),
              }}
              locale={locale}
            />

            {/* 3. AI Knowledge Explorer — inline preview (bubble iframe + mermaid + keywords) */}
            {article.visualization_data && (
              <>
                <ArticleVisualExplorer
                  articleSlug={articleSlug}
                  title={article.title}
                  entities={article.visualization_data.entities || []}
                  config={{
                    type: (article.viz_type === 'auto' ? article.visualization_data.structure_type : article.viz_type) as any,
                    structure_type: article.visualization_data.structure_type,
                    confidence: article.visualization_data.confidence,
                    bubble_map_id: article.viz_override?.bubble_map_id || article.visualization_data.config?.bubble_map_id || `kb-${articleSlug}`,
                  }}
                  visualEmbeds={{
                    bubble_map_id: article.viz_override?.bubble_map_id || `kb-${articleSlug}`,
                    bubble_cta_label: isRu
                      ? `Откройте ${article.title} в Bubbles`
                      : isUk
                        ? `Відкрийте ${article.title} у Bubbles`
                        : `Explore ${article.title} in Bubbles`,
                  }}
                  locale={locale}
                />
                <EntityLegend
                  entities={article.visualization_data.entities || []}
                  seoKeywords={article.visualization_data.seo_keywords || []}
                  locale={locale}
                />
                {primaryBundleId && termCandidates.length > 0 && (
                  <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                      {isRu ? 'Голосовать по терминам в связанном бандле' : 'Vote terms in linked bundle'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {termCandidates.map((term) => (
                        <Link
                          key={term}
                          href={`/${locale}/bundles?bundle=${encodeURIComponent(primaryBundleId)}&vote_term=${encodeURIComponent(term)}&from_article=${encodeURIComponent(article.title)}`}
                          className="text-xs px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
                        >
                          🗳 {term}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 4. Article text */}
            <ArticleContent
              contentHtml={article.content_html || ''}
              contentMd={article.content_md}
              seoKeywords={article.visualization_data?.seo_keywords || []}
              entities={article.visualization_data?.entities || []}
            />
          </div>

          {/* Prev / Next */}
          <PrevNextNav siblings={siblings} categorySlug={article.category?.slug || categorySlug} locale={locale} />
        </article>

        {/* Table of Contents sidebar */}
        <TableOfContents items={tocItems} activeId={activeHeading} isRu={isRu} />
      </div>

      {/* Footer section: related + links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 flex-1">
        <ConnectedArticleGraph article={article} locale={locale} />

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-white mb-4">{isRu ? 'Похожие статьи' : 'Related Articles'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {article.related_articles.map((rel) => (
                <RelatedCard key={rel.id} article={rel} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="mb-10 pt-8 border-t border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            💬 {isRu ? 'Комментарии' : 'Comments'}
            {comments.length > 0 && (
              <span className="text-sm text-gray-500 font-normal">({comments.length})</span>
            )}
          </h3>

          {/* Comment form */}
          <div className="bg-[#1a1f2e] rounded-xl border border-white/5 p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={commentNick}
                onChange={e => setCommentNick(e.target.value)}
                placeholder={isRu ? 'Ваше имя' : 'Your name'}
                className="flex-1 max-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              {replyTo && (
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  {isRu ? 'Отменить ответ ✕' : 'Cancel reply ✕'}
                </button>
              )}
            </div>
            <textarea
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              placeholder={replyTo ? (isRu ? 'Напишите ответ...' : 'Write a reply...') : (isRu ? 'Поделитесь мыслями...' : 'Share your thoughts...')}
              rows={3}
              maxLength={2000}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">{commentBody.length}/2000</span>
              <button
                onClick={handleComment}
                disabled={posting || !commentBody.trim() || !commentNick.trim()}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {posting ? (isRu ? 'Отправка...' : 'Posting...') : (isRu ? 'Отправить' : 'Post Comment')}
              </button>
            </div>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">{isRu ? 'Пока нет комментариев. Будьте первым!' : 'No comments yet. Be the first!'}</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="bg-[#1a1f2e] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-medium">
                        {c.author_name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{c.author_name}</span>
                      {c.is_pinned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">{isRu ? 'Закреплено' : 'Pinned'}</span>}
                    </div>
                    <span className="text-[11px] text-gray-600">
                      {new Date(c.created_at).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.body}</p>
                  <button
                    onClick={() => { setReplyTo(c.id); window.scrollTo({ top: document.querySelector('textarea')?.offsetTop || 0, behavior: 'smooth' }); }}
                    className="text-[11px] text-gray-500 hover:text-blue-400 mt-2"
                  >
                    {isRu ? 'Ответить' : 'Reply'}
                  </button>
                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l border-white/5 space-y-3">
                      {c.replies.map(r => (
                        <div key={r.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-medium">
                              {r.author_name[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-300">{r.author_name}</span>
                            <span className="text-[10px] text-gray-600">
                              {new Date(r.created_at).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 whitespace-pre-wrap">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-8 border-t border-white/5 text-sm">
          <Link
            href={`/${locale}/kb/${article.category?.slug}`}
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            ← {isRu ? 'Ещё в разделе' : 'More in'} {article.category?.name}
          </Link>
          <Link href={`/${locale}/kb`} className="text-gray-500 hover:text-sky-400 transition-colors">
            {isRu ? 'База знаний' : isUk ? 'База знань' : 'Knowledge Base'}
          </Link>
          <Link href={`/${locale}/decmap`} className="text-gray-500 hover:text-sky-400 transition-colors">
            {isRu ? 'Карта решений' : isUk ? 'Карта рішень' : 'Decision Map'}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
