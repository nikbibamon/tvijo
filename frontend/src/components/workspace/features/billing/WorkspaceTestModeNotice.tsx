'use client';

/**
 * Billing is in test mode: no live checkout, no charges. States the service-credit unit
 * once, with the same definition as the public service record and task receipts.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';

const COPY = {
  en: {
    badge: 'Test mode', title: 'Payments are not live',
    body: 'There is no live checkout and no card is charged. Tvijo Tokens (TT) are an internal service credit: 1 USD = 1,000 TT and 1 TT = 1,000,000 micro_tvijo. TT are not crypto and not model tokens.',
    receipts: 'Per-task reserved, debited, held and released credits appear in task receipts under Runs & Evidence.',
    link: 'Open task receipts',
  },
  ru: {
    badge: 'Тестовый режим', title: 'Оплата не подключена',
    body: 'Живой оплаты нет, карты не списываются. Tvijo Tokens (TT) — внутренний сервисный кредит: 1 USD = 1000 TT, 1 TT = 1 000 000 micro_tvijo. TT — не криптовалюта и не токены модели.',
    receipts: 'Зарезервированные, списанные, удержанные и освобождённые кредиты по каждой задаче видны в квитанциях раздела «Запуски и доказательства».',
    link: 'Открыть квитанции задач',
  },
  uk: {
    badge: 'Тестовий режим', title: 'Оплату не підключено',
    body: 'Живої оплати немає, картки не списуються. Tvijo Tokens (TT) — внутрішній сервісний кредит: 1 USD = 1000 TT, 1 TT = 1 000 000 micro_tvijo. TT — не криптовалюта і не токени моделі.',
    receipts: 'Зарезервовані, списані, утримані та звільнені кредити за кожною задачею видно в квитанціях розділу «Запуски та докази».',
    link: 'Відкрити квитанції задач',
  },
} as const;

export default function WorkspaceTestModeNotice() {
  const route = parseLocale(usePathname());
  const l = route === 'ru' || route === 'uk' ? route : 'en';
  const t = COPY[l];
  return (
    <section className="twk-admin-panel" role="note" aria-label={t.badge} data-testid="billing-test-mode">
      <header className="twk-admin-panel-head">
        <div><p className="twk-eyebrow">{t.badge}</p><h2>{t.title}</h2></div>
      </header>
      <p className="twk-notice-body">{t.body}</p>
      <p className="twk-notice-body">{t.receipts} <Link href={`/${route}/workspace/runs`}>{t.link} →</Link></p>
    </section>
  );
}
