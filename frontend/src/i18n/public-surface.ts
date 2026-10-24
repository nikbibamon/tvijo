import type { Locale } from './config';

/**
 * Copy for the public surface: the sample page, the header call-to-action and
 * the readiness band on the home page.
 *
 * English is the base; Ukrainian and Russian are the other fully supported
 * languages. Like `src/i18n/workspace.ts`, this dictionary lives OUTSIDE the
 * `Translations` contract (`typeof en`, shared by all 11 locale files): adding
 * these keys to en.ts would force ten other locale files to carry them and
 * break `check:i18n`. A locale we do not translate falls back to English,
 * which is what the workspace surface already does.
 *
 * Wording rule for this page: it describes a sample, so it may not borrow the
 * grammar of a live result. "Sample", "illustrative" and "no billing" are part
 * of the content, not a disclaimer bolted to the bottom.
 */

export type DemoCopy = {
  meta: { title: string; description: string };
  sampleBadge: string;
  eyebrow: string;
  title: string;
  intro: string;
  notice: string;
  scopeNote: string;
  nav: { result: string; steps: string; cost: string };
  result: {
    title: string;
    subtitle: string;
    goalLabel: string;
    expectedLabel: string;
    outputLabel: string;
    acceptanceLabel: string;
    acceptedValue: string;
    reviewValue: string;
    sourcesTitle: string;
    sourcesNote: string;
    snapshotLabel: string;
    versionLabel: string;
  };
  steps: {
    title: string;
    subtitle: string;
    replay: string;
    replayReset: string;
    replayNote: string;
    checksTitle: string;
    checksSubtitle: string;
    ruleCol: string;
    resultCol: string;
    evidenceCol: string;
    passed: string;
    failed: string;
    summary: string;
  };
  cost: {
    title: string;
    subtitle: string;
    modelLabel: string;
    providerLabel: string;
    inputLabel: string;
    outputLabel: string;
    totalTokensLabel: string;
    rateLabel: string;
    estimateLabel: string;
    budgetLabel: string;
    heldLabel: string;
    settledLabel: string;
    basisNote: string;
    hashTitle: string;
    contractHashLabel: string;
    evidenceHashLabel: string;
    hashNote: string;
  };
  cta: { title: string; body: string; primary: string; secondary: string };
  error: { title: string; body: string; retry: string };
};

