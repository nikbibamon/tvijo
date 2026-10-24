export type Locale = 'en' | 'ru' | 'hi' | 'ko' | 'ja' | 'zh' | 'de' | 'es' | 'pt' | 'nl' | 'uk';

export const LOCALES: Locale[] = ['en', 'ru', 'hi', 'ko', 'ja', 'zh', 'de', 'es', 'pt', 'nl', 'uk'];

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleMeta {
  code: Locale;
  label: string;
  flag: string;
  hreflang: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: 'en', label: 'English', flag: '🇬🇧', hreflang: 'en' },
  ru: { code: 'ru', label: 'Русский', flag: '🇷🇺', hreflang: 'ru' },
  hi: { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', hreflang: 'hi' },
  ko: { code: 'ko', label: '한국어', flag: '🇰🇷', hreflang: 'ko' },
  ja: { code: 'ja', label: '日本語', flag: '🇯🇵', hreflang: 'ja' },
  zh: { code: 'zh', label: '中文', flag: '🇨🇳', hreflang: 'zh' },
  de: { code: 'de', label: 'Deutsch', flag: '🇩🇪', hreflang: 'de' },
  es: { code: 'es', label: 'Español', flag: '🇪🇸', hreflang: 'es' },
  pt: { code: 'pt', label: 'Português', flag: '🇵🇹', hreflang: 'pt' },
  nl: { code: 'nl', label: 'Nederlands', flag: '🇳🇱', hreflang: 'nl' },
  uk: { code: 'uk', label: 'Українська', flag: '🇺🇦', hreflang: 'uk' },
};

const LOCALE_SET = new Set(LOCALES);

export function isValidLocale(loc: string): loc is Locale {
  return LOCALE_SET.has(loc as Locale);
}

export function parseLocale(pathname: string | null): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const seg = pathname.split('/')[1];
  if (seg && isValidLocale(seg)) return seg;
  return DEFAULT_LOCALE;
}
