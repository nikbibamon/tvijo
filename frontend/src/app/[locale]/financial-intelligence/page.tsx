import { permanentRedirect } from 'next/navigation';

export default function FinancialIntelligencePage({
  params,
}: {
  params: { locale: string };
}) {
  permanentRedirect(`/${params.locale}/market-intelligence`);
}
