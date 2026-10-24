'use client';

/**
 * Shared Portal Navbar with Explore dropdown + mobile hamburger menu
 * Generation: GEN-PORTAL-002
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StaffOpsBanner from '@/components/portal/StaffOpsBanner';
import DisplayPreferencesMenu from '@/components/theme/DisplayPreferencesMenu';

/** Основная навигация для обычных пользователей */
const NAV_PRIMARY = [
  { href: '/kb', label: 'Knowledge' },
  { href: '/directory', label: 'Directory' },
];

/** Второстепенные страницы; админка — в «More» только после входа */
const MORE_NAV_ITEMS = [
  { href: '/achievements', label: 'Achievements', icon: '\u{1F3C6}', desc: 'Badges & progress' },
  { href: '/faq', label: 'FAQ', icon: '\u{2753}', desc: 'Help & answers' },
  { href: '/changelog', label: 'Changelog', icon: '\u{1F4CB}', desc: 'Product updates' },
];

/** KB-adjacent exploration links */
const EXPLORE_ITEMS = [
  { href: '/kb', label: 'Knowledge Base', icon: '📚', desc: 'Articles, search, categories' },
  { href: '/kb/mindmaps', label: 'Mind Maps', icon: '🗂️', desc: 'Gallery of article mind maps' },
];

/** Staff / operator panels (login required) */
const ADMIN_ITEMS = [
  { href: '/admin/', label: 'Django Admin', icon: '⚙️', desc: 'Users, data, KB', external: false },
];

export default function Navbar() {
  const pathname = usePathname() || '';
  const locale = pathname.startsWith('/ru') ? 'ru' : 'en';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(t)) setExploreOpen(false);
      if (moreRef.current && !moreRef.current.contains(t)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => pathname.includes(href);
  const isExploreActive =
    pathname.includes('/kb');
  const isAdminActive =
    pathname.startsWith('/admin');
  const isMoreMenuActive =
    isAdminActive ||
    pathname.includes('/achievements') ||
    pathname.includes('/faq') ||
    pathname.includes('/changelog');

  const isExploreItemActive = (href: string) => {
    const p = pathname.replace(/\/$/, '');
    const base = `/${locale}${href}`.replace(/\/$/, '');
    if (href === '/kb') {
      if (!p.startsWith(`/${locale}/kb`)) return false;
      if (p === `/${locale}/kb`) return true;
      if (p.startsWith(`/${locale}/kb/mindmap`)) return false;
      if (p.startsWith(`/${locale}/kb/mindmaps`)) return false;
      return true;
    }
    return p === base || p.startsWith(`${base}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 simple:shadow-none ${
          scrolled || mobileOpen
            ? 'border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#0A0A0F]/95 dark:shadow-lg'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <StaffOpsBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between simple:h-14">
            {/* Logo */}
            <Link href={`/${locale}`} className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white shadow-md shadow-orange-500/25 simple:h-8 simple:w-8 simple:rounded-lg simple:shadow-sm">
                B
              </div>
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-lg font-bold text-transparent dark:from-orange-400 dark:to-amber-500">
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
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Explore: KB graph tools */}
              <div className="relative" ref={exploreRef}>
                <button
                  type="button"
                  onClick={() => {
                    setExploreOpen(!exploreOpen);
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md ${
                    isExploreActive
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  Explore
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
                  <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#12121A] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                    {EXPLORE_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={`/${locale}${item.href}`}
                        onClick={() => setExploreOpen(false)}
                      >
                        <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                          <span className="mt-0.5 text-lg">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                              {item.label}
                            </span>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* More: FAQ, changelog, partners… + staff panels if logged in */}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(!moreOpen);
                    setExploreOpen(false);
                  }}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors simple:rounded-md ${
                    isMoreMenuActive
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  More
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
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#12121A] dark:shadow-black/50 simple:rounded-md simple:shadow-md">
                    <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
                      Platform
                    </div>
                    {MORE_NAV_ITEMS.map((item) => (
                      <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setMoreOpen(false)}>
                        <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                          <span className="mt-0.5 text-lg">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                              {item.label}
                            </span>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {isLoggedIn && (
                      <>
                        <div className="border-t border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
                          Staff
                        </div>
                        {ADMIN_ITEMS.map((item) => {
                          const inner = (
                            <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                              <span className="mt-0.5 text-lg">{item.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-slate-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                                  {item.label}
                                </span>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                          );
                          return item.href.startsWith('/admin') ? (
                            <a key={item.href} href={item.href} onClick={() => setMoreOpen(false)}>
                              {inner}
                            </a>
                          ) : (
                            <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setMoreOpen(false)}>
                              {inner}
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <DisplayPreferencesMenu />
              <div className="hidden items-center gap-1.5 rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 sm:flex dark:border-green-500/20">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600 dark:bg-green-500" />
                <span className="text-[11px] font-medium text-green-700 dark:text-green-400">Live</span>
              </div>
              {isLoggedIn ? (
                <Link
                  href={`/${locale}/profile`}
                  className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10 sm:inline-flex"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  Profile
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="hidden sm:inline-flex px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/20"
                >
                  Join Free
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white md:hidden"
                aria-label="Toggle menu"
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
          <div className="border-t border-slate-200 bg-white/98 backdrop-blur-xl dark:border-white/5 dark:bg-[#0A0A0F]/98 md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              <Link
                href={`/${locale}`}
                className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                  pathname === `/${locale}`
                    ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                Home
              </Link>
              {NAV_PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pb-1 pt-2">
                <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                  Explore
                </span>
              </div>
              {EXPLORE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                    isExploreItemActive(item.href)
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pb-1 pt-2">
                <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                  More
                </span>
              </div>
              {MORE_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              {isLoggedIn && (
                <>
                  <div className="pb-1 pt-2">
                    <span className="mb-1 block px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-600">
                      Staff
                    </span>
                  </div>
                  {ADMIN_ITEMS.map((item) => {
                    const cls = `flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5`;
                    return item.href.startsWith('/admin') ? (
                      <a key={item.href} href={item.href} className={cls}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <Link key={item.href} href={`/${locale}${item.href}`} className={cls}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              <Link
                href={`/${locale}/login`}
                className="block rounded-lg px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Sign In / Register
              </Link>
              <div className="border-t border-slate-200 pt-3 dark:border-white/5">
                <Link
                  href={`/${locale}/login`}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium rounded-lg"
                >
                  Join Free — Register
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
