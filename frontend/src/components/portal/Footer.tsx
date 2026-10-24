'use client';

/**
 * Shared Portal Footer
 * Generation: GEN-PORTAL-001
 */

import Link from 'next/link';
import { useStaffUser } from '@/hooks/useStaffUser';
import { useLocale } from '@/i18n/useLocale';
import { solutions, solutionLocale } from '@/data/solutions';

export default function Footer() {
  const { locale, t } = useLocale();
  const isStaff = useStaffUser();
  // Landing labels come from src/data/solutions.ts (en/ru), not from the i18n
  // contract — the pages themselves are en/ru only, like /compare.
  const solutionLang = solutionLocale(locale);

  return (
    <footer className="border-t border-slate-200 py-12 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{t.footer.product}</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/#product`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.productLinks[0]}</Link>
              <Link href={`/${locale}/ai-radar`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{locale === 'ru' ? 'AI-радар моделей' : 'AI Market Radar'}</Link>
              <Link href={`/${locale}/#metr-research`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.productLinks[1]}</Link>
              <Link href={`/${locale}/#cta`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.productLinks[2]}</Link>
              <Link href={`/${locale}/compare`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.productLinks[3]}</Link>
              <Link href={`/${locale}/demo`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.productLinks[4]}</Link>
              <Link href={`/${locale}/why-tvijo`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{locale === 'ru' ? 'Почему Tvijo' : 'Why Tvijo'}</Link>
              <Link href={'/' + locale + '/workspace'} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{locale === 'ru' ? 'Рабочая область' : 'Product workspace'}</Link>
              <a href="https://dsh.tvijo.com/download" className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white" target="_blank" rel="noreferrer">Tvijo Terminal</a>
              <a href="https://dsh.tvijo.com/docs" className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white" target="_blank" rel="noreferrer">{locale === 'ru' ? 'Документация терминала' : 'Terminal documentation'}</a>
              <a href="https://platform.tvijo.com/keys" className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white" target="_blank" rel="noreferrer">{locale === 'ru' ? 'Ключи платформы' : 'Platform keys'}</a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              <Link href={`/${locale}/solutions`} className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
                {solutionLang === 'ru' ? 'Решения' : 'Solutions'}
              </Link>
            </h4>
            <div className="space-y-2">
              {solutions.map((solution) => (
                <Link
                  key={solution.slug}
                  href={`/${locale}/solutions/${solution.slug}`}
                  className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white"
                >
                  {solution.copy[solutionLang].cardTitle}
                </Link>
              ))}
              <Link href={`/${locale}/proof`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">
                {solutionLang === 'ru' ? 'Структура evidence pack' : 'Evidence pack structure'}
              </Link>
              <Link href={`/${locale}/seo-geo`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">
                {solutionLang === 'ru' ? 'Проверка SEO / GEO' : 'SEO / GEO check'}
              </Link>
              <Link href={`/${locale}/domains`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">
                {solutionLang === 'ru' ? 'Каталог доменов' : 'Domain catalogue'}
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{t.footer.learn}</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/learn`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.learnLinks[0]}</Link>
              <Link href={`/${locale}/learn/ai-agent-governance-foundations`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.learnLinks[1]}</Link>
              <Link href={`/${locale}/faq`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.learnLinks[2]}</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{t.footer.kb}</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/kb`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.kbLinks[0]}</Link>
              <Link href={`/${locale}/kb/ai-governance`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.kbLinks[1]}</Link>
              <Link href={`/${locale}/kb/ai-governance/metr-agent-risk-monitorability-ai-os`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.kbLinks[2]}</Link>
              {isStaff && (
                <Link href={`/${locale}/achievements`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.kbLinks[4]}</Link>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{t.footer.security}</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/security`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.securityLinks[0]}</Link>
              <Link href={`/${locale}/pricing`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.securityLinks[1]}</Link>
              <Link href={`/${locale}/faq`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.securityLinks[2]}</Link>
            </div>
          </div>
          {isStaff && (
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{t.footer.admin}</h4>
              <div className="space-y-2">
                <a href="/admin/" className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.adminLinks[0]}</a>
                <Link href={`/${locale}/tools`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.adminLinks[1]}</Link>
                <Link href={`/${locale}/changelog`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{t.footer.adminLinks[2]}</Link>
                <Link href={'/' + locale + '/agentroy'} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">{locale === 'ru' ? 'Центр команд оператора' : 'Agentroy operator center'}</Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 dark:border-white/5 dark:text-gray-600 sm:flex-row sm:gap-0">
          <span>&copy; {new Date().getFullYear()} Tvijo. {t.footer.copyright}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-green-700 dark:text-green-400">{t.footer.systemOnline}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
