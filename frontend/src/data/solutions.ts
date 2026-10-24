/**
 * Buyer-motive landing pages for tvijo.com — /[locale]/solutions/*.
 * Spec: bibamoney-backend/specs/2026-08-buyer-motive-landings.md
 * Addendum (claims audit + indexing): specs/2026-08-marketing-funnel-addendum.md
 *
 * Content rules (honest-claims policy):
 *  - every capability claim carries a `status`, and the status must match the
 *    claims-audit table in the addendum §3 — no status is a page bug;
 *  - `live` may only describe code that exists: apps/aiscan (exposure check),
 *    apps/ai/router.py + LLMCallLog (our own routing, per-call cost, daily USD
 *    cap), apps/referrals (partner attribution), apps/trading leads;
 *  - NOT built, therefore never `live`: customer-facing gateway, BYOK vault,
 *    policy engine (resolve_policy only picks provider/model), PII guard
 *    (guard.py only checks output refusals/length), hash-chained records,
 *    evidence-pack export, team/project attribution fields;
 *  - no savings %, accuracy %, customer counts, awards, certifications;
 *  - no profit/return claims of any kind; no "compliant"/"certified"/
 *    "guaranteed compliance"; SOC 2 is roadmap, never attested.
 *
 * Copy exists in `en` and `ru` only — the other nine locales render English and
 * are served noindex (see src/lib/seo/marketing.ts).
 */

export type SolutionLocale = 'en' | 'ru';

/** Where a capability actually stands. Rendered as a visible badge. */
export type ClaimStatus = 'live' | 'pilot' | 'design';

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, Record<SolutionLocale, string>> = {
  live: { en: 'Live today', ru: 'Работает сегодня' },
  pilot: { en: 'Pilot scope', ru: 'Объём пилота' },
  design: { en: 'Design intent', ru: 'Проектное решение' },
};

export const CLAIM_STATUS_NOTE: Record<SolutionLocale, string> = {
  en: 'Every capability on this page carries its real status: shipped code, work we do inside a pilot, or a design we have not built yet.',
  ru: 'У каждого пункта на этой странице стоит реальный статус: работающий код, работа внутри пилота или проект, который ещё не построен.',
};

export interface SolutionBlock {
  title: string;
  body: string;
  status: ClaimStatus;
}

export interface SolutionFaq {
  q: string;
  a: string;
}

export interface SolutionLink {
  /** Appended after `/${locale}` unless `apex` is set. */
  path: string;
  /** Routes that live outside [locale], e.g. /partners. */
  apex?: boolean;
  label: Record<SolutionLocale, string>;
  note: Record<SolutionLocale, string>;
}

export interface SolutionCopy {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  /** Short pair used by the /solutions index cards. */
  cardTitle: string;
  cardBody: string;
  headline: string;
  subhead: string;
  painTitle: string;
  pains: string[];
  offerTitle: string;
  offer: SolutionBlock[];
  stepsTitle: string;
  steps: SolutionBlock[];
  todayTitle: string;
  today: string[];
  notClaimTitle: string;
  notClaim: string[];
  faqTitle: string;
  faq: SolutionFaq[];
  ctaTitle: string;
  ctaBody: string;
  formTitle: string;
  formSubtitle: string;
  formSubmit: string;
}

export interface Solution {
  slug: string;
  /** LeadCapture.source — the backend accepts the `landing_` prefix. */
  leadSource: `landing_${string}`;
  /** Cross-links to live surfaces. Internal linking is half the point of these pages. */
  related: SolutionLink[];
  copy: Record<SolutionLocale, SolutionCopy>;
}

const SCAN_LINK: SolutionLink = {
  path: '/scan',
  label: { en: 'External AI Exposure Check', ru: 'Внешняя проверка AI-периметра' },
  note: {
    en: 'Free, no signup — what your product reveals about its AI from the outside.',
    ru: 'Бесплатно и без регистрации — что видно о вашем AI снаружи.',
  },
};

const PROOF_LINK: SolutionLink = {
  path: '/proof',
  label: { en: 'Evidence pack structure', ru: 'Структура evidence pack' },
  note: {
    en: 'Field by field: what a record can hold, what exists today, what is design.',
    ru: 'Поле за полем: что несёт запись, что есть сегодня, что пока проект.',
  },
};

const SECURITY_LINK: SolutionLink = {
  path: '/security',
  label: { en: 'Security & data handling', ru: 'Безопасность и данные' },
  note: {
    en: 'Retention, keys, access, deployment options — with the gaps named.',
    ru: 'Хранение, ключи, доступ, варианты развёртывания — с названными пробелами.',
  },
};

const COMPARE_LINK: SolutionLink = {
  path: '/compare',
  label: { en: 'How Tvijo compares', ru: 'Сравнение с альтернативами' },
  note: {
    en: 'Portkey, LiteLLM, Langfuse, LangSmith, Credo AI, n8n — what each does better.',
    ru: 'Portkey, LiteLLM, Langfuse, LangSmith, Credo AI, n8n — и что каждый делает лучше нас.',
  },
};

const PRICING_LINK: SolutionLink = {
  path: '/pricing',
  label: { en: 'Pricing', ru: 'Тарифы' },
  note: {
    en: 'Published plans, so a pilot conversation starts from a number.',
    ru: 'Опубликованные планы, чтобы разговор о пилоте начинался с цифры.',
  },
};

const DEMO_LINK: SolutionLink = {
  path: '/demo',
  label: { en: 'Book a walkthrough', ru: 'Запросить разбор' },
  note: {
    en: 'A person walks through what is built and what is not.',
    ru: 'Человек показывает, что построено, а что нет.',
  },
};

const KB_LINK: SolutionLink = {
  path: '/kb/ai-governance',
  label: { en: 'AI governance knowledge base', ru: 'База знаний по AI governance' },
  note: {
    en: 'Longer write-ups on agent risk, monitorability and oversight.',
    ru: 'Развёрнутые материалы про риск агентов, наблюдаемость и надзор.',
  },
};

const PARTNERS_LINK: SolutionLink = {
  path: '/partners',
  apex: true,
  label: { en: 'Partner program', ru: 'Партнёрская программа' },
  note: {
    en: 'Server-side referral attribution and published terms.',
    ru: 'Серверная атрибуция рефералов и опубликованные условия.',
  },
};

