export const AGENT_SKILL_INDEX_LOCALES = ['en', 'ru', 'uk'] as const;

export type AgentSkillsLocale = (typeof AGENT_SKILL_INDEX_LOCALES)[number];

export interface AgentSkillPack {
  key:
    | 'caveman'
    | 'graphify'
    | 'impeccable'
    | 'ai4trade'
    | 'engineering-ops';
  title: string;
  version: string;
  tier: 'verified_core' | 'experimental' | 'community';
  files: number;
  description: string;
}

interface AgentSkillsCopy {
  metaTitle: string;
  metaDescription: string;
  nav: {
    packs: string;
    how: string;
    trust: string;
    signIn: string;
    workspace: string;
  };
  hero: {
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    proofs: string[];
    documentLabel: string;
    documentTitle: string;
    documentDescription: string;
    flowAgent: string;
    flowGateway: string;
    flowGatewayNote: string;
    flowProvider: string;
  };
  catalogue: {
    eyebrow: string;
    title: string;
    lede: string;
    tier: string;
    files: string;
    cta: string;
    note: string;
  };
  packs: AgentSkillPack[];
  how: {
    eyebrow: string;
    title: string;
    lede: string;
    steps: { number: string; title: string; body: string }[];
    configTitle: string;
    privateNote: string;
    cta: string;
  };
  trust: {
    eyebrow: string;
    title: string;
    lede: string;
    publicTitle: string;
    publicItems: string[];
    privateTitle: string;
    privateItems: string[];
  };
  finalCta: {
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    note: string;
  };
  footerTagline: string;
}

const EN_PACKS: AgentSkillPack[] = [
  {
    key: 'caveman',
    title: 'Caveman',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Short, direct answers and compressed plans for fast operator work.',
  },
  {
    key: 'graphify',
    title: 'Graphify',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Turn entities, claims, decisions, and links into durable graph structure.',
  },
  {
    key: 'impeccable',
    title: 'Impeccable',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Sharper visual hierarchy, typography, spacing, and critique for frontend work.',
  },
  {
    key: 'ai4trade',
    title: 'AI-Trader',
    version: '1.0.0',
    tier: 'experimental',
    files: 6,
    description: 'Experimental signal, market-intelligence, heartbeat, and public-data workflows.',
  },
  {
    key: 'engineering-ops',
    title: 'Engineering & Ops',
    version: '1.0.0',
    tier: 'community',
    files: 77,
    description: 'Eighteen audited engineering and operations skills: architecture and migrations, API review, observability, runbooks, incident command, dependency and secrets hygiene, agent design, and AEO audits.',
  },
];

const RU_PACKS: AgentSkillPack[] = [
  {
    key: 'caveman',
    title: 'Caveman',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Короткие прямые ответы и сжатые планы для быстрой работы оператора.',
  },
  {
    key: 'graphify',
    title: 'Graphify',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Собирает сущности, утверждения, решения и связи в устойчивый граф знаний.',
  },
  {
    key: 'impeccable',
    title: 'Impeccable',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Усиливает иерархию, типографику, ритм и качество критики интерфейсов.',
  },
  {
    key: 'ai4trade',
    title: 'AI-Trader',
    version: '1.0.0',
    tier: 'experimental',
    files: 6,
    description: 'Экспериментальные сценарии сигналов, market-intel, heartbeat и публичных данных.',
  },
  {
    key: 'engineering-ops',
    title: 'Engineering & Ops',
    version: '1.0.0',
    tier: 'community',
    files: 77,
    description: 'Восемнадцать проверенных инженерных и операционных навыков: архитектура и миграции, ревью API, наблюдаемость, ранбуки, инциденты, гигиена зависимостей и секретов, дизайн агентов и AEO-аудит.',
  },
];

