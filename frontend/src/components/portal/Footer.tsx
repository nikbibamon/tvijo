'use client';

/**
 * Shared Portal Footer
 * Generation: GEN-PORTAL-001
 */

import Link from 'next/link';
import Script from 'next/script';
import { useLocale } from '@/i18n/useLocale';
import { portalNavigation } from './navigation';

export default function Footer() {
  const { locale, t } = useLocale();
  const { footerGroups, teamLinks } = portalNavigation(locale);

  return (
    <footer className="border-t border-slate-200 py-12 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label={locale === 'ru' ? 'Навигация внизу страницы' : 'Footer navigation'} className="mb-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {footerGroups.map(group => <section key={group.id}>
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{group.label}</h2>
            <div className="space-y-2">{group.links.map(item => <Link key={item.href} href={item.href} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-gray-500 dark:hover:text-white">{item.label}</Link>)}</div>
            {group.id === 'company-help' && <details className="mt-3 text-sm text-slate-600 dark:text-gray-500">
              <summary className="cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">{locale === 'ru' ? 'Решения для отдельных команд' : 'Solutions by team'}</summary>
              <div className="mt-3 space-y-2">{teamLinks.map(item => <a key={item.href} href={item.href} className="block hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:text-white">{item.label}</a>)}</div>
            </details>}
          </section>)}
        </nav>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 dark:border-white/5 dark:text-gray-600 sm:flex-row sm:gap-0">
          <span>&copy; {new Date().getFullYear()} Tvijo. {t.footer.copyright}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-green-700 dark:text-green-400">{t.footer.systemOnline}</span>
            </div>
          </div>
        </div>
        {/* Public service record: one renderer and one snapshot for every tvijo.com page family. */}
        <div data-tvijo-usage="next" className="text-slate-600 dark:text-gray-400" />
        <Script src="/public/usage-footer.js" strategy="lazyOnload" />
      </div>
    </footer>
  );
}
