import type { ReactNode } from 'react';

/**
 * `/{locale}/dashboard` only redirects now (see page.tsx), so this layout is
 * deliberately empty: mounting the workspace shell and its stylesheets to
 * render a 307 would load the whole control plane for a response that has no
 * body. The shell still wraps the real destination, `/{locale}/workspace`.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