const EN: DemoCopy = {
  meta: {
    title: 'Sample result — TVIJO',
    description:
      'A finished sample run you can read without signing in: the result, the '
      + 'sources behind it, the checks that ran and what it cost.',
  },
  sampleBadge: 'Sample data · no live charges',
  eyebrow: 'Public example',
  title: 'Explore a sample result',
  intro:
    'This is one finished run, recorded the way the product records every run: '
    + 'what was asked, what came back, which checks ran over it, and what the '
    + 'model call cost. Nothing here is running now — opening or refreshing '
    + 'this page starts no work and charges nothing.',
  notice:
    'The company, the sources and the cost basis are synthetic. The checks and '
    + 'the hashes are not: they are produced by the same code that judges a '
    + 'paying run.',
  scopeNote:
    'What this sample covers: a counterparty brief where every claim has to '
    + 'carry a source. Building and hosting a site from a description is a '
    + 'separate workflow and is not shown here.',
  nav: { result: 'Result', steps: 'Steps & checks', cost: 'Model & cost' },
  result: {
    title: 'Result',
    subtitle: 'What the run was asked for, and what it returned.',
    goalLabel: 'Goal',
    expectedLabel: 'Expected result',
    outputLabel: 'Returned brief',
    acceptanceLabel: 'Acceptance',
    acceptedValue: 'Example accepted',
    reviewValue: 'Needs review',
    sourcesTitle: 'Approved sources',
    sourcesNote:
      'Only these sources were allowed. A claim citing anything else fails the '
      + 'check. The refs are placeholders, not live documents.',
    snapshotLabel: 'What the source said',
    versionLabel: 'Version',
  },
  steps: {
    title: 'Steps & checks',
    subtitle:
      'The states a run actually moves through, and the deterministic rules '
      + 'that decide whether it passed.',
    replay: 'Replay example',
    replayReset: 'Show all steps',
    replayNote:
      'Replay walks through the steps already recorded above. It sends no '
      + 'prompt, starts no run and changes no record.',
    checksTitle: 'Acceptance checks',
    checksSubtitle:
      'Deterministic rules, not a model marking its own work. One failure '
      + 'sends the run back for rework.',
    ruleCol: 'Rule',
    resultCol: 'Result',
    evidenceCol: 'Evidence',
    passed: 'Passed',
    failed: 'Failed',
    summary: 'checks passed',
  },
  cost: {
    title: 'Model & cost',
    subtitle: 'What was bound, what it consumed and how the number was reached.',
    modelLabel: 'Model',
    providerLabel: 'Provider',
    inputLabel: 'Input tokens',
    outputLabel: 'Output tokens',
    totalTokensLabel: 'Total tokens',
    rateLabel: 'Rate applied (per million tokens)',
    estimateLabel: 'Model cost, this run',
    budgetLabel: 'Contract budget',
    heldLabel: 'Held before the call',
    settledLabel: 'Settled after the call',
    basisNote:
      'An illustrative rate applied to the token counts above, so the '
      + 'arithmetic can be checked. It is not a quoted price and not a bill.',
    hashTitle: 'Verifiable record',
    contractHashLabel: 'Contract hash',
    evidenceHashLabel: 'Evidence pack hash',
    hashNote:
      'Both hashes are computed from the content shown on this page, so the '
      + 'same input reproduces the same value.',
  },
  cta: {
    title: 'Open your own workspace',
    body:
      'Sign in to start from this example. You get your own workspace with '
      + 'your own limits; nothing from this sample is copied into it.',
    primary: 'Open your workspace',
    secondary: 'See how limits work',
  },
  error: {
    title: 'The sample could not be loaded',
    body:
      'The sample is served by our API and that request did not come back. '
      + 'Nothing is wrong with your account — there is nothing to charge here.',
    retry: 'Try again',
  },
};

