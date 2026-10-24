'use client';

/**
 * Shared Portal Footer
 * Generation: GEN-PORTAL-001
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname() || '';
  const locale = pathname.startsWith('/ru') ? 'ru' : 'en';

  return (
    <footer className="border-t border-slate-200 py-12 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Platform</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/directory`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Directory</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Learn &amp; Explore</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/kb`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Knowledge Base</Link>
              <Link href={`/${locale}/kb/mindmaps`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Mind maps</Link>
              <Link href={`/${locale}/achievements`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Achievements</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Community</h4>
            <div className="space-y-2">
              <Link href={`/${locale}/profile`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">My Profile</Link>
              <Link href={`/${locale}/onboarding`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Onboarding</Link>
              <Link href={`/${locale}/about`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">About Us</Link>
              <Link href={`/${locale}/faq`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">FAQ</Link>
              <Link href={`/${locale}/changelog`} className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Changelog</Link>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Admin</h4>
            <div className="space-y-2">
              <a href="/admin/" className="block text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-500 dark:hover:text-white">Django Admin</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 dark:border-white/5 dark:text-gray-600 sm:flex-row sm:gap-0">
          <span>&copy; {new Date().getFullYear()} Tvijo. AI-Powered Financial Intelligence.</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-green-700 dark:text-green-400">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
