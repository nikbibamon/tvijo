/**
 * /[locale]/security — data handling, keys, access, deployment, and the gaps.
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §3–4.
 *
 * Every statement here is checked against code:
 *  - stored records: apps/ai/models.py::LLMCallLog, apps/aiscan/models.py::
 *    ExposureScan (host, findings, hashed IP), apps/trading/models.py::LeadCapture;
 *  - abuse controls: DEFAULT_THROTTLE_RATES in config/settings/base.py
 *    (leads 15/hour, aiscan 10/hour) plus the honeypot in LeadCaptureView;
 *  - gaps are stated as gaps: no retention job exists in the codebase, there is
 *    no PII filter, no policy engine, no customer key vault, no tamper-evident
 *    storage, no SOC 2 attestation.
 */

import type { ClaimStatus, SolutionLocale } from '@/data/solutions';

export interface SecurityItem {
  body: string;
  status: ClaimStatus;
}

export interface SecuritySection {
  title: string;
  items: SecurityItem[];
}

export interface SecurityCopy {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  sections: SecuritySection[];
  gapsTitle: string;
  gapsIntro: string;
  gaps: string[];
  soc2Title: string;
  soc2Body: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
  relatedTitle: string;
}

export const securityCopy: Record<SolutionLocale, SecurityCopy> = {
  en: {
    metaTitle: 'Security, data handling and audit evidence at Tvijo',
    metaDescription:
      'What Tvijo stores, how keys and access are handled, what abuse controls run, and which security capabilities are still missing. SOC 2 is roadmap, not attested.',
    eyebrow: 'Security & data',
    headline: 'Security posture, including the parts that are missing',
    subhead:
      'Most vendor security pages list capabilities and omit gaps, which makes them useless for the person doing the review. This one states what the system actually stores and enforces today, marks pilot-scoped items as such, and lists the gaps in their own section so you can find them without reading between lines.',
    sections: [
      {
        title: 'What is stored',
        items: [
          {
            body: 'Model-call records: timestamp, actor, source, operation, provider, model, token counts, latency, estimated cost and a JSON extras field. These come from the router we run on our own AI spend.',
            status: 'live',
          },
          {
            body: 'Exposure-check scans: the submitted URL and host, the findings, the score, locale and user agent, plus a hashed client IP — raw IP addresses are not stored for scans.',
            status: 'live',
          },
          {
            body: 'Contact submissions: the email or Telegram handle you type, your message, the page it came from, UTM parameters, and the submitting IP, which is kept for abuse control.',
            status: 'live',
          },
          {
            body: 'Customer production prompts and responses are not stored, because the product does not sit in front of customer traffic yet.',
            status: 'live',
          },
        ],
      },
      {
        title: 'Retention and deletion',
        items: [
          {
            body: 'There is no automated retention window in the codebase today: scan, lead and call records are kept until deleted. We would rather say that than publish a policy nothing enforces.',
            status: 'live',
          },
          {
            body: 'Deletion on request: email us and we remove the rows — scans by report link, leads by the address you used.',
            status: 'live',
          },
          {
            body: 'Retention rules bound to a pilot — window, scope and who may export — are agreed as part of that pilot.',
            status: 'pilot',
          },
        ],
      },
      {
        title: 'Keys and BYOK',
        items: [
          {
            body: 'Provider API keys live in server-side environment configuration and are never shipped to the browser. The exposure check exists partly because this is the mistake we most often find in other products.',
            status: 'live',
          },
          {
            body: 'A customer-facing key vault, per-lane key scoping and rotation workflows are design. There is no BYOK storage in the product today.',
            status: 'design',
          },
        ],
      },
      {
        title: 'Access control',
        items: [
          {
            body: 'Staff and superuser roles gate the administrative surfaces, and those surfaces are kept out of the public navigation rather than merely unlinked.',
            status: 'live',
          },
          {
            body: 'Per-customer RBAC, SSO and SCIM provisioning do not exist yet. If your procurement requires SSO today, we are not the answer today.',
            status: 'design',
          },
        ],
      },
      {
        title: 'Audit trail',
        items: [
          {
            body: 'Every model call writes a structured record; the full field list, with each field marked shipped or design, is published on the evidence page.',
            status: 'live',
          },
          {
            body: 'Tamper-evident storage — hash-chained records where a silent edit breaks the chain — is designed and not built.',
            status: 'design',
          },
          {
            body: 'Scoped evidence packs are assembled inside a pilot; there is no export button in the product.',
            status: 'pilot',
          },
        ],
      },
      {
        title: 'Abuse controls',
        items: [
          {
            body: 'Rate limits per endpoint: contact submissions are capped per hour per client, and the exposure check is capped tighter because it fetches a URL you supply.',
            status: 'live',
          },
          {
            body: 'Forms carry a honeypot field; submissions that fill it are accepted silently and stored nowhere.',
            status: 'live',
          },
          {
            body: 'Scan findings redact the secrets they detect, so a shared report link does not become the leak.',
            status: 'live',
          },
        ],
      },
      {
        title: 'Transport, storage and hosting',
        items: [
          {
            body: 'All traffic to the site and API runs over HTTPS.',
            status: 'live',
          },
          {
            body: 'A single hosted deployment in the EU backs both the site and the API today.',
            status: 'live',
          },
          {
            body: 'There is no application-level field encryption: data sits in the database protected by host and access controls, not by per-field cryptography.',
            status: 'live',
          },
          {
            body: 'Private deployment and data residency in a region of your choice are pilot-scoping conversations, not switches.',
            status: 'pilot',
          },
        ],
      },
    ],
    gapsTitle: 'Known gaps, stated plainly',
    gapsIntro:
      'If one of these is a blocker for your review, you have learned it here in a minute instead of three calls in.',
    gaps: [
      'No SOC 2 attestation.',
      'No PII or secret filtering in the model path — the only automated output check looks for refusals and absurd lengths.',
      'No policy engine, so no record carries an allow / redact / block decision.',
      'No tamper-evident storage and no evidence-pack export.',
      'No automated retention or deletion schedule.',
      'No customer key vault, no SSO, no SCIM.',
      'No gateway in front of customer production traffic — governed lanes are design intent.',
    ],
    soc2Title: 'SOC 2',
    soc2Body:
      'SOC 2 is on the roadmap and not attested. We will not describe ourselves as certified, compliant or audited before an auditor says so in writing, and we would rather lose a deal than be quoted otherwise in your report.',
    faqTitle: 'Questions a security review asks',
    faq: [
      {
        q: 'Where is our data hosted?',
        a: 'In a single hosted deployment in the EU covering both the website and the API. Multi-region and customer-chosen residency are pilot-scoping topics, not existing configuration.',
      },
      {
        q: 'Do you train models on anything we send?',
        a: 'No. We do not train models at all. Content sent to a third-party provider through our own router is subject to that provider\'s terms — and today the product does not process customer production traffic in the first place.',
      },
      {
        q: 'Can we get our data deleted?',
        a: 'Yes. Email us with the report link or the address you used and the rows are removed. Because there is no automated retention job, deletion is a request rather than an expiry today.',
      },
      {
        q: 'What does the exposure check send to your servers?',
        a: 'The URL you submit. The server fetches that page and stores the host, the findings, the score, your locale and user agent, and a hashed IP. It does not store your raw IP address.',
      },
      {
        q: 'Do you have SOC 2 or ISO 27001?',
        a: 'Neither, today. SOC 2 is on the roadmap. If your procurement blocks on an attestation, that is a legitimate reason not to buy from us yet, and we will say so on the call.',
      },
    ],
    ctaTitle: 'Send the security questionnaire',
    ctaBody:
      'If your review has questions this page does not answer, send them. You will get direct answers, including "we do not have that" where it applies.',
    ctaPrimary: 'Book a walkthrough',
    ctaSecondary: 'Read the evidence field list',
    relatedTitle: 'Related',
  },
  ru: {
    metaTitle: 'Безопасность, хранение данных и аудит-след Tvijo',
    metaDescription:
      'Что Tvijo хранит, как обращается с ключами и доступом, какие есть защиты от злоупотреблений и каких возможностей пока нет. SOC 2 — в планах, не аттестован.',
    eyebrow: 'Безопасность и данные',
    headline: 'Состояние безопасности, включая то, чего нет',
    subhead:
      'Большинство страниц про безопасность перечисляют возможности и умалчивают о пробелах, из-за чего они бесполезны тому, кто проводит проверку. Здесь написано, что система реально хранит и применяет сегодня, что относится к пилоту, а пробелы вынесены в отдельный раздел — чтобы их не приходилось вычитывать между строк.',
    sections: [
      {
        title: 'Что хранится',
        items: [
          {
            body: 'Записи вызовов моделей: время, актор, источник, операция, провайдер, модель, счётчики токенов, задержка, оценка стоимости и JSON-поле для дополнений. Это данные роутера, через который идут наши собственные траты на AI.',
            status: 'live',
          },
          {
            body: 'Сканы внешней проверки: отправленный URL и хост, находки, оценка, локаль и user agent, а также хеш IP клиента — сырые IP-адреса для сканов не хранятся.',
            status: 'live',
          },
          {
            body: 'Обращения через форму: почта или Telegram, ваше сообщение, страница, с которой пришли, UTM-метки и IP отправителя, который нужен для защиты от злоупотреблений.',
            status: 'live',
          },
          {
            body: 'Боевые промпты и ответы клиентов не хранятся, потому что продукт пока не стоит перед клиентским трафиком.',
            status: 'live',
          },
        ],
      },
      {
        title: 'Хранение и удаление',
        items: [
          {
            body: 'В коде сегодня нет автоматического срока хранения: записи сканов, обращений и вызовов лежат до удаления. Лучше сказать это прямо, чем опубликовать политику, которую ничто не выполняет.',
            status: 'live',
          },
          {
            body: 'Удаление по запросу: напишите нам — удалим строки: сканы по ссылке на отчёт, обращения по адресу, который вы использовали.',
            status: 'live',
          },
          {
            body: 'Правила хранения под пилот — срок, область и кто может выгружать — согласуются в рамках этого пилота.',
            status: 'pilot',
          },
        ],
      },
      {
        title: 'Ключи и BYOK',
        items: [
          {
            body: 'Ключи API провайдеров живут в серверной конфигурации окружения и никогда не уезжают в браузер. Внешняя проверка существует в том числе потому, что это самая частая ошибка, которую мы находим у других продуктов.',
            status: 'live',
          },
          {
            body: 'Хранилище ключей для клиента, привязка ключей к потокам и сценарии ротации — это проект. Хранения BYOK в продукте сегодня нет.',
            status: 'design',
          },
        ],
      },
      {
        title: 'Управление доступом',
        items: [
          {
            body: 'Роли staff и superuser закрывают административные поверхности, и эти поверхности убраны из публичной навигации, а не просто «не залинкованы».',
            status: 'live',
          },
          {
            body: 'RBAC на стороне клиента, SSO и SCIM пока не существуют. Если ваш закуп требует SSO сегодня — сегодня мы не ответ.',
            status: 'design',
          },
        ],
      },
      {
        title: 'Аудит-след',
        items: [
          {
            body: 'Каждый вызов модели пишет структурированную запись; полный список полей со статусом каждого опубликован на странице доказательств.',
            status: 'live',
          },
          {
            body: 'Хранение с защитой от правок — хеш-цепочка, где тихая правка рвёт цепь, — спроектировано и не построено.',
            status: 'design',
          },
          {
            body: 'Пакеты доказательств по области собираются внутри пилота; кнопки выгрузки в продукте нет.',
            status: 'pilot',
          },
        ],
      },
      {
        title: 'Защита от злоупотреблений',
        items: [
          {
            body: 'Ограничения частоты по эндпоинтам: обращения через форму лимитированы в час на клиента, внешняя проверка — жёстче, потому что сервер ходит по URL, который вы прислали.',
            status: 'live',
          },
          {
            body: 'В формах есть honeypot-поле; отправки, которые его заполнили, принимаются молча и никуда не сохраняются.',
            status: 'live',
          },
          {
            body: 'Находки скана скрывают найденные секреты, чтобы пересланная ссылка на отчёт сама не стала утечкой.',
            status: 'live',
          },
        ],
      },
      {
        title: 'Передача, хранение и размещение',
        items: [
          {
            body: 'Весь трафик сайта и API идёт по HTTPS.',
            status: 'live',
          },
          {
            body: 'Сегодня и сайт, и API работают в одном размещении на территории ЕС.',
            status: 'live',
          },
          {
            body: 'Шифрования на уровне полей приложения нет: данные лежат в базе, защищённые доступом и хостом, а не криптографией по полям.',
            status: 'live',
          },
          {
            body: 'Приватное развёртывание и резидентность в нужном вам регионе — предмет разговора о пилоте, а не переключатель.',
            status: 'pilot',
          },
        ],
      },
    ],
    gapsTitle: 'Известные пробелы, прямым текстом',
    gapsIntro:
      'Если что-то из этого блокирует вашу проверку, вы узнали это здесь за минуту, а не на третьем созвоне.',
    gaps: [
      'Нет аттестации SOC 2.',
      'Нет фильтрации PII и секретов в пути к модели — единственная автоматическая проверка на выходе ищет отказы и абсурдную длину.',
      'Нет движка политик, поэтому ни одна запись не несёт решения «разрешено / замаскировано / заблокировано».',
      'Нет хранения с защитой от правок и нет выгрузки evidence pack.',
      'Нет автоматического срока хранения и планового удаления.',
      'Нет хранилища ключей клиента, нет SSO, нет SCIM.',
      'Нет шлюза перед боевым трафиком клиента — управляемые потоки остаются проектом.',
    ],
    soc2Title: 'SOC 2',
    soc2Body:
      'SOC 2 у нас в планах и не подтверждён аттестацией. Мы не будем называть себя сертифицированными, соответствующими или прошедшими аудит, пока это письменно не скажет аудитор, — и скорее потеряем сделку, чем окажемся неверно процитированными в вашем отчёте.',
    faqTitle: 'Вопросы, которые задаёт проверка безопасности',
    faq: [
      {
        q: 'Где размещаются наши данные?',
        a: 'В одном размещении на территории ЕС, которое обслуживает и сайт, и API. Мультирегион и резидентность по выбору клиента — темы пилота, а не существующая конфигурация.',
      },
      {
        q: 'Вы обучаете модели на том, что мы присылаем?',
        a: 'Нет. Мы вообще не обучаем модели. К содержимому, отправленному стороннему провайдеру через наш роутер, применяются условия этого провайдера, — и сегодня продукт вообще не обрабатывает боевой трафик клиентов.',
      },
      {
        q: 'Можно удалить наши данные?',
        a: 'Да. Напишите нам со ссылкой на отчёт или с адресом, который использовали, — строки удалим. Поскольку автоматического срока хранения нет, удаление сегодня происходит по запросу, а не по расписанию.',
      },
      {
        q: 'Что внешняя проверка отправляет на ваши серверы?',
        a: 'Присланный вами URL. Сервер забирает эту страницу и сохраняет хост, находки, оценку, вашу локаль и user agent, а также хеш IP. Сырой IP-адрес не сохраняется.',
      },
      {
        q: 'У вас есть SOC 2 или ISO 27001?',
        a: 'Сегодня ни того, ни другого. SOC 2 в планах. Если ваш закуп упирается в аттестацию, это законная причина пока не покупать у нас, и на звонке мы это скажем.',
      },
    ],
    ctaTitle: 'Пришлите анкету по безопасности',
    ctaBody:
      'Если у проверки есть вопросы, на которые эта страница не отвечает, присылайте. Ответим прямо, включая «этого у нас нет» там, где это так.',
    ctaPrimary: 'Запросить разбор',
    ctaSecondary: 'Список полей доказательств',
    relatedTitle: 'Связанное',
  },
};
