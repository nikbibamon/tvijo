'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import { parseLocale } from '@/i18n/config';
import Footer from '@/components/portal/Footer';
import { getVisibleCourses, LEVEL_COLORS } from '@/data/courses';
import type { Course } from '@/data/courses';

type Locale = 'en' | 'ru' | 'uk';
type Copy = {
  eyebrow: string; title: string; intro: string; count: string; paths: string;
  languages: string; choose: string; description: string; languageAvailability: string;
  open: string; radar: string; courseTitle: string; courseIntro: string;
  lessons: string; level: Record<'Beginner' | 'Intermediate' | 'Advanced', string>;
  bunnyTitle: string; bunnyNote: string; method: string;
};
const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Tvijo learning paths', title: 'Learn AI with AIRADAR',
    intro: 'A practical learning library for young people, students, teams, and public institutions. Ask better questions, check sources, and make responsible decisions with AI.',
    count: '17 lessons', paths: '6 audience paths', languages: 'English · Russian · Ukrainian',
    choose: 'Choose a starting point', description: 'Start with one short lesson, practice the method, and follow the links to go deeper.',
    languageAvailability: 'All 17 AIRADAR lessons are available in English, Russian, and Ukrainian.',
    open: 'Open lesson', radar: 'Explore AIRADAR', courseTitle: 'Explore Tvijo courses',
    courseIntro: 'AIRADAR learning paths sit alongside the existing course library.',
    lessons: 'lessons', level: { Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' },
    bunnyTitle: 'Bunny Top · market spotlight',
    bunnyNote: 'OpenRouter token popularity is a market signal; it does not measure answer quality.',
    method: 'What Tvijo teaches and why',
  },
  ru: {
    eyebrow: 'Учебные маршруты Tvijo', title: 'Изучайте AI с AIRADAR',
    intro: 'Практическая библиотека для школьников, студентов, команд и государственных организаций. Учитесь задавать точные вопросы, проверять источники и ответственно принимать решения с AI.',
    count: '17 уроков', paths: '6 маршрутов для разных аудиторий', languages: 'Английский · русский · украинский',
    choose: 'Выберите, с чего начать', description: 'Начните с короткого урока, примените метод и переходите по ссылкам к следующим темам.',
    languageAvailability: 'Все 17 уроков AIRADAR доступны на английском, русском и украинском языках.',
    open: 'Открыть урок', radar: 'Открыть AIRADAR', courseTitle: 'Курсы Tvijo',
    courseIntro: 'Маршруты AIRADAR дополняют существующую библиотеку курсов.',
    lessons: 'уроков', level: { Beginner: 'Начальный', Intermediate: 'Средний', Advanced: 'Продвинутый' },
    bunnyTitle: 'Bunny Top · обзор рынка',
    bunnyNote: 'Популярность по токенам OpenRouter — рыночный сигнал, а не оценка качества ответов.',
    method: 'Чему учит Tvijo и зачем',
  },
  uk: {
    eyebrow: 'Навчальні маршрути Tvijo', title: 'Вивчайте AI з AIRADAR',
    intro: 'Практична бібліотека для школярів, студентів, команд і державних установ. Вчіться ставити точні запитання, перевіряти джерела й відповідально ухвалювати рішення з AI.',
    count: '17 уроків', paths: '6 маршрутів для різних аудиторій', languages: 'Англійська · російська · українська',
    choose: 'Оберіть, з чого почати', description: 'Почніть із короткого уроку, застосуйте метод і переходьте до наступних тем.',
    languageAvailability: 'Усі 17 уроків AIRADAR доступні англійською, російською та українською мовами.',
    open: 'Відкрити урок', radar: 'Відкрити AIRADAR', courseTitle: 'Курси Tvijo',
    courseIntro: 'Маршрути AIRADAR доповнюють наявну бібліотеку курсів.',
    lessons: 'уроків', level: { Beginner: 'Початковий', Intermediate: 'Середній', Advanced: 'Просунутий' },
    bunnyTitle: 'Bunny Top · огляд ринку',
    bunnyNote: 'Популярність за токенами OpenRouter — ринковий сигнал, а не оцінка якості відповідей.',
    method: 'Чого навчає Tvijo і навіщо',
  },
};

