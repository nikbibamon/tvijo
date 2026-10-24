import type { Metadata } from 'next';

import AIRadarPage from '@/components/ai-radar/AIRadarPage';
import { aiRadarCopy, aiRadarLanguage } from '@/data/ai-radar';
import { LOCALES } from '@/i18n/config';
import { marketingMetadata } from '@/lib/seo/marketing';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const copy = aiRadarCopy[aiRadarLanguage(params.locale)];
  return marketingMetadata({
    locale: params.locale,
    path: '/ai-radar',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: copy.metaKeywords,
  });
}

export default function Page({ params }: { params: { locale: string } }) {
  return <AIRadarPage locale={params.locale} />;
}