export const solutions: Solution[] = [
  // ------------------------------------------------- fear of the regulator --
  {
    slug: 'eu-ai-act-readiness',
    leadSource: 'landing_eu-ai-act-readiness',
    related: [SCAN_LINK, PROOF_LINK, SECURITY_LINK, KB_LINK],
    copy: {
      en: {
        metaTitle: 'EU AI Act readiness: inventory, risk class, records',
        metaDescription:
          'Turn the EU AI Act into working records: an inventory of the AI you run, risk classes, oversight decisions. Honest scope — what exists today and what is pilot work.',
        eyebrow: 'Regulatory readiness',
        cardTitle: 'EU AI Act readiness',
        cardBody:
          'An inventory, risk classes and oversight records — starting from what is already visible outside your product.',
        headline: 'EU AI Act readiness starts with a list you do not have',
        subhead:
          'Teams rarely stumble on the AI Act because a model misbehaved. They stumble because nobody can produce a current list of every AI system in use, who owns it, what data it touches and who signed off. That list is the work — and it starts with what your own product already leaks to the outside.',
        painTitle: 'What this usually looks like',
        pains: [
          'Asked "how many AI systems do we run?", the honest answer is a Slack thread and a guess.',
          'The risk-classification spreadsheet was last updated before three new agents shipped.',
          'Human-oversight obligations exist in a policy document that nothing in the stack can evidence.',
          'Every customer security questionnaire now has an AI section, and each one eats days of engineering time.',
        ],
        offerTitle: 'What Tvijo does about it',
        offer: [
          {
            title: 'Start from what is already visible',
            body: 'The External AI Exposure Check reads your product from the outside and reports what anyone could already determine about its AI: provider keys in client bundles, direct browser-to-provider calls, exposed source maps, missing governance pages. Free, no account, full report shown.',
            status: 'live',
          },
          {
            title: 'An inventory with owners and risk classes',
            body: 'Built with you during a pilot: each system, its owner, its risk class and the reasoning behind that class, kept where the next person can find it. This is assembled work today, not a self-serve product.',
            status: 'pilot',
          },
          {
            title: 'Oversight decisions written down',
            body: 'Who reviewed a system, when, and what they decided — recorded next to the system it describes, which is the part auditors ask for and most stacks never store.',
            status: 'pilot',
          },
          {
            title: 'Inventory derived from traffic',
            body: 'The design is that governed requests keep the list current by themselves. The gateway that would produce those records is not built — we will not sell you a routing story we cannot run today.',
            status: 'design',
          },
        ],
        stepsTitle: 'How a first month actually goes',
        steps: [
          {
            title: '1. Scan your own product',
            body: 'Two minutes, free. It usually surfaces something specific — a key in a bundle, a direct provider call — that makes the rest of the conversation concrete.',
            status: 'live',
          },
          {
            title: '2. Scope one system, not the estate',
            body: 'Pick the workflow that would be hardest to explain to a regulator, and document that one end to end.',
            status: 'pilot',
          },
          {
            title: '3. Put the records where they will be found',
            body: 'Inventory, risk class and oversight decisions in one place, with an owner — so next quarter is an edit rather than a repeat.',
            status: 'pilot',
          },
        ],
        todayTitle: 'What exists today',
        today: [
          'External AI Exposure Check: live, free, no account; every report keeps a permanent link you can reopen or share.',
          'A daily USD cap and per-call cost logging on our own model router — the practice we run on our own spend, described honestly on the cost-control page.',
          'Published pricing and a form that reaches a person, not a sequence.',
        ],
        notClaimTitle: 'What we do not claim',
        notClaim: [
          'This is not legal advice and we are not your counsel.',
          'No product makes you "AI Act certified" — there is no such certificate.',
          'SOC 2 is on the roadmap, not attested.',
          'There is no gateway you can point production traffic at today. Governed lanes and traffic-derived inventory are design intent.',
          'We do not publish an enforcement-date table — dates shift, and a stale table on a vendor site is worse than none.',
        ],
        faqTitle: 'Questions people actually ask',
        faq: [
          {
            q: 'Does Tvijo make us compliant with the EU AI Act?',
            a: 'No product can. Compliance is a legal assessment your counsel signs. What we contribute is the operational material that assessment needs — what AI you actually run, how it is classified, who reviewed it — plus a free external check that finds the parts nobody registered.',
          },
          {
            q: 'What can we get in the first week, concretely?',
            a: 'A scan report on your own product, and a scoped plan for one system. Nothing in week one requires you to route traffic through us, because that product does not exist yet.',
          },
          {
            q: 'How is this different from hiring a consultancy?',
            a: 'A consultancy delivers a document. We start from a technical scan of your live product and leave the record structure behind. Many teams need both — several advisors use the check to open their own engagements.',
          },
          {
            q: 'We already run Langfuse or LangSmith. Do we need anything else?',
            a: 'Observability answers "what did the model do". Readiness work also needs "who authorised it, under which risk class, and can you show that months later". Different question, usually different tool — the comparison pages spell out where each one wins.',
          },
          {
            q: 'We are not in the EU. Is this irrelevant?',
            a: 'The same records answer customer security questionnaires and internal audit. The AI Act is the deadline that makes teams start; the underlying need is not jurisdictional.',
          },
        ],
        ctaTitle: 'Ask for a readiness walkthrough',
        ctaBody:
          'Tell us which AI systems you run today. We will walk through what the records would look like and say plainly which parts we cannot cover yet.',
        formTitle: 'Request a readiness walkthrough',
        formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
        formSubmit: 'Request walkthrough',
      },
      ru: {
        metaTitle: 'Готовность к EU AI Act: реестр, классы риска, записи',
        metaDescription:
          'Как превратить EU AI Act в рабочие записи: реестр AI-систем, классы риска, решения о надзоре. Честно: что работает сегодня, а что делается внутри пилота.',
        eyebrow: 'Готовность к регулированию',
        cardTitle: 'Готовность к EU AI Act',
        cardBody:
          'Реестр, классы риска и записи о надзоре — начиная с того, что уже видно о вашем продукте снаружи.',
        headline: 'Подготовка к EU AI Act начинается со списка, которого у вас нет',
        subhead:
          'Компании спотыкаются об AI Act не потому, что модель повела себя плохо. А потому, что никто не может показать актуальный список AI-систем: кто владелец, какие данные затрагиваются, кто согласовал. Этот список и есть работа — и начинается она с того, что ваш продукт уже показывает наружу.',
        painTitle: 'Как это обычно выглядит',
        pains: [
          'На вопрос «сколько у нас AI-систем?» честный ответ — тред в Slack и оценка на глаз.',
          'Таблица с классификацией рисков последний раз обновлялась до того, как выкатили три новых агента.',
          'Требование о человеческом надзоре записано в политике, которую нечем подтвердить в проде.',
          'В каждой клиентской анкете по безопасности появился AI-раздел, и каждая съедает дни инженерного времени.',
        ],
        offerTitle: 'Что с этим делает Tvijo',
        offer: [
          {
            title: 'Начать с того, что уже видно',
            body: 'Внешняя проверка AI-периметра читает продукт снаружи и показывает, что о его AI может определить любой: ключи провайдеров в клиентских бандлах, прямые вызовы «браузер → провайдер», открытые source maps, отсутствующие governance-страницы. Бесплатно, без аккаунта, отчёт целиком.',
            status: 'live',
          },
          {
            title: 'Реестр с владельцами и классами риска',
            body: 'Собирается вместе с вами в пилоте: система, владелец, класс риска и обоснование класса — там, где это найдёт следующий человек. Сегодня это собранная работа, а не self-service продукт.',
            status: 'pilot',
          },
          {
            title: 'Записанные решения о надзоре',
            body: 'Кто проверял систему, когда и что решил — рядом с самой системой. Именно об этом спрашивает аудитор, и именно это большинство стеков не хранит.',
            status: 'pilot',
          },
          {
            title: 'Реестр, выведенный из трафика',
            body: 'Замысел в том, чтобы управляемые запросы сами держали список актуальным. Шлюз, который порождал бы эти записи, не построен — мы не будем продавать историю про маршрутизацию, которой сегодня нет.',
            status: 'design',
          },
        ],
        stepsTitle: 'Как реально проходит первый месяц',
        steps: [
          {
            title: '1. Просканировать свой продукт',
            body: 'Две минуты, бесплатно. Обычно всплывает что-то конкретное — ключ в бандле, прямой вызов провайдера, — и дальше разговор идёт предметно.',
            status: 'live',
          },
          {
            title: '2. Взять одну систему, а не весь ландшафт',
            body: 'Выберите сценарий, который было бы тяжелее всего объяснить регулятору, и опишите именно его от начала до конца.',
            status: 'pilot',
          },
          {
            title: '3. Положить записи туда, где их найдут',
            body: 'Реестр, класс риска и решения о надзоре в одном месте и с владельцем — чтобы следующий квартал был правкой, а не повтором.',
            status: 'pilot',
          },
        ],
        todayTitle: 'Что работает сегодня',
        today: [
          'Внешняя проверка AI-периметра: живая, бесплатная, без аккаунта; у каждого отчёта постоянная ссылка, которую можно открыть заново или переслать.',
          'Суточный лимит расходов и логирование стоимости каждого вызова в нашем собственном роутере моделей — практика, которую мы применяем к своим тратам, честно описана на странице про расходы.',
          'Опубликованные тарифы и форма, которая ведёт к человеку, а не в воронку писем.',
        ],
        notClaimTitle: 'Чего мы не обещаем',
        notClaim: [
          'Это не юридическая консультация, и мы не ваш юрист.',
          'Ни один продукт не делает вас «сертифицированными по AI Act» — такого сертификата не существует.',
          'SOC 2 у нас в планах, а не подтверждён аттестацией.',
          'Сегодня нет шлюза, на который можно направить боевой трафик. Управляемые потоки и реестр из трафика — это проект, а не работающая функция.',
          'Мы не публикуем таблицу дат вступления норм в силу: даты сдвигаются, а устаревшая таблица на сайте вендора хуже, чем её отсутствие.',
        ],
        faqTitle: 'Вопросы, которые задают на самом деле',
        faq: [
          {
            q: 'Tvijo делает нас соответствующими EU AI Act?',
            a: 'Ни один продукт этого не может. Соответствие — юридическая оценка, которую подписывает ваш юрист. Мы даём материал, на котором эта оценка держится: какой AI у вас реально работает, как он классифицирован, кто его проверял, — плюс бесплатную внешнюю проверку, которая находит незарегистрированное.',
          },
          {
            q: 'Что конкретно можно получить за первую неделю?',
            a: 'Отчёт скана по вашему продукту и очерченный план по одной системе. Ничего из этого не требует пускать трафик через нас — такого продукта пока просто нет.',
          },
          {
            q: 'Чем это отличается от найма консалтинга?',
            a: 'Консалтинг сдаёт документ. Мы начинаем с технического скана живого продукта и оставляем структуру записей. Многим нужно и то и другое — часть консультантов использует нашу проверку, чтобы открывать свои проекты.',
          },
          {
            q: 'У нас уже есть Langfuse или LangSmith. Нужно ли что-то ещё?',
            a: 'Observability отвечает на вопрос «что сделала модель». Готовности нужен ещё ответ «кто это разрешил, под каким классом риска и можно ли показать через полгода». Разные вопросы и обычно разные инструменты — разбор есть на страницах сравнения.',
          },
          {
            q: 'Мы не в ЕС. Это мимо нас?',
            a: 'Те же записи закрывают клиентские анкеты по безопасности и внутренний аудит. AI Act — просто дедлайн, который заставляет начать; сама потребность от юрисдикции не зависит.',
          },
        ],
        ctaTitle: 'Запросить разбор готовности',
        ctaBody:
          'Расскажите, какие AI-системы у вас работают. Разберём, как будут выглядеть записи, и прямо скажем, что пока не закрываем.',
        formTitle: 'Запросить разбор готовности',
        formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
        formSubmit: 'Запросить разбор',
      },
    },
  },

  // -------------------------------------------------------- proving trust ---
  {
    slug: 'ai-audit-evidence',
    leadSource: 'landing_ai-audit-evidence',
    related: [PROOF_LINK, SECURITY_LINK, COMPARE_LINK, DEMO_LINK],
    copy: {
      en: {
        metaTitle: 'AI audit evidence: what an auditor actually asks for',
        metaDescription:
          'Logs prove a request happened. Evidence names who ran it, which model, what it cost, and stays checkable later. What our records hold today and what is still design.',
        eyebrow: 'Audit evidence',
        cardTitle: 'AI audit evidence',
        cardBody:
          'Who ran it, which model, what it cost — the record fields an auditor asks for, published before you talk to us.',
        headline: 'Logs are not evidence',
        subhead:
          'A log line proves a request happened. An auditor, a customer\'s security team and your own board want something stricter: who ran it, under what authority, which model answered, what it cost — and whether the record can still be trusted months later. Most AI stacks quietly fail that second question.',
        painTitle: 'The gap, concretely',
        pains: [
          'Cost lives in the provider invoice, the decision lives in a code review, the identity lives nowhere — so no single record answers a question end to end.',
          'Preparing for a review means an engineer exporting CSVs and stitching them together by hand.',
          '"Show me every AI decision from March in this product" is currently a two-week project.',
          'Your logs can be edited by anyone with database access, and nothing would show it.',
        ],
        offerTitle: 'What we actually have',
        offer: [
          {
            title: 'Cost, model and actor on one record',
            body: 'Our own router writes a record per call: who ran it, the source and operation, provider and model, tokens, latency and estimated cost in USD. That is a real table with real rows — it is the shape everything else builds on.',
            status: 'live',
          },
          {
            title: 'A published field list you can check',
            body: 'The evidence-pack structure is written out field by field on a public page, with each field marked as existing or design. Take it to your auditor before you take a call with us.',
            status: 'live',
          },
          {
            title: 'Scope instead of sampling',
            body: 'Evidence is always about a scope: this system, this quarter, these decisions. Agreeing that scope and filling it is what a pilot does.',
            status: 'pilot',
          },
          {
            title: 'Tamper-evidence and packaged export',
            body: 'Hash-chaining records so a silent edit breaks the chain, and exporting a scoped pack — both are designed and neither is built. No download button here will pretend otherwise.',
            status: 'design',
          },
        ],
        stepsTitle: 'How to check us',
        steps: [
          {
            title: '1. Read the field list',
            body: 'The proof page states every field, with its status. If a field your auditor needs is marked design, you have learned that in two minutes instead of two calls.',
            status: 'live',
          },
          {
            title: '2. Bring your reviewer\'s actual question',
            body: 'Not "do you have audit logs" but the exact question you keep failing to answer. We map it to fields, or we tell you we cannot.',
            status: 'live',
          },
          {
            title: '3. Fill one scope in a pilot',
            body: 'One system, one period, records that survive being read by someone who was not there.',
            status: 'pilot',
          },
        ],
        todayTitle: 'What exists today',
        today: [
          'Per-call records with actor, source, operation, provider, model, tokens, latency and estimated cost — in our own router, backed by tests.',
          'A public, field-by-field evidence-pack structure, each field labelled existing or design.',
          'The free External AI Exposure Check, which finds AI use nobody registered — the input to any honest inventory.',
        ],
        notClaimTitle: 'What we do not claim',
        notClaim: [
          'We do not have tamper-evident storage. Hash-chained records are design intent, not a shipped feature.',
          'There is no evidence-pack download today, and we will not fake one.',
          'Team, project and policy-result fields do not exist yet; a record today carries actor, source, operation, provider, model, tokens, latency and cost.',
          'We hold no SOC 2 attestation and publish no customer names.',
          'Records only ever cover traffic that is instrumented. Anything running around it leaves nothing — no vendor can honestly say otherwise.',
        ],
        faqTitle: 'Questions people actually ask',
        faq: [
          {
            q: 'How is this different from our observability tool?',
            a: 'Observability is built for debugging: high-volume, sampled, short retention, freely mutable. Evidence is built for review: scoped, complete inside that scope, retained on your schedule, and ideally hard to edit silently. We are honest that the "hard to edit" part is still design.',
          },
          {
            q: 'What is actually in a record right now?',
            a: 'Actor, source, operation, provider, model, input/output tokens, latency and estimated cost in USD, with a timestamp. The proof page lists it in full alongside the fields that do not exist yet.',
          },
          {
            q: 'Do you filter PII out of prompts?',
            a: 'No. Today there is no PII or secret filter in the path — the only output check looks for refusals and absurd lengths. Treat prompt content handling as pilot-scoping work, not a shipped guardrail.',
          },
          {
            q: 'Can records live in our own infrastructure?',
            a: 'That is pilot scoping, not a switch we flip. The honest answer depends on your residency constraints, and we would rather discuss it than promise a deployment mode we have not built.',
          },
          {
            q: 'Who decides this is enough?',
            a: 'Your auditor or counsel. Our job is to make sure that when they ask, the answer is a query against a defined structure rather than an archaeology project.',
          },
        ],
        ctaTitle: 'Send us the question your reviewer keeps asking',
        ctaBody:
          'We will map it to the fields that answer it — or tell you plainly which part of it we cannot cover today.',
        formTitle: 'Request an evidence walkthrough',
        formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
        formSubmit: 'Request walkthrough',
      },
      ru: {
        metaTitle: 'Доказательства для AI-аудита: что спросит аудитор',
        metaDescription:
          'Лог доказывает, что запрос был. Доказательство называет, кто его сделал, какая модель и во что обошлось. Что записи несут сегодня, а что пока проект.',
        eyebrow: 'Доказательная база',
        cardTitle: 'Доказательства для аудита',
        cardBody:
          'Кто запустил, какая модель, во что обошлось — поля записи, опубликованные до разговора с нами.',
        headline: 'Логи — это не доказательство',
        subhead:
          'Строчка в логе подтверждает, что запрос был. Аудитору, службе безопасности клиента и вашему совету нужно строже: кто запустил, на каком основании, какая модель ответила, во что обошлось — и можно ли доверять записи через полгода. На втором вопросе тихо ломается большинство AI-стеков.',
        painTitle: 'Разрыв конкретно',
        pains: [
          'Стоимость в счёте провайдера, решение — в код-ревью, личность — нигде, и ни одна запись не отвечает на вопрос целиком.',
          'Подготовка к проверке — это инженер, который выгружает CSV и сшивает их руками.',
          '«Покажите все AI-решения по этому продукту за март» — сейчас двухнедельный проект.',
          'Ваши логи может отредактировать любой с доступом к базе, и это никак не проявится.',
        ],
        offerTitle: 'Что у нас реально есть',
        offer: [
          {
            title: 'Стоимость, модель и актор в одной записи',
            body: 'Наш собственный роутер пишет запись на каждый вызов: кто запустил, источник и операция, провайдер и модель, токены, задержка и оценка стоимости в долларах. Это настоящая таблица с настоящими строками — форма, из которой растёт всё остальное.',
            status: 'live',
          },
          {
            title: 'Опубликованный список полей',
            body: 'Структура evidence pack расписана по полям на публичной странице, у каждого поля стоит статус: есть или проект. Можно отнести аудитору до того, как созваниваться с нами.',
            status: 'live',
          },
          {
            title: 'Область вместо выборки',
            body: 'Доказательство всегда про область: эта система, этот квартал, эти решения. Договориться об области и наполнить её — это и есть работа пилота.',
            status: 'pilot',
          },
          {
            title: 'Защита от правок и выгрузка пакетом',
            body: 'Хеш-цепочка, при которой тихая правка рвёт цепь, и выгрузка пакета по области — спроектированы, но не построены. Никакой кнопки «скачать» здесь не будет изображать обратное.',
            status: 'design',
          },
        ],
        stepsTitle: 'Как нас проверить',
        steps: [
          {
            title: '1. Прочитать список полей',
            body: 'На странице доказательств у каждого поля стоит статус. Если нужное аудитору поле помечено как проект, вы узнали это за две минуты, а не за два созвона.',
            status: 'live',
          },
          {
            title: '2. Принести реальный вопрос проверяющего',
            body: 'Не «есть ли у вас аудит-логи», а тот самый вопрос, на который вы не можете ответить. Мы разложим его по полям — или скажем, что не можем.',
            status: 'live',
          },
          {
            title: '3. Наполнить одну область в пилоте',
            body: 'Одна система, один период, записи, которые переживут чтение человеком, которого при этом не было.',
            status: 'pilot',
          },
        ],
        todayTitle: 'Что работает сегодня',
        today: [
          'Запись на каждый вызов: актор, источник, операция, провайдер, модель, токены, задержка и оценка стоимости — в нашем собственном роутере, с тестами.',
          'Публичная структура evidence pack по полям, у каждого поля статус «есть» или «проект».',
          'Бесплатная внешняя проверка AI-периметра, которая находит незарегистрированное использование — вход для любого честного реестра.',
        ],
        notClaimTitle: 'Чего мы не обещаем',
        notClaim: [
          'У нас нет хранения с защитой от правок. Хеш-цепочка — это проект, а не работающая функция.',
          'Сегодня нет выгрузки evidence pack, и мы не будем её имитировать.',
          'Полей team, project и policy result пока нет; запись несёт актора, источник, операцию, провайдера, модель, токены, задержку и стоимость.',
          'У нас нет аттестации SOC 2, и мы не публикуем имена клиентов.',
          'Записи покрывают только то, что инструментировано. Что работает мимо — не оставляет следов, и честно этого не обойдёт ни один вендор.',
        ],
        faqTitle: 'Вопросы, которые задают на самом деле',
        faq: [
          {
            q: 'Чем это отличается от нашего observability-инструмента?',
            a: 'Observability сделан для отладки: большой объём, сэмплирование, короткое хранение, свободно изменяемые данные. Доказательство — для проверки: ограниченная область, полнота внутри неё, хранение по вашему регламенту и, в идеале, невозможность тихой правки. Мы честно говорим, что последняя часть пока проект.',
          },
          {
            q: 'Что реально лежит в записи сейчас?',
            a: 'Актор, источник, операция, провайдер, модель, входные и выходные токены, задержка и оценка стоимости в долларах, с меткой времени. На странице доказательств список приведён целиком — вместе с полями, которых пока нет.',
          },
          {
            q: 'Вы вырезаете персональные данные из промптов?',
            a: 'Нет. Сегодня в пути нет фильтра PII или секретов — единственная проверка на выходе ищет отказы модели и абсурдную длину. Считайте работу с содержимым промптов предметом пилота, а не готовой защитой.',
          },
          {
            q: 'Могут ли записи жить в нашей инфраструктуре?',
            a: 'Это предмет пилота, а не переключатель. Честный ответ зависит от ваших требований к резидентности, и лучше обсудить его, чем обещать режим развёртывания, которого мы не строили.',
          },
          {
            q: 'Кто решает, что этого достаточно?',
            a: 'Ваш аудитор или юрист. Наша задача — чтобы на его вопрос отвечал запрос к описанной структуре, а не отдельные раскопки.',
          },
        ],
        ctaTitle: 'Пришлите вопрос, который вам постоянно задаёт проверяющий',
        ctaBody:
          'Разложим его по полям, которые на него отвечают, — или прямо скажем, какую часть сегодня не закрываем.',
        formTitle: 'Запросить разбор доказательной базы',
        formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
        formSubmit: 'Запросить разбор',
      },
    },
  },

  // ------------------------------------------------------ cost of models ----
  {
    slug: 'llm-cost-control',
    leadSource: 'landing_llm-cost-control',
    related: [PRICING_LINK, COMPARE_LINK, PROOF_LINK, DEMO_LINK],
    copy: {
      en: {
        metaTitle: 'LLM cost control: per-call cost and a hard daily cap',
        metaDescription:
          'One provider invoice, no attribution. How a daily USD cap and per-call cost logging work in practice — and which parts of spend control we have not built yet.',
        eyebrow: 'Spend control',
        cardTitle: 'LLM cost control',
        cardBody:
          'A daily cap that refuses calls and a cost recorded per call — running on our own spend, described without a savings number.',
        headline: 'One invoice, no idea which team spent it',
        subhead:
          'Most AI budgets are discovered, not managed: the invoice arrives, someone asks who spent it, and the answer takes a week of log spelunking. We run the opposite pattern on our own spend — a cost written per call and a daily cap that refuses the next one — and we will show you exactly how far that goes.',
        painTitle: 'Signs this is you',
        pains: [
          'Finance asks which product line drove last month\'s AI spend, and engineering cannot answer confidently.',
          'A retry loop or a runaway agent can burn a meaningful share of the month before anyone notices.',
          'Every workflow calls the strongest model available, including the ones classifying short strings.',
          'Nobody knows what a feature costs per user, so nobody can price it.',
        ],
        offerTitle: 'What we run, and what we do not',
        offer: [
          {
            title: 'A daily cap that actually refuses calls',
            body: 'Our router sums the day\'s logged spend before each call and raises rather than proceeding once the configured USD cap is reached. There is a test for exactly that behaviour, because a budget guard nobody tested is a decoration.',
            status: 'live',
          },
          {
            title: 'Cost recorded per call, not per invoice',
            body: 'Each call writes provider, model, operation, tokens, latency and an estimated cost in USD. Attribution starts as a real row, not a month-end reconciliation.',
            status: 'live',
          },
          {
            title: 'Provider choice per operation',
            body: 'The router resolves provider and model per operation across several vendors, so cheap work does not have to run on the expensive model. The choice is recorded with the call.',
            status: 'live',
          },
          {
            title: 'Team and project attribution, caps per lane',
            body: 'Splitting spend by team and project, and capping a specific lane, is the design. The fields and the multi-tenant gateway are not built — today the cap is global to our own router.',
            status: 'design',
          },
        ],
        stepsTitle: 'How a conversation goes',
        steps: [
          {
            title: '1. Tell us your current setup',
            body: 'Providers, rough monthly spend, which workflows you suspect. Most teams already have a hunch, and it is usually wrong in an interesting way.',
            status: 'live',
          },
          {
            title: '2. We show what the record shape gives you',
            body: 'What a per-call cost row answers, and what it does not answer without team and project fields.',
            status: 'live',
          },
          {
            title: '3. Decide whether it is worth changing anything',
            body: 'If your spend is small or your stack already reports per-feature cost, we will say so. Selling a control plane to a team with one workflow helps nobody.',
            status: 'pilot',
          },
        ],
        todayTitle: 'What exists today',
        today: [
          'A configurable daily USD cap enforced before each model call, with test coverage — running on our own router.',
          'Per-call records with provider, model, operation, tokens, latency and estimated cost.',
          'Routing across several providers, with the selected model recorded on the call.',
        ],
        notClaimTitle: 'What we do not claim',
        notClaim: [
          'We publish no savings percentage. Any number would depend on your traffic mix, and a vendor quoting one for your account invented it.',
          'This is a cost-control product. We make no claims about revenue, returns or profit — not now, not later.',
          'There is no multi-tenant gateway you can route production traffic through today.',
          'Per-team and per-project attribution does not exist yet; the cap that exists is global to one router.',
          'Cheaper models save money and can cost quality. We make the trade-off visible, not automatic.',
        ],
        faqTitle: 'Questions people actually ask',
        faq: [
          {
            q: 'Can we route our traffic through Tvijo today?',
            a: 'No. Portkey and LiteLLM ship that product; we do not. What we have is a router with a working cap and per-call cost records that we run ourselves, and a pilot conversation about applying the same pattern to your lanes.',
          },
          {
            q: 'Does adding a gateway slow requests down?',
            a: 'Any hop adds latency; the honest question is how much relative to model time and whether the control is worth it for that lane. Some lanes should not be governed at all, and we will say so.',
          },
          {
            q: 'Can we keep using our own provider keys?',
            a: 'BYOK is the intended design, and there is no key vault in the product today. Right now your provider relationship and invoice simply stay where they are.',
          },
          {
            q: 'What if our spend is small?',
            a: 'Then attribution matters more than caps, and you may not need us yet. We would rather say that than sell you a plan.',
          },
        ],
        ctaTitle: 'Find out what attribution would actually show',
        ctaBody:
          'Describe the setup and we will tell you what a per-call record answers for you — and whether the change is worth making at your size.',
        formTitle: 'Request a spend walkthrough',
        formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
        formSubmit: 'Request walkthrough',
      },
      ru: {
        metaTitle: 'Контроль расходов на LLM: цена вызова и жёсткий лимит',
        metaDescription:
          'Один счёт провайдера без разбивки. Как работают суточный лимит в долларах и запись стоимости каждого вызова — и чего в контроле расходов у нас пока нет.',
        eyebrow: 'Контроль расходов',
        cardTitle: 'Контроль расходов на LLM',
        cardBody:
          'Суточный лимит, который отказывает в вызове, и стоимость на каждый вызов — на наших собственных тратах, без процента экономии.',
        headline: 'Один счёт — и непонятно, чья это команда потратила',
        subhead:
          'Бюджет на AI чаще обнаруживают, чем планируют: приходит счёт, кто-то спрашивает, кто потратил, и ответ занимает неделю раскопок. У себя мы держим обратную схему — стоимость пишется на каждый вызов, а суточный лимит отказывает в следующем, — и покажем, докуда этого хватает.',
        painTitle: 'Признаки, что это про вас',
        pains: [
          'Финансы спрашивают, какое направление дало прошлый месяц трат, и инженеры не могут ответить уверенно.',
          'Цикл ретраев или сорвавшийся агент способен сжечь заметную долю месяца, пока никто не смотрит.',
          'Каждый сценарий зовёт самую сильную модель — включая те, что классифицируют короткие строки.',
          'Никто не знает, сколько фича стоит на пользователя, поэтому её нельзя корректно оценить.',
        ],
        offerTitle: 'Что у нас работает, а чего нет',
        offer: [
          {
            title: 'Суточный лимит, который реально отказывает',
            body: 'Роутер перед каждым вызовом суммирует записанные за день траты и, дойдя до заданного лимита в долларах, поднимает ошибку вместо вызова. На это поведение есть тест — бюджетный ограничитель без теста является украшением.',
            status: 'live',
          },
          {
            title: 'Стоимость на вызов, а не на счёт',
            body: 'Каждый вызов пишет провайдера, модель, операцию, токены, задержку и оценку стоимости в долларах. Атрибуция начинается со строки в таблице, а не со сверки в конце месяца.',
            status: 'live',
          },
          {
            title: 'Выбор провайдера под операцию',
            body: 'Роутер выбирает провайдера и модель под операцию среди нескольких вендоров, так что дешёвой работе не обязательно идти на дорогую модель. Выбор фиксируется вместе с вызовом.',
            status: 'live',
          },
          {
            title: 'Разбивка по командам и лимиты на поток',
            body: 'Разложить траты по командам и проектам и ограничить конкретный поток — это замысел. Ни полей, ни мультиарендного шлюза нет: сегодня лимит один и относится к нашему собственному роутеру.',
            status: 'design',
          },
        ],
        stepsTitle: 'Как проходит разговор',
        steps: [
          {
            title: '1. Вы описываете текущую схему',
            body: 'Провайдеры, примерные месячные траты, подозрительные сценарии. Догадка обычно уже есть — и обычно она интересно ошибается.',
            status: 'live',
          },
          {
            title: '2. Мы показываем, что даёт форма записи',
            body: 'На что отвечает строка со стоимостью вызова и на что она не ответит без полей команды и проекта.',
            status: 'live',
          },
          {
            title: '3. Решаете, стоит ли что-то менять',
            body: 'Если траты небольшие или ваш стек уже показывает стоимость по фичам, мы так и скажем. Продавать control plane команде с одним сценарием бессмысленно.',
            status: 'pilot',
          },
        ],
        todayTitle: 'Что работает сегодня',
        today: [
          'Настраиваемый суточный лимит в долларах, проверяемый перед каждым вызовом модели, с тестами — на нашем собственном роутере.',
          'Записи на вызов: провайдер, модель, операция, токены, задержка и оценка стоимости.',
          'Маршрутизация между несколькими провайдерами с фиксацией выбранной модели.',
        ],
        notClaimTitle: 'Чего мы не обещаем',
        notClaim: [
          'Мы не публикуем процент экономии. Любая цифра зависела бы от вашего трафика, а вендор, называющий её для вашего аккаунта, её выдумал.',
          'Это продукт про контроль расходов. Никаких утверждений про выручку, доходность и прибыль — ни сейчас, ни потом.',
          'Сегодня нет мультиарендного шлюза, через который можно пустить боевой трафик.',
          'Разбивки по командам и проектам пока нет; существующий лимит один и общий для одного роутера.',
          'Дешёвые модели экономят деньги и могут стоить качества. Мы делаем размен видимым, а не автоматическим.',
        ],
        faqTitle: 'Вопросы, которые задают на самом деле',
        faq: [
          {
            q: 'Можно сегодня пустить трафик через Tvijo?',
            a: 'Нет. Такой продукт есть у Portkey и LiteLLM, у нас его нет. У нас есть роутер с работающим лимитом и записями стоимости, который мы используем сами, и разговор о пилоте — как применить ту же схему к вашим потокам.',
          },
          {
            q: 'Не замедлит ли шлюз запросы?',
            a: 'Любой промежуточный узел добавляет задержку; честный вопрос — сколько это на фоне времени модели и стоит ли контроль того для этого потока. Некоторые потоки не надо брать под управление вовсе, и мы это скажем.',
          },
          {
            q: 'Можно остаться на своих ключах провайдеров?',
            a: 'BYOK — это предполагаемая схема, и хранилища ключей в продукте сегодня нет. Пока ваши отношения с провайдером и счёт просто остаются там же, где были.',
          },
          {
            q: 'А если у нас маленькие траты?',
            a: 'Тогда важнее атрибуция, чем лимиты, и, возможно, мы вам пока не нужны. Лучше сказать это, чем продать план.',
          },
        ],
        ctaTitle: 'Узнать, что реально покажет атрибуция',
        ctaBody:
          'Опишите схему — скажем, на что вам ответит запись со стоимостью вызова и стоит ли что-то менять на вашем масштабе.',
        formTitle: 'Запросить разбор расходов',
        formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
        formSubmit: 'Запросить разбор',
      },
    },
  },

  // ------------------------------------------------------------ discovery ---
  {
    slug: 'shadow-ai-discovery',
    leadSource: 'landing_shadow-ai-discovery',
    related: [SCAN_LINK, SECURITY_LINK, PROOF_LINK, KB_LINK],
    copy: {
      en: {
        metaTitle: 'Shadow AI discovery: find the AI nobody registered',
        metaDescription:
          'Shadow AI is not only staff in chatbots: provider keys in client bundles, direct browser calls, forgotten agents. Run a free external check on your own product.',
        eyebrow: 'Discovery',
        cardTitle: 'Shadow AI discovery',
        cardBody:
          'Keys in client bundles, direct browser calls to providers, forgotten agents. Free external check, full report, no signup.',
        headline: 'Find the AI nobody told you about',
        subhead:
          'Shadow AI gets discussed as an employee-behaviour problem, which is the easy half. The expensive half is technical: a provider key shipped in a client bundle, a browser calling a model API directly, an agent a contractor left running. None of it shows up in a policy review, and all of it is yours.',
        painTitle: 'Where it actually hides',
        pains: [
          'API keys and endpoints left in client-side bundles or exposed source maps.',
          'Direct browser-to-provider calls that never touch your backend and never appear in your logs.',
          'Prototypes that quietly became production, owned by whoever built them and documented nowhere.',
          'Contractor work still holding live credentials after the engagement ended.',
        ],
        offerTitle: 'What the check does',
        offer: [
          {
            title: 'Reads your product from the outside',
            body: 'Give it a URL. It fetches what a visitor\'s browser gets — scripts, headers, source maps — and reports what that already reveals about your AI setup. No account, no email wall, the full report is shown.',
            status: 'live',
          },
          {
            title: 'Findings with severity, evidence and confidence',
            body: 'Each finding carries a status, a severity, the evidence behind it and how confident the check is. What it could not determine is marked unknown, not quietly passed.',
            status: 'live',
          },
          {
            title: 'A permanent link to the report',
            body: 'Every scan is stored and reopenable at its own URL, so you can send it to the team that owns the fix instead of screenshotting it.',
            status: 'live',
          },
          {
            title: 'Inventory that keeps itself current',
            body: 'Deriving a live inventory from governed traffic is the design. It needs a gateway we have not built, so today discovery is external plus whatever a pilot instruments.',
            status: 'design',
          },
        ],
        stepsTitle: 'A realistic first week',
        steps: [
          {
            title: '1. Scan your own product',
            body: 'Two minutes, free, and it usually tells you something you did not know — most often about a bundle or a header.',
            status: 'live',
          },
          {
            title: '2. Fix what is exposed externally',
            body: 'Keys in client code and direct provider calls are the findings worth acting on the same day, because anyone reading your bundle can act on them too.',
            status: 'live',
          },
          {
            title: '3. Decide what governance you actually need',
            body: 'Sometimes the answer is a policy and two fixes, not a platform. We would rather scope that honestly than sell a pilot into a problem you just solved.',
            status: 'pilot',
          },
        ],
        todayTitle: 'What exists today',
        today: [
          'The External AI Exposure Check is live, free and requires no account; reports keep a permanent link.',
          'The report states its own limits: from a URL it cannot see server-side routing, budgets or internal systems.',
          'Scans are stored with the host, findings and a hashed IP — so aggregate stats exist without keeping raw addresses.',
        ],
        notClaimTitle: 'What we do not claim',
        notClaim: [
          'The scan is not a penetration test and not a full security audit.',
          'A URL cannot reveal internal systems. Anything we cannot see is marked "not checked", never "passed".',
          'We do not offer scanning of third-party domains as a service — point it at a product you are responsible for.',
          'Finding shadow AI is not governing it. The first is a report; the second is work we would scope with you.',
        ],
        faqTitle: 'Questions people actually ask',
        faq: [
          {
            q: 'Is the external check really free?',
            a: 'Yes, and the whole report is shown without an email. The contact form appears only if you want a control review afterwards.',
          },
          {
            q: 'What exactly does it look at?',
            a: 'The public surface of the page: scripts and bundles, source maps when they are exposed, response headers, and signals of direct calls to model providers from the browser. It reports evidence, with secrets redacted in what it shows back.',
          },
          {
            q: 'Do you store our scan?',
            a: 'Yes — the host, the findings, the score and a hashed IP, so the report keeps a permanent link and we can count usage. We do not store raw IP addresses.',
          },
          {
            q: 'It found nothing. Are we fine?',
            a: 'It means nothing was visible from outside, which is a narrower statement. Server-side keys, internal agents and vendor integrations are invisible to a URL scan by definition.',
          },
          {
            q: 'Do we have to route everything through you afterwards?',
            a: 'No, and you could not today even if you wanted — that gateway is not built. External discovery needs nothing from you at all.',
          },
        ],
        ctaTitle: 'Run the check first, talk to us after',
        ctaBody:
          'The scan costs nothing and you keep the report either way. If what it finds is worth a conversation, the form below reaches a person.',
        formTitle: 'Request a control review',
        formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
        formSubmit: 'Request review',
      },
      ru: {
        metaTitle: 'Поиск теневого AI: найти то, что не регистрировали',
        metaDescription:
          'Теневой AI — не только сотрудники в чат-ботах: ключи в клиентских бандлах, прямые вызовы из браузера, забытые агенты. Бесплатная внешняя проверка вашего продукта.',
        eyebrow: 'Обнаружение',
        cardTitle: 'Поиск теневого AI',
        cardBody:
          'Ключи в бандлах, прямые вызовы провайдеров из браузера, забытые агенты. Бесплатная внешняя проверка, отчёт целиком, без регистрации.',
        headline: 'Найти AI, о котором вам не сказали',
        subhead:
          'Про теневой AI обычно говорят как про поведение сотрудников — это простая половина. Дорогая половина техническая: ключ провайдера, уехавший в клиентский бандл; браузер, который зовёт API модели напрямую; агент, оставленный подрядчиком. В ревью политик это не видно — и всё это ваше.',
        painTitle: 'Где это прячется на самом деле',
        pains: [
          'Ключи и эндпоинты, оставшиеся в клиентских бандлах или в открытых source maps.',
          'Прямые вызовы «браузер → провайдер», которые не проходят через ваш бэкенд и не попадают в логи.',
          'Прототипы, тихо ставшие продакшеном: владелец — тот, кто написал, документации нет.',
          'Работы подрядчиков, у которых живые доступы остались после конца проекта.',
        ],
        offerTitle: 'Что делает проверка',
        offer: [
          {
            title: 'Читает продукт снаружи',
            body: 'Даёте URL. Она забирает то же, что получает браузер посетителя, — скрипты, заголовки, source maps — и показывает, что это уже говорит о вашем AI. Без аккаунта и почтовой стены, отчёт целиком.',
            status: 'live',
          },
          {
            title: 'Находки со значимостью, свидетельством и уверенностью',
            body: 'У каждой находки есть статус, уровень значимости, свидетельство и то, насколько проверка в ней уверена. Что определить не удалось, помечается как «неизвестно», а не как «в порядке».',
            status: 'live',
          },
          {
            title: 'Постоянная ссылка на отчёт',
            body: 'Каждый скан сохраняется и открывается по своему адресу — отчёт можно переслать команде, которая будет чинить, а не пересылать скриншот.',
            status: 'live',
          },
          {
            title: 'Реестр, который держит себя актуальным',
            body: 'Живой реестр из управляемого трафика — это замысел. Ему нужен шлюз, которого мы не построили, поэтому сегодня обнаружение — это внешняя проверка плюс то, что инструментируется в пилоте.',
            status: 'design',
          },
        ],
        stepsTitle: 'Реалистичная первая неделя',
        steps: [
          {
            title: '1. Просканировать свой продукт',
            body: 'Две минуты, бесплатно, и обычно вы узнаёте что-то новое — чаще всего про бандл или заголовки.',
            status: 'live',
          },
          {
            title: '2. Закрыть то, что торчит наружу',
            body: 'Ключи в клиентском коде и прямые вызовы провайдеров — находки, по которым стоит действовать в тот же день: любой, кто читает ваш бандл, тоже может по ним действовать.',
            status: 'live',
          },
          {
            title: '3. Понять, какой контроль вам вообще нужен',
            body: 'Иногда ответ — политика и две правки, а не платформа. Лучше честно очертить это, чем продавать пилот в задачу, которую вы только что закрыли.',
            status: 'pilot',
          },
        ],
        todayTitle: 'Что работает сегодня',
        today: [
          'Внешняя проверка AI-периметра живая, бесплатная и не требует аккаунта; у отчётов постоянная ссылка.',
          'Отчёт сам сообщает свои границы: по URL не видно серверного роутинга, бюджетов и внутренних систем.',
          'Сканы сохраняются с хостом, находками и хешем IP — агрегированная статистика есть, сырые адреса не хранятся.',
        ],
        notClaimTitle: 'Чего мы не обещаем',
        notClaim: [
          'Скан — это не пентест и не полный аудит безопасности.',
          'По URL нельзя увидеть внутренние системы. То, чего мы не видим, помечается «не проверено», а не «в порядке».',
          'Мы не оказываем услугу сканирования чужих доменов — направляйте проверку на продукт, за который отвечаете.',
          'Найти теневой AI — не то же самое, что взять его под контроль. Первое — отчёт, второе — работа, которую надо очертить вместе.',
        ],
        faqTitle: 'Вопросы, которые задают на самом деле',
        faq: [
          {
            q: 'Внешняя проверка правда бесплатная?',
            a: 'Да, и отчёт показывается целиком без почты. Форма появляется только если после этого вы захотите разбор.',
          },
          {
            q: 'На что именно она смотрит?',
            a: 'На публичную поверхность страницы: скрипты и бандлы, открытые source maps, заголовки ответов и признаки прямых вызовов провайдеров моделей из браузера. Она показывает свидетельства, скрывая в них сами секреты.',
          },
          {
            q: 'Вы храните наш скан?',
            a: 'Да — хост, находки, оценку и хеш IP, чтобы у отчёта была постоянная ссылка, а у нас — счётчик использования. Сырые IP-адреса мы не храним.',
          },
          {
            q: 'Она ничего не нашла. Значит, всё хорошо?',
            a: 'Значит, снаружи ничего не было видно, а это более узкое утверждение. Серверные ключи, внутренние агенты и интеграции с вендорами по определению невидимы для проверки по URL.',
          },
          {
            q: 'Придётся ли потом вести весь трафик через вас?',
            a: 'Нет, и сегодня это было бы невозможно при всём желании — такого шлюза мы не построили. Внешнему обнаружению от вас не нужно ничего.',
          },
        ],
        ctaTitle: 'Сначала проверка, разговор — потом',
        ctaBody:
          'Скан ничего не стоит, и отчёт остаётся у вас в любом случае. Если находки стоят разговора, форма ниже ведёт к человеку.',
        formTitle: 'Запросить разбор контроля',
        formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
        formSubmit: 'Запросить разбор',
      },
    },
  },

  // ---------------------------------------------------------- consultants ---
  {
    slug: 'ai-governance-for-consultants',
    leadSource: 'landing_ai-governance-for-consultants',
    related: [PARTNERS_LINK, PROOF_LINK, COMPARE_LINK, SCAN_LINK],
    copy: {
      en: {
        metaTitle: 'AI governance tooling for consultants and advisors',
        metaDescription:
          'Open an engagement with concrete findings from a free external check, hand the client a published record structure, and get referral attribution handled server-side.',
        eyebrow: 'For consultants & advisors',
        cardTitle: 'For consultants & advisors',
        cardBody:
          'A free check that opens the engagement, a published record structure to cite, and referral terms that are actually written down.',
        headline: 'Open with findings, not a maturity questionnaire',
        subhead:
          'AI governance engagements have a structural problem: discovery eats the budget, the deliverable is a document, and the document is stale within a quarter. A free technical check on the client\'s own product changes the first meeting, and a published record structure gives your report something durable to cite.',
        painTitle: 'What makes these engagements hard',
        pains: [
          'Half the budget goes into chasing teams for a list of what AI they run.',
          'The findings decay immediately, so the value you delivered is invisible six months later.',
          'Clients ask "what tool do we use for this?" and the honest answer has been "a spreadsheet".',
          'Your recommendations are only as good as the client\'s ability to evidence them afterwards.',
        ],
        offerTitle: 'What you get to work with',
        offer: [
          {
            title: 'A free check you can run in the first meeting',
            body: 'Point it at the client\'s product and get concrete findings — keys in bundles, direct provider calls, missing governance surfaces — with evidence and severity. No account, and the client sees the same report you do.',
            status: 'live',
          },
          {
            title: 'A published record structure to cite',
            body: 'The evidence-pack page lists every field with its real status, so your report can reference a structure the client can check rather than a promise from a vendor deck.',
            status: 'live',
          },
          {
            title: 'Comparisons you can forward without becoming a salesperson',
            body: 'Our comparison pages say where Portkey, LiteLLM, Langfuse, LangSmith, Credo AI and n8n are the better answer. Send them to a client as-is.',
            status: 'live',
          },
          {
            title: 'Referral attribution handled server-side',
            body: 'The partner program tracks attribution on our side with published terms and a dashboard, instead of asking you to trust a spreadsheet.',
            status: 'live',
          },
        ],
        stepsTitle: 'How advisors use it',
        steps: [
          {
            title: '1. Run the check live',
            body: 'It produces specific findings about the client\'s own product in the first meeting, which beats a maturity questionnaire as an opener.',
            status: 'live',
          },
          {
            title: '2. Anchor the report to the field list',
            body: 'Recommend records the client can actually keep, and mark honestly which of those exist in tooling today.',
            status: 'live',
          },
          {
            title: '3. Bring us in only where it fits',
            body: 'If the client needs a running gateway today, say so — we do not have one, and a referral into the wrong problem costs you more than it pays.',
            status: 'pilot',
          },
        ],
        todayTitle: 'What exists today',
        today: [
          'The referral program is live: server-side attribution, a partner dashboard and published terms.',
          'The external check works on any product you are asked to review — free, no account.',
          'The comparison and evidence pages are written to be forwarded to a client, including the parts where competitors win.',
        ],
        notClaimTitle: 'What we do not claim',
        notClaim: [
          'We do not certify anyone and there is no badge for your engagement.',
          'We hold no SOC 2 attestation — if your client requires one today, say so; we would rather lose the deal than be misquoted in your report.',
          'We do not publish client names or case studies we cannot substantiate.',
          'There is no gateway, BYOK vault or evidence export in the product today. If your recommendation depends on those, it depends on a roadmap.',
          'The partner program pays on attributed business, not on introductions in the abstract.',
        ],
        faqTitle: 'Questions people actually ask',
        faq: [
          {
            q: 'Can I use the external check inside a client engagement?',
            a: 'Yes. It is free, needs no account, and the report is shown in full — you can run it live on a product you have been asked to review.',
          },
          {
            q: 'What can I honestly promise the client Tvijo does today?',
            a: 'External discovery, a published record structure, published pricing, and pilot work to build an inventory and oversight records. Not a running control plane for their traffic — that is design intent.',
          },
          {
            q: 'How does referral attribution work?',
            a: 'Server-side, with a partner dashboard and published terms, rather than trust-based reporting.',
          },
          {
            q: 'Do you compete with our advisory work?',
            a: 'No. We do not staff engagements. The assessment, the risk judgement and the client relationship stay yours.',
          },
          {
            q: 'What if another tool fits the client better?',
            a: 'Tell them. Our comparison pages exist precisely so that conversation can happen without anyone fudging it.',
          },
        ],
        ctaTitle: 'Talk to us as a partner, not a lead',
        ctaBody:
          'Tell us what your engagements look like and where the tooling gap sits. If a referral relationship makes sense, we will point you at the terms rather than into a funnel.',
        formTitle: 'Talk about a partnership',
        formSubtitle: 'Email or Telegram is enough. A person replies; there is no automated sales sequence.',
        formSubmit: 'Start the conversation',
      },
      ru: {
        metaTitle: 'AI governance для консультантов: инструменты и условия',
        metaDescription:
          'Открывать проект конкретными находками бесплатной внешней проверки, отдавать клиенту опубликованную структуру записей и получать серверную атрибуцию рефералов.',
        eyebrow: 'Для консультантов и советников',
        cardTitle: 'Для консультантов',
        cardBody:
          'Бесплатная проверка, с которой начинается проект, опубликованная структура записей и записанные партнёрские условия.',
        headline: 'Начинать с находок, а не с анкеты зрелости',
        subhead:
          'У проектов по AI governance структурная проблема: discovery съедает бюджет, результат — документ, а документ устаревает за квартал. Бесплатная техническая проверка продукта клиента меняет первую встречу, а опубликованная структура записей даёт вашему отчёту то, на что можно сослаться.',
        painTitle: 'Почему такие проекты тяжёлые',
        pains: [
          'Половина бюджета уходит на выпрашивание у команд списка того, какой AI у них работает.',
          'Находки устаревают сразу, и через полгода ценность работы не видна.',
          'Клиент спрашивает «а каким инструментом это вести?», и честным ответом была таблица.',
          'Ваши рекомендации стоят ровно столько, сколько клиент потом может подтвердить.',
        ],
        offerTitle: 'С чем вы работаете',
        offer: [
          {
            title: 'Бесплатная проверка прямо на первой встрече',
            body: 'Направляете на продукт клиента и получаете конкретные находки — ключи в бандлах, прямые вызовы провайдеров, отсутствующие governance-страницы — со свидетельствами и значимостью. Без аккаунта, и клиент видит тот же отчёт, что и вы.',
            status: 'live',
          },
          {
            title: 'Опубликованная структура записей',
            body: 'На странице evidence pack перечислены все поля с реальным статусом: ваш отчёт ссылается на структуру, которую клиент может проверить, а не на обещание из презентации вендора.',
            status: 'live',
          },
          {
            title: 'Сравнения, которые можно переслать',
            body: 'Наши страницы сравнения говорят, где лучше Portkey, LiteLLM, Langfuse, LangSmith, Credo AI и n8n. Отправляйте клиенту как есть.',
            status: 'live',
          },
          {
            title: 'Серверная атрибуция рефералов',
            body: 'Партнёрская программа считает атрибуцию на нашей стороне, с опубликованными условиями и кабинетом, а не просит вас доверять таблице.',
            status: 'live',
          },
        ],
        stepsTitle: 'Как это используют',
        steps: [
          {
            title: '1. Запустить проверку вживую',
            body: 'Она даёт конкретные находки по продукту клиента на первой же встрече — это лучше как открытие, чем анкета зрелости.',
            status: 'live',
          },
          {
            title: '2. Привязать отчёт к списку полей',
            body: 'Рекомендуйте записи, которые клиент реально сможет вести, и честно помечайте, что из этого уже существует в инструментах.',
            status: 'live',
          },
          {
            title: '3. Звать нас только туда, где мы подходим',
            body: 'Если клиенту сегодня нужен работающий шлюз — скажите это: у нас его нет, и реферал не в ту задачу обойдётся вам дороже, чем принесёт.',
            status: 'pilot',
          },
        ],
        todayTitle: 'Что работает сегодня',
        today: [
          'Партнёрская программа запущена: серверная атрибуция, кабинет партнёра, опубликованные условия.',
          'Внешняя проверка работает для любого продукта, который вас попросили посмотреть, — бесплатно и без аккаунта.',
          'Страницы сравнения и доказательств написаны так, чтобы их можно было переслать клиенту, включая места, где выигрывают конкуренты.',
        ],
        notClaimTitle: 'Чего мы не обещаем',
        notClaim: [
          'Мы никого не сертифицируем, и значка для вашего проекта не существует.',
          'У нас нет аттестации SOC 2 — если клиенту она нужна сегодня, скажите прямо; лучше потерять сделку, чем быть неверно процитированными в отчёте.',
          'Мы не публикуем имена клиентов и кейсы, которые не можем подтвердить.',
          'В продукте сегодня нет ни шлюза, ни хранилища ключей, ни выгрузки доказательств. Если ваша рекомендация опирается на них — она опирается на планы.',
          'Партнёрская программа платит за атрибутированный бизнес, а не за знакомство в принципе.',
        ],
        faqTitle: 'Вопросы, которые задают на самом деле',
        faq: [
          {
            q: 'Можно использовать внешнюю проверку в клиентском проекте?',
            a: 'Да. Она бесплатная, не требует аккаунта, отчёт показывается целиком — можно запустить вживую по продукту, который вас попросили посмотреть.',
          },
          {
            q: 'Что честно можно пообещать клиенту от Tvijo сегодня?',
            a: 'Внешнее обнаружение, опубликованную структуру записей, опубликованные тарифы и работу пилота по сборке реестра и записей о надзоре. Не работающий control plane для их трафика — это пока проект.',
          },
          {
            q: 'Как считается партнёрская атрибуция?',
            a: 'На стороне сервера, с кабинетом партнёра и опубликованными условиями, а не по отчётам на доверии.',
          },
          {
            q: 'Вы конкурируете с нашей консалтинговой работой?',
            a: 'Нет. Мы не подряжаемся на проекты. Оценка, суждение о рисках и отношения с клиентом остаются вашими.',
          },
          {
            q: 'А если клиенту больше подходит другой инструмент?',
            a: 'Скажите ему. Наши страницы сравнения существуют ровно для того, чтобы такой разговор был возможен без подтасовок.',
          },
        ],
        ctaTitle: 'Поговорить как партнёр, а не как лид',
        ctaBody:
          'Расскажите, как устроены ваши проекты и где не хватает инструмента. Если партнёрство имеет смысл, отправим вас к условиям, а не в воронку.',
        formTitle: 'Обсудить партнёрство',
        formSubtitle: 'Достаточно почты или Telegram. Отвечает человек, автоматической воронки писем нет.',
        formSubmit: 'Начать разговор',
      },
    },
  },
];

