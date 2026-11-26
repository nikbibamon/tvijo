import type { Metadata } from 'next';
import ServiceNotOpen, { serviceNotOpenMetadata } from '@/components/marketing/ServiceNotOpen';

export const metadata: Metadata = serviceNotOpenMetadata('MyOwnAI', '/myownai');

export default function MyOwnAIPage() {
  return <ServiceNotOpen name="MyOwnAI" />;
}
