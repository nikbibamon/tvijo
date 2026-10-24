import { permanentRedirect } from 'next/navigation';

export default function TradingLabRoute({
  params,
}: {
  params: { locale: string };
}) {
  // Trading Lab has been retired. The AI OS demo workspace is the only demo surface.
  permanentRedirect(`/${params.locale}/demo`);
}
