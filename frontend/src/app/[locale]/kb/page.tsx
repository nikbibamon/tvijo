'use client';

/**
 * Knowledge Base — Home Page
 * Generation: GEN-KB-001
 *
 * Category grid + featured articles + recent articles.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { KBCategory, KBArticleListItem } from '@/types/knowledge';
import { DIFFICULTY_CONFIG, CONTENT_TYPE_CONFIG } from '@/types/knowledge';
import { kbCategoriesApi, kbArticlesApi } from '@/services/kb-api';
import { portalApiFetch } from '@/lib/portal-auth-fetch';

const ROLE_LABELS: Record<string, { label: string; labelRu: string; icon: string }> = {
  trader: { label: 'Trader', labelRu: 'Трейдер', icon: '📈' },
  investor: { label: 'Investor', labelRu: 'Инвестор', icon: '💰' },
  manager: { label: 'Manager', labelRu: 'Менеджер', icon: '📋' },
  devops: { label: 'DevOps', labelRu: 'DevOps', icon: '⚙️' },
  boss: { label: 'CEO / Founder', labelRu: 'CEO / Основатель', icon: '👔' },
  designer: { label: 'Designer', labelRu: 'Дизайнер', icon: '🎨' },
  admin_mod: { label: 'Admin', labelRu: 'Админ', icon: '🛡️' },
  architect: { label: 'Architect', labelRu: 'Архитектор', icon: '🏗️' },
  developer: { label: 'Developer', labelRu: 'Разработчик', icon: '💻' },
  data_analyst: { label: 'Data Analyst', labelRu: 'Аналитик данных', icon: '📊' },
  qa: { label: 'QA', labelRu: 'QA', icon: '✅' },
  content: { label: 'Content', labelRu: 'Контент', icon: '✍️' },
};

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

function CategoryCard({ category, locale }: { category: KBCategory; locale: string }) {
  const isRu = locale === 'ru';
  return (
    <Link
      href={`/${locale}/kb/${category.slug}`}
      className="group block bg-[#1a1f2e] rounded-xl border border-white/5 p-6 hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="text-3xl mb-3">{category.icon}</div>
      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
        {category.name}
      </h3>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{category.description}</p>
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span className="bg-white/5 px-2 py-1 rounded">
          {category.article_count} {isRu ? 'статей' : `article${category.article_count !== 1 ? 's' : ''}`}
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ article, locale }: { article: KBArticleListItem; locale: string }) {
  const isRu = locale === 'ru';
  const typeCfg = CONTENT_TYPE_CONFIG[article.content_type] || CONTENT_TYPE_CONFIG.article;
  return (
    <Link
      href={`/${locale}/kb/${article.category_slug}/${article.slug}`}
      className="group block bg-[#1a1f2e] rounded-xl border border-white/5 p-5 hover:border-blue-500/30 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{typeCfg.icon}</span>
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">{isRu ? typeCfg.labelRu : typeCfg.label}</span>
        {article.is_pinned && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">{isRu ? 'Закреплено' : 'Pinned'}</span>
        )}
      </div>
      <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={article.difficulty} isRu={isRu} />
        <span className="text-[11px] text-gray-500">{article.reading_time} {isRu ? 'мин' : 'min read'}</span>
        <span className="text-[11px] text-gray-600">•</span>
        <span className="text-[11px] text-gray-500">{article.category_icon} {article.category_name}</span>
        {article.view_count > 0 && (
          <>
            <span className="text-[11px] text-gray-600">•</span>
            <span className="text-[11px] text-gray-500">{article.view_count} {isRu ? 'просмотров' : 'views'}</span>
          </>
        )}
      </div>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag.slug} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function KnowledgeBasePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [featured, setFeatured] = useState<KBArticleListItem[]>([]);
  const [recent, setRecent] = useState<KBArticleListItem[]>([]);
  const [popular, setPopular] = useState<KBArticleListItem[]>([]);
  const [forMe, setForMe] = useState<KBArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KBArticleListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeRole, setActiveRole] = useState('');
  const [categorySort, setCategorySort] = useState<'custom' | 'name' | 'article_count' | 'newest' | 'oldest'>('article_count');
  const [articleSort, setArticleSort] = useState<'newest' | 'popular' | 'updated'>('newest');

  // Detect user role from profile API (refresh JWT on 401)
  useEffect(() => {
    async function detectRole() {
      if (!localStorage.getItem('access_token')) return;
      try {
        const data = await portalApiFetch<{ platform_role?: string }>('/auth/me/');
        if (data.platform_role) setActiveRole(data.platform_role);
      } catch {}
    }
    detectRole();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [cats, feat, rec, pop] = await Promise.all([
          kbCategoriesApi.list(categorySort, locale),
          kbArticlesApi.featured(locale),
          kbArticlesApi.list({ sort: articleSort }, locale),
          kbArticlesApi.popular(6, locale),
        ]);
        setCategories(Array.isArray(cats) ? cats : (cats as any)?.results || []);
        setFeatured(Array.isArray(feat) ? feat : []);
        const recArray = Array.isArray(rec) ? rec : (rec as any)?.results || [];
        setRecent(recArray.slice(0, 6));
        setPopular(Array.isArray(pop) ? pop : []);
      } catch (e) {
        console.error('Failed to load KB data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySort, articleSort, locale]);

  // Fetch role-filtered articles
  useEffect(() => {
    if (!activeRole) { setForMe([]); return; }
    kbArticlesApi.forMe(activeRole, undefined, 6, locale)
      .then(d => setForMe(Array.isArray(d) ? d : []))
      .catch(() => setForMe([]));
  }, [activeRole, locale]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await kbArticlesApi.list({ q: searchQuery }, locale);
        setSearchResults(Array.isArray(results) ? results : (results as any)?.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, locale]);

  if (loading) {
    return (
      <div className="bm-page-muted flex items-center justify-center">
        <div className="animate-pulse text-gray-400">{locale === 'ru' ? 'Загрузка базы знаний...' : 'Loading Knowledge Base...'}</div>
      </div>
    );
  }

  const isRu = locale === 'ru';
  const isUk = locale === 'uk';

  return (
    <div className="bm-page-muted">
      {/* AIRADAR learning introduction */}
      <section className="relative overflow-hidden border-b border-sky-300/10 bg-[radial-gradient(ellipse_at_80%_10%,rgba(37,99,235,.18),transparent_42%),linear-gradient(135deg,#07162b,#0a1a30_65%,#0e2748)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" /> AIRADAR · Learn
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {isRu ? 'База знаний Tvijo' : isUk ? 'База знань Tvijo' : 'Tvijo Knowledge Base'}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {isRu
                ? 'Практические материалы об AI, проверке источников, ответственном внедрении и принятии решений. Начните с учебного маршрута AIRADAR для вашей аудитории.'
                : isUk
                  ? 'Практичні матеріали про AI, перевірку джерел, відповідальне впровадження та ухвалення рішень. Почніть із навчального маршруту AIRADAR для вашої аудиторії.'
                  : 'Practical guides to AI, source checking, responsible adoption, and decision-making. Start with the AIRADAR learning path for your audience.'}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              {isRu ? 'Все 17 уроков AIRADAR доступны на английском, русском и украинском языках.' : isUk ? 'Усі 17 уроків AIRADAR доступні англійською, російською та українською мовами.' : 'All 17 AIRADAR lessons are available in English, Russian, and Ukrainian.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={'/' + locale + '/kb/airadar-learning'} className="rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-[#05182c] transition hover:bg-sky-200">
                {isRu ? 'Открыть AIRADAR Learning' : isUk ? 'Відкрити AIRADAR Learning' : 'Open AIRADAR Learning'} →
              </Link>
              <Link href={'/' + locale + '/learn'} className="rounded-xl border border-sky-200/20 bg-sky-300/5 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/10">
                {isRu ? 'Выбрать учебный маршрут' : isUk ? 'Обрати навчальний маршрут' : 'Choose a learning path'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">AIRADAR · Bunny Top · market spotlight</p>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              {isRu ? 'Учитесь по своему маршруту' : isUk ? 'Навчайтеся за своїм маршрутом' : 'Learn along your path'}
            </h2>
          </div>
          <Link href={'/' + locale + '/ai-radar'} className="text-xs font-medium text-sky-200 underline decoration-sky-300/40 underline-offset-4 hover:text-white">
            {isRu ? 'Открыть датированные данные AIRADAR' : isUk ? 'Відкрити датовані дані AIRADAR' : 'Open dated AIRADAR data'} ↗
          </Link>
        </div>
        <p className="mb-4 max-w-3xl text-xs leading-5 text-slate-500">
          {isRu ? 'Популярность по токенам OpenRouter — рыночный сигнал, а не оценка качества ответов.' : isUk ? 'Популярність за токенами OpenRouter — ринковий сигнал, а не оцінка якості відповідей.' : 'OpenRouter token popularity is a market signal; it does not measure answer quality.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: '🧭', label: isRu ? '7 класс · 12–14 лет' : isUk ? '7 клас · 12–14 років' : 'Grade 7 · ages 12–14', slug: 'airadar-ask-a-useful-question' },
            { icon: '🔎', label: isRu ? '9–11 классы · 15–17 лет' : isUk ? '9–11 класи · 15–17 років' : 'Grades 9–11 · ages 15–17', slug: 'airadar-source-notebook' },
            { icon: '🎓', label: isRu ? 'Студенты' : isUk ? 'Студенти' : 'Students', slug: 'airadar-research-to-brief' },
            { icon: '🧩', label: isRu ? 'Менеджеры' : isUk ? 'Менеджери' : 'Managers', slug: 'airadar-delegate-with-acceptance' },
            { icon: '🏛️', label: isRu ? 'Руководители' : isUk ? 'Керівники' : 'Leaders', slug: 'airadar-ai-adoption-pilot' },
            { icon: '🌐', label: isRu ? 'Госслужащие' : isUk ? 'Держслужбовці' : 'Public servants', slug: 'airadar-public-service-pilot' },
          ].map((path) => (
            <Link key={path.slug} href={'/' + locale + '/kb/airadar-learning/' + path.slug} className="group flex items-center gap-3 rounded-xl border border-blue-200/10 bg-[#091a30] p-4 transition hover:border-sky-300/35 hover:bg-[#0c2039]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-lg">{path.icon}</span>
              <span className="min-w-0 flex-1 text-sm font-medium text-slate-200">{path.label}</span>
              <span className="text-sky-300 transition group-hover:translate-x-0.5" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={'/' + locale + '/bubbles'} className="rounded-lg border border-blue-200/10 bg-blue-400/5 px-3 py-2 text-xs text-sky-200 transition hover:bg-blue-400/10">🫧 Tvijo Bubbles</Link>
          <Link href={'/' + locale + '/bundles'} className="rounded-lg border border-blue-200/10 bg-blue-400/5 px-3 py-2 text-xs text-sky-200 transition hover:bg-blue-400/10">🎯 {isRu ? 'Бандлы решений' : isUk ? 'Пакети рішень' : 'Decision Bundles'}</Link>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-white/5 bg-[#0f141e]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder={isRu ? 'Поиск статей, руководств, исследований...' : 'Search articles, guides, research...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search results overlay */}
      {searchQuery.trim() && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {searching ? (isRu ? 'Поиск...' : 'Searching...') : `${searchResults.length} ${isRu ? 'результат' : `result${searchResults.length !== 1 ? 's' : ''}`} ${isRu ? 'для' : 'for'} "${searchQuery}"`}
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          ) : !searching ? (
            <p className="text-gray-500">{isRu ? 'Статьи не найдены. Попробуйте другие ключевые слова.' : 'No articles found. Try different keywords.'}</p>
          ) : null}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Role filter bar */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-400">{isRu ? 'Фильтр по роли:' : 'Filter by role:'}</span>
            <button
              onClick={() => setActiveRole('')}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                !activeRole ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'
              }`}
            >
              {isRu ? 'Все' : 'All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ROLE_LABELS).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setActiveRole(prev => prev === key ? '' : key)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  activeRole === key
                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                    : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/[0.07]'
                }`}
              >
                <span>{icon}</span> {isRu ? ROLE_LABELS[key]?.labelRu || label : label}
              </button>
            ))}
          </div>
        </section>

        {/* Recommended for You */}
        {activeRole && forMe.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-orange-400">🎯</span> {isRu ? `Рекомендовано для ${ROLE_LABELS[activeRole]?.labelRu || 'Вас'}` : `Recommended for ${ROLE_LABELS[activeRole]?.label || 'You'}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forMe.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Onboarding CTA for non-role users */}
        {!activeRole && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-emerald-400/10 to-teal-400/10 border border-emerald-400/20 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-3xl">🎯</div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white font-semibold">{isRu ? 'Получите персональные рекомендации' : isUk ? 'Отримайте персональні рекомендації' : 'Get personalized recommendations'}</h3>
                <p className="text-sm text-gray-400 mt-1">{isRu ? 'Заполните профиль, чтобы видеть статьи, подобранные под вашу роль и уровень опыта.' : isUk ? 'Заповніть профіль, щоб бачити статті, підібрані під вашу роль і рівень досвіду.' : 'Complete your profile to see articles tailored to your role and experience level.'}</p>
              </div>
              <Link
                href={`/${locale}/onboarding`}
                className="px-5 py-2 bg-emerald-400 text-[#001b18] font-semibold text-sm rounded-lg hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 transition-all whitespace-nowrap"
              >
                {isRu ? 'Настроить профиль' : isUk ? 'Налаштувати профіль' : 'Set Up Profile'}
              </Link>
            </div>
          </section>
        )}

        {/* Tools & Features */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-gray-400">🛠️</span> {isRu ? 'Инструменты и функции' : 'Tools & Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Knowledge Bubbles */}
            <Link
              href={`/${locale}/bubbles`}
              className="block bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">🫧</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{isRu ? 'База знаний Bubbles' : 'Knowledge Bubbles'}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRu ? 'Интерактивные карты знаний и связей. Стройте визуальные карты вокруг своих знаний.' : 'Interactive knowledge and relationship maps. Build visual maps around your knowledge.'}
                  </p>
                </div>
                <span className="text-cyan-400 text-sm shrink-0">→</span>
              </div>
            </Link>
            {/* Decision Map */}
            <Link
              href={`/${locale}/decmap`}
              className="block bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎯</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{isRu ? 'Карта решений' : 'Decision Map'}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRu ? 'Управляемые задачи, выбор и AI-промпты — личный поток решений (ник + API).' : 'Guided tasks, choices, and AI prompts — personal decision flow (nick + API).'}
                  </p>
                </div>
                <span className="text-emerald-400 text-sm shrink-0">→</span>
              </div>
            </Link>
            {/* FAQ */}
            <Link
              href={`/${locale}/faq`}
              className="block bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">❓</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-amber-400 transition-colors">FAQ</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRu ? 'Часто задаваемые вопросы о платформе, функциях и использовании.' : 'Frequently asked questions about the platform, features, and usage.'}
                  </p>
                </div>
                <span className="text-amber-400 text-sm shrink-0">→</span>
              </div>
            </Link>
            {/* Changelog */}
            <Link
              href={`/${locale}/changelog`}
              className="block bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">📋</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{isRu ? 'Список изменений' : 'Changelog'}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRu ? 'Отслеживайте последние обновления, новые функции и улучшения платформы.' : 'Track recent updates, new features, and platform improvements.'}
                  </p>
                </div>
                <span className="text-blue-400 text-sm shrink-0">→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="mb-14">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-blue-400">📂</span> {isRu ? 'Просмотр по категориям' : 'Browse by Category'}
            </h2>
            <select
              value={categorySort}
              onChange={(e) => setCategorySort(e.target.value as 'custom' | 'name' | 'article_count' | 'newest' | 'oldest')}
              className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50"
            >
              <option value="article_count">{isRu ? 'Больше статей' : 'Most articles'}</option>
              <option value="newest">{isRu ? 'Новые категории' : 'Newest categories'}</option>
              <option value="name">{isRu ? 'Название А-Я' : 'Name A-Z'}</option>
              <option value="custom">{isRu ? 'Свой порядок' : 'Custom order'}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} locale={locale} />
            ))}
          </div>
        </section>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-yellow-400">⭐</span> {isRu ? 'Избранные статьи' : 'Featured Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recent.length > 0 && (
          <section className="mb-14">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-green-400">🕐</span> {isRu ? 'Последние обновления' : 'Latest Updates'}
              </h2>
              <select
                value={articleSort}
                onChange={(e) => setArticleSort(e.target.value as 'newest' | 'popular' | 'updated')}
                className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50"
              >
                <option value="newest">{isRu ? 'Сначала новые' : 'Newest first'}</option>
                <option value="updated">{isRu ? 'Недавно обновлённые' : 'Recently updated'}</option>
                <option value="popular">{isRu ? 'Самые просматриваемые' : 'Most viewed'}</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Articles */}
        {popular.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-orange-400">🔥</span> {isRu ? 'Самые популярные' : 'Most Popular'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popular.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Stats banner */}
        <section className="mb-14 bg-[#1a1f2e] rounded-2xl border border-white/5 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-gray-500 mt-1">{isRu ? 'Категории' : 'Categories'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{featured.length + recent.length + popular.length > 0 ? '15+' : '0'}</div>
              <div className="text-sm text-gray-500 mt-1">{isRu ? 'Статей' : 'Articles'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">6</div>
              <div className="text-sm text-gray-500 mt-1">{isRu ? 'Типов контента' : 'Content Types'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{isRu ? 'Бесплатно' : 'Free'}</div>
              <div className="text-sm text-gray-500 mt-1">{isRu ? 'Уровень доступа' : 'Access Level'}</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10 border-t border-white/5">
          <p className="text-gray-400 mb-4">
            {isRu ? "Есть вопрос или тема, которую хотите обсудить?" : "Have a question or topic you'd like covered?"}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            💬 {isRu ? 'Спросите нашего AI-ассистента' : 'Ask Our AI Assistant'}
          </Link>
        </section>
      </div>
    </div>
  );
}
