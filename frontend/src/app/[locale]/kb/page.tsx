/**
 * Server wrapper for /[locale]/kb: its own title and canonical instead of the locale
 * home. Category and article routes keep their own metadata. The index carries unique
 * EN/RU/UK copy; other locales render English under noindex (honest-indexing rule).
 */
import type { Metadata } from 'next';
import { marketingMetadata } from '@/lib/seo/marketing';
import KbIndexClient from './KbIndexClient';

const KB_LOCALES = ['en', 'ru', 'uk'] as const;

const COPY = {
  en: {
    title: 'Tvijo Knowledge Base — practical AI guides',
    description: 'Practical guides to AI, source checking, responsible adoption and decision-making, with Tvijo learning paths for each audience.',
    keywords: ['AI knowledge base', 'AI guides', 'AI governance', 'source checking', 'Tvijo'],
  },
  ru: {
    title: 'База знаний Tvijo — практические руководства по AI',
    description: 'Практические материалы об AI, проверке источников, ответственном внедрении и принятии решений, с учебными маршрутами Tvijo.',
    keywords: ['база знаний AI', 'руководства по AI', 'управление AI', 'проверка источников', 'Tvijo'],
  },
  uk: {
    title: 'База знань Tvijo — практичні посібники з AI',
    description: 'Практичні матеріали про AI, перевірку джерел, відповідальне впровадження та ухвалення рішень, з навчальними маршрутами Tvijo.',
    keywords: ['база знань AI', 'посібники з AI', 'управління AI', 'перевірка джерел', 'Tvijo'],
  },
} as const;

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const copy = COPY[(params.locale as keyof typeof COPY)] ?? COPY.en;
  return marketingMetadata({ locale: params.locale, path: '/kb', ...copy, indexIn: KB_LOCALES });
}

export default function KnowledgeBasePage() {
  return <KbIndexClient />;
}
