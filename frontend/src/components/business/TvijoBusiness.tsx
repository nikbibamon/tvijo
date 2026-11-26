import type { Metadata } from 'next';
import { loadPublicPricing, type PublicPricing } from '@/lib/tvijo-public-pricing';

const PATHS = { en: '/en/for-business', ru: '/ru/for-business', uk: '/ua/' } as const;
const WORKSPACE = 'https://platform.tvijo.com/';
const HOTIDO_REQUEST = 'https://hotido.com/ua/b2b/it-services';
type BusinessLocale = keyof typeof PATHS;

const COPY = {
  en: {
    title: 'Tvijo for companies',
    summary: 'Connect Tvijo DSHREM to your editor and work with AI models under your team’s access and budget rules.',
    signIn: 'Sign in to your workspace',
    exampleTitle: 'Example task',
    example: 'Ask Tvijo to review a change in your invoicing module. Add the relevant files and inspect the proposed diff and usage before accepting it.',
    setupTitle: 'What your IT team needs',
    setup: [
      ['Editor and extension', 'Install the Tvijo DSHREM VSIX in VS Code or VSCodium. Managed routes use Tvijo service credits.'],
      ['Network access', 'Allow outbound HTTPS to tvijo.com, platform.tvijo.com and dsh.tvijo.com for sign-in, workspace access and downloads.'],
      ['Data sent with a request', 'Tvijo receives the prompt and attached project context. The selected provider processes the context sent for inference. Review which files and text your team may send.'],
      ['Company administrator', 'Appoint an IT administrator to manage access and agree what context the team may send and which limits apply.'],
    ],
    privacy: 'Tvijo privacy notice',
    hotido: 'Go back to the IT request on Hotido',
    pricesTitle: 'Token prices',
    pricesBasis: 'Reference rates per 1 million tokens.',
    markup: 'Tvijo markup',
    empty: 'Prices will appear after the metered API routes pass verification.',
    unavailable: 'The Tvijo price catalog is temporarily unavailable.',
    input: 'Input', output: 'Output', source: 'Price source', language: 'Language',
  },
  ru: {
    title: 'Tvijo для компаний',
    summary: 'Подключите Tvijo DSHREM к редактору и работайте с ИИ-моделями по правилам доступа и бюджета вашей команды.',
    signIn: 'Войти в рабочее пространство',
    exampleTitle: 'Пример задачи',
    example: 'Попросите Tvijo проверить изменение в модуле счетов. Приложите нужные файлы, проверьте предложенные изменения и расход перед принятием результата.',
    setupTitle: 'Что понадобится ИТ-команде',
    setup: [
      ['Редактор и расширение', 'Установите Tvijo DSHREM VSIX в VS Code или VSCodium. Для управляемых маршрутов используются кредиты Tvijo.'],
      ['Сетевой доступ', 'Разрешите исходящий HTTPS к tvijo.com, platform.tvijo.com и dsh.tvijo.com для входа, работы и скачивания.'],
      ['Какие данные уходят', 'Tvijo получает запрос и приложенный контекст проекта. Выбранный провайдер обрабатывает контекст, переданный для ответа модели. Определите, какие файлы и текст команда может отправлять.'],
      ['Администратор компании', 'Назначьте ИТ-администратора, который управляет доступом и согласует правила передачи контекста и лимиты.'],
    ],
    privacy: 'Политика конфиденциальности Tvijo',
    hotido: 'Вернуться к ИТ-заявке на Hotido',
    pricesTitle: 'Цены на токены',
    pricesBasis: 'Справочные цены за 1 млн токенов.',
    markup: 'Наценка Tvijo',
    empty: 'Цены появятся после проверки маршрутов API с учётом расходов.',
    unavailable: 'Каталог цен Tvijo временно недоступен.',
    input: 'Вход', output: 'Выход', source: 'Источник цены', language: 'Язык',
  },
  uk: {
    title: 'Tvijo для компаній',
    summary: 'Підключіть Tvijo DSHREM до редактора й працюйте з ШІ-моделями за правилами доступу та бюджету вашої команди.',
    signIn: 'Увійти до робочого простору',
    exampleTitle: 'Приклад завдання',
    example: 'Попросіть Tvijo перевірити зміну в модулі рахунків. Додайте потрібні файли, перегляньте запропоновані зміни та витрати перед прийняттям результату.',
    setupTitle: 'Що знадобиться ІТ-команді',
    setup: [
      ['Редактор і розширення', 'Встановіть Tvijo DSHREM VSIX у VS Code або VSCodium. Для керованих маршрутів використовуються кредити Tvijo.'],
      ['Доступ до мережі', 'Дозвольте вихідний HTTPS до tvijo.com, platform.tvijo.com і dsh.tvijo.com для входу, роботи й завантаження.'],
      ['Які дані передаються', 'Tvijo отримує запит і доданий контекст проєкту. Вибраний провайдер обробляє контекст, надісланий моделі для відповіді. Визначте, які файли й текст команда може надсилати.'],
      ['Адміністратор компанії', 'Призначте ІТ-адміністратора, який керуватиме доступом і погоджуватиме правила передавання контексту та ліміти.'],
    ],
    privacy: 'Політика конфіденційності Tvijo',
    hotido: 'Повернутися до ІТ-заявки на Hotido',
    pricesTitle: 'Ціни',
    pricesBasis: 'Довідкові ціни за 1 млн токенів.',
    markup: 'Націнка Tvijo',
    empty: 'Ціни з’являться після перевірки маршрутів API з обліком витрат.',
    unavailable: 'Каталог цін Tvijo тимчасово недоступний.',
    input: 'Вхід', output: 'Вихід', source: 'Джерело ціни', language: 'Мова',
  },
};