const RU: DemoCopy = {
  meta: {
    title: 'Пример результата — TVIJO',
    description:
      'Завершённый пример прогона, который видно без входа: результат, '
      + 'источники под ним, пройденные проверки и стоимость.',
  },
  sampleBadge: 'Пример данных · без списаний',
  eyebrow: 'Публичный пример',
  title: 'Посмотрите пример результата',
  intro:
    'Это один завершённый прогон, записанный так же, как продукт записывает '
    + 'любой другой: что просили, что вернулось, какие проверки прошли и '
    + 'сколько стоил вызов модели. Сейчас здесь ничего не выполняется — '
    + 'открытие и обновление страницы не запускают работу и ничего не тратят.',
  notice:
    'Компания, источники и база расчёта стоимости — синтетические. Проверки и '
    + 'хеши — нет: их считает тот же код, который оценивает платный прогон.',
  scopeNote:
    'Что показывает этот пример: справку о контрагенте, где каждое утверждение '
    + 'обязано опираться на источник. Сборка и размещение сайта по описанию — '
    + 'отдельный сценарий, здесь он не показан.',
  nav: { result: 'Результат', steps: 'Шаги и проверки', cost: 'Модель и стоимость' },
  result: {
    title: 'Результат',
    subtitle: 'Что просили у прогона и что он вернул.',
    goalLabel: 'Цель',
    expectedLabel: 'Ожидаемый результат',
    outputLabel: 'Полученная справка',
    acceptanceLabel: 'Приёмка',
    acceptedValue: 'Пример принят',
    reviewValue: 'Требует пересмотра',
    sourcesTitle: 'Разрешённые источники',
    sourcesNote:
      'Разрешены только эти источники. Утверждение со ссылкой на что-то другое '
      + 'проверку не проходит. Ссылки — плейсхолдеры, не живые документы.',
    snapshotLabel: 'Что сказал источник',
    versionLabel: 'Версия',
  },
  steps: {
    title: 'Шаги и проверки',
    subtitle:
      'Состояния, через которые прогон действительно проходит, и '
      + 'детерминированные правила, решающие, принят ли он.',
    replay: 'Проиграть пример',
    replayReset: 'Показать все шаги',
    replayNote:
      'Проигрывание проходит по уже записанным выше шагам. Оно не отправляет '
      + 'запрос модели, не запускает прогон и ничего не меняет.',
    checksTitle: 'Проверки приёмки',
    checksSubtitle:
      'Детерминированные правила, а не модель, оценивающая саму себя. Одна '
      + 'неудача отправляет прогон на доработку.',
    ruleCol: 'Правило',
    resultCol: 'Результат',
    evidenceCol: 'Доказательство',
    passed: 'Пройдено',
    failed: 'Не пройдено',
    summary: 'проверок пройдено',
  },
  cost: {
    title: 'Модель и стоимость',
    subtitle: 'Что было привязано, сколько израсходовано и как получено число.',
    modelLabel: 'Модель',
    providerLabel: 'Провайдер',
    inputLabel: 'Входные токены',
    outputLabel: 'Выходные токены',
    totalTokensLabel: 'Всего токенов',
    rateLabel: 'Применённая ставка (за миллион токенов)',
    estimateLabel: 'Стоимость модели за прогон',
    budgetLabel: 'Бюджет контракта',
    heldLabel: 'Удержано до вызова',
    settledLabel: 'Списано после вызова',
    basisNote:
      'Иллюстративная ставка, применённая к числу токенов выше, чтобы '
      + 'арифметику можно было проверить. Это не тариф и не счёт.',
    hashTitle: 'Проверяемая запись',
    contractHashLabel: 'Хеш контракта',
    evidenceHashLabel: 'Хеш пакета доказательств',
    hashNote:
      'Оба хеша считаются от показанного на этой странице содержимого: те же '
      + 'входные данные дают то же значение.',
  },
  cta: {
    title: 'Откройте своё рабочее пространство',
    body:
      'Войдите, чтобы начать с этого примера. Вы получите своё пространство со '
      + 'своими лимитами; ничего из этого примера в него не копируется.',
    primary: 'Открыть рабочее пространство',
    secondary: 'Как устроены лимиты',
  },
  error: {
    title: 'Не удалось загрузить пример',
    body:
      'Пример отдаёт наш API, и этот запрос не вернулся. С вашим аккаунтом всё '
      + 'в порядке — здесь нечего списывать.',
    retry: 'Попробовать снова',
  },
};

