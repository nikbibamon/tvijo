import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BASE_URL } from '@/lib/seo/marketing';

/**
 * SEO-20261103: страница — клиентский компонент без своих метаданных, поэтому
 * canonical и title наследовались от `[locale]/layout.tsx`: canonical указывал
 * на корень локали, и страница считалась его копией. Layout даёт странице её
 * собственные canonical, title, description и og:image.
 */
const COPY: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Achievements and rewards',
    description: 'How the Tvijo gamification system counts XP, badges and streaks for reading articles, comments and shares.',
  },
  ru: {
    title: 'Достижения и награды',
    description: 'Как в Tvijo считаются XP, значки и серии: за чтение статей, комментарии и репосты.',
  },
};

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = params.locale in COPY ? params.locale : 'en';
  const { title, description } = COPY[locale];
  // Текст берём из en/ru, а canonical — всегда свой адрес: иначе у девяти
  // непереведённых локалей canonical уезжал на /en.
  const url = `${BASE_URL}/${params.locale}/achievements`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Tvijo',
      images: [{ url: 'https://tvijo.com/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://tvijo.com/og-image.png'],
    },
  };
}

export default function AchievementsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
