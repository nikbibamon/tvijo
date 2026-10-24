'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { kbArticlesApi } from '@/services/kb-api';
import type { KBArticleListItem } from '@/types/knowledge';
import { getVisibleCourses, type Course } from '@/data/courses';

const MAX_ARTICLES = 3;
const MAX_COURSES = 3;

type LoadState = 'loading' | 'ready' | 'error';

function ArticleSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.035] p-5">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-3 h-4 w-full rounded bg-white/10" />
      <div className="mt-2 h-4 w-3/4 rounded bg-white/10" />
      <div className="mt-4 h-3 w-1/2 rounded bg-white/[0.06]" />
    </div>
  );
}

export default function KnowledgeLearnSection() {
  const { locale, t } = useLocale();
  const copy = t.home.knowledge;
  const [articles, setArticles] = useState<KBArticleListItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const courses: Course[] = getVisibleCourses(locale).slice(0, MAX_COURSES);

  useEffect(() => {
    let cancelled = false;
    // featured first, recent as a fallback so the section stays useful when
    // nothing is flagged featured. Never blocks the initial page render.
    kbArticlesApi
      .featured(locale)
      .then((featured) =>
        featured.length >= MAX_ARTICLES
          ? featured
          : kbArticlesApi.recent(MAX_ARTICLES, locale).then((recent) => {
              const seen = new Set(featured.map((a) => a.slug));
              return [...featured, ...recent.filter((a) => !seen.has(a.slug))];
            }),
      )
      .then((items) => {
        if (cancelled) return;
        setArticles(items.slice(0, MAX_ARTICLES));
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const showArticles = state === 'ready' && articles.length > 0;

  return (
    <section id="knowledge" className="bg-[#041922] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{copy.eyebrow}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">{copy.title}</h2>
          <p className="max-w-md text-sm leading-6 text-slate-400">{copy.subtitle}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Knowledge base articles — live Django data with explicit states */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <BookOpen className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {copy.articles}
              </h3>
              <Link
                href={`/${locale}/kb`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                {copy.viewAllArticles} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {state === 'loading' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            )}

            {state === 'error' && (
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.035] p-6 text-sm text-slate-400">
                {copy.error}{' '}
                <Link href={`/${locale}/kb`} className="font-semibold text-emerald-300 hover:text-emerald-200">
                  {copy.browseKb}
                </Link>
              </div>
            )}

            {state === 'ready' && articles.length === 0 && (
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.035] p-6 text-sm text-slate-400">
                {copy.empty}{' '}
                <Link href={`/${locale}/kb`} className="font-semibold text-emerald-300 hover:text-emerald-200">
                  {copy.browseKb}
                </Link>
              </div>
            )}

            {showArticles && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/${locale}/kb/${article.category_slug}/${article.slug}`}
                    className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.035] p-5 transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300/90">
                      {article.category_name}
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white group-hover:text-emerald-100">
                      {article.title}
                    </span>
                    {article.excerpt && (
                      <span className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{article.excerpt}</span>
                    )}
                    <span className="mt-auto pt-3 text-[11px] text-slate-500">
                      {article.reading_time > 0 ? `${article.reading_time} ${copy.minRead}` : copy.readArticle}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Learning paths — local catalog, no network dependency */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <GraduationCap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {copy.learningPaths}
              </h3>
              <Link
                href={`/${locale}/learn`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                {copy.viewAllCourses} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/${locale}/learn/${course.id}`}
                  className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <span className="text-xl" aria-hidden="true">{course.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white group-hover:text-emerald-100">
                      {course.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-400">
                      {course.description}
                    </span>
                    <span className="mt-1.5 block text-[11px] text-slate-500">
                      {course.lessons.length} {copy.lessons} · {course.level}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
