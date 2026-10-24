'use client';

/**
 * Knowledge Base — Category Page
 * Generation: GEN-KB-001
 *
 * Lists all articles in a category with filtering by type and difficulty.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { KBCategory, KBArticleListItem, KBContentType, KBDifficulty } from '@/types/knowledge';
import { DIFFICULTY_CONFIG, CONTENT_TYPE_CONFIG } from '@/types/knowledge';
import { kbCategoriesApi, kbArticlesApi } from '@/services/kb-api';

// ============================================================================
// Sub-components
// ============================================================================

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

function ArticleRow({ article, locale }: { article: KBArticleListItem; locale: string }) {
  const isRu = locale === 'ru';
  const typeCfg = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.article;
  return (
    <Link
      href={`/${locale}/kb/${article.category_slug}/${article.slug}`}
      className="group flex gap-4 bg-[#1a1f2e] rounded-xl border border-white/5 p-5 hover:border-blue-500/30 transition-all duration-200"
    >
      <div className="flex-shrink-0 text-2xl mt-1">{typeCfg.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">{isRu ? typeCfg.labelRu : typeCfg.label}</span>
          {article.is_pinned && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">{isRu ? 'Закреплено' : 'Pinned'}</span>
          )}
          {article.is_featured && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{isRu ? 'Избранное' : 'Featured'}</span>
          )}
        </div>
        <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {article.title}
        </h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{article.excerpt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={article.difficulty} isRu={isRu} />
          <span className="text-[11px] text-gray-500">{article.reading_time} {isRu ? 'мин' : 'min read'}</span>
          <span className="text-[11px] text-gray-600">•</span>
          <span className="text-[11px] text-gray-500">{isRu ? 'автор' : 'by'} {article.author_name}</span>
          {article.view_count > 0 && (
            <>
              <span className="text-[11px] text-gray-600">•</span>
              <span className="text-[11px] text-gray-500">{article.view_count} {isRu ? 'просмотров' : 'views'}</span>
            </>
          )}
        </div>
        {article.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {article.tags.slice(0, 5).map((tag) => (
              <span key={tag.slug} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 hidden sm:flex items-center">
        <span className="text-gray-600 group-hover:text-blue-400 transition-colors text-lg">→</span>
      </div>
    </Link>
  );
}

// ============================================================================
// Filter Bar
// ============================================================================

const ALL_TYPES: { value: string; label: string; labelRu: string }[] = [
  { value: '', label: 'All Types', labelRu: 'Все типы' },
  { value: 'article', label: '📄 Article', labelRu: '📄 Статья' },
  { value: 'guide', label: '📖 Guide', labelRu: '📖 Руководство' },
  { value: 'research', label: '🔬 Research', labelRu: '🔬 Исследование' },
  { value: 'observation', label: '🔭 Observation', labelRu: '🔭 Наблюдение' },
  { value: 'analysis', label: '📊 Analysis', labelRu: '📊 Анализ' },
  { value: 'tutorial', label: '🎓 Tutorial', labelRu: '🎓 Туториал' },
  { value: 'roadmap', label: '🗺️ Roadmap', labelRu: '🗺️ Дорожная карта' },
];

const ALL_DIFFICULTIES: { value: string; label: string; labelRu: string }[] = [
  { value: '', label: 'All Levels', labelRu: 'Все уровни' },
  { value: 'beginner', label: 'Beginner', labelRu: 'Начальный' },
  { value: 'intermediate', label: 'Intermediate', labelRu: 'Средний' },
  { value: 'advanced', label: 'Advanced', labelRu: 'Продвинутый' },
  { value: 'expert', label: 'Expert', labelRu: 'Экспертный' },
];

// ============================================================================
// Main Page
// ============================================================================

export default function KBCategoryPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const categorySlug = params?.categorySlug as string;

  const [category, setCategory] = useState<KBCategory | null>(null);
  const [articles, setArticles] = useState<KBArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [cat, arts] = await Promise.all([
          kbCategoriesApi.get(categorySlug, locale),
          kbArticlesApi.list({ category: categorySlug }, locale),
        ]);
        setCategory(cat);
        setArticles(Array.isArray(arts) ? arts : (arts as any)?.results || []);
      } catch (e) {
        console.error('Failed to load category:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug, locale]);

  // Client-side filtering for instant UX
  const filtered = articles.filter((a) => {
    if (typeFilter && a.content_type !== typeFilter) return false;
    if (difficultyFilter && a.difficulty !== difficultyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bm-page-muted flex items-center justify-center">
        <div className="animate-pulse text-gray-400">{locale === 'ru' ? 'Загрузка...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bm-page-muted flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">{locale === 'ru' ? 'Категория не найдена' : 'Category not found'}</p>
        <Link href={`/${locale}/kb`} className="text-blue-400 hover:underline">
          ← {locale === 'ru' ? 'Назад в базу знаний' : 'Back to Knowledge Base'}
        </Link>
      </div>
    );
  }

  const isRu = locale === 'ru';

  return (
    <div className="bm-page-muted">
      {/* Header */}
      <section className="border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href={`/${locale}/kb`} className="hover:text-blue-400 transition-colors">
              {isRu ? 'База знаний' : 'Knowledge Base'}
            </Link>
            <span>/</span>
            <span className="text-gray-300">{category.name}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">{category.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {articles.length} {isRu ? 'статей' : `article${articles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            placeholder={isRu ? 'Поиск статей...' : 'Search articles...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            {ALL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{isRu ? t.labelRu : t.label}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            {ALL_DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{isRu ? d.labelRu : d.label}</option>
            ))}
          </select>
        </div>

        {/* Articles */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">{isRu ? 'Нет статей по вашим фильтрам.' : 'No articles match your filters.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((article) => (
              <ArticleRow key={article.id} article={article} locale={locale} />
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <Link href={`/${locale}/kb`} className="text-sm text-blue-400 hover:underline">
            ← {isRu ? 'Все категории' : 'All Categories'}
          </Link>
        </div>
      </div>
    </div>
  );
}
