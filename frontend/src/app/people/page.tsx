import type { Metadata } from 'next';
import ServiceNotOpen, { serviceNotOpenMetadata } from '@/components/marketing/ServiceNotOpen';

export const metadata: Metadata = serviceNotOpenMetadata('People', '/people');

export default function PeoplePage() {
  return <ServiceNotOpen name="People" />;
}
