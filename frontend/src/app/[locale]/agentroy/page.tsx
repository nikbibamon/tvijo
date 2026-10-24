import type { Metadata } from 'next';
import AgentroyCenter from '@/components/agentroy/AgentroyCenter';

export const metadata: Metadata = {
  title: 'Operator command center | Tvijo',
  robots: { index: false, follow: false },
};

export default function AgentroyPage() {
  return <AgentroyCenter />;
}
