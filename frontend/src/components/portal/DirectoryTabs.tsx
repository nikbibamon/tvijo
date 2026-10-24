'use client';

/**
 * Shared sub-navigation for the Directory hub.
 * Lets users switch between Startups (companies) and Investment Funds — the two
 * are stored separately but presented as one browsable directory.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';

const TABS = [
  { href: '/directory', label: 'Startups', icon: '🏢' },
  { href: '/investment-funds', label: 'Investment Funds', icon: '💰' },
];

export default function DirectoryTabs() {
  const pathname = usePathname() || '';
  const locale = parseLocale(pathname);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        Directory
      </span>
      {TABS.map((t) => {
        const base = `/${locale}${t.href}`;
        const current = pathname.replace(/\/$/, '');
        const active = current === base || current.startsWith(`${base}/`);
        return (
          <Link
            key={t.href}
            href={base}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              active
                ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
