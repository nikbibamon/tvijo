import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';

/**
 * `/{locale}/dashboard` → `/{locale}/workspace`.
 *
 * Two URLs rendered the same login wall for an anonymous visitor — byte for
 * byte, per plans/08092026/gate-f/DEMO_SURFACE_REVIEW_RU.md §2 — and a
 * product with two names for its own screen reads as unfinished. The
 * workspace overview is the single entry; this route stays only so old links,
 * bookmarks and indexed URLs keep working.
 *
 * Redirect safety: the locale comes from the validated path segment, never
 * from user input, and only known-safe query keys are forwarded. There is no
 * `next`/`url` parameter to point somewhere else — an open redirect on the
 * route that leads to sign-in is exactly the one worth not having.
 */

const FORWARDED_PARAMS = ['template', 'from', 'utm_source', 'utm_medium', 'utm_campaign'];

export const dynamic = 'force-dynamic';

export default function DashboardRedirect({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const locale = isValidLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const forwarded = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = searchParams?.[key];
    const single = Array.isArray(value) ? value[0] : value;
    if (typeof single === 'string' && single) forwarded.set(key, single);
  }
  const query = forwarded.toString();
  redirect(`/${locale}/workspace${query ? `?${query}` : ''}`);
}
