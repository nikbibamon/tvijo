/**
 * Copy for the SEO/GEO scanner, the public catalogue and the crawler policy.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.10.
 *
 * en/ru only, like the rest of the funnel: the other nine locales render
 * English and are served noindex (src/lib/seo/marketing.ts).
 *
 * Wording rules carried over from the claims audit: a card reports what was
 * *observed from outside*, never that a company is unsafe or certified, and
 * the free score is "readiness", never a rank or a prediction of citations.
 */

import type { SolutionLocale } from '@/data/solutions';

export interface CatalogCopy {
  scanner: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    headline: string;
    subhead: string;
    placeholder: string;
    submit: string;
    running: string;
    queued: string;
    failed: string;
    blockedByRobots: string;
    whatWeCheck: string;
    checks: { title: string; body: string }[];
    limitsTitle: string;
    limits: string[];
    resultCta: string;
  };
  catalog: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    headline: string;
    subhead: string;
    empty: string;
    searchPlaceholder: string;
    sortLabel: string;
    sortOptions: { value: string; label: string }[];
    columns: { host: string; overall: string; seo: string; geo: string; exposure: string; checked: string };
    rankingDisabled: string;
    methodTitle: string;
    methodBody: string;
  };
  profile: {
    scanned: string;
    coverage: string;
    insufficient: string;
    seo: string;
    geo: string;
    exposure: string;
    overall: string;
    notMeasured: string;
    findingsTitle: string;
    crawlersTitle: string;
    crawlerIntents: Record<string, string>;
    allowed: string;
    blocked: string;
    historyTitle: string;
    disputeTitle: string;
    disputeBody: string;
    disputeCta: string;
    ownerTitle: string;
    ownerBody: string;
    rescanCta: string;
    staleNote: string;
  };
  crawlerPolicy: {
    metaTitle: string;
    metaDescription: string;
    headline: string;
    intro: string;
    sections: { title: string; body: string }[];
    contactTitle: string;
    contactBody: string;
  };
}

