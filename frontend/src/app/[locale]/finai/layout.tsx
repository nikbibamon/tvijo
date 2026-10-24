import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FinAI - AI-Powered Financial Intelligence | Tvijo',
  description: 'AI-powered market intelligence for financial analysis, market insights, and data-driven research. Real-time data, semantic models, and analytics. Public beta.',
  keywords: ['AI', 'financial analysis', 'market intelligence', 'crypto', 'stocks', 'portfolio', 'analytics'],
  openGraph: {
    title: 'FinAI - AI-Powered Financial Intelligence',
    description: 'AI market intelligence for financial markets. Real-time analysis, semantic models, and actionable insights. Public beta.',
    type: 'website',
  },
};

export default function FinAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