const UK_PACKS: AgentSkillPack[] = [
  {
    key: 'caveman',
    title: 'Caveman',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Короткі, прямі відповіді та стислі плани для швидкої роботи оператора.',
  },
  {
    key: 'graphify',
    title: 'Graphify',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Перетворюйте сутності, твердження, рішення та зв\'язки у стійку графову структуру.',
  },
  {
    key: 'impeccable',
    title: 'Impeccable',
    version: '1.0.0',
    tier: 'verified_core',
    files: 2,
    description: 'Чіткіша візуальна ієрархія, типографіка, інтервали та критика для фронтенд-роботи.',
  },
  {
    key: 'ai4trade',
    title: 'AI-Trader',
    version: '1.0.0',
    tier: 'experimental',
    files: 6,
    description: 'Експериментальні робочі процеси для сигналів, ринкової аналітики, heartbeat та публічних даних.',
  },
  {
    key: 'engineering-ops',
    title: 'Engineering & Ops',
    version: '1.0.0',
    tier: 'community',
    files: 77,
    description: 'Вісімнадцять перевірених інженерних та операційних навичок: архітектура та міграції, рев\'ю API, спостережуваність, runbooks, командування інцидентами, гігієна залежностей і секретів, дизайн агентів та аудити AEO.',
  },
];

