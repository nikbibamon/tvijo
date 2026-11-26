/**
 * Server wrapper for /[locale]/learn. The page body is a client component, so this
 * file supplies its own title and canonical (the root layout pointed the canonical
 * at the locale home). The page carries unique EN/RU/UK copy; other locales render
 * English under noindex (honest-indexing rule, lib/seo/marketing.ts).
 */
import type { Metadata } from 'next';
import { marketingMetadata } from '@/lib/seo/marketing';
import LearnIndexClient from './LearnIndexClient';

const LEARN_LOCALES = ['en', 'ru', 'uk'] as const;

const COPY = {
  en: {
    title: 'Learn AI with Tvijo — 17 lessons, 6 audience paths',
    description: 'A practical learning library for young people, students, teams and public institutions: ask better questions, check sources and make responsible decisions with AI.',
    keywords: ['learn AI', 'AI lessons', 'AI literacy', 'source checking', 'responsible AI', 'Tvijo'],
  },
  ru: {
    title: 'Изучайте AI с Tvijo — 17 уроков, 6 маршрутов',
    description: 'Практическая библиотека для школьников, студентов, команд и государственных организаций: точные вопросы, проверка источников и ответственные решения с AI.',
    keywords: ['обучение AI', 'уроки AI', 'проверка источников', 'ответственный AI', 'Tvijo'],
  },
  uk: {
    title: 'Вивчайте AI з Tvijo — 17 уроків, 6 маршрутів',
    description: 'Практична бібліотека для школярів, студентів, команд і державних установ: точні запитання, перевірка джерел і відповідальні рішення з AI.',
    keywords: ['навчання AI', 'уроки AI', 'перевірка джерел', 'відповідальний AI', 'Tvijo'],
  },
} as const;

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const copy = COPY[(params.locale as keyof typeof COPY)] ?? COPY.en;
  return marketingMetadata({ locale: params.locale, path: '/learn', ...copy, indexIn: LEARN_LOCALES });
}

export default function LearnPage() {
  return <LearnIndexClient />;
}
