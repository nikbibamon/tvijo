import type { Metadata } from 'next';
import { Pricing } from '@/components/business/TvijoBusiness';
import { loadPublicPricing } from '@/lib/tvijo-public-pricing';

export const metadata: Metadata = {
  title: 'Ціни · Tvijo',
  alternates: { canonical: 'https://tvijo.com/ua/pricing' },
};

export default async function UkrainianPricesPage() {
  return (
    <main lang="uk" className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
      <a href="/ua/" className="underline">Tvijo для компаній</a>
      <Pricing rates={await loadPublicPricing()} locale="uk" standalone />
    </main>
  );
}