export const agentSkillsCopy: Record<AgentSkillsLocale, AgentSkillsCopy> = {
  en: {
    metaTitle: 'Inspectable AI Agent Skill Packs | Tvijo',
    metaDescription:
      'Explore curated Markdown skill packs for AI agents. Review every file, run on your own server, and add controlled managed routing when approved.',
    nav: {
      packs: 'Skill packs',
      how: 'How it works',
      trust: 'Trust & control',
      signIn: 'Sign in',
      workspace: 'Open workspace',
    },
    hero: {
      title: 'Give your AI agent skills you can inspect.',
      lede:
        'Curated SKILL.md packs for focused work. Read what every pack does, run it on your own server, and connect managed routing when your account is approved.',
      primary: 'Explore skill packs',
      secondary: 'See how it works',
      proofs: ['5 curated packs', 'Markdown-only downloads', 'Your server, your runtime'],
      documentLabel: 'Readable by design',
      documentTitle: 'A skill is a file, not a black box.',
      documentDescription:
        'Purpose, instructions, version, and trust metadata stay visible before the agent runs anything.',
      flowAgent: 'Your agent',
      flowGateway: 'Tvijo gateway',
      flowGatewayNote: 'provisioned accounts',
      flowProvider: 'Model provider',
    },
    catalogue: {
      eyebrow: 'Curated catalogue',
      title: 'Five focused packs. No black box.',
      lede:
        'Read the purpose, trust tier, and file count before you sign in. Downloads stay in the client workspace.',
      tier: 'Trust tier',
      files: 'files',
      cta: 'Open the client workspace to download',
      note: 'Every archive is Markdown-only. Review each file before use.',
    },
    packs: EN_PACKS,
    how: {
      eyebrow: 'How it works',
      title: 'From readable files to a controlled agent.',
      lede: 'Start with the skill documents. Add managed routing only when it is provisioned for your account.',
      steps: [
        { number: '01', title: 'Choose a pack', body: 'Compare the purpose, trust tier, and file count in public.' },
        { number: '02', title: 'Review the files', body: 'Sign in, download the Markdown-only archive, and inspect it.' },
        { number: '03', title: 'Run on your server', body: 'Install the pack in your own single-user agent runtime.' },
        { number: '04', title: 'Add controlled routing', body: 'Approved clients can connect a scoped, budget-guarded gateway key.' },
      ],
      configTitle: 'Provider configuration',
      privateNote: 'Gateway keys, usage, and traces stay inside the authenticated workspace.',
      cta: 'Open workspace setup',
    },
    trust: {
      eyebrow: 'Clear boundary',
      title: 'Show the product. Protect the customer.',
      lede: 'The public page explains the packs and setup. Operational data stays behind authentication.',
      publicTitle: 'Public by design',
      publicItems: ['Pack names and outcomes', 'Trust tier and file count', 'Installation and review guide', 'Gateway operating model'],
      privateTitle: 'Private by default',
      privateItems: ['Skill-pack downloads', 'API keys and credentials', 'Usage and sanitized traces', 'Budget and revocation controls'],
    },
    finalCta: {
      title: 'Start with the files. Add control when you need it.',
      lede: 'Explore the catalogue now. Sign in when you are ready to download a pack or request managed gateway access.',
      primary: 'Explore the packs',
      secondary: 'Open client workspace',
      note: 'Managed gateway access is provisioned for approved accounts.',
    },
    footerTagline: 'Agent skills you can inspect.',
  },
  ru: {
    metaTitle: 'Проверяемые skill-паки для AI-агентов | Tvijo',
    metaDescription:
      'Публичный каталог Markdown skill-паков для AI-агентов: назначение, тир доверия, инструкция и управляемый шлюз для одобренных клиентов.',
    nav: {
      packs: 'Skill-паки',
      how: 'Как это работает',
      trust: 'Доверие и контроль',
      signIn: 'Войти',
      workspace: 'Открыть кабинет',
    },
    hero: {
      title: 'Дайте AI-агенту навыки, которые можно проверить.',
      lede:
        'Curated SKILL.md-паки для конкретных задач. Прочитайте каждый файл, запустите на своём сервере и подключите управляемый роутинг после одобрения аккаунта.',
      primary: 'Смотреть skill-паки',
      secondary: 'Как это работает',
      proofs: ['5 curated-паков', 'Только Markdown', 'Ваш сервер, ваш runtime'],
      documentLabel: 'Прозрачно по замыслу',
      documentTitle: 'Навык — это файл, а не чёрный ящик.',
      documentDescription:
        'Назначение, инструкции, версия и trust-метаданные видны до того, как агент что-либо запустит.',
      flowAgent: 'Ваш агент',
      flowGateway: 'Шлюз Tvijo',
      flowGatewayNote: 'для подключённых аккаунтов',
      flowProvider: 'Model provider',
    },
    catalogue: {
      eyebrow: 'Curated-каталог',
      title: 'Пять точных паков. Никакого чёрного ящика.',
      lede:
        'Назначение, тир доверия и число файлов видны до входа. Скачивание остаётся в клиентском кабинете.',
      tier: 'Тир доверия',
      files: 'файла(ов)',
      cta: 'Открыть кабинет и скачать',
      note: 'В каждом архиве только Markdown. Проверьте файлы перед использованием.',
    },
    packs: RU_PACKS,
    how: {
      eyebrow: 'Как это работает',
      title: 'От читаемых файлов к управляемому агенту.',
      lede: 'Начните с документов навыка. Managed-роутинг подключайте только после выдачи доступа вашему аккаунту.',
      steps: [
        { number: '01', title: 'Выберите пак', body: 'Сравните назначение, тир доверия и число файлов без регистрации.' },
        { number: '02', title: 'Проверьте файлы', body: 'Войдите, скачайте Markdown-архив и прочитайте его содержимое.' },
        { number: '03', title: 'Запустите у себя', body: 'Установите пак в собственный single-user runtime агента.' },
        { number: '04', title: 'Добавьте контроль', body: 'Подключённые клиенты получают scoped-ключ со строгим budget guard.' },
      ],
      configTitle: 'Настройка провайдера',
      privateNote: 'Ключи шлюза, usage и traces остаются внутри авторизованного кабинета.',
      cta: 'Открыть настройку',
    },
    trust: {
      eyebrow: 'Чёткая граница',
      title: 'Показываем продукт. Защищаем клиента.',
      lede: 'Публичная страница объясняет паки и настройку. Операционные данные доступны только после входа.',
      publicTitle: 'Публично по замыслу',
      publicItems: ['Названия и назначение паков', 'Тир доверия и число файлов', 'Инструкция установки и проверки', 'Модель работы шлюза'],
      privateTitle: 'Приватно по умолчанию',
      privateItems: ['Скачивание skill-паков', 'API-ключи и credentials', 'Usage и очищенные traces', 'Бюджеты и отзыв доступа'],
    },
    finalCta: {
      title: 'Начните с файлов. Добавьте контроль, когда он понадобится.',
      lede: 'Изучите каталог сейчас. Войдите, когда будете готовы скачать пак или запросить доступ к управляемому шлюзу.',
      primary: 'Смотреть паки',
      secondary: 'Открыть кабинет',
      note: 'Доступ к managed gateway выдаётся одобренным аккаунтам.',
    },
    footerTagline: 'Навыки для агентов, которые можно проверить.',
  },

  uk: {
    metaTitle: 'Інспектовані набори навичок для AI-агентів | Tvijo',
    metaDescription:
      'Досліджуйте підібрані набори навичок Markdown для AI-агентів. Перегляньте кожен файл, запускайте на власному сервері та додавайте контрольовану керовану маршрутизацію після схвалення.',
    nav: {
      packs: 'Набори навичок',
      how: 'Як це працює',
      trust: 'Довіра та контроль',
      signIn: 'Увійти',
      workspace: 'Відкрити робочий простір',
    },
    hero: {
      title: 'Надайте вашому AI-агенту навички, які можна інспектувати.',
      lede:
        'Підібрані набори SKILL.md для зосередженої роботи. Читайте, що робить кожен набір, запускайте його на власному сервері та підключайте керовану маршрутизацію після схвалення вашого облікового запису.',
      primary: 'Дослідити набори навичок',
      secondary: 'Подивитися, як це працює',
      proofs: ['5 підібраних наборів', 'Завантаження лише у форматі Markdown', 'Ваш сервер, ваше середовище виконання'],
      documentLabel: 'Читабельний за дизайном',
      documentTitle: 'Навичка — це файл, а не чорна скринька.',
      documentDescription:
        'Призначення, інструкції, версія та метадані довіри залишаються видимими до того, як агент щось запустить.',
      flowAgent: 'Ваш агент',
      flowGateway: 'Шлюз Tvijo',
      flowGatewayNote: 'підготовлені облікові записи',
      flowProvider: 'Постачальник моделей',
    },
    catalogue: {
      eyebrow: 'Підібраний каталог',
      title: 'П\'ять зосереджених наборів. Жодної чорної скриньки.',
      lede:
        'Читайте призначення, рівень довіри та кількість файлів перед входом. Завантаження залишаються в клієнтському робочому просторі.',
      tier: 'Рівень довіри',
      files: 'файлів',
      cta: 'Відкрийте клієнтський робочий простір для завантаження',
      note: 'Кожен архів містить лише Markdown. Перегляньте кожен файл перед використанням.',
    },
    packs: UK_PACKS,
    how: {
      eyebrow: 'Як це працює',
      title: 'Від читабельних файлів до контрольованого агента.',
      lede: 'Почніть із документів навичок. Додавайте керовану маршрутизацію лише тоді, коли вона підготовлена для вашого облікового запису.',
      steps: [
        { number: '01', title: 'Оберіть набір', body: 'Порівнюйте призначення, рівень довіри та кількість файлів публічно.' },
        { number: '02', title: 'Перегляньте файли', body: 'Увійдіть, завантажте архів лише у форматі Markdown та інспектуйте його.' },
        { number: '03', title: 'Запустіть на своєму сервері', body: 'Встановіть набір у власному однокористувацькому середовищі виконання агента.' },
        { number: '04', title: 'Додайте контрольовану маршрутизацію', body: 'Схвалені клієнти можуть підключити обмежений ключ шлюзу з бюджетним захистом.' },
      ],
      configTitle: 'Конфігурація постачальника',
      privateNote: 'Ключі шлюзу, використання та трасування залишаються в автентифікованому робочому просторі.',
      cta: 'Налаштування відкритого робочого простору',
    },
    trust: {
      eyebrow: 'Чітка межа',
      title: 'Показуйте продукт. Захищайте клієнта.',
      lede: 'Публічна сторінка пояснює набори та налаштування. Операційні дані залишаються за автентифікацією.',
      publicTitle: 'Публічний за дизайном',
      publicItems: ['Назви наборів і результати', 'Рівень довіри та кількість файлів', 'Посібник із встановлення та перегляду', 'Операційна модель шлюзу'],
      privateTitle: 'Приватний за замовчуванням',
      privateItems: ['Завантаження наборів навичок', 'Ключі API та облікові дані', 'Використання та очищені трасування', 'Контроль бюджету та відкликання'],
    },
    finalCta: {
      title: 'Почніть із файлів. Додавайте контроль, коли це потрібно.',
      lede: 'Досліджуйте каталог зараз. Увійдіть, коли будете готові завантажити набір або запросити керований доступ до шлюзу.',
      primary: 'Дослідити набори',
      secondary: 'Відкрити клієнтський робочий простір',
      note: 'Керований доступ до шлюзу надається для схвалених облікових записів.',
    },
    footerTagline: 'Навички агента, які можна інспектувати.',
  },
};

export function agentSkillsLocale(locale: string): AgentSkillsLocale {
  return locale === 'ru' ? 'ru' : locale === 'uk' ? 'uk' : 'en';
}
