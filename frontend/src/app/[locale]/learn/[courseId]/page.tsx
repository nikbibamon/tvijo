'use client';

/**
 * Course Detail Page — Lessons view with markdown-style content
 * Generation: GEN-PORTAL-002
 */

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { getVisibleCourseById, LEVEL_COLORS } from '@/data/courses';
import type { Lesson } from '@/data/courses';
import { parseLocale } from '@/i18n/config';

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const dataRows = tableRows.slice(2);
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-white/5">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-gray-300 font-semibold border-b border-white/10">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="border-b border-white/5">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-gray-400">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(c => c.trim() !== '');
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable();
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-semibold text-white mt-5 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('- **') || line.startsWith('- ')) {
      const text = line.slice(2);
      elements.push(
        <div key={i} className="flex gap-2 ml-2 mb-1">
          <span className="text-emerald-400 mt-1 shrink-0">•</span>
          <span className="text-gray-300 text-sm" dangerouslySetInnerHTML={{
            __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          }} />
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      const text = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={i} className="flex gap-2 ml-2 mb-1">
          <span className="text-emerald-400 font-mono text-sm shrink-0 w-5">{num}.</span>
          <span className="text-gray-300 text-sm" dangerouslySetInnerHTML={{
            __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          }} />
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-gray-300 text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        }} />
      );
    }
  }
  if (inTable) flushTable();

  return <div>{elements}</div>;
}

export default function CourseDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = parseLocale(pathname);
  const courseId = params.courseId as string;

  const course = getVisibleCourseById(courseId, locale);
  const [activeLesson, setActiveLesson] = useState(0);

  if (!course) {
    return (
      <div className="bm-page">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link href={`/${locale}/learn`} className="text-emerald-400 hover:underline">
            Back to Courses
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const levelStyle = LEVEL_COLORS[course.level];
  const hasLessons = course.lessons.length > 0;
  const currentLesson: Lesson | null = hasLessons ? course.lessons[activeLesson] : null;

  return (
    <div className="bm-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href={`/${locale}/learn`} className="hover:text-white transition-colors">Learn</Link>
          <span>/</span>
          <span className="text-gray-400">{course.title}</span>
        </nav>

        {/* Course Header */}
        <div className="bg-[#071d24]/80 rounded-2xl border border-emerald-400/15 p-8 mb-8">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${course.color}15` }}
            >
              {course.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <span className={`${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                  {course.level}
                </span>
              </div>
              <p className="text-gray-400 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{course.lessons.length} lessons</span>
                <span>{course.category}</span>
                <div className="flex flex-wrap gap-1.5 ml-auto">
                  {course.topics.slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-gray-500">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!hasLessons ? (
          /* Coming Soon */
          <div className="bg-[#071d24]/80 rounded-2xl border border-emerald-400/15 p-12 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-2">Course Content Coming Soon</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We&apos;re working on creating high-quality lessons for this course. Check back soon!
            </p>
            <Link
              href={`/${locale}/learn`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:border-emerald-400/30 hover:text-white transition-colors"
            >
              Browse Other Courses
            </Link>
          </div>
        ) : (
          /* Course Content */
          <div className="flex gap-8">
            {/* Sidebar — Lesson List */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="bg-[#071d24]/80 rounded-2xl border border-emerald-400/15 p-4 sticky top-24">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Lessons</h3>
                <div className="space-y-1">
                  {course.lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                        idx === activeLesson
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono w-5 shrink-0 text-gray-600">{idx + 1}</span>
                        <span className="font-medium line-clamp-1">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-600 ml-7">{lesson.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Lesson Nav */}
              <div className="lg:hidden mb-4">
                <select
                  value={activeLesson}
                  onChange={(e) => setActiveLesson(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#071d24]/80 border border-emerald-400/15 rounded-xl text-sm text-white"
                >
                  {course.lessons.map((lesson, idx) => (
                    <option key={lesson.id} value={idx}>
                      {idx + 1}. {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {currentLesson && (
                <div className="bg-[#071d24]/80 rounded-2xl border border-emerald-400/15 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono px-2 py-0.5 bg-white/5 rounded text-gray-500">
                      Lesson {activeLesson + 1} of {course.lessons.length}
                    </span>
                    <span className="text-xs text-gray-600">{currentLesson.duration} read</span>
                  </div>
                  <MarkdownContent content={currentLesson.content} />

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                    <button
                      onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
                      disabled={activeLesson === 0}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:border-white/20 disabled:opacity-30 transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-600">
                      {activeLesson + 1} / {course.lessons.length}
                    </span>
                    <button
                      onClick={() => setActiveLesson(Math.min(course.lessons.length - 1, activeLesson + 1))}
                      disabled={activeLesson === course.lessons.length - 1}
                      className="px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-sm text-emerald-400 hover:bg-emerald-400/20 disabled:opacity-30 transition-all"
                    >
                      Next Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
