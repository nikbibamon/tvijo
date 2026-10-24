/**
 * /[locale]/proof — what an AI audit-evidence record and pack actually contain.
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §4.
 *
 * The point of this page is checkability: every field is listed with its real
 * status, so a reader can compare it against their auditor's list before
 * booking a call. Fields marked `live` map to columns that exist today in
 * apps/ai/models.py::LLMCallLog; `design` fields are not built. There is no
 * download button here, because there is no export in the product.
 */

import type { ClaimStatus, SolutionLocale } from '@/data/solutions';

export interface ProofField {
  /** Technical field name, identical in both languages. */
  name: string;
  answers: Record<SolutionLocale, string>;
  status: ClaimStatus;
  note: Record<SolutionLocale, string>;
}

export interface ProofCopy {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  fieldsTitle: string;
  fieldsIntro: string;
  colField: string;
  colAnswers: string;
  colStatus: string;
  exampleTitle: string;
  exampleIntro: string;
  exampleCaption: string;
  packTitle: string;
  packIntro: string;
  pack: { title: string; body: string; status: ClaimStatus }[];
  todayTitle: string;
  today: string[];
  notClaimTitle: string;
  notClaim: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
  formTitle: string;
  formSubtitle: string;
  formSubmit: string;
  relatedTitle: string;
}

/** LeadCapture.source for this page — backend accepts the `landing_` prefix. */
export const PROOF_LEAD_SOURCE = 'landing_proof' as const;

export const proofFields: ProofField[] = [
  {
    name: 'timestamp',
    answers: { en: 'When the call happened.', ru: 'Когда произошёл вызов.' },
    status: 'live',
    note: {
      en: 'Stored per record, UTC.',
      ru: 'Пишется в каждой записи, UTC.',
    },
  },
  {
    name: 'actor',
    answers: {
      en: 'Which user or service account made the call.',
      ru: 'Какой пользователь или сервисный аккаунт сделал вызов.',
    },
    status: 'live',
    note: {
      en: 'Nullable for unauthenticated internal jobs — the record says so rather than guessing.',
      ru: 'Может быть пустым для внутренних задач без пользователя — запись это показывает, а не додумывает.',
    },
  },
  {
    name: 'source',
    answers: {
      en: 'Which surface or subsystem originated the call.',
      ru: 'Какая поверхность или подсистема породила вызов.',
    },
    status: 'live',
    note: {
      en: 'Free-form, indexed — the closest thing to "which feature" that exists today.',
      ru: 'Свободная строка с индексом — ближайшее к «какая фича» из того, что есть сегодня.',
    },
  },
  {
    name: 'operation',
    answers: {
      en: 'What the call was for (classification, summary, translation…).',
      ru: 'Для чего был вызов (классификация, резюме, перевод…).',
    },
    status: 'live',
    note: {
      en: 'Indexed, used to group cost by kind of work.',
      ru: 'Индексируется, по нему группируются траты по типу работы.',
    },
  },
  {
    name: 'provider',
    answers: {
      en: 'Which vendor answered.',
      ru: 'Какой вендор ответил.',
    },
    status: 'live',
    note: {
      en: 'Resolved per call across the configured adapters.',
      ru: 'Определяется на каждый вызов среди настроенных адаптеров.',
    },
  },
  {
    name: 'model',
    answers: {
      en: 'Which model actually ran — not which one was requested.',
      ru: 'Какая модель реально отработала — не какую запросили.',
    },
    status: 'live',
    note: {
      en: 'This distinction matters the moment a fallback fires.',
      ru: 'Разница становится важной в ту секунду, когда сработал фолбэк.',
    },
  },
  {
    name: 'input_tokens / output_tokens',
    answers: {
      en: 'How much went in and came out.',
      ru: 'Сколько ушло и сколько вернулось.',
    },
    status: 'live',
    note: {
      en: 'Reported by the provider; absent when the provider does not return counts.',
      ru: 'Отдаётся провайдером; отсутствует, если провайдер счётчиков не вернул.',
    },
  },
  {
    name: 'latency_ms',
    answers: {
      en: 'How long the call took.',
      ru: 'Сколько занял вызов.',
    },
    status: 'live',
    note: {
      en: 'Useful for the "was a human waiting on this" question.',
      ru: 'Нужно для вопроса «ждал ли этого человек».',
    },
  },
  {
    name: 'cost_usd',
    answers: {
      en: 'Estimated cost of this single call.',
      ru: 'Оценка стоимости именно этого вызова.',
    },
    status: 'live',
    note: {
      en: 'Estimated from token counts and a price table — an estimate, not the invoice line.',
      ru: 'Считается по токенам и таблице цен — это оценка, а не строка из счёта.',
    },
  },
  {
    name: 'request_meta',
    answers: {
      en: 'Structured extras attached at call time.',
      ru: 'Структурированные дополнения, приложенные в момент вызова.',
    },
    status: 'live',
    note: {
      en: 'JSON. Where per-pilot fields live until they earn a column.',
      ru: 'JSON. Здесь живут поля конкретного пилота, пока не заслужат отдельную колонку.',
    },
  },
  {
    name: 'team / project',
    answers: {
      en: 'Which team and initiative the call belongs to.',
      ru: 'К какой команде и инициативе относится вызов.',
    },
    status: 'design',
    note: {
      en: 'No such columns today. Per-team attribution is design, not a setting.',
      ru: 'Таких колонок сегодня нет. Разбивка по командам — проект, а не настройка.',
    },
  },
  {
    name: 'policy_result',
    answers: {
      en: 'Whether a rule allowed, redacted or blocked the call.',
      ru: 'Разрешило правило вызов, замаскировало его или заблокировало.',
    },
    status: 'design',
    note: {
      en: 'There is no policy engine in the product. Routing picks a provider and model; it does not adjudicate.',
      ru: 'Движка политик в продукте нет. Маршрутизация выбирает провайдера и модель, а не выносит решение.',
    },
  },
  {
    name: 'event_hash / chain',
    answers: {
      en: 'Whether the record can still be trusted months later.',
      ru: 'Можно ли доверять записи спустя месяцы.',
    },
    status: 'design',
    note: {
      en: 'Not implemented. Any page telling you our records are tamper-evident today would be wrong.',
      ru: 'Не реализовано. Любая страница, утверждающая, что наши записи защищены от правок, была бы неправа.',
    },
  },
  {
    name: 'scope / retention metadata',
    answers: {
      en: 'Which system and period a pack covers, and how long records are kept.',
      ru: 'Какую систему и период покрывает пакет и сколько хранятся записи.',
    },
    status: 'pilot',
    note: {
      en: 'Agreed per pilot today, because the right answer depends on your auditor and your residency rules.',
      ru: 'Сегодня согласуется в пилоте: правильный ответ зависит от вашего аудитора и требований к резидентности.',
    },
  },
];

