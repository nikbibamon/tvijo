import { BusinessPage, businessMetadata } from '@/components/business/TvijoBusiness';

export const metadata = businessMetadata('uk');

export default function UkrainianBusinessPage() {
  return <BusinessPage locale="uk" />;
}