const UK: DemoCopy = {
  meta: {
    title: 'Приклад результату — TVIJO',
    description:
      'Завершений приклад прогону, який видно без входу: результат, джерела '
      + 'під ним, пройдені перевірки та вартість.',
  },
  sampleBadge: 'Приклад даних · без списань',
  eyebrow: 'Публічний приклад',
  title: 'Перегляньте приклад результату',
  intro:
    'Це один завершений прогін, записаний так само, як продукт записує '
    + 'будь-який інший: що просили, що повернулося, які перевірки пройшли і '
    + 'скільки коштував виклик моделі. Зараз тут нічого не виконується — '
    + 'відкриття та оновлення сторінки не запускають роботу і нічого не '
    + 'витрачають.',
  notice:
    'Компанія, джерела та база розрахунку вартості — синтетичні. Перевірки та '
    + 'хеші — ні: їх рахує той самий код, що оцінює платний прогін.',
  scopeNote:
    'Що показує цей приклад: довідку про контрагента, де кожне твердження має '
    + 'спиратися на джерело. Складання й розміщення сайту за описом — окремий '
    + 'сценарій, тут він не показаний.',
  nav: { result: 'Результат', steps: 'Кроки та перевірки', cost: 'Модель і вартість' },
  result: {
    title: 'Результат',
    subtitle: 'Що просили у прогону і що він повернув.',
    goalLabel: 'Мета',
    expectedLabel: 'Очікуваний результат',
    outputLabel: 'Отримана довідка',
    acceptanceLabel: 'Приймання',
    acceptedValue: 'Приклад прийнято',
    reviewValue: 'Потребує перегляду',
    sourcesTitle: 'Дозволені джерела',
    sourcesNote:
      'Дозволені лише ці джерела. Твердження з посиланням на щось інше '
      + 'перевірку не проходить. Посилання — заповнювачі, не живі документи.',
    snapshotLabel: 'Що сказало джерело',
    versionLabel: 'Версія',
  },
  steps: {
    title: 'Кроки та перевірки',
    subtitle:
      'Стани, через які прогін справді проходить, і детерміновані правила, що '
      + 'вирішують, чи прийнятий він.',
    replay: 'Програти приклад',
    replayReset: 'Показати всі кроки',
    replayNote:
      'Програвання проходить уже записаними вище кроками. Воно не надсилає '
      + 'запит моделі, не запускає прогін і нічого не змінює.',
    checksTitle: 'Перевірки приймання',
    checksSubtitle:
      'Детерміновані правила, а не модель, що оцінює саму себе. Одна невдача '
      + 'відправляє прогін на доопрацювання.',
    ruleCol: 'Правило',
    resultCol: 'Результат',
    evidenceCol: 'Доказ',
    passed: 'Пройдено',
    failed: 'Не пройдено',
    summary: 'перевірок пройдено',
  },
  cost: {
    title: 'Модель і вартість',
    subtitle: 'Що було прив’язано, скільки витрачено і як отримано число.',
    modelLabel: 'Модель',
    providerLabel: 'Провайдер',
    inputLabel: 'Вхідні токени',
    outputLabel: 'Вихідні токени',
    totalTokensLabel: 'Усього токенів',
    rateLabel: 'Застосована ставка (за мільйон токенів)',
    estimateLabel: 'Вартість моделі за прогін',
    budgetLabel: 'Бюджет контракту',
    heldLabel: 'Утримано до виклику',
    settledLabel: 'Списано після виклику',
    basisNote:
      'Ілюстративна ставка, застосована до кількості токенів вище, щоб '
      + 'арифметику можна було перевірити. Це не тариф і не рахунок.',
    hashTitle: 'Перевірюваний запис',
    contractHashLabel: 'Хеш контракту',
    evidenceHashLabel: 'Хеш пакета доказів',
    hashNote:
      'Обидва хеші рахуються від показаного на цій сторінці вмісту: ті самі '
      + 'вхідні дані дають те саме значення.',
  },
  cta: {
    title: 'Відкрийте свій робочий простір',
    body:
      'Увійдіть, щоб почати з цього прикладу. Ви отримаєте свій простір із '
      + 'власними лімітами; нічого з цього прикладу до нього не копіюється.',
    primary: 'Відкрити робочий простір',
    secondary: 'Як влаштовані ліміти',
  },
  error: {
    title: 'Не вдалося завантажити приклад',
    body:
      'Приклад віддає наш API, і цей запит не повернувся. З вашим обліковим '
      + 'записом усе гаразд — тут нічого списувати.',
    retry: 'Спробувати ще раз',
  },
};

export function getDemoCopy(locale: Locale): DemoCopy {
  if (locale === 'uk') return UK;
  if (locale === 'ru') return RU;
  return EN;
}

/* ------------------------- header / hero buttons -------------------------- */

/**
 * The four public call-to-action labels, in every supported language.
 *
 * These are short enough to carry all eleven locales, and they must: a header
 * that says "Book Demo" in German while the button now opens a read-only
 * sample is a worse lie than an untranslated one. The long sample-page copy
 * above stays EN/RU/UK with an English fallback, as the workspace dictionary
 * already does.
 */