/** Illustrative shape of one record. Values are examples, not real traffic. */
export const proofExampleRecord = `{
  "id": "7c1f…",                     // record id
  "timestamp": "2026-08-05T09:14:22Z",
  "actor": "u_314 (analytics service)",
  "source": "kb-translation",
  "operation": "translate_article",
  "provider": "deepseek",
  "model": "deepseek-v4-flash",
  "input_tokens": 2841,
  "output_tokens": 1190,
  "latency_ms": 3120,
  "cost_usd": "0.004310",
  "request_meta": { "article_id": 812, "target_locale": "ru" }

  // not present today — see the table above:
  // "team", "project", "policy_result", "event_hash"
}`;

export const proofCopy: Record<SolutionLocale, ProofCopy> = {
  en: {
    metaTitle: 'AI audit trail: what an evidence record contains',
    metaDescription:
      'Field by field: what an AI audit record holds, what our system stores today and what is still design. No download button, because there is no export yet.',
    eyebrow: 'Evidence',
    headline: 'What an AI evidence record actually contains',
    subhead:
      'Vendors talk about "full audit trails" and then never show you a field list. Here is ours, with each field marked as shipped, pilot work or design. Take it to whoever reviews you and check it against their list before you talk to us.',
    fieldsTitle: 'The record, field by field',
    fieldsIntro:
      'Fields marked live exist today in the router we run on our own AI spend. Fields marked design do not exist — they are the direction, and calling them shipped would be the exact lie this page is against.',
    colField: 'Field',
    colAnswers: 'The question it answers',
    colStatus: 'Status',
    exampleTitle: 'One record, shaped',
    exampleIntro:
      'An illustrative record with example values — the structure is real, the numbers are not from your account or anyone else\'s.',
    exampleCaption: 'Illustrative example. Not exported data, not a customer record.',
    packTitle: 'What a pack would add on top',
    packIntro:
      'A pack is a scoped bundle rather than a dump. None of this is a button in the product today; it is what a pilot assembles with you.',
    pack: [
      {
        title: 'Scope statement',
        body: 'Which system, which period, which decisions — written down, so a reader knows what the pack does not cover.',
        status: 'pilot',
      },
      {
        title: 'Field dictionary',
        body: 'The same table you are reading, frozen at export time, so a reviewer in a year knows what each column meant.',
        status: 'pilot',
      },
      {
        title: 'Records for the scope',
        body: 'The rows themselves, complete within the declared scope rather than sampled.',
        status: 'pilot',
      },
      {
        title: 'Integrity proof',
        body: 'A chain that makes a later edit detectable. Designed, not built — this is the single biggest gap between this page and a finished product.',
        status: 'design',
      },
    ],
    todayTitle: 'What exists today',
    today: [
      'Per-call records with timestamp, actor, source, operation, provider, model, tokens, latency, estimated cost and a JSON extras field — in our own router, covered by tests.',
      'A free External AI Exposure Check that finds AI use nobody registered, with a permanent link per report.',
      'This page: a field list you can check without talking to sales.',
    ],
    notClaimTitle: 'What we do not claim',
    notClaim: [
      'There is no evidence-pack export in the product. No button here produces a file, and none will until the feature exists.',
      'Records are not tamper-evident today. Hash chaining is design intent.',
      'There is no policy engine, so no record carries a policy decision.',
      'We hold no SOC 2 attestation and we are not a legal opinion on any regulation.',
      'Records only cover instrumented traffic. Whatever runs around the instrumentation leaves nothing behind.',
    ],
    faqTitle: 'Questions people actually ask',
    faq: [
      {
        q: 'Can I download a sample evidence pack?',
        a: 'No, and that is deliberate. Export is not built, so a downloadable "sample" would be a designed artefact pretending to be product output. The field table above is the honest version of the same information.',
      },
      {
        q: 'Which of these fields would we get in a pilot?',
        a: 'The live ones immediately, because they already exist. Scope and retention are agreed with you. Team, project, policy result and the integrity chain are design — if your reviewer requires them, you need a different answer today, and we would rather you hear that now.',
      },
      {
        q: 'Is an estimated cost good enough for audit?',
        a: 'For spend attribution it usually is, and we label it as an estimate rather than dressing it up as the invoice. For financial reporting, reconcile against the provider bill.',
      },
      {
        q: 'How does this differ from our observability traces?',
        a: 'Traces are for debugging: sampled, short-lived, freely editable. Evidence is for review: scoped, complete inside that scope, retained deliberately. Same events, different contract.',
      },
      {
        q: 'Where does the record live?',
        a: 'Today, in the Postgres database behind the product. Private deployment and residency are pilot-scoping questions, not switches we can flip on this page.',
      },
    ],
    ctaTitle: 'Bring your reviewer\'s field list',
    ctaBody:
      'Send us what your auditor, customer or board actually asks for. We will mark which fields answer it today, which are pilot work, and which we simply do not have.',
    formTitle: 'Request an evidence walkthrough',
    formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
    formSubmit: 'Request walkthrough',
    relatedTitle: 'Related',
  },
  ru: {
    metaTitle: 'Аудит-след AI: что содержит запись доказательства',
    metaDescription:
      'Поле за полем: что несёт запись AI-аудита, что система хранит сегодня и что пока проект. Кнопки скачивания нет, потому что выгрузки в продукте нет.',
    eyebrow: 'Доказательства',
    headline: 'Что на самом деле содержит запись AI-доказательства',
    subhead:
      'Вендоры говорят про «полный аудит-след» и никогда не показывают список полей. Вот наш, где у каждого поля стоит статус: работает, делается в пилоте или проект. Отнесите его тому, кто вас проверяет, и сверьте с его списком до разговора с нами.',
    fieldsTitle: 'Запись по полям',
    fieldsIntro:
      'Поля со статусом «работает» существуют сегодня в роутере, через который идут наши собственные траты на AI. Поля со статусом «проект» не существуют — это направление, и назвать их готовыми было бы ровно той ложью, против которой эта страница.',
    colField: 'Поле',
    colAnswers: 'На какой вопрос отвечает',
    colStatus: 'Статус',
    exampleTitle: 'Одна запись, форма',
    exampleIntro:
      'Иллюстративная запись с примерными значениями — структура настоящая, числа не из вашего и ничьего аккаунта.',
    exampleCaption: 'Иллюстрация. Не выгруженные данные и не запись клиента.',
    packTitle: 'Что пакет добавляет сверху',
    packIntro:
      'Пакет — это ограниченный набор, а не свалка. Ничего из этого не является кнопкой в продукте сегодня; это то, что собирается вместе с вами в пилоте.',
    pack: [
      {
        title: 'Заявленная область',
        body: 'Какая система, какой период, какие решения — записано, чтобы читатель понимал, чего в пакете нет.',
        status: 'pilot',
      },
      {
        title: 'Словарь полей',
        body: 'Та же таблица, что вы читаете, зафиксированная на момент выгрузки: через год проверяющий поймёт, что значила каждая колонка.',
        status: 'pilot',
      },
      {
        title: 'Записи по области',
        body: 'Сами строки — полные внутри заявленной области, а не выборка.',
        status: 'pilot',
      },
      {
        title: 'Подтверждение целостности',
        body: 'Цепочка, при которой поздняя правка становится обнаружимой. Спроектировано, но не построено — это главный разрыв между этой страницей и законченным продуктом.',
        status: 'design',
      },
    ],
    todayTitle: 'Что работает сегодня',
    today: [
      'Записи на каждый вызов: время, актор, источник, операция, провайдер, модель, токены, задержка, оценка стоимости и JSON-поле для дополнений — в нашем роутере, с тестами.',
      'Бесплатная внешняя проверка AI-периметра, которая находит незарегистрированное использование, с постоянной ссылкой на каждый отчёт.',
      'Эта страница: список полей, который можно проверить, не разговаривая с продажами.',
    ],
    notClaimTitle: 'Чего мы не обещаем',
    notClaim: [
      'В продукте нет выгрузки evidence pack. Ни одна кнопка здесь не отдаёт файл и не будет, пока функции не существует.',
      'Записи сегодня не защищены от правок. Хеш-цепочка — это проект.',
      'Движка политик нет, поэтому ни одна запись не несёт решения политики.',
      'У нас нет аттестации SOC 2, и мы не являемся юридическим заключением ни по одной норме.',
      'Записи покрывают только инструментированный трафик. Что работает мимо — не оставляет следов.',
    ],
    faqTitle: 'Вопросы, которые задают на самом деле',
    faq: [
      {
        q: 'Можно скачать пример evidence pack?',
        a: 'Нет, и это намеренно. Выгрузки нет, поэтому «пример файла» был бы нарисованным артефактом, изображающим результат работы продукта. Таблица полей выше — честная версия той же информации.',
      },
      {
        q: 'Какие из этих полей мы получим в пилоте?',
        a: 'Те, что помечены «работает», — сразу, они уже существуют. Область и хранение согласуются с вами. Команда, проект, результат политики и цепочка целостности — проект: если проверяющий требует их сегодня, вам нужен другой ответ, и лучше услышать это сейчас.',
      },
      {
        q: 'Достаточно ли для аудита оценки стоимости?',
        a: 'Для атрибуции трат обычно да, и мы называем это оценкой, а не выдаём за счёт. Для финансовой отчётности сверяйтесь со счётом провайдера.',
      },
      {
        q: 'Чем это отличается от трейсов observability?',
        a: 'Трейсы — для отладки: выборка, короткое хранение, свободная правка. Доказательство — для проверки: ограниченная область, полнота внутри неё, осознанное хранение. Те же события, другой контракт.',
      },
      {
        q: 'Где живёт запись?',
        a: 'Сегодня — в Postgres за продуктом. Приватное развёртывание и резидентность — вопросы пилота, а не переключатели, которые можно щёлкнуть на этой странице.',
      },
    ],
    ctaTitle: 'Принесите список полей вашего проверяющего',
    ctaBody:
      'Пришлите, что реально спрашивает аудитор, клиент или совет директоров. Отметим, какие поля отвечают на это сегодня, какие делаются в пилоте, а чего у нас просто нет.',
    formTitle: 'Запросить разбор доказательной базы',
    formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
    formSubmit: 'Запросить разбор',
    relatedTitle: 'Связанное',
  },
};
