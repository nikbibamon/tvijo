'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import StaffOpsBanner from '@/components/portal/StaffOpsBanner';
import DisplayPreferencesMenu from '@/components/theme/DisplayPreferencesMenu';
import LanguageSwitcher from '@/components/portal/LanguageSwitcher';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { logout } from '@/services/auth';
import { useLocale } from '@/i18n/useLocale';
import { activePortalHref, portalNavigation, type PortalLink } from './navigation';

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500';
const itemClass = `block rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white ${focus}`;
const activeClass = 'bg-emerald-400/10 font-medium !text-emerald-600 dark:!text-emerald-400';
const menuClass = 'absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-emerald-400/15 dark:bg-[#071d24] simple:rounded-md';

export default function Navbar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { locale, t } = useLocale();
  const { groups, staffLinks, openWorkspace } = portalNavigation(locale);
  const { user } = useCurrentUser();
  // Preserve the existing Navbar Admin visibility predicate.
  const isStaff = !!user && (user.is_staff || user.is_superuser);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const displayName = user?.first_name?.trim() || user?.full_name?.trim() || user?.email?.split('@')[0] || 'Account';
  const activeHref = activePortalHref(groups, pathname, activeHash);
  const accountLinks = [
    { href: `/${locale}/workspace`, label: t.nav.dashboard },
    { href: `/${locale}/profile`, label: t.nav.profile },
    { href: `/${locale}/achievements`, label: t.nav.achievements },
    { href: `/${locale}/account/referrals`, label: t.nav.partnerProgram },
  ];

  const close = () => { setOpenMenu(null); setMobileOpen(false); };
  const handleLogout = () => { logout(); close(); router.push(`/${locale}`); };

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 20);
    const updateHash = () => setActiveHash(window.location.hash);
    updateScroll();
    updateHash();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('hashchange', updateHash);
    return () => { window.removeEventListener('scroll', updateScroll); window.removeEventListener('hashchange', updateHash); };
  }, []);

  useEffect(() => {
    setActiveHash(window.location.hash);
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) { setOpenMenu(null); setMobileOpen(false); }
      else if (openMenu && !(event.target as Element).closest(`[data-nav-menu="${openMenu}"]`)) setOpenMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || (!openMenu && !mobileOpen)) return;
      event.preventDefault();
      headerRef.current?.querySelector<HTMLButtonElement>(`#nav-trigger-${openMenu || 'mobile'}`)?.focus();
      setOpenMenu(null);
      setMobileOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [openMenu, mobileOpen]);

  const renderLink = (item: PortalLink) => <Link key={item.href} href={item.href} onClick={close}
    aria-current={activeHref === item.href ? 'page' : undefined}
    className={`${itemClass} ${activeHref === item.href ? activeClass : ''}`}>{item.label}</Link>;

  const accountContent = <>
    <div className="border-b border-slate-100 px-3 py-2 dark:border-white/5">
      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
      {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
    </div>
    {accountLinks.map(item => <Link key={item.href} href={item.href} onClick={close} className={itemClass}>{item.label}</Link>)}
    <button type="button" onClick={handleLogout} className={`${itemClass} w-full text-left !text-red-600 dark:!text-red-400`}>{t.nav.signOut}</button>
  </>;

  return <header ref={headerRef} className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 simple:shadow-none ${scrolled || mobileOpen || openMenu ? 'border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#031117]/95' : 'border-b border-transparent bg-transparent'}`}>
    <StaffOpsBanner />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between gap-2 simple:h-14">
        <Link href={`/${locale}`} className={`group flex items-center gap-2.5 ${focus}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-[#001b18] shadow-md shadow-emerald-500/25">T</span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tvijo</span>
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label={locale === 'ru' ? 'Главная навигация' : 'Main navigation'}>
          {groups.map(group => <div key={group.id} className="relative" data-nav-menu={group.id}>
            <button id={`nav-trigger-${group.id}`} type="button" aria-expanded={openMenu === group.id} aria-controls={`nav-menu-${group.id}`}
              onClick={() => setOpenMenu(openMenu === group.id ? null : group.id)}
              className={`${itemClass} flex items-center gap-1 ${group.links.some(item => item.href === activeHref) ? activeClass : ''}`}>
              {group.label}<span aria-hidden="true">⌄</span>
            </button>
            <div id={`nav-menu-${group.id}`} hidden={openMenu !== group.id} className={menuClass}>{group.links.map(renderLink)}</div>
          </div>)}
          {isStaff && <div className="relative" data-nav-menu="admin">
            <button id="nav-trigger-admin" type="button" aria-expanded={openMenu === 'admin'} aria-controls="nav-menu-admin" onClick={() => setOpenMenu(openMenu === 'admin' ? null : 'admin')} className={itemClass}>{t.nav.staff} ⌄</button>
            <div id="nav-menu-admin" hidden={openMenu !== 'admin'} className={menuClass}>
              <a href="/admin/" onClick={close} className={itemClass}>{t.nav.adminItems[0].label}</a>
              <p className="px-3 text-xs text-slate-500">{t.nav.adminItems[0].desc}</p>
              {staffLinks.map(renderLink)}
            </div>
          </div>}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <DisplayPreferencesMenu />
          <Link href={`/${locale}/workspace`} className={`hidden rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-[#001b18] shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 xl:inline-flex ${focus}`}>{openWorkspace}</Link>
          {user ? <div className="relative hidden xl:block" data-nav-menu="account">
            <button id="nav-trigger-account" type="button" aria-label={t.nav.accountMenu} aria-expanded={openMenu === 'account'} aria-controls="nav-menu-account" onClick={() => setOpenMenu(openMenu === 'account' ? null : 'account')} className={`flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white ${focus}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[#001b18]">{displayName.charAt(0).toUpperCase()}</span>
              <span className="max-w-24 truncate">{displayName}</span><span aria-hidden="true">⌄</span>
            </button>
            <div id="nav-menu-account" hidden={openMenu !== 'account'} className={menuClass}>{accountContent}</div>
          </div> : <Link href={`/${locale}/login`} className={`hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white xl:inline-flex ${focus}`}>{t.nav.signIn}</Link>}
          <button id="nav-trigger-mobile" type="button" onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null); }} aria-label={t.nav.toggleMenu} aria-expanded={mobileOpen} aria-controls="nav-mobile" className={`${itemClass} xl:hidden`}><span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span></button>
        </div>
      </div>
    </div>
    <div id="nav-mobile" hidden={!mobileOpen} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white dark:border-white/5 dark:bg-[#031117] xl:hidden">
      <nav className="mx-auto max-w-7xl space-y-4 px-4 py-4" aria-label={locale === 'ru' ? 'Мобильная навигация' : 'Mobile navigation'}>
        {groups.map(group => <section key={group.id} aria-labelledby={`nav-mobile-${group.id}`}>
          <h2 id={`nav-mobile-${group.id}`} className={`px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white ${group.links.some(item => item.href === activeHref) ? activeClass : ''}`}>{group.label}</h2>
          {group.links.map(renderLink)}
        </section>)}
        {isStaff && <section><h2 className="px-3 text-sm font-semibold text-slate-900 dark:text-white">{t.nav.staff}</h2><a href="/admin/" onClick={close} className={itemClass}>{t.nav.adminItems[0].label}</a>{staffLinks.map(renderLink)}</section>}
        <section className="border-t border-slate-200 pt-3 dark:border-white/5"><h2 className="px-3 text-sm font-semibold text-slate-900 dark:text-white">{t.nav.account}</h2>
          {user ? accountContent : <Link href={`/${locale}/login`} onClick={close} className={itemClass}>{t.nav.signIn}</Link>}
        </section>
        <Link href={`/${locale}/workspace`} onClick={close} className={`block rounded-lg bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-[#001b18] ${focus}`}>{openWorkspace}</Link>
      </nav>
    </div>
  </header>;
}