export interface SolutionsIndexCopy {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  cardCta: string;
  honestTitle: string;
  honestBody: string;
  relatedTitle: string;
}

export const solutionsIndexCopy: Record<SolutionLocale, SolutionsIndexCopy> = {
  en: {
    metaTitle: 'AI governance solutions, by the problem you have',
    metaDescription:
      'Entry points by the problem you have: EU AI Act readiness, audit evidence, LLM cost control, shadow AI discovery and tooling for consultants. Each page states its status.',
    eyebrow: 'Solutions',
    headline: 'Start from the problem, not the product tour',
    subhead:
      'Five pages, five reasons teams come to us. Every capability on them carries a status — shipped, pilot work, or design we have not built — because the fastest way to waste your time is a demo for something that does not exist yet.',
    cardCta: 'Read more',
    honestTitle: 'Why every page labels its own claims',
    honestBody:
      'Governance buyers are lied to constantly: certifications that do not exist, accuracy numbers with no methodology, savings percentages invented for a slide. We mark each capability as live, pilot or design, and we name what is missing, so you can check us before a call rather than after a contract.',
    relatedTitle: 'Also useful',
  },
  ru: {
    metaTitle: 'Решения Tvijo по задачам: AI governance и расходы',
    metaDescription:
      'Входы по реальной задаче: готовность к EU AI Act, доказательства для аудита, контроль расходов на LLM, поиск теневого AI, инструменты для консультантов.',
    eyebrow: 'Решения',
    headline: 'Начните с задачи, а не с обзора продукта',
    subhead:
      'Пять страниц — пять причин, по которым к нам приходят. У каждого пункта стоит статус: работает, делается в пилоте или пока проект. Самый быстрый способ потратить ваше время — демо того, чего ещё нет.',
    cardCta: 'Подробнее',
    honestTitle: 'Почему на каждой странице размечены утверждения',
    honestBody:
      'Покупателю governance врут постоянно: несуществующие сертификаты, проценты точности без методики, экономия, выдуманная под слайд. Мы помечаем каждый пункт как «работает», «пилот» или «проект» и называем то, чего нет, — чтобы вы проверили нас до звонка, а не после договора.',
    relatedTitle: 'Тоже полезно',
  },
};

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}

/** Page copy exists in en/ru; every other locale renders English (and is noindex). */
export function solutionLocale(locale: string): SolutionLocale {
  return locale === 'ru' ? 'ru' : 'en';
}
