import { notFound, permanentRedirect } from 'next/navigation';
import { BusinessPage, businessMetadata } from '@/components/business/TvijoBusiness';

function businessLocale(locale: string) {
  if (locale === 'uk') permanentRedirect('/ua/');
  if (locale === 'en' || locale === 'ru') return locale;
  notFound();
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return businessMetadata(businessLocale(params.locale));
}

export default function LocalizedBusinessPage({ params }: { params: { locale: string } }) {
  return <BusinessPage locale={businessLocale(params.locale)} />;
}