export function businessMetadata(locale: BusinessLocale): Metadata {
  return {
    title: COPY[locale].title,
    description: COPY[locale].summary,
    alternates: { canonical: PATHS[locale], languages: { ...PATHS, 'x-default': PATHS.en } },
  };
}

const panel = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/70 break-words';
const muted = 'text-slate-600 dark:text-slate-300';
const link = 'text-blue-700 dark:text-sky-300 underline underline-offset-4';

function Pricing({ rates, locale }: { rates: PublicPricing | null; locale: BusinessLocale }) {
  const copy = COPY[locale];
  return (
    <section className="py-8" aria-labelledby="token-prices">
      <h2 id="token-prices" className="text-2xl font-semibold">{copy.pricesTitle}</h2>
      <p className={`mt-2 ${muted}`}>{copy.pricesBasis}</p>
      {rates && (
        <p className={`mt-1 ${muted}`}>
          1 USD = {rates.tt_per_usd} TT · {copy.markup} {rates.managed_markup_percent}%
        </p>
      )}
      {rates?.models.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {rates.models.map((rate) => (
            <article className={panel} key={rate.id}>
              <h3 className="text-lg font-semibold">{rate.name}</h3>
              <p className={`mt-1 ${muted}`} translate="no">{rate.provider}</p>
              <dl className="mt-4 grid gap-y-2 sm:grid-cols-[1fr_auto] sm:gap-x-4">
                <dt>{copy.input}</dt>
                <dd>{rate.input_per_million_usd} USD · {rate.input_per_million_tt} TT</dd>
                <dt>{copy.output}</dt>
                <dd>{rate.output_per_million_usd} USD · {rate.output_per_million_tt} TT</dd>
              </dl>
              <p className="mt-4">
                <a className={link} href={rate.source}>{copy.source}</a>
                {' · '}<time dateTime={rate.observed_at}>{rate.observed_at}</time>
              </p>
            </article>
          ))}
        </div>
      ) : <p className={`${panel} mt-5`}>{rates ? copy.empty : copy.unavailable}</p>}
    </section>
  );
}

export async function BusinessPage({ locale }: { locale: BusinessLocale }) {
  const copy = COPY[locale];
  const rates = await loadPublicPricing();
  return (
    <div className="min-h-screen bg-slate-50 leading-relaxed text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a className="text-lg font-semibold" href="/" translate="no">Tvijo</a>
          <nav className="flex flex-wrap items-center gap-4" aria-label={copy.language}>
            {Object.entries(PATHS).map(([lang, href]) => (
              <a className={lang === locale ? 'font-semibold underline underline-offset-4' : muted}
                key={lang} href={href} hrefLang={lang} aria-current={lang === locale ? 'page' : undefined}>
                {lang === 'uk' ? 'UA' : lang.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid items-center gap-6 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:py-16">
          <div>
            <h1 className="break-words text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{copy.title}</h1>
            <p className={`mt-4 max-w-xl text-lg ${muted}`}>{copy.summary}</p>
            <a className="mt-6 inline-flex max-w-full rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800 dark:bg-sky-300 dark:text-slate-950 dark:hover:bg-sky-200" href={WORKSPACE}>
              {copy.signIn}
            </a>
          </div>
          <section className={panel} aria-labelledby="task-example">
            <h2 id="task-example" className="text-lg font-semibold">{copy.exampleTitle}</h2>
            <p className={`mt-2 ${muted}`}>{copy.example}</p>
          </section>
        </div>
        <section aria-labelledby="it-setup" className="border-y border-slate-200 py-8 dark:border-slate-800">
          <h2 id="it-setup" className="text-2xl font-semibold">{copy.setupTitle}</h2>
          <dl className="mt-5 grid gap-5 md:grid-cols-2">
            {copy.setup.map(([title, detail]) => (
              <div className={panel} key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className={`mt-2 ${muted}`}>{detail}</dd>
              </div>
            ))}
          </dl>
          <a href="https://dsh.tvijo.com/privacy" className={`${link} mt-4 inline-block`}>{copy.privacy}</a>
        </section>
        <Pricing rates={rates} locale={locale} />
        <footer className="border-t border-slate-200 py-6 dark:border-slate-800">
          <a className={link} href={HOTIDO_REQUEST}>{copy.hotido}</a>
        </footer>
      </main>
    </div>
  );
}