export const catalogCopy: Record<SolutionLocale, CatalogCopy> = {
  en: {
    scanner: {
      metaTitle: 'SEO and AI visibility check for any site',
      metaDescription:
        'Free passive audit: what search engines and AI assistants can read on your site, which crawlers robots.txt allows, and what is missing. No signup.',
      eyebrow: 'SEO / GEO check',
      headline: 'Can search engines and AI assistants actually read your site?',
      subhead:
        'One URL in, three scores out: classic SEO hygiene, GEO readiness (whether an assistant can fetch, understand and quote the page) and, if we have already looked, its external AI exposure. Free, no account, and the full report is public at its own address.',
      placeholder: 'yourdomain.com',
      submit: 'Run the check',
      running: 'Reading the site — homepage, robots.txt, sitemap and a sample of pages.',
      queued: 'Queued. This page updates itself as the audit progresses.',
      failed: 'The site did not answer well enough to score. Nothing is published in that case.',
      blockedByRobots:
        'robots.txt asks audit crawlers not to read this site, so nothing was fetched and no card was created.',
      whatWeCheck: 'What the check reads',
      checks: [
        {
          title: 'The HTML as served',
          body: 'Titles, descriptions, canonical, hreflang, headings, structured data and how much text exists before any JavaScript runs.',
        },
        {
          title: 'robots.txt, by crawler intent',
          body: 'Search crawlers, AI search crawlers, user-triggered retrieval and training crawlers are reported separately — blocking training is a choice, not a defect.',
        },
        {
          title: 'Sitemap and a sample of pages',
          body: 'Up to twenty same-origin pages and a sample of internal links, so uniqueness and broken links are measured rather than guessed.',
        },
        {
          title: 'Quotability signals',
          body: 'Entity markup, author and date signals, self-contained answerable blocks, about and contact pages, llms.txt.',
        },
      ],
      limitsTitle: 'What it cannot do',
      limits: [
        'It does not execute JavaScript: that is the point, because plenty of crawlers do not either.',
        'It cannot see your server, your analytics or your rankings, and it never guesses them.',
        'It is not a penetration test and never touches forms, logins or the endpoints it finds.',
        'Ranking positions and AI citation counts are not measured here. A free passive scan cannot know them.',
      ],
      resultCta: 'Open the domain card',
    },
    catalog: {
      metaTitle: 'Domain catalogue: SEO and AI readiness scores',
      metaDescription:
        'Public cards for scanned domains: SEO hygiene, GEO readiness and AI exposure, with coverage, the ruleset version and the date of the check.',
      eyebrow: 'Catalogue',
      headline: 'Scanned domains',
      subhead:
        'Every card comes from a passive check of what the site serves publicly. Scores are observations with a coverage figure attached, not verdicts about a company — and any owner can request a correction or removal.',
      empty: 'No domains match this filter yet.',
      searchPlaceholder: 'Search by domain',
      sortLabel: 'Sort',
      sortOptions: [
        { value: 'overall', label: 'Best overall first' },
        { value: '-overall', label: 'Most problems first' },
        { value: 'seo', label: 'Best SEO first' },
        { value: 'geo', label: 'Best GEO readiness first' },
        { value: 'recent', label: 'Recently checked' },
      ],
      columns: {
        host: 'Domain',
        overall: 'Overall',
        seo: 'SEO',
        geo: 'GEO',
        exposure: 'Exposure',
        checked: 'Checked',
      },
      rankingDisabled:
        'Positions are not shown yet: a ranking needs at least 25 comparable, recently checked profiles on one ruleset version. Sorting works regardless.',
      methodTitle: 'How to read these numbers',
      methodBody:
        'A score is the share of applicable weight a site earned; coverage says how much of the ruleset actually ran. A high score at low coverage means little, so cards below 70% coverage are reachable by link but stay out of the catalogue and the index.',
    },
    profile: {
      scanned: 'Checked',
      coverage: 'Coverage',
      insufficient: 'Not enough coverage for a combined score',
      seo: 'SEO hygiene',
      geo: 'GEO readiness',
      exposure: 'AI exposure',
      overall: 'Overall',
      notMeasured: 'Not measured',
      findingsTitle: 'What was observed',
      crawlersTitle: 'What robots.txt tells each crawler',
      crawlerIntents: {
        ai_search: 'AI search — counts towards GEO readiness',
        user_retrieval: 'User-triggered retrieval — diagnostic only',
        training: 'Model training — reported, never scored',
        search: 'Ordinary web search',
      },
      allowed: 'Allowed',
      blocked: 'Blocked',
      historyTitle: 'History',
      disputeTitle: 'Something wrong here?',
      disputeBody:
        'Corrections and removals are free and do not require an account. A disputed card leaves the ranking immediately, before anyone reviews it, and personal or non-commercial domains are removed on request without argument.',
      disputeCta: 'Request a correction or removal',
      ownerTitle: 'Is this your domain?',
      ownerBody:
        'Owner verification, the full report with exact evidence, and paid remediation are being built. For now the free check and this card are the whole product — we would rather say that than promise a dashboard that does not exist.',
      rescanCta: 'Run the check again',
      staleNote: 'This check is more than 30 days old, so it may no longer reflect the site.',
    },
    crawlerPolicy: {
      metaTitle: 'TvijoAuditBot crawler policy',
      metaDescription:
        'What TvijoAuditBot fetches, how often, how to block it, and how to have a domain card corrected or removed.',
      headline: 'TvijoAuditBot crawler policy',
      intro:
        'TvijoAuditBot performs passive technical audits of public web pages so a site owner can see what search engines and AI assistants read. This page exists because a crawler that visits sites nobody asked it to visit owes them a plain explanation and a way to say no.',
      sections: [
        {
          title: 'User agent',
          body: 'TvijoAuditBot/1.0 (+https://tvijo.com/en/crawler-policy)',
        },
        {
          title: 'What it requests',
          body: 'The homepage, robots.txt, up to two sitemap documents, llms.txt, at most twenty same-origin HTML pages and a sample of internal links. Nothing else: no ports, no subdomain enumeration, no forms, no logins, and it never calls the endpoints it discovers.',
        },
        {
          title: 'How to block it',
          body: 'Add a group for TvijoAuditBot in robots.txt with Disallow: / — it is read before anything else, and a blocked site is neither fetched nor published. Crawl-delay is honoured within reason.',
        },
        {
          title: 'How often',
          body: 'A visitor-triggered check runs once and reuses its result for a short window. Unverified domains are not re-checked more than once every 30 days.',
        },
        {
          title: 'What is stored',
          body: 'Derived metrics: scores, findings, page-level counters, a content hash and short evidence fragments. The pages themselves are not archived, and secret-shaped strings never appear on a public card.',
        },
        {
          title: 'Corrections and removal',
          body: 'Any domain card can be corrected or removed on request. Disputed cards leave the ranking immediately; personal and non-commercial domains are removed without discussion.',
        },
      ],
      contactTitle: 'Contact',
      contactBody:
        'Write to the address on the contact page with the domain and the report link. Abuse reports about crawler behaviour are answered first.',
    },
  },
  ru: {
    scanner: {
      metaTitle: 'Проверка SEO и видимости в AI для любого сайта',
      metaDescription:
        'Бесплатный пассивный аудит: что читают поисковики и AI-ассистенты, каким краулерам разрешает robots.txt и чего не хватает. Без регистрации.',
      eyebrow: 'SEO / GEO проверка',
      headline: 'Могут ли поисковики и AI-ассистенты вообще прочитать ваш сайт?',
      subhead:
        'На входе один URL, на выходе три оценки: классическая SEO-гигиена, GEO readiness (может ли ассистент забрать, понять и процитировать страницу) и, если мы уже смотрели, внешняя AI-экспозиция. Бесплатно, без аккаунта, отчёт живёт по своему адресу.',
      placeholder: 'вашдомен.ru',
      submit: 'Запустить проверку',
      running: 'Читаем сайт — главная, robots.txt, sitemap и выборка страниц.',
      queued: 'В очереди. Страница обновляется сама по мере выполнения.',
      failed: 'Сайт ответил недостаточно, чтобы выставить оценку. В таком случае ничего не публикуется.',
      blockedByRobots:
        'robots.txt просит аудит-краулеры не читать сайт: мы ничего не забирали и карточку не создавали.',
      whatWeCheck: 'Что читает проверка',
      checks: [
        {
          title: 'HTML в том виде, в котором он отдан',
          body: 'Заголовки, описания, canonical, hreflang, структура заголовков, разметка и сколько текста есть до выполнения JavaScript.',
        },
        {
          title: 'robots.txt по типам краулеров',
          body: 'Поисковые, AI-поисковые, пользовательские и обучающие краулеры показываются отдельно: блокировка обучения — это выбор, а не дефект.',
        },
        {
          title: 'Sitemap и выборка страниц',
          body: 'До двадцати страниц того же домена и выборка внутренних ссылок, чтобы уникальность и битые ссылки измерялись, а не угадывались.',
        },
        {
          title: 'Признаки цитируемости',
          body: 'Разметка сущностей, автор и дата, самостоятельные блоки с ответами, страницы about и contact, llms.txt.',
        },
      ],
      limitsTitle: 'Чего она не делает',
      limits: [
        'Не выполняет JavaScript — и в этом смысл: многие краулеры тоже не выполняют.',
        'Не видит ваш сервер, аналитику и позиции и никогда их не додумывает.',
        'Это не пентест: формы, авторизация и найденные эндпоинты не трогаются.',
        'Позиции в выдаче и число цитирований в AI здесь не измеряются — пассивный скан этого знать не может.',
      ],
      resultCta: 'Открыть карточку домена',
    },
    catalog: {
      metaTitle: 'Каталог доменов: оценки SEO и готовности к AI',
      metaDescription:
        'Публичные карточки просканированных доменов: SEO-гигиена, GEO readiness и AI-экспозиция с покрытием, версией правил и датой проверки.',
      eyebrow: 'Каталог',
      headline: 'Просканированные домены',
      subhead:
        'Каждая карточка — результат пассивной проверки того, что сайт отдаёт публично. Оценка это наблюдение с указанным покрытием, а не вердикт о компании; владелец может запросить исправление или удаление.',
      empty: 'Под этот фильтр пока ничего не подходит.',
      searchPlaceholder: 'Поиск по домену',
      sortLabel: 'Сортировка',
      sortOptions: [
        { value: 'overall', label: 'Сначала лучшие' },
        { value: '-overall', label: 'Сначала проблемные' },
        { value: 'seo', label: 'Лучший SEO' },
        { value: 'geo', label: 'Лучшая GEO-готовность' },
        { value: 'recent', label: 'Недавно проверенные' },
      ],
      columns: {
        host: 'Домен',
        overall: 'Итог',
        seo: 'SEO',
        geo: 'GEO',
        exposure: 'Экспозиция',
        checked: 'Проверен',
      },
      rankingDisabled:
        'Места пока не показываются: для рейтинга нужно минимум 25 сопоставимых свежих профилей на одной версии правил. Сортировка при этом работает.',
      methodTitle: 'Как читать эти числа',
      methodBody:
        'Оценка — доля применимого веса, которую сайт набрал; покрытие говорит, какая часть правил реально отработала. Высокая оценка при низком покрытии почти ничего не значит, поэтому карточки с покрытием ниже 70% доступны по ссылке, но не попадают ни в каталог, ни в индекс.',
    },
    profile: {
      scanned: 'Проверен',
      coverage: 'Покрытие',
      insufficient: 'Покрытия недостаточно для сводной оценки',
      seo: 'SEO-гигиена',
      geo: 'GEO readiness',
      exposure: 'AI-экспозиция',
      overall: 'Итог',
      notMeasured: 'Не измерялось',
      findingsTitle: 'Что наблюдалось',
      crawlersTitle: 'Что robots.txt говорит каждому краулеру',
      crawlerIntents: {
        ai_search: 'AI-поиск — влияет на GEO readiness',
        user_retrieval: 'Пользовательский запрос — только диагностика',
        training: 'Обучение моделей — показываем, не оцениваем',
        search: 'Обычный поиск',
      },
      allowed: 'Разрешён',
      blocked: 'Заблокирован',
      historyTitle: 'История',
      disputeTitle: 'Здесь что-то не так?',
      disputeBody:
        'Исправление и удаление бесплатны и не требуют аккаунта. Оспоренная карточка сразу выходит из рейтинга, до всякого разбора, а личные и некоммерческие домены удаляются по запросу без обсуждения.',
      disputeCta: 'Запросить исправление или удаление',
      ownerTitle: 'Это ваш домен?',
      ownerBody:
        'Подтверждение владения, полный отчёт с точными свидетельствами и платное устранение — в работе. Сегодня продукт это бесплатная проверка и эта карточка; лучше сказать так, чем обещать несуществующий кабинет.',
      rescanCta: 'Проверить ещё раз',
      staleNote: 'Проверке больше 30 дней — она может уже не отражать сайт.',
    },
    crawlerPolicy: {
      metaTitle: 'Политика краулера TvijoAuditBot',
      metaDescription:
        'Что забирает TvijoAuditBot, как часто, как его заблокировать и как исправить или удалить карточку домена.',
      headline: 'Политика краулера TvijoAuditBot',
      intro:
        'TvijoAuditBot делает пассивный технический аудит публичных страниц, чтобы владелец сайта видел, что читают поисковики и AI-ассистенты. Эта страница существует потому, что краулер, приходящий туда, куда его не звали, обязан объяснить себя простыми словами и дать возможность отказаться.',
      sections: [
        {
          title: 'User agent',
          body: 'TvijoAuditBot/1.0 (+https://tvijo.com/en/crawler-policy)',
        },
        {
          title: 'Что запрашивается',
          body: 'Главная, robots.txt, до двух файлов sitemap, llms.txt, не более двадцати HTML-страниц того же домена и выборка внутренних ссылок. Больше ничего: ни портов, ни перебора поддоменов, ни форм, ни авторизации; найденные эндпоинты не вызываются.',
        },
        {
          title: 'Как заблокировать',
          body: 'Добавьте в robots.txt группу для TvijoAuditBot с Disallow: / — он читается раньше всего, и заблокированный сайт не забирается и не публикуется. Crawl-delay соблюдается в разумных пределах.',
        },
        {
          title: 'Как часто',
          body: 'Проверка по запросу посетителя выполняется один раз, и её результат переиспользуется короткое время. Неподтверждённые домены не перепроверяются чаще раза в 30 дней.',
        },
        {
          title: 'Что хранится',
          body: 'Производные метрики: оценки, находки, счётчики по страницам, хеш содержимого и короткие фрагменты свидетельств. Сами страницы не архивируются, а строки, похожие на секреты, никогда не попадают в публичную карточку.',
        },
        {
          title: 'Исправление и удаление',
          body: 'Любую карточку можно исправить или удалить по запросу. Оспоренная карточка сразу выходит из рейтинга; личные и некоммерческие домены удаляются без обсуждения.',
        },
      ],
      contactTitle: 'Контакт',
      contactBody:
        'Напишите на адрес со страницы контактов, указав домен и ссылку на отчёт. Жалобы на поведение краулера обрабатываются в первую очередь.',
    },
  },
};
