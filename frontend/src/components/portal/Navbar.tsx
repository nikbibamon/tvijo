'use client';

/**
 * Shared Portal Navbar with Explore dropdown + mobile hamburger menu
 * Generation: GEN-PORTAL-002
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import StaffOpsBanner from '@/components/portal/StaffOpsBanner';
import DisplayPreferencesMenu from '@/components/theme/DisplayPreferencesMenu';
import LanguageSwitcher from '@/components/portal/LanguageSwitcher';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { logout } from '@/services/auth';
import { useLocale } from '@/i18n/useLocale';
import { getPublicCta } from '@/i18n/public-surface';

const NAV_PRIMARY = [
  { href: '/#product', key: 'product' as const },
  { href: '/ai-radar', label: 'AI Radar', labelRu: 'AI-радар' },
  { href: '/agent-skills', key: 'agentSkills' as const },
  { href: '/kb', key: 'knowledge' as const },
  { href: '/learn', key: 'learn' as const },
  { href: '/pricing', key: 'pricing' as const },
];

const MORE_NAV_ITEMS = [
  { href: '/achievements', icon: '\u{1F3C6}' },
  { href: '/faq', icon: '\u{2753}' },
  { href: '/changelog', icon: '\u{1F4CB}' },
];

const TOOLS_ITEMS = [
  { href: '/tools', icon: '🔧', status: 'live' as const },
];

const EXPLORE_ITEMS = [
  { href: '/#metr-research', icon: '🔬' },
  { href: '/#use-cases', icon: '💡' },
  { href: '/#cta', icon: '🛡️' },
];

const ADMIN_ITEMS = [
  { href: '/admin/', icon: '⚙️', external: false },
];

export default function Navbar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { locale, t } = useLocale();
  const publicCta = getPublicCta(locale);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user } = useCurrentUser();
  const isStaff = !!user && (user.is_staff || user.is_superuser);
  const toolsRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.first_name?.trim() ||
    user?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Account';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
    router.push(`/${locale}`);
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    setActiveHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
    setExploreOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (toolsRef.current && !toolsRef.current.contains(t)) setToolsOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(t)) setExploreOpen(false);
      if (moreRef.current && !moreRef.current.contains(t)) setMoreOpen(false);
      if (accountRef.current && !accountRef.current.contains(t)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => {
    const [path, hash] = href.split('#');
    if (hash) {
      const homePath = `/${locale}`;
      const currentPath = pathname.replace(/\/$/, '') || homePath;
      return currentPath === homePath && activeHash === `#${hash}`;
    }
    const targetPath = `/${locale}${path}`.replace(/\/$/, '');
    const currentPath = pathname.replace(/\/$/, '');
    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  };
  const primaryLabel = (item: (typeof NAV_PRIMARY)[number]) => (
    'key' in item && item.key ? t.nav[item.key] : (locale === 'ru' ? item.labelRu : item.label)
  );
  const isToolsActive = isStaff && pathname.includes('/tools');
  const isExploreActive =
    pathname.includes('/market-intelligence');
  const isAdminActive =
    pathname.startsWith('/admin');
  const isMoreMenuActive =
    isStaff && (
      isAdminActive ||
      pathname.includes('/achievements') ||
      pathname.includes('/faq') ||
      pathname.includes('/changelog')
    );

  const isExploreItemActive = (href: string) => {
    const [path, hash] = href.split('#');
    if (hash) return false; // homepage anchors don't hold a persistent active state
    const p = pathname.replace(/\/$/, '');
    const base = `/${locale}${path}`.replace(/\/$/, '');
    return p === base || p.startsWith(`${base}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 simple:shadow-none ${
          scrolled || mobileOpen
            ? 'border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#031117]/95 dark:shadow-lg'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <StaffOpsBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between simple:h-14">
            {/* Logo */}
            <Link href={`/${locale}`} className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-[#001b18] shadow-md shadow-emerald-500/25 simple:h-8 simple:w-8 simple:rounded-lg simple:shadow-sm">
                T
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Tvijo
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {NAV_PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md simple:px-2.5 simple:py-1.5 ${
                    isActive(item.href)
                      ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {primaryLabel(item)}
                </Link>
              ))}

              {/* Explore dropdown: public */}
              <div className="relative" ref={exploreRef}>
                <button
                  type="button"
                  onClick={() => {
                    setExploreOpen(!exploreOpen);
                    setToolsOpen(false);
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md ${
                    isExploreActive
                      ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {t.nav.explore}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {exploreOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                    {EXPLORE_ITEMS.map((item, i) => (
                      <Link
                        key={item.href}
                        href={`/${locale}${item.href}`}
                        onClick={() => setExploreOpen(false)}
                      >
                        <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                          <span className="mt-0.5 text-lg">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                              {t.nav.exploreItems[i].label}
                            </span>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{t.nav.exploreItems[i].desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isStaff && (
                <>

                  {/* Tools dropdown: admin-only */}
                  <div className="relative" ref={toolsRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpen(!toolsOpen);
                        setExploreOpen(false);
                        setMoreOpen(false);
                      }}
                      className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md ${
                        isToolsActive
                          ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {t.nav.tools}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {toolsOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                        {TOOLS_ITEMS.map((tool, i) => (
                          <Link key={tool.href} href={`/${locale}${tool.href}`} onClick={() => setToolsOpen(false)}>
                            <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                              <span className="mt-0.5 text-lg">{tool.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                  {t.nav.toolsItems[i].label}
                                </span>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{t.nav.toolsItems[i].desc}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* More dropdown: admin-only */}
                  <div className="relative" ref={moreRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(!moreOpen);
                        setToolsOpen(false);
                        setExploreOpen(false);
                      }}
                      className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md ${
                        isMoreMenuActive
                          ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {t.nav.more}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {moreOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                        <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
                          {t.nav.platform}
                        </div>
                        {MORE_NAV_ITEMS.map((item, i) => (
                          <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setMoreOpen(false)}>
                            <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                              <span className="mt-0.5 text-lg">{item.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                  {t.nav.moreItems[i].label}
                                </span>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{t.nav.moreItems[i].desc}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
                          {t.nav.staff}
                        </div>
                        {ADMIN_ITEMS.map((item, i) => (
                          <a key={item.href} href={item.href} onClick={() => setMoreOpen(false)}>
                            <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                              <span className="mt-0.5 text-lg">{item.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                                  {t.nav.adminItems[i].label}
                                </span>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{t.nav.adminItems[i].desc}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <DisplayPreferencesMenu />
              {/* Demo now leads to the public sample, so it says "Demo"
                  and nothing else; the single primary CTA opens the
                  workspace. Labels come from the public-surface
                  dictionary in all eleven languages — the old keys named
                  actions these buttons no longer perform. */}
              <Link
                href={`/${locale}/demo`}
                className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10 lg:inline-flex"
              >
                {publicCta.demo}
              </Link>
              <Link
                href={`/${locale}/workspace`}
                className="hidden lg:inline-flex px-4 py-2 bg-emerald-400 text-[#001b18] text-sm font-bold rounded-lg hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20"
              >
                {publicCta.openWorkspace}
              </Link>

              {/* Account control (desktop) */}
              {user ? (
                <div className="relative hidden md:block" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(!accountOpen);
                      setToolsOpen(false);
                      setExploreOpen(false);
                      setMoreOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10"
                    aria-label={t.nav.accountMenu}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      {initial}
                    </span>
                    <span className="hidden max-w-[110px] truncate lg:inline">{displayName}</span>
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${accountOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/5">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                        {user.email && (
                          <p className="truncate text-[11px] text-slate-500 dark:text-gray-500">{user.email}</p>
                        )}
                      </div>
                      <Link href={`/${locale}/workspace`} onClick={() => setAccountOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5">
                          <span className="text-lg">🏠</span>
                          <span>{t.nav.dashboard}</span>
                        </div>
                      </Link>
                      <Link href={`/${locale}/profile`} onClick={() => setAccountOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5">
                          <span className="text-lg">👤</span>
                          <span>{t.nav.profile}</span>
                        </div>
                      </Link>
                      <Link href={`/${locale}/achievements`} onClick={() => setAccountOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5">
                          <span className="text-lg">🏆</span>
                          <span>{t.nav.achievements}</span>
                        </div>
                      </Link>
                      <Link href={`/${locale}/account/referrals`} onClick={() => setAccountOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5">
                          <span className="text-lg">🤝</span>
                          <span>{t.nav.partnerProgram}</span>
                        </div>
                      </Link>
                      <div className="border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <span className="text-lg">🚪</span>
                          <span>{t.nav.signOut}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="hidden md:inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10"
                >
                  {t.nav.signIn}
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white md:hidden"
                aria-label={t.nav.toggleMenu}
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white/98 backdrop-blur-xl dark:border-white/5 dark:bg-[#031117]/98 md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              <Link
                href={`/${locale}`}
                className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                  pathname === `/${locale}`
                    ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                {t.nav.home}
              </Link>
              {NAV_PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {primaryLabel(item)}
                </Link>
              ))}

              <div className="pb-1 pt-2">
                <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                  {t.nav.explore}
                </span>
              </div>
              {EXPLORE_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                    isExploreItemActive(item.href)
                      ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{t.nav.exploreItems[i].label}</span>
                </Link>
              ))}

              {isStaff && (
                <>
                  <div className="pb-1 pt-2">
                    <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                      {t.nav.tools}
                    </span>
                  </div>
                  {TOOLS_ITEMS.map((tool, i) => (
                    <Link
                      key={tool.href}
                      href={`/${locale}${tool.href}`}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                        isActive(tool.href)
                          ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <span>{tool.icon}</span>
                      <span>{t.nav.toolsItems[i].label}</span>
                    </Link>
                  ))}

                  <div className="pb-1 pt-2">
                    <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                      {t.nav.more}
                    </span>
                  </div>
                  {MORE_NAV_ITEMS.map((item, i) => (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href}`}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-emerald-400/10 font-medium text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{t.nav.moreItems[i].label}</span>
                    </Link>
                  ))}

                  <div className="pb-1 pt-2">
                    <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                      {t.nav.staff}
                    </span>
                  </div>
                  {ADMIN_ITEMS.map((item, i) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span>{item.icon}</span>
                      <span>{t.nav.adminItems[i].label}</span>
                    </a>
                  ))}
                </>
              )}

              <Link
                href={`/${locale}/demo`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {publicCta.demo}
              </Link>

              {/* Account (mobile) */}
              <div className="mt-2 border-t border-slate-200 pt-3 dark:border-white/5">
                <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                  {t.nav.account}
                </span>
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                      {user.email && (
                        <p className="truncate text-[11px] text-slate-500 dark:text-gray-500">{user.email}</p>
                      )}
                    </div>
                    <Link
                      href={`/${locale}/workspace`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span>🏠</span>
                      <span>{t.nav.dashboard}</span>
                    </Link>
                    <Link
                      href={`/${locale}/profile`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span>👤</span>
                      <span>{t.nav.profile}</span>
                    </Link>
                    <Link
                      href={`/${locale}/achievements`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span>🏆</span>
                      <span>{t.nav.achievements}</span>
                    </Link>
                    <Link
                      href={`/${locale}/account/referrals`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span>🤝</span>
                      <span>{t.nav.partnerProgram}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <span>🚪</span>
                      <span>{t.nav.signOut}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <span>🔑</span>
                    <span>{t.nav.signIn}</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-white/5">
                <Link
                  href={`/${locale}/#cta`}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-emerald-400 text-[#001b18] text-sm font-bold rounded-lg"
                >
                  {t.nav.runRiskAudit}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