export type PublicCta = {
  demo: string;
  exploreDemo: string;
  openWorkspace: string;
  talkToUs: string;
};

const CTA: Record<Locale, PublicCta> = {
  en: { demo: 'Demo', exploreDemo: 'Explore the demo', openWorkspace: 'Open your workspace', talkToUs: 'Talk to us' },
  ru: { demo: 'Демо', exploreDemo: 'Посмотреть пример', openWorkspace: 'Открыть рабочее пространство', talkToUs: 'Связаться с нами' },
  uk: { demo: 'Демо', exploreDemo: 'Переглянути приклад', openWorkspace: 'Відкрити робочий простір', talkToUs: 'Зв’язатися з нами' },
  de: { demo: 'Demo', exploreDemo: 'Demo ansehen', openWorkspace: 'Workspace öffnen', talkToUs: 'Kontakt aufnehmen' },
  es: { demo: 'Demo', exploreDemo: 'Ver la demo', openWorkspace: 'Abrir tu espacio de trabajo', talkToUs: 'Hablar con nosotros' },
  pt: { demo: 'Demo', exploreDemo: 'Ver a demonstração', openWorkspace: 'Abrir seu espaço de trabalho', talkToUs: 'Fale conosco' },
  nl: { demo: 'Demo', exploreDemo: 'Bekijk de demo', openWorkspace: 'Open je werkruimte', talkToUs: 'Neem contact op' },
  ja: { demo: 'デモ', exploreDemo: 'デモを見る', openWorkspace: 'ワークスペースを開く', talkToUs: 'お問い合わせ' },
  ko: { demo: '데모', exploreDemo: '데모 살펴보기', openWorkspace: '워크스페이스 열기', talkToUs: '문의하기' },
  zh: { demo: '演示', exploreDemo: '查看演示', openWorkspace: '打开工作区', talkToUs: '联系我们' },
  hi: { demo: 'डेमो', exploreDemo: 'डेमो देखें', openWorkspace: 'अपना वर्कस्पेस खोलें', talkToUs: 'हमसे बात करें' },
};

export function getPublicCta(locale: Locale): PublicCta {
  return CTA[locale] ?? CTA.en;
}

/* --------------------------- home readiness band -------------------------- */

/**
 * What a visitor can do today, and what is only in preparation.
 *
 * The home page offered "Install TVIJO DSH" and hosted deployment as if they
 * existed. The distribution repository holds a licence file and nothing else,
 * and hosted previews are not built, so the honest shape of this block is two
 * lists rather than three buttons. A path with nothing behind it gets a status
 * line here, never a button that pretends to start it.
 */
export type ReadinessCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  todayTitle: string;
  today: Array<{ title: string; body: string }>;
  soonTitle: string;
  soon: Array<{ title: string; body: string; status: string }>;
  footnote: string;
};

const READINESS_EN: ReadinessCopy = {
  eyebrow: 'Where it stands',
  title: 'What works today, and what is still being built',
  subtitle:
    'One list of each, so nothing on this page has to be taken on trust.',
  todayTitle: 'Available now',
  today: [
    {
      title: 'Read a finished sample',
      body: 'A complete run — result, sources, checks, cost — without an account.',
    },
    {
      title: 'Your own workspace',
      body: 'Sign in, connect your provider key and see usage, budget and runs in one place.',
    },
    {
      title: 'Contracts with evidence',
      body: 'Freeze what a run may do, hold the budget before the call, and keep a hash anyone can recheck.',
    },
  ],
  soonTitle: 'In preparation',
  soon: [
    {
      title: 'TVIJO DSH',
      body: 'Our distribution of the DeepSeek Harness agent workspace, with TVIJO sign-in and a scoped key.',
      status: 'No release to download yet',
    },
    {
      title: 'TVIJO hosting',
      body: 'A limited hosted preview of a project you built here.',
      status: 'Not open yet',
    },
    {
      title: 'Your own server',
      body: 'Run the same project on your infrastructure, connected to your TVIJO workspace.',
      status: 'Enrollment not released yet',
    },
  ],
  footnote:
    'Nothing in the second list can be bought or started today. When one ships, it appears in the first list with the path to use it.',
};

