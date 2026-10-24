import { permanentRedirect } from 'next/navigation';

export default function JobsPage({
  params,
}: {
  params: { locale: string };
}) {
  permanentRedirect(`/${params.locale}`);
}
