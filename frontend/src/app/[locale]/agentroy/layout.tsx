import type { ReactNode } from 'react';
import AgentroyGuard from '@/components/agentroy/AgentroyGuard';

export const dynamic = 'force-dynamic';

export default function AgentroyLayout({ children }: { children: ReactNode }) {
  return <AgentroyGuard>{children}</AgentroyGuard>;
}
