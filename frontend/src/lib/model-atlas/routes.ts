import type { Metadata } from 'next';
import { marketingMetadata } from '@/lib/seo/marketing';

export const ATLAS_LOCALES = ['en', 'ru'] as const;
// Programmev3 authorizes English publication; other source locales stay prepared.
export const ATLAS_RELEASE_LOCALES = ['en'] as const;
export function atlasLocaleAvailable(locale: string) { return (ATLAS_RELEASE_LOCALES as readonly string[]).includes(locale); }
export const ATLAS_PROJECTS = ['tvijo', 'hotido', 'finedg'] as const;
export const ATLAS_PATHS = [
  '/compare/research',
  '/compare/research/tvijo',
  '/compare/research/hotido',
  '/compare/research/finedg',
  '/compare/benchmarks',
  '/compare/systems',
  '/compare/experiments',
] as const;

export function atlasMetadata(locale: string, path: string, title: { en: string; ru: string }, description: { en: string; ru: string }): Metadata {
  const lang = locale === 'ru' ? 'ru' : 'en';
  return marketingMetadata({
    locale, path, title: `${title[lang]} | Tvijo`, description: description[lang],
    keywords: lang === 'ru'
      ? ['бенчмарки моделей', 'оценка ИИ-агентов', 'вероятность успеха', 'стоимость принятой задачи', 'Tvijo AIOS', 'Hotido', 'FinEdg']
      : ['AI model benchmarks', 'agent evaluation', 'accepted task cost', 'Tvijo AIOS', 'Hotido', 'FinEdg'],
    indexIn: ATLAS_RELEASE_LOCALES,
  });
}
