'use client';

/**
 * Agent Control Panel — Layout
 * Generation: GEN-AGENTS-SEC-001
 * Dark theme with cyan/blue accents. Reuses newsadmin auth system.
 */

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { NewsAdminAuthProvider, useNewsAdminAuth } from '@/contexts/newsadmin-auth';
import { parseLocale } from '@/i18n/config';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/agentadmin', icon: 'dashboard', description: 'Overview of pipeline & security' },
  { name: 'System Health', href: '/agentadmin/health', icon: 'heart', description: 'PM2, DB, Redis, Celery status' },
  { name: 'AI Budget', href: '/agentadmin/budget', icon: 'dollar', description: 'Token spending & cost control' },
  { name: 'Security', href: '/agentadmin/security', icon: 'shield', description: 'Security events & alerts' },
  { name: 'Pipeline', href: '/agentadmin/pipeline', icon: 'activity', description: 'Pipeline runs & performance' },
  { name: 'Guardrails', href: '/agentadmin/guardrails', icon: 'settings', description: 'Safety limits & configs' },
  { name: 'AI Assistant', href: '/agentadmin/ai-chat', icon: 'sparkles', description: 'AI-powered analysis & help' },
  { name: 'SEO Analytics', href: '/agentadmin/seo', icon: 'search', description: 'Google Search Console data' },
  { name: 'SEO Pipeline', href: '/agentadmin/seo/pipeline', icon: 'sparkles', description: 'Plan, draft, approve and publish SEO articles' },
];

const EXTERNAL_LINKS = [
  { name: 'Django Admin', href: 'https://api.tvijo.com/admin/', icon: 'database', description: 'Database & models admin', external: true },
];

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  activity: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  news: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  database: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  dollar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Auth Guard — requires is_staff
// ---------------------------------------------------------------------------

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useNewsAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname.includes('/newsadmin/login');

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0a0e17] items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const locale = parseLocale(pathname);
    router.replace(`/${locale}/newsadmin/login`);
    return null;
  }

  if (user && !user.is_staff && !user.is_superuser) {
    return (
      <div className="flex h-screen bg-[#0a0e17] items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6">Agent Control Panel requires admin access.</p>
          <button onClick={logout} className="px-6 py-2 bg-white/5 border border-white/10 text-sm text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Inner layout
// ---------------------------------------------------------------------------

function AgentAdminInnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useNewsAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, '');
    if (href === '/agentadmin') {
      return cleanPath === '/agentadmin' || cleanPath === '/agentadmin/';
    }
    return cleanPath.startsWith(href);
  };

  const locale = parseLocale(pathname);
  const initials = user
    ? `${(user.first_name || 'A')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : 'A';

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-sm">AC</span>
          <span className="text-cyan-400">&#9889;</span>
        </div>
        <div className="text-cyan-400 font-bold text-sm mt-1">Agent Control</div>
        <div className="text-[10px] text-gray-500">Security &amp; Pipeline</div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const fullHref = `/${locale}${item.href}`;
          return (
            <Link
              key={item.href}
              href={fullHref}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {ICONS[item.icon]}
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="mx-4 my-3 border-t border-white/5" />
        <div className="px-4 py-2">
          <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">External Systems</span>
        </div>
        {EXTERNAL_LINKS.map((item) => {
          const fullHref = item.external ? item.href : `/${locale}${item.href}`;
          const LinkComponent = item.external ? 'a' : Link;
          return (
            <LinkComponent
              key={item.name}
              href={fullHref}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors group"
            >
              {ICONS[item.icon]}
              <span className="flex-1">{item.name}</span>
              {item.external && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {ICONS.external}
                </span>
              )}
            </LinkComponent>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs text-cyan-400">Pipeline Active</span>
        </div>
      </div>
    </>
  );

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#0a0e17] text-white overflow-hidden">
        <aside className="hidden lg:flex w-[200px] bg-[#0d1220] border-r border-white/5 flex-col shrink-0">
          {sidebarContent}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-[240px] h-full bg-[#0d1220] border-r border-white/5 flex flex-col shadow-2xl">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-3 text-gray-400 hover:text-white z-10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {sidebarContent}
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 bg-[#0d1220] border-b border-white/5 flex items-center px-4 lg:px-6 shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <h1 className="text-sm font-medium text-gray-300">Agent Control Panel</h1>

            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-cyan-500/50 transition-all"
                >
                  {initials}
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-sm text-white font-medium truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function AgentAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NewsAdminAuthProvider>
      <AgentAdminInnerLayout>{children}</AgentAdminInnerLayout>
    </NewsAdminAuthProvider>
  );
}
