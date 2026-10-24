'use client';

import { usePathname } from 'next/navigation';
import { parseLocale, type Locale } from './config';
import { getTranslations, type Translations } from './index';

export function useLocale(): { locale: Locale; t: Translations } {
  const pathname = usePathname();
  const locale = parseLocale(pathname);
  const t = getTranslations(locale);
  return { locale, t };
}

export { parseLocale, type Locale, type Translations };
