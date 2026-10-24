'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { portalApiFetch } from '@/lib/portal-auth-fetch';
import AssistantWidget from './assistant/AssistantWidget';
import SandboxLaunchButton from './SandboxLaunchButton';
import { WorkspaceIcon, type WorkspaceIconName } from './WorkspaceIcon';

interface WorkspaceUser {
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: WorkspaceIconName;
  match?: string[];
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

type NavRoute = {
  href: string;
  icon: WorkspaceIconName;
  match?: string[];
  labelIndex: number;
};

/**
 * Navigation routes: hrefs/icons (locale-independent) with an index into
 * `copy.shell.groups[][].items[]` so labels come from the active language.
 */
const NAV_ROUTES: ReadonlyArray<{ groupIndex: number; items: NavRoute[] }> = [
  // `/dashboard` is a redirect to `/workspace` now (Gate F review §2: two
  // URLs, one page), so the shell no longer offers it as a separate
  // destination — the overview below is the single landing screen. The group
  // stays as an empty slot because `navGroups` pairs this table with the copy
  // dictionary BY POSITION; dropping the entry would shift every label by one
  // and index past the end of the array.
  { groupIndex: 0, items: [] },
  { groupIndex: 1, items: [
    { href: '/workspace', icon: 'apps', labelIndex: 0 },
    { href: '/workspace/activity', icon: 'activity', labelIndex: 1 },
    { href: '/workspace/runs', icon: 'file', labelIndex: 2 },
    { href: '/workspace/contracts', icon: 'file', labelIndex: 6 },
    { href: '/workspace/models', icon: 'box', labelIndex: 3 },
    { href: '/workspace/apps', icon: 'plugins', labelIndex: 4, match: ['/workspace/apps', '/workspace/plugins'] },
    { href: '/workspace/reference', icon: 'book', labelIndex: 5 },
  ] },
  { groupIndex: 2, items: [
    { href: '/workspace/connections', icon: 'connections', labelIndex: 0 },
    { href: '/workspace/management-keys', icon: 'key', labelIndex: 1 },
    { href: '/workspace/guardrails', icon: 'guardrails', labelIndex: 2 },
  ] },
  { groupIndex: 3, items: [
    { href: '/workspace/infrastructure', icon: 'server', labelIndex: 0 },
    { href: '/workspace/domains', icon: 'network', labelIndex: 1 },
  ] },
  { groupIndex: 4, items: [
    { href: '/workspace/billing', icon: 'billing', labelIndex: 0 },
    { href: '/workspace/profile', icon: 'user', labelIndex: 1 },
    { href: '/workspace/preferences', icon: 'engineering', labelIndex: 2 },
  ] },
];

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
const ENV_LABEL = APP_ENV === 'production' ? 'Production' : 'Preview';

function initialsFor(user: WorkspaceUser | null) {
  if (!user) return 'T';
  const source = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  if (source) {
    return source.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
  return user.email.slice(0, 1).toUpperCase();
}

function displayNameFor(user: WorkspaceUser | null, fallback: string) {
  if (!user) return fallback;
  return user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
}

function useWorkspaceAuth(locale: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('access_token');

    if (!token) {
      const current = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    portalApiFetch<WorkspaceUser>('/auth/me/')
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        const current = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        router.replace(`/${locale}/login?redirect=${encodeURIComponent(current)}`);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, pathname, router, searchParams]);

  return { user, status };
}

function itemIsActive(item: NavItem, cleanPath: string) {
  const matches = item.match || [item.href];
  return matches.some((href) => (
    href === '/workspace'
      ? cleanPath === href
      : cleanPath === href || cleanPath.startsWith(`${href}/`)
  ));
}

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = parseLocale(pathname);
  const { user, status } = useWorkspaceAuth(locale);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setUserMenuOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  useEffect(() => {
    if (commandOpen) commandInputRef.current?.focus();
  }, [commandOpen]);

