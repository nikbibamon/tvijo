import type { Metadata } from 'next';
import ServiceNotOpen, { serviceNotOpenMetadata } from '@/components/marketing/ServiceNotOpen';

export const metadata: Metadata = serviceNotOpenMetadata('PeopleVsAI', '/peoplevsai');

export default function PeopleVsAIPage() {
  return <ServiceNotOpen name="PeopleVsAI" />;
}