// WHY titles are keyed by locale: the lesson links used to carry an English-only
// label, so /ru/learn and /uk/learn showed English article names (reported
// 2026-09-29). The slug is the KB article; the label is the site's own short copy.
type LessonLink = { slug: string; titles: Record<Locale, string> };
type Path = { icon: string; titles: Record<Locale, string>; notes: Record<Locale, string>; lessons: LessonLink[] };
const PATHS: Path[] = [
  {
    icon: '🧭', titles: { en: 'Grade 7 · ages 12–14', ru: '7 класс · 12–14 лет', uk: '7 клас · 12–14 років' },
    notes: { en: 'Ask a useful question, check an answer, then build a small verifiable project.', ru: 'Задайте полезный вопрос, проверьте ответ и создайте небольшой проверяемый проект.', uk: 'Поставте корисне запитання, перевірте відповідь і створіть невеликий проєкт, який можна перевірити.' },
    lessons: [
      { slug: 'airadar-ask-a-useful-question', titles: { en: 'Ask a useful question', ru: 'Задайте полезный вопрос', uk: 'Поставте корисне запитання' } },
      { slug: 'airadar-check-an-ai-answer', titles: { en: 'Check an AI answer', ru: 'Проверьте ответ ИИ', uk: 'Перевірте відповідь ШІ' } },
      { slug: 'airadar-verifiable-mini-project', titles: { en: 'Build a verifiable mini-project', ru: 'Сделайте проверяемый мини-проект', uk: 'Створіть проєкт, який можна перевірити' } },
    ],
  },
  {
    icon: '🔎', titles: { en: 'Grades 9–11 · ages 15–17', ru: '9–11 классы · 15–17 лет', uk: '9–11 класи · 15–17 років' },
    notes: { en: 'Compare answers, keep source notes, and read model rankings critically.', ru: 'Сравнивайте ответы, записывайте источники и критически читайте рейтинги моделей.', uk: 'Порівнюйте відповіді, занотовуйте джерела й критично читайте рейтинги моделей.' },
    lessons: [
      { slug: 'airadar-source-notebook', titles: { en: 'Keep a source notebook', ru: 'Ведите блокнот источников', uk: 'Ведіть записник джерел' } },
      { slug: 'airadar-compare-two-answers', titles: { en: 'Compare two answers', ru: 'Сравните два ответа', uk: 'Порівняйте дві відповіді' } },
      { slug: 'airadar-read-rankings', titles: { en: 'Read model rankings', ru: 'Читайте рейтинги моделей', uk: 'Читайте рейтинги моделей' } },
    ],
  },
  {
    icon: '🎓', titles: { en: 'Students & independent learners', ru: 'Студенты и самостоятельные ученики', uk: 'Студенти й самостійні учні' },
    notes: { en: 'Turn research into a brief, account for costs, and preserve checkable knowledge.', ru: 'Превращайте исследование в записку, считайте расходы и сохраняйте проверяемые знания.', uk: 'Перетворюйте дослідження на записку, рахуйте витрати й зберігайте знання, які можна перевірити.' },
    lessons: [
      { slug: 'airadar-research-to-brief', titles: { en: 'Turn research into a brief', ru: 'Превратите исследование в записку', uk: 'Перетворіть дослідження на записку' } },
      { slug: 'airadar-api-subscription-costs', titles: { en: 'Compare API and subscription costs', ru: 'Сравните расходы на API и подписку', uk: 'Порівняйте витрати на API і підписку' } },
      { slug: 'airadar-accepted-knowledge', titles: { en: 'Keep knowledge that can be checked', ru: 'Сохраняйте проверяемые знания', uk: 'Зберігайте знання, які можна перевірити' } },
    ],
  },
  {
    icon: '🧩', titles: { en: 'Managers & team leads', ru: 'Менеджеры и руководители команд', uk: 'Менеджери й керівники команд' },
    notes: { en: 'Delegate with clear acceptance criteria and define review boundaries.', ru: 'Ставьте понятные критерии приёмки задач и определяйте границы проверки.', uk: 'Визначайте критерії приймання завдань і межі перевірки.' },
    lessons: [
      { slug: 'airadar-delegate-with-acceptance', titles: { en: 'Delegate with acceptance criteria', ru: 'Делегируйте с критериями приёмки', uk: 'Делегуйте з критеріями приймання' } },
      { slug: 'airadar-automation-review-boundary', titles: { en: 'Set a review boundary', ru: 'Определите границу проверки', uk: 'Визначте межу перевірки' } },
      { slug: 'airadar-accepted-knowledge', titles: { en: 'Turn accepted work into knowledge', ru: 'Превратите принятую работу в знания', uk: 'Перетворіть прийняту роботу на знання' } },
    ],
  },
  {
    icon: '🏛️', titles: { en: 'Executives & organization leaders', ru: 'Руководители организаций', uk: 'Керівники організацій' },
    notes: { en: 'Plan responsible adoption, useful public content, and human review.', ru: 'Планируйте ответственное внедрение, полезные публикации и проверку человеком.', uk: 'Плануйте відповідальне впровадження, корисні матеріали й перевірку людиною.' },
    lessons: [
      { slug: 'airadar-ai-adoption-pilot', titles: { en: 'Plan an AI adoption pilot', ru: 'Спланируйте пилот по внедрению ИИ', uk: 'Сплануйте пілот із упровадження ШІ' } },
      { slug: 'airadar-people-first-seo', titles: { en: 'Make useful content for people', ru: 'Создавайте полезный контент для людей', uk: 'Створюйте корисний контент для людей' } },
      { slug: 'airadar-what-tvijo-teaches', titles: { en: 'What Tvijo teaches and why', ru: 'Чему учит Tvijo и зачем', uk: 'Чого навчає Tvijo і навіщо' } },
    ],
  },
  {
    icon: '🌐', titles: { en: 'Public servants & civic teams', ru: 'Госслужащие и общественные команды', uk: 'Держслужбовці й громадські команди' },
    notes: { en: 'Scope a public-service pilot and connect research responsibly.', ru: 'Определяйте рамки пилота для госуслуг и ответственно связывайте исследования.', uk: 'Визначайте межі пілота для держпослуг і відповідально поєднуйте дослідження.' },
    lessons: [
      { slug: 'airadar-public-service-pilot', titles: { en: 'Plan a public-service pilot', ru: 'Спланируйте пилот для госуслуг', uk: 'Сплануйте пілот для держпослуг' } },
      { slug: 'airadar-public-research-ecosystem', titles: { en: 'Build a public research network', ru: 'Постройте сеть публичных исследований', uk: 'Побудуйте мережу публічних досліджень' } },
      { slug: 'airadar-responsible-outreach', titles: { en: 'Use responsible outreach', ru: 'Ответственный аутрич', uk: 'Відповідальний аутрич' } },
    ],
  },
];