const READINESS_RU: ReadinessCopy = {
  eyebrow: 'Как обстоят дела',
  title: 'Что работает сегодня, а что ещё делается',
  subtitle: 'По списку на каждое, чтобы ничего на этой странице не приходилось принимать на веру.',
  todayTitle: 'Доступно сейчас',
  today: [
    {
      title: 'Прочитать готовый пример',
      body: 'Завершённый прогон — результат, источники, проверки, стоимость — без аккаунта.',
    },
    {
      title: 'Своё рабочее пространство',
      body: 'Войдите, подключите свой ключ провайдера и видите расход, бюджет и прогоны в одном месте.',
    },
    {
      title: 'Контракты с доказательствами',
      body: 'Зафиксируйте, что прогону разрешено, удержите бюджет до вызова и оставьте хеш, который можно перепроверить.',
    },
  ],
  soonTitle: 'В подготовке',
  soon: [
    {
      title: 'TVIJO DSH',
      body: 'Наша сборка рабочей среды агентов DeepSeek Harness со входом TVIJO и ограниченным ключом.',
      status: 'Скачиваемого релиза пока нет',
    },
    {
      title: 'Хостинг TVIJO',
      body: 'Ограниченный размещённый предпросмотр проекта, собранного здесь.',
      status: 'Пока не открыт',
    },
    {
      title: 'Свой сервер',
      body: 'Тот же проект на вашей инфраструктуре, подключённый к вашему пространству TVIJO.',
      status: 'Подключение пока не выпущено',
    },
  ],
  footnote:
    'Ничего из второго списка сегодня нельзя купить или запустить. Когда что-то выйдет, оно появится в первом списке вместе с путём к нему.',
};

const READINESS_UK: ReadinessCopy = {
  eyebrow: 'Як справи',
  title: 'Що працює сьогодні, а що ще робиться',
  subtitle: 'По списку на кожне, щоб нічого на цій сторінці не доводилося приймати на віру.',
  todayTitle: 'Доступно зараз',
  today: [
    {
      title: 'Прочитати готовий приклад',
      body: 'Завершений прогін — результат, джерела, перевірки, вартість — без облікового запису.',
    },
    {
      title: 'Свій робочий простір',
      body: 'Увійдіть, підключіть свій ключ провайдера і бачте витрати, бюджет і прогони в одному місці.',
    },
    {
      title: 'Контракти з доказами',
      body: 'Зафіксуйте, що прогону дозволено, утримайте бюджет до виклику і залиште хеш, який можна перевірити.',
    },
  ],
  soonTitle: 'У підготовці',
  soon: [
    {
      title: 'TVIJO DSH',
      body: 'Наша збірка робочого середовища агентів DeepSeek Harness із входом TVIJO та обмеженим ключем.',
      status: 'Релізу для завантаження ще немає',
    },
    {
      title: 'Хостинг TVIJO',
      body: 'Обмежений розміщений попередній перегляд проєкту, зібраного тут.',
      status: 'Ще не відкрито',
    },
    {
      title: 'Власний сервер',
      body: 'Той самий проєкт на вашій інфраструктурі, підключений до вашого простору TVIJO.',
      status: 'Підключення ще не випущено',
    },
  ],
  footnote:
    'Нічого з другого списку сьогодні не можна купити або запустити. Коли щось вийде, воно з’явиться в першому списку разом зі шляхом до нього.',
};

export function getReadinessCopy(locale: Locale): ReadinessCopy {
  if (locale === 'uk') return READINESS_UK;
  if (locale === 'ru') return READINESS_RU;
  return READINESS_EN;
}
