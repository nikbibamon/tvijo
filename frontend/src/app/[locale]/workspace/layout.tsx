import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';
import { workspaceMetadata } from '@/lib/seo/workspace';
import './workspace.css';
import './workspace-admin.css';
import './workspace-catalog.css';

// Authenticated workspace pages are request-rendered so the root layout can
// emit the actual route locale in <html lang> from the middleware header.
// Public marketing pages keep their existing static generation.
export const dynamic = 'force-dynamic';

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  return workspaceMetadata(params.locale, 'overview');
}

/**
 * The shell's auth gate reads `useSearchParams()` to preserve the exact return
 * route through login (ТЗ §8). That opts the subtree into client rendering, so
 * it needs its own Suspense boundary — otherwise the static prerender of every
 * /[locale]/workspace/** route fails. The fallback is the same skeleton the
 * shell shows while it checks the session: never content, never metrics.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={(
        <div className="twk-auth-skeleton" role="status" aria-label="Loading your workspace">
          <div className="twk-skeleton-block" />
          <div className="twk-skeleton-block short" />
        </div>
      )}
    >
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}
