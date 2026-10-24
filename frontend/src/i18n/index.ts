import type { Translations } from './locales/en';
import en from './locales/en';
import ru from './locales/ru';
import hi from './locales/hi';
import ko from './locales/ko';
import ja from './locales/ja';
import zh from './locales/zh';
import de from './locales/de';
import es from './locales/es';
import pt from './locales/pt';
import nl from './locales/nl';
import uk from './locales/uk';
import type { Locale } from './config';

// No `as Translations` casts here: each locale file declares itself as `Translations`
// (typed against en.ts), so a missing or misspelled key is a compile error, not a
// silent English fallback at runtime.
const translations: Record<Locale, Translations> = {
  en,
  ru,
  hi,
  ko,
  ja,
  zh,
  de,
  es,
  pt,
  nl,
  uk,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? en;
}

export type { Translations };
