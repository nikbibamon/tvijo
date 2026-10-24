'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { parseLocale } from '@/i18n/config';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAgentroyCopy } from './copy';
import { logout } from '@/services/auth';

const OWNER_EMAIL = 'be9ava@gmail.com';

export default function AgentroyGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/en/agentroy';
  const router = useRouter();
  const locale = parseLocale(pathname);
  const copy = getAgentroyCopy(locale);
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (loading || user) return;
    const destination = '/' + locale + '/agentroy';
    router.replace('/' + locale + '/login?redirect=' + encodeURIComponent(destination));
  }, [loading, locale, router, user]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#f4f7f7] px-5 pt-28 text-slate-700">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" role="status">
          <div className="mb-3 h-3 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
          <p className="sr-only">{copy.loading}</p>
        </div>
      </main>
    );
  }

  const ownerAndStaff =
    user.email.trim().toLowerCase() === OWNER_EMAIL &&
    (user.is_staff || user.is_superuser);

  if (!ownerAndStaff) {
    return (
      <main className="min-h-screen bg-[#f4f7f7] px-5 pt-28 text-slate-800">
        <section className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Tvijo · Private operations</p>
          <h1 className="text-2xl font-semibold">{copy.accessDenied}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{copy.serviceDenied}</p>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{copy.signedInAs} <strong>{user.email || copy.unknownAccount}</strong></p>
          <button type="button" className="mt-5 rounded-xl bg-[#123b3d] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => { logout(); router.replace('/' + locale + '/login?redirect=' + encodeURIComponent('/' + locale + '/agentroy')); }}>
            {copy.switchAccount}
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
