import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title: 'FinAI - AI-Powered Financial Intelligence | Tvijo',
    description: 'AI-powered market intelligence for financial analysis, market insights, and data-driven research. Real-time data, semantic models, and analytics. Public beta.',
    keywords: ['AI', 'financial analysis', 'market intelligence', 'crypto', 'stocks', 'portfolio', 'analytics'],
    alternates: { canonical: `https://tvijo.com/${params.locale}/finai` },
    openGraph: {
      title: 'FinAI - AI-Powered Financial Intelligence',
      description: 'AI market intelligence for financial markets. Real-time analysis, semantic models, and actionable insights. Public beta.',
      type: 'website',
      images: [{ url: 'https://tvijo.com/og-image.png', width: 1200, height: 630,
                 alt: 'FinAI - AI-Powered Financial Intelligence' }],
    },
  };
}

export default function FinAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
