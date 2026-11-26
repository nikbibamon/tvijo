/**
 * Server wrapper for /[locale]/changelog: its own title and canonical instead of the
 * locale home. Public visitors see the published extension releases; platform history
 * stays staff-only. Copy exists in EN and RU; other locales render English under noindex.
 */
import type { Metadata } from 'next';
import { marketingMetadata } from '@/lib/seo/marketing';
import ChangelogClient from './ChangelogClient';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const ru = params.locale === 'ru';
  return marketingMetadata({
    locale: params.locale,
    path: '/changelog',
    title: ru ? 'Выпуски расширения Tvijo — история версий' : 'Tvijo extension releases — changelog',
    description: ru
      ? 'Опубликованные выпуски расширения Tvijo: версия, дата, контрольная сумма и ограничения. История платформы доступна сотрудникам.'
      : 'Published Tvijo extension releases with version, date, checksum and limits. Platform history is available to staff.',
    keywords: ru ? ['Tvijo', 'история версий', 'выпуски расширения', 'VSIX'] : ['Tvijo', 'changelog', 'extension releases', 'VSIX'],
  });
}

export default function ChangelogPage() {
  return <ChangelogClient />;
}