  const cleanPath = useMemo(() => pathname.replace(/^\/[^/]+/, ''), [pathname]);
  const t = getWorkspaceCopy(locale).shell;
  const navGroups: NavGroup[] = t.groups.map((group, groupIndex) => ({
    label: group.label,
    items: NAV_ROUTES[groupIndex].items.map((route) => ({
      label: group.items[route.labelIndex].label,
      href: route.href,
      icon: route.icon,
      match: route.match,
    })),
  }));
  const commandItems = navGroups.flatMap((group) => group.items);
  const normalizedQuery = commandQuery.trim().toLowerCase();
  const filteredCommandItems = normalizedQuery
    ? commandItems.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : commandItems;

  const handleLogout = async () => {
    try {
      await portalApiFetch('/auth/logout/', { method: 'POST' });
    } catch {
      // Logout is best-effort. Local credentials are always cleared below.
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace(`/${locale}/login`);
  };

  const goTo = (href: string) => {
    setCommandOpen(false);
    setCommandQuery('');
    router.push(`/${locale}${href}`);
  };

  const renderNavigation = (mobile = false) => (
    <>
      <Link className="twk-brand" href={`/${locale}/workspace`} onClick={() => setSidebarOpen(false)}>
        <span className="twk-brand-mark" aria-hidden="true">T</span>
        <span className="twk-brand-word">{t.brandWord}</span>
      </Link>
      <nav className="twk-nav" aria-label={t.navAria}>
        {navGroups.filter((group) => group.items.length > 0).map((group, groupIndex) => (
          <div className="twk-nav-group" key={group.label || `primary-${groupIndex}`}>
            {group.label ? <p className="twk-nav-label">{group.label}</p> : null}
            {group.items.map((item) => {
              const active = itemIsActive(item, cleanPath);
              return (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={active ? 'twk-nav-link is-active' : 'twk-nav-link'}
                  aria-current={active ? 'page' : undefined}
                  title={sidebarCollapsed && !mobile ? item.label : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <WorkspaceIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <button
        className="twk-collapse"
        type="button"
        aria-label={mobile ? t.closeNavigation : sidebarCollapsed ? t.expandNavigation : t.collapseNavigation}
        onClick={() => (mobile ? setSidebarOpen(false) : setSidebarCollapsed((value) => !value))}
      >
        <span className="twk-collapse-icon" aria-hidden="true">{sidebarCollapsed && !mobile ? '›' : '‹'}</span>
        <span>{mobile ? t.close : sidebarCollapsed ? t.expand : t.collapse}</span>
      </button>
    </>
  );

  const shellClass = sidebarCollapsed ? 'tvi-workspace is-sidebar-collapsed' : 'tvi-workspace';

  const mobileTabIcon: Record<string, WorkspaceIconName> = {
    '/dashboard': 'home',
    '/workspace': 'apps',
    '/workspace/activity': 'activity',
    '/workspace/apps': 'plugins',
  };

  const renderBottomNav = () => (
    <nav className="twk-bottomnav" aria-label={t.bottomNavAria}>
      {t.mobileTabs.map((tab) => {
        if (tab.href === '#more') {
          return (
            <button key={tab.href} type="button" className="twk-bottomnav-item" onClick={() => setSidebarOpen(true)} aria-label={t.openNavigation}>
              <WorkspaceIcon name="menu" />
              <span>{tab.label}</span>
            </button>
          );
        }
        const active = itemIsActive({ label: tab.label, href: tab.href, icon: mobileTabIcon[tab.href] || 'apps' }, cleanPath);
        return (
          <Link
            key={tab.href}
            href={`/${locale}${tab.href}`}
            className={active ? 'twk-bottomnav-item is-active' : 'twk-bottomnav-item'}
            aria-current={active ? 'page' : undefined}
          >
            <WorkspaceIcon name={mobileTabIcon[tab.href] || 'apps'} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  if (status === 'loading') {
    return (
      <div className={shellClass}>
        <aside className="twk-sidebar">{renderNavigation()}</aside>
        <div className="twk-app">
          <header className="twk-topbar">
            <button className="twk-menu-button" type="button" aria-label={t.openNavigation} onClick={() => setSidebarOpen(true)}><WorkspaceIcon name="menu" /></button>
            <span className="twk-workspace-switcher"><WorkspaceIcon name="building" /><span>{t.personalWorkspace}</span></span>
            <div className="twk-topbar-spacer" />
            <div className="twk-topbar-status"><span />{ENV_LABEL}</div>
            <span className="twk-avatar" aria-hidden="true" />
          </header>
          <main className="twk-main">
            <div className="twk-auth-skeleton" role="status" aria-label={t.loadingAria}><div className="twk-skeleton-block" /><div className="twk-skeleton-block short" /></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <aside className="twk-sidebar">{renderNavigation()}</aside>
      {sidebarOpen ? (
        <div className="twk-mobile-layer">
          <button className="twk-mobile-scrim" aria-label={t.closeNavigation} type="button" onClick={() => setSidebarOpen(false)} />
          <aside className="twk-mobile-sidebar">{renderNavigation(true)}</aside>
        </div>
      ) : null}
      <div className="twk-app">
        <header className="twk-topbar">
          <button className="twk-menu-button" type="button" aria-label={t.openNavigation} onClick={() => setSidebarOpen(true)}><WorkspaceIcon name="menu" /></button>
          <span className="twk-workspace-switcher" title={t.workspaceTitle}><WorkspaceIcon name="building" /><span>{t.personalWorkspace}</span></span>
          <button className="twk-global-search" type="button" aria-label={t.search} onClick={() => setCommandOpen(true)}><WorkspaceIcon name="search" /><span>{t.search}</span><kbd>⌘K</kbd></button>
          <div className="twk-topbar-status"><span />{ENV_LABEL}</div>
          <SandboxLaunchButton locale={locale} />
          <button className="twk-notification-button" type="button" disabled title={t.notificationsTitle} aria-label={t.notificationsTitle}><WorkspaceIcon name="bell" /></button>
          <div className="twk-user-wrap">
            <button className="twk-avatar" type="button" aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen((value) => !value)}>{initialsFor(user)}</button>
            {userMenuOpen ? (
              <div className="twk-user-menu" role="menu" aria-label={t.userMenuAria}>
                <div className="twk-user-menu-head"><span className="twk-user-menu-name">{displayNameFor(user, t.accountFallback)}</span><span className="twk-user-menu-email">{user?.email}</span></div>
                <Link role="menuitem" href={`/${locale}/workspace`} onClick={() => setUserMenuOpen(false)}>{t.home}</Link>
                <Link role="menuitem" href={`/${locale}`} onClick={() => setUserMenuOpen(false)}>{t.publicWebsite}</Link>
                <button role="menuitem" type="button" onClick={handleLogout}>{t.logOut}</button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="twk-main">{children}</main>
        {renderBottomNav()}
      </div>
      {/* Support assistant: authenticated surfaces only — it answers from the
          knowledge base and can hand a question to a person. */}
      <AssistantWidget locale={locale} />
      {commandOpen ? (
        <div className="twk-modal-layer twk-command-layer" role="presentation" onMouseDown={() => setCommandOpen(false)}>
          <section className="twk-command-dialog" role="dialog" aria-modal="true" aria-label={t.commandAria} onMouseDown={(event) => event.stopPropagation()}>
            <label className="twk-command-search">
              <WorkspaceIcon name="search" />
              <input ref={commandInputRef} value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && filteredCommandItems[0]) goTo(filteredCommandItems[0].href); }} placeholder={t.commandPlaceholder} />
              <kbd>ESC</kbd>
            </label>
            <div className="twk-command-results">
              <p>{t.commandSection}</p>
              {filteredCommandItems.map((item) => <button key={item.href} type="button" onClick={() => goTo(item.href)}><WorkspaceIcon name={item.icon} /><span>{item.label}</span><WorkspaceIcon name="chevron" /></button>)}
              {filteredCommandItems.length === 0 ? <div className="twk-command-empty">{t.commandNoMatch.replace('{query}', commandQuery)}</div> : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