function CourseCard({ course, locale, copy }: { course: Course; locale: Locale; copy: Copy }) {
  const level = LEVEL_COLORS[course.level];
  return (
    <Link href={'/' + locale + '/learn/' + course.id} className="group rounded-2xl border border-blue-200/10 bg-[#091a30] p-5 transition hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-[#0c2039]">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-2xl">{course.icon}</span>
        <span className={level.bg + ' ' + level.text + ' border ' + level.border + ' rounded-full px-2.5 py-1 text-[10px]'}>{copy.level[course.level]}</span>
      </div>
      <h3 className="font-semibold text-white transition group-hover:text-sky-200">{course.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{course.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
        <span>{course.lessons.length} {copy.lessons}</span>
        <span className="font-medium text-sky-300">{copy.open} →</span>
      </div>
    </Link>
  );
}

export default function LearnPage() {
  const pathLocale = parseLocale(usePathname());
  const locale = (pathLocale === 'ru' || pathLocale === 'uk' ? pathLocale : 'en') as Locale;
  const copy = COPY[locale];
  const courses = getVisibleCourses(locale);

  return (
    <div className="min-h-screen bg-[#061326] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-sky-300/15 bg-[radial-gradient(ellipse_at_82%_22%,rgba(37,99,235,.24),transparent_42%),linear-gradient(135deg,#091a31_0%,#07162a_60%,#102747_100%)] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-sky-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" /> {copy.eyebrow} · AIRADAR
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{copy.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">{copy.intro}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {[copy.count, copy.paths, copy.languages].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs text-slate-300">{item}</span>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#learning-paths" className="rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-[#05182c] shadow-lg shadow-sky-500/10 transition hover:bg-sky-200">{copy.choose} ↓</a>
                <Link href={'/' + locale + '/ai-radar'} className="rounded-xl border border-sky-200/25 bg-blue-400/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-200/50 hover:bg-blue-400/20">{copy.radar} ↗</Link>
              </div>
            </div>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-[1.6rem] border border-sky-200/20 bg-[#071a31] shadow-2xl shadow-blue-950/60">
              <Image src="/images/airadar-learning/airadar-hero-clean.png" alt="" fill priority sizes="(max-width: 1024px) 90vw, 480px" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07182d]/10 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-[#071326]/80 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm">Learn · practice · verify</div>
            </div>
          </div>
        </section>

        <section id="learning-paths" className="scroll-mt-24 pt-16">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">AIRADAR · Learn</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{copy.choose}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{copy.description}</p>
            </div>
            <p className="max-w-sm text-xs leading-5 text-slate-500">{copy.languageAvailability}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PATHS.map((path, index) => (
              <article key={path.titles.en} className="group relative overflow-hidden rounded-2xl border border-blue-200/10 bg-[#091a30] p-5 transition hover:border-sky-300/35 hover:bg-[#0b203a]">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-sky-400/10" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-300/15 bg-sky-400/10 text-xl">{path.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-sky-300">Path 0{index + 1}</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{path.titles[locale]}</h3>
                    </div>
                  </div>
                  <p className="mt-4 min-h-10 text-sm leading-6 text-slate-400">{path.notes[locale]}</p>
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {path.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link href={'/' + locale + '/kb/airadar-learning/' + lesson.slug} className="inline-flex items-start gap-2 text-sm text-slate-300 transition hover:text-sky-200">
                          <span className="mt-0.5 text-sky-400" aria-hidden="true">↗</span><span>{lesson.titles[locale]}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-gradient-to-r from-cyan-400/[.08] to-blue-500/[.06] p-5 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">{copy.bunnyTitle}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{copy.bunnyNote}</p>
            </div>
            <Link href={'/' + locale + '/ai-radar'} className="mt-3 inline-flex shrink-0 rounded-xl border border-sky-200/25 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 sm:mt-0">{copy.radar} →</Link>
          </div>
          <Link href={'/' + locale + '/kb/airadar-learning/airadar-what-tvijo-teaches'} className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-200/10 bg-[#091a30] p-5 transition hover:border-blue-200/30 sm:flex-row sm:items-center sm:justify-between">
            <span><span className="block text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">AIRADAR · method</span><span className="mt-1 block font-semibold text-white">{copy.method}</span></span>
            <span className="shrink-0 text-sm font-semibold text-sky-200">{copy.open} →</span>
          </Link>
        </section>

        {courses.length > 0 && (
          <section className="pt-16">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Tvijo learning library</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{copy.courseTitle}</h2>
              <p className="mt-2 text-sm text-slate-400">{copy.courseIntro}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => <CourseCard key={course.id} course={course} locale={locale} copy={copy} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
