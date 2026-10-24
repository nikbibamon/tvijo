// Declared policy for Tvijo agent profiles — v3.
// v1 was drafted with Devstral 2512 via DSHREM; v2 applied the independent
// Astra review. v3 applies the Opus 5.5 review: axes describe only the task, so
// model choice also needs a declared model profile; hard filters exclude, soft
// filters rank; conflicts follow a fixed precedence; claims climb a ladder.
// Model lines are advice recorded side by side, never votes and never evidence.

export const POLICY_ID = 'tvijo-policy-axes-v3';

export type Bi = { en: string; ru: string };

export const TITLE: Bi = {
  en: 'Axes that change requirements, and what stays fixed',
  ru: 'Оси, которые меняют требования, и то, что остаётся неизменным',
};

export const INTRO: Bi = {
  en: 'This page lists the axes that change requirements for content and platform work, the lifecycle dimensions that describe how an agent acts, and the invariants that do not change. Each axis names what varies and what we keep fixed; a profile declares the conditions under which a task runs.',
  ru: 'На этой странице перечислены оси, которые меняют требования к контенту и работе платформы, измерения жизненного цикла, описывающие поведение агента, и инварианты, которые не меняются. У каждой оси указано, что варьируется и что остаётся фиксированным; профиль объявляет условия, в которых выполняется задача.',
};

export type Revision = { id: string; label: Bi; note: Bi; state: 'shipped' | 'current' | 'planned' };

export const REVISIONS: Revision[] = [
  {
    id: 'v1',
    label: { en: 'v1 — first public policy', ru: 'v1 — первая публичная политика' },
    note: { en: '14 axes, 6 profile fields, 9 invariants, 7 checks.', ru: '14 осей, 6 полей профиля, 9 инвариантов, 7 проверок.' },
    state: 'shipped',
  },
  {
    id: 'v2',
    label: { en: 'v2 — Astra review applied', ru: 'v2 — применено ревью Astra' },
    note: {
      en: 'Nine lifecycle dimensions; age separated from AI-content labelling; profile fields for residency, jurisdictions, language, intermediary, organization and accessibility; data flags split; checks before egress; guarantee status.',
      ru: 'Девять измерений жизненного цикла; возраст отделён от маркировки ИИ-контента; поля резидентности, юрисдикций, языка, посредника, организации и доступности; признаки данных разделены; проверки до отправки; статус гарантий.',
    },
    state: 'shipped',
  },
  {
    id: 'v3',
    label: { en: 'v3 — Opus 5.5 review applied', ru: 'v3 — применено ревью Opus 5.5' },
    note: {
      en: 'Model profile as the other half of the filter, including content policy; hard vs soft filters; precedence and unknown values; claim ladder; filters by audience; NIST AI RMF gap map; model lines recorded side by side.',
      ru: 'Профиль модели как вторая половина фильтра, включая политику контента; жёсткие и мягкие фильтры; порядок старшинства и неизвестные значения; лестница утверждений; фильтры по аудиториям; карта пробелов по NIST AI RMF; линии моделей рядом.',
    },
    state: 'current',
  },
];

export type Axis = { id: string; title: Bi; changes: Bi; invariant: Bi };

export const AXES: Axis[] = [
  {
    id: 'political_regime',
    title: { en: 'Political regime', ru: 'Политический режим' },
    changes: {
      en: 'Censorship rules, content restrictions and electoral cycles change what may be published or must be labelled. Party politics by itself rarely changes a product requirement.',
      ru: 'Правила цензуры, ограничения контента и электоральные циклы меняют то, что можно публиковать и что нужно маркировать. Сама партийная принадлежность требование к продукту меняет редко.',
    },
    invariant: {
      en: 'No party, candidate or state ideology is promoted; every obligation is stated together with the jurisdiction that creates it.',
      ru: 'Ни одна партия, кандидат или государственная идеология не продвигается; каждое обязательство указывается вместе с юрисдикцией, которая его создаёт.',
    },
  },
  {
    id: 'religion_law',
    title: { en: 'Religion and religious law', ru: 'Религия и религиозное право' },
    changes: {
      en: 'Religious norms and religious law affect content, finance and calendar rules where they are part of the applicable legal order or of the client’s declared policy.',
      ru: 'Религиозные нормы и религиозное право влияют на контент, финансы и календарные правила там, где они входят в применимый правопорядок или в объявленную политику клиента.',
    },
    invariant: {
      en: 'Using the product does not require adherence to any religion; religious-law profiles are opt-in and declared by the client.',
      ru: 'Использование продукта не требует принадлежности к какой-либо религии; профили религиозного права включаются по выбору клиента и им объявляются.',
    },
  },
  {
    id: 'data_jurisdiction',
    title: { en: 'Data jurisdiction and residency', ru: 'Юрисдикция данных и резидентность' },
    changes: {
      en: 'Storage, processing and transfer rules depend on three different jurisdictions — operator, user and storage region — and they are not interchangeable.',
      ru: 'Правила хранения, обработки и передачи зависят от трёх разных юрисдикций — оператора, пользователя и региона хранения — и они не взаимозаменяемы.',
    },
    invariant: {
      en: 'Storage region is declared per profile; personal data is not moved outside it without an explicit decision.',
      ru: 'Регион хранения объявляется в профиле; персональные данные не вывозятся за его пределы без явного решения.',
    },
  },
  {
    id: 'sector_regulation',
    title: { en: 'Sector regulation', ru: 'Отраслевое регулирование' },
    changes: {
      en: 'Sector rules add obligations: health, legal, public sector and education carry their own evidence, retention and audit requirements.',
      ru: 'Отраслевые правила добавляют обязательства: здравоохранение, право, госсектор и образование несут собственные требования к доказательствам, хранению и аудиту.',
    },
    invariant: {
      en: 'Safety checks on generated code and commands stay the same in every sector; sector rules add requirements and never remove them.',
      ru: 'Проверки безопасности сгенерированного кода и команд одинаковы в любой отрасли; отраслевые правила добавляют требования и никогда их не снимают.',
    },
  },
  {
    id: 'financial_regulation',
    title: { en: 'Financial regulation and risk appetite', ru: 'Финансовое регулирование и риск-аппетит' },
    changes: {
      en: 'Payments, reporting, suitability and risk limits depend on the financial regime and on the client’s declared risk appetite.',
      ru: 'Платежи, отчётность, допустимость и лимиты риска зависят от финансового режима и объявленного риск-аппетита клиента.',
    },
    invariant: {
      en: 'Money is reserved before work and recorded in a receipt; no financial action bypasses the ledger.',
      ru: 'Деньги резервируются до начала работы и фиксируются в квитанции; ни одно финансовое действие не обходит леджер.',
    },
  },
  {
    id: 'sanctions_export',
    title: { en: 'Sanctions and export controls', ru: 'Санкции и экспортный контроль' },
    changes: {
      en: 'Access, distribution and end-use restrictions depend on sanctions and export-control regimes; they are not a matter of preference.',
      ru: 'Ограничения доступа, распространения и конечного использования зависят от санкционных режимов и экспортного контроля; это не вопрос предпочтений.',
    },
    invariant: {
      en: 'Sanctioned parties and prohibited end uses are refused; availability never overrides screening.',
      ru: 'Лица под санкциями и запрещённые конечные применения отклоняются; доступность никогда не отменяет проверку.',
    },
  },
  {
    id: 'licenses_ip',
    title: { en: 'Licenses and intellectual property', ru: 'Лицензии и интеллектуальная собственность' },
    changes: {
      en: 'What may be copied, modified or redistributed depends on the license of each dependency and on the client’s IP rules.',
      ru: 'Что можно копировать, изменять и распространять, зависит от лицензии каждой зависимости и от правил ИС клиента.',
    },
    invariant: {
      en: 'Every dependency license is checked against the declared allowlist; unclear licensing blocks the change.',
      ru: 'Лицензия каждой зависимости сверяется с заявленным allowlist; неясная лицензия блокирует изменение.',
    },
  },
  {
    id: 'commercial_model',
    title: { en: 'Commercial model', ru: 'Коммерческая модель' },
    changes: {
      en: 'Advertising, subscription, marketplace and open-core models create different duties to users and different disclosure requirements.',
      ru: 'Рекламная, подписочная, маркетплейсная и open-core модели создают разные обязанности перед пользователями и разные требования к раскрытию информации.',
    },
    invariant: {
      en: 'Prices and limits are published; there is no hidden charge and no silent auto-renewal.',
      ru: 'Цены и лимиты публикуются; скрытых списаний и тихого автопродления нет.',
    },
  },
  {
    id: 'environmental',
    title: { en: 'Environmental requirements', ru: 'Экологические требования' },
    changes: {
      en: 'Sustainability requirements and reporting duties depend on jurisdiction and on the client’s own commitments.',
      ru: 'Требования к устойчивости и отчётности зависят от юрисдикции и от собственных обязательств клиента.',
    },
    invariant: {
      en: 'Energy and routing claims are reported as measurements with a source, or not reported at all.',
      ru: 'Утверждения об энергии и маршрутизации публикуются как измерения с источником — либо не публикуются вовсе.',
    },
  },
  {
    id: 'public_good',
    title: { en: 'Public good and social expectations', ru: 'Общественное благо и социальные ожидания' },
    changes: {
      en: 'Expectations about open access, education and public benefit differ between communities and funders.',
      ru: 'Ожидания открытого доступа, образования и общественной пользы различаются у сообществ и фондов.',
    },
    invariant: {
      en: 'No harmful content or capability is enabled by a commercial, social or charitable argument.',
      ru: 'Никакой вредный контент или функциональность не включается ради коммерческого, социального или благотворительного аргумента.',
    },
  },
  {
    id: 'culture_language',
    title: { en: 'Culture and language', ru: 'Культура и язык' },
    changes: {
      en: 'Localization, formality, imagery and calendar depend on the audience and the language declared in the profile.',
      ru: 'Локализация, формальность, визуальные образы и календарь зависят от аудитории и языка, объявленного в профиле.',
    },
    invariant: {
      en: 'Translations are labelled; the original meaning is not silently changed.',
      ru: 'Переводы маркируются; исходный смысл не меняется молча.',
    },
  },
  {
    id: 'age_digital_literacy',
    title: { en: 'Age and digital literacy', ru: 'Возраст и цифровая грамотность' },
    changes: {
      en: 'The same capability needs different pacing, wording, supervision and examples for a 12-year-old, a 17-year-old, a student and a manager. Teachers and parents may need to approve the result.',
      ru: 'Одна и та же возможность требует разного темпа, формулировок, надзора и примеров для 12-летнего, 17-летнего, студента и менеджера. Учитель или родитель может утверждать результат.',
    },
    invariant: {
      en: 'No personal data is collected from minors; work produced with AI is disclosed; a human approves the result.',
      ru: 'Персональные данные несовершеннолетних не собираются; работа, сделанная с ИИ, раскрывается; результат утверждает человек.',
    },
  },
  {
    id: 'ai_content_labeling',
    title: { en: 'AI-content labelling and accessibility', ru: 'Маркировка ИИ-контента и доступность' },
    changes: {
      en: 'Rules for labelling generated content and for accessibility depend on the audience, the medium and the applicable law. Accessibility requirements must be stated explicitly, not assumed.',
      ru: 'Правила маркировки сгенерированного контента и доступности зависят от аудитории, носителя и применимого права. Требования доступности должны быть объявлены явно, а не подразумеваться.',
    },
    invariant: {
      en: 'Generated output is disclosed where required; accessibility is a requirement, not an optional flag.',
      ru: 'Сгенерированный результат раскрывается там, где требуется; доступность — требование, а не необязательный флаг.',
    },
  },
  {
    id: 'organization_type',
    title: { en: 'Organization type', ru: 'Тип организации' },
    changes: {
      en: 'For-profit, non-profit, cooperative and public bodies have different procurement, transparency and audit duties.',
      ru: 'Коммерческие, некоммерческие, кооперативные и государственные организации имеют разные обязанности по закупкам, прозрачности и аудиту.',
    },
    invariant: {
      en: 'The same evidence rules apply to every organization type.',
      ru: 'Одни и те же правила доказательств действуют для любого типа организации.',
    },
  },
  {
    id: 'platform_intermediaries',
    title: { en: 'Platform intermediaries', ru: 'Платформы-посредники' },
    changes: {
      en: 'App stores, payment providers, cloud providers and ad networks impose their own terms that can block a feature regardless of local law.',
      ru: 'Магазины приложений, платёжные системы, облака и рекламные сети вводят собственные условия, которые могут заблокировать функцию независимо от местного закона.',
    },
    invariant: {
      en: 'Intermediary terms are treated as hard constraints, not as advice.',
      ru: 'Условия посредников считаются жёсткими ограничениями, а не рекомендациями.',
    },
  },
];

export type Dimension = { id: string; title: Bi; question: Bi; example: Bi; check: Bi };

export const DIMENSIONS: Dimension[] = [
  {
    id: 'intent_outcome',
    title: { en: 'Intent and outcome', ru: 'Назначение и результат' },
    question: { en: 'What is the task, the accepted result and the excluded scenarios?', ru: 'Какая задача, какой результат считается принятым и что исключено?' },
    example: { en: 'Fix the failing test without editing the test.', ru: 'Починить падающий тест, не меняя тест.' },
    check: { en: 'Acceptance criterion written before the run; without it — NOT_RUN.', ru: 'Критерий приёмки записан до старта; без него — NOT_RUN.' },
  },
  {
    id: 'authority',
    title: { en: 'Authority and autonomy', ru: 'Полномочия и автономность' },
    question: { en: 'Read, prepare or execute; which tools; who approves; may it delegate?', ru: 'Читать, готовить или исполнять; какие инструменты; кто подтверждает; можно ли делегировать?' },
    example: { en: 'The agent prepares a diff; a human presses Apply.', ru: 'Агент готовит дифф; человек нажимает Apply.' },
    check: { en: 'A tool outside the allowlist is refused.', ru: 'Инструмент вне allowlist — отказ.' },
  },
  {
    id: 'impact',
    title: { en: 'Consequences of error', ru: 'Последствия ошибки' },
    question: { en: 'Severity, scope, reversibility, detectability, time to intervene?', ru: 'Тяжесть, масштаб, обратимость, обнаружимость, время на вмешательство?' },
    example: { en: 'A production edit is reversible; a money transfer is not.', ru: 'Правка в проде обратима; перевод денег — нет.' },
    check: { en: 'Irreversible actions require explicit confirmation.', ru: 'Необратимые действия требуют явного подтверждения.' },
  },
  {
    id: 'runtime',
    title: { en: 'Architecture and resources', ru: 'Архитектура и ресурсы' },
    question: { en: 'Cloud, on-premise or edge; CPU, memory, network, latency, availability?', ru: 'Облако, on-prem или edge; CPU, память, сеть, задержка, доступность?' },
    example: { en: 'A local model for autocomplete, a server model for refactoring.', ru: 'Локальная модель для автодополнения, серверная — для рефакторинга.' },
    check: { en: 'Latency and memory measured and stored with the profile.', ru: 'Задержка и память измерены и сохранены с профилем.' },
  },
  {
    id: 'data_quality',
    title: { en: 'Data and knowledge quality', ru: 'Данные и качество знаний' },
    question: { en: 'Origin, rights, freshness, quality, evidential support, uncertainty?', ru: 'Происхождение, права, актуальность, качество, доказательность, неопределённость?' },
    example: { en: 'An answer about the documentation of version X, not “in general”.', ru: 'Ответ по документации версии X, а не «вообще».' },
    check: { en: 'Every source carries a link and a date.', ru: 'У каждого источника есть ссылка и дата.' },
  },
  {
    id: 'lifecycle',
    title: { en: 'Operations and lifecycle', ru: 'Эксплуатация и жизненный цикл' },
    question: { en: 'Monitoring, incidents, rollback, model updates, migrations, retirement?', ru: 'Мониторинг, инциденты, откат, обновление моделей, миграции, вывод из эксплуатации?' },
    example: { en: 'A model change does not break stored tasks.', ru: 'Смена модели не ломает сохранённые задачи.' },
    check: { en: 'Rollback test and compatibility test pass.', ru: 'Тест отката и тест совместимости проходят.' },
  },
  {
    id: 'human_capacity',
    title: { en: 'Human capabilities', ru: 'Человеческие возможности' },
    question: { en: 'Age, digital literacy, cognitive load, interaction modes, accessibility?', ru: 'Возраст, цифровая грамотность, когнитивная нагрузка, способы взаимодействия, доступность?' },
    example: { en: 'A 7th grader gets short steps and an adult nearby.', ru: 'Семиклассник получает короткие шаги и взрослого рядом.' },
    check: { en: 'Readability and accessibility check recorded.', ru: 'Проверка понятности и доступности записана.' },
  },
  {
    id: 'accountability',
    title: { en: 'Accountability and conflicts', ru: 'Ответственность и конфликты' },
    question: { en: 'Who owns the decision, who approves, how are conflicts resolved, who revises the policy?', ru: 'Кто владелец решения, кто согласует, как разрешаются конфликты, кто пересматривает политику?' },
    example: { en: 'The risk owner decides “fast vs safe”.', ru: 'Спор «быстро или безопасно» решает владелец риска.' },
    check: { en: 'Every rule has an owner and a version.', ru: 'У каждого правила есть владелец и версия.' },
  },
  {
    id: 'economics',
    title: { en: 'Execution economics', ru: 'Экономика исполнения' },
    question: { en: 'Cost per accepted result, retry and concurrency limits, cost/quality/time trade-offs?', ru: 'Стоимость принятого результата, лимиты повторов и параллелизма, компромисс цена/качество/время?' },
    example: { en: 'An expensive model only for complex tasks.', ru: 'Дорогая модель только для сложных задач.' },
    check: { en: 'A receipt per attempt; unknown spend is not zero.', ru: 'Квитанция на каждую попытку; неизвестный расход — не ноль.' },
  },
];

export type ProfileField = { field: string; values: string[]; note?: Bi; why: Bi };

export const PROFILES: ProfileField[] = [
  {
    field: 'operator_jurisdiction',
    values: ['EU', 'US-CA', 'US-TX', 'UK', 'BR', 'IN', 'RU', 'CN', 'other'],
    note: { en: 'The list is extensible; “other” requires a named jurisdiction.', ru: 'Список расширяемый; «other» требует названной юрисдикции.' },
    why: { en: 'Selects the rules that bind the party operating the service.', ru: 'Выбирает правила, обязательные для стороны, которая эксплуатирует сервис.' },
  },
  {
    field: 'user_jurisdiction',
    values: ['EU', 'US-CA', 'US-TX', 'UK', 'BR', 'IN', 'RU', 'CN', 'other'],
    note: { en: 'Not merged with the operator: they can differ.', ru: 'Не объединяется с оператором: они могут различаться.' },
    why: { en: 'Selects consumer, privacy and content rules that bind the user.', ru: 'Выбирает потребительские, приватные и контентные нормы для пользователя.' },
  },
  {
    field: 'storage_region',
    values: ['same_as_operator', 'EU', 'US', 'UK', 'BR', 'IN', 'other'],
    why: { en: 'Declares where data is stored and processed.', ru: 'Объявляет, где хранятся и обрабатываются данные.' },
  },
  {
    field: 'sector',
    values: ['software', 'finance', 'health', 'education', 'public_sector', 'media'],
    why: { en: 'Adds sector obligations and evidence requirements.', ru: 'Добавляет отраслевые обязательства и требования к доказательствам.' },
  },
  {
    field: 'risk_profile',
    values: ['conservative', 'moderate', 'aggressive'],
    why: { en: 'Caps what the agent may do with money and markets.', ru: 'Ограничивает допустимые действия агента с деньгами и рынками.' },
  },
  {
    field: 'visibility',
    values: ['public', 'internal', 'confidential'],
    why: { en: 'Who may see the inputs and outputs.', ru: 'Кто может видеть входы и результаты.' },
  },
  {
    field: 'contains_personal_data',
    values: ['true', 'false'],
    why: { en: 'Separate flag: internal data can still be personal.', ru: 'Отдельный признак: внутренние данные тоже могут быть персональными.' },
  },
  {
    field: 'sensitivity',
    values: ['normal', 'sensitive', 'special_category'],
    why: { en: 'Separate flag: sensitivity is not the same as visibility.', ru: 'Отдельный признак: чувствительность не равна видимости.' },
  },
  {
    field: 'language',
    values: ['en', 'ru', 'uk', 'hi', 'other'],
    why: { en: 'Controls localization, formality and disclosure language.', ru: 'Управляет локализацией, формальностью и языком раскрытия.' },
  },
  {
    field: 'intermediary',
    values: ['none', 'app_store', 'payment_provider', 'cloud', 'ad_network'],
    why: { en: 'Names the platform whose terms can block a feature.', ru: 'Называет платформу, чьи условия могут заблокировать функцию.' },
  },
  {
    field: 'organization_type',
    values: ['for_profit', 'non_profit', 'cooperative', 'public_body'],
    why: { en: 'Procurement, transparency and audit duties differ.', ru: 'Обязанности по закупкам, прозрачности и аудиту различаются.' },
  },
  {
    field: 'accessibility_needs',
    values: ['none', 'vision', 'hearing', 'cognitive', 'motor'],
    why: { en: 'Turns “accessibility” from a slogan into a requirement.', ru: 'Превращает «доступность» из лозунга в требование.' },
  },
  {
    field: 'license_allow',
    values: ['MIT', 'Apache-2.0', 'BSD', 'proprietary-internal'],
    why: { en: 'Defines what may enter the codebase.', ru: 'Определяет, что может попасть в кодовую базу.' },
  },
  {
    field: 'prohibited_use',
    values: ['weapons', 'surveillance', 'sanctions_evasion', 'disinformation'],
    why: { en: 'Refused regardless of jurisdiction.', ru: 'Отклоняется независимо от юрисдикции.' },
  },
];

export type GuaranteeStatus = 'confirmed' | 'partial' | 'not_checked';

export type Invariant = { id: string; rule: Bi; check: Bi; status: GuaranteeStatus };

export const INVARIANTS: Invariant[] = [
  {
    id: 'sourced_claims',
    rule: { en: 'Factual claims carry a source. Versions, identifiers and our own measurements follow their own rules.', ru: 'Фактические утверждения имеют источник. Версии, идентификаторы и наши собственные измерения идут по отдельным правилам.' },
    check: { en: 'Claims without a source are flagged; version numbers and policy ids are excluded from the rule.', ru: 'Утверждения без источника помечаются; версии и идентификаторы политики из правила исключены.' },
    status: 'confirmed',
  },
  {
    id: 'safety',
    rule: { en: 'Destructive commands and writes outside the workspace are refused.', ru: 'Разрушительные команды и запись вне рабочей папки отклоняются.' },
    check: { en: 'Every command passes the blocklist; one match fails.', ru: 'Каждая команда проходит блок-лист; одно совпадение — отказ.' },
    status: 'confirmed',
  },
  {
    id: 'applicable_law',
    rule: { en: 'Each task declares operator and user jurisdiction whose rules apply.', ru: 'Каждая задача объявляет юрисдикции оператора и пользователя, чьи правила применяются.' },
    check: { en: 'Missing jurisdiction is NOT_RUN, never PASS.', ru: 'Отсутствие юрисдикции — NOT_RUN, никогда не PASS.' },
    status: 'partial',
  },
  {
    id: 'money_reservation',
    rule: { en: 'Budget is reserved before a task starts and recorded after it ends.', ru: 'Бюджет резервируется до старта задачи и фиксируется после завершения.' },
    check: { en: 'Every attempt has a reservation row and a receipt; a missing row fails.', ru: 'У каждой попытки есть резерв и квитанция; отсутствие строки — отказ.' },
    status: 'confirmed',
  },
  {
    id: 'personal_data',
    rule: { en: 'Personal data is not sent to a provider or written to logs, prompts or published pages.', ru: 'Персональные данные не отправляются провайдеру и не попадают в логи, промпты и опубликованные страницы.' },
    check: { en: 'PII check runs before egress to the provider and before tool execution, plus a scan of diffs and output.', ru: 'Проверка PII выполняется до отправки провайдеру и до исполнения инструмента, плюс скан диффов и вывода.' },
    status: 'partial',
  },
  {
    id: 'non_discrimination',
    rule: { en: 'Protected attributes are not used to rank, price or refuse service.', ru: 'Защищённые признаки не используются для ранжирования, цены или отказа в обслуживании.' },
    check: { en: 'Search profiles and policies for protected-attribute fields.', ru: 'Поиск защищённых признаков в профилях и политиках.' },
    status: 'partial',
  },
  {
    id: 'prohibited_use',
    rule: { en: 'Weapons, surveillance, sanctions evasion and disinformation are refused.', ru: 'Оружие, слежка, обход санкций и дезинформация отклоняются.' },
    check: { en: 'Use case checked against the declared prohibited set.', ru: 'Сценарий сверяется с объявленным списком запрещённого.' },
    status: 'partial',
  },
  {
    id: 'disclosure_limits',
    rule: { en: 'Every page states what the product does not do and where the law overrides this policy.', ru: 'Каждая страница указывает, чего продукт не делает и где закон выше этой политики.' },
    check: { en: 'Required disclosure block present on the page.', ru: 'Обязательный блок раскрытия присутствует на странице.' },
    status: 'confirmed',
  },
  {
    id: 'no_silent_fallback',
    rule: { en: 'If a model or route is unavailable, the task fails with a code; it is not silently replaced.', ru: 'Если модель или маршрут недоступны, задача падает с кодом, а не подменяется молча.' },
    check: { en: 'Unknown route returns an error code, not another model’s answer.', ru: 'Неизвестный маршрут возвращает код ошибки, а не ответ другой модели.' },
    status: 'confirmed',
  },
];

export type Test = { id: string; pass: Bi; fail: Bi; notProve: Bi };

export const TESTS: Test[] = [
  { id: 'pii_before_egress', pass: { en: 'No PII leaves before the provider call or tool execution.', ru: 'Никакие PII не уходят до вызова провайдера или исполнения инструмента.' }, fail: { en: 'A PII pattern is found in the outgoing request.', ru: 'PII-паттерн найден в исходящем запросе.' }, notProve: { en: 'That the provider does not retain data under its own policy.', ru: 'Что провайдер не хранит данные по своей политике.' } },
  { id: 'pii_scan', pass: { en: 'No PII patterns in diff or output.', ru: 'В диффе и выводе нет PII-паттернов.' }, fail: { en: 'At least one pattern matches.', ru: 'Совпал хотя бы один паттерн.' }, notProve: { en: 'That no personal data reached the provider.', ru: 'Что персональные данные не дошли до провайдера.' } },
  { id: 'license_allowlist', pass: { en: 'Every new dependency is on the allowlist.', ru: 'Каждая новая зависимость есть в allowlist.' }, fail: { en: 'An unknown or unclear license is present.', ru: 'Есть неизвестная или неясная лицензия.' }, notProve: { en: 'That the license fits the client’s business model.', ru: 'Что лицензия подходит бизнес-модели клиента.' } },
  { id: 'sanctions_screen', pass: { en: 'Customer and use case are not on the list.', ru: 'Клиент и сценарий отсутствуют в списке.' }, fail: { en: 'A match is found.', ru: 'Найдено совпадение.' }, notProve: { en: 'That the end use is lawful in every jurisdiction.', ru: 'Что конечное использование законно в каждой юрисдикции.' } },
  { id: 'path_allowlist', pass: { en: 'Every edit is inside declared paths.', ru: 'Каждая правка внутри объявленных путей.' }, fail: { en: 'An edit touches any other path.', ru: 'Правка затрагивает любой другой путь.' }, notProve: { en: 'That the edit is correct.', ru: 'Что правка корректна.' } },
  { id: 'secret_scan', pass: { en: 'No key-like strings in diff or output.', ru: 'В диффе и выводе нет строк, похожих на ключи.' }, fail: { en: 'A candidate secret is found.', ru: 'Найден кандидат в секреты.' }, notProve: { en: 'That no secret was sent to a model.', ru: 'Что секрет не был отправлен модели.' } },
  { id: 'policy_present', pass: { en: 'Policy id, revision and disclosure are visible.', ru: 'Идентификатор политики, ревизия и раскрытие видны.' }, fail: { en: 'Any of them is missing.', ru: 'Чего-то из них нет.' }, notProve: { en: 'That the policy is followed.', ru: 'Что политика соблюдается.' } },
  { id: 'sourced_claims', pass: { en: 'Every factual claim has a link; versions and ids are exempt.', ru: 'У каждого факта есть ссылка; версии и идентификаторы исключены.' }, fail: { en: 'A factual claim without a source is present.', ru: 'Есть факт без источника.' }, notProve: { en: 'That the source is correct.', ru: 'Что источник верен.' } },
];

export type Risk = { id: string; risk: Bi; signal: Bi };

export const RISKS: Risk[] = [
  { id: 'ideological_capture', risk: { en: 'One worldview becomes the default for every client.', ru: 'Одно мировоззрение становится умолчанием для всех клиентов.' }, signal: { en: 'A profile field named party or religion appears, or one profile becomes the default for all.', ru: 'Появляется поле party или religion, либо один профиль становится умолчанием для всех.' } },
  { id: 'echo_chambers', risk: { en: 'Users see only confirming material.', ru: 'Пользователи видят только подтверждающие материалы.' }, signal: { en: 'The share of a single source in answers rises for several weeks.', ru: 'Доля одного источника в ответах растёт несколько недель.' } },
  { id: 'regulatory_complaints', risk: { en: 'Complaints about censorship and about discrimination arrive at the same time.', ru: 'Жалобы на цензуру и на дискриминацию приходят одновременно.' }, signal: { en: 'Two complaints from opposite sides within one month.', ru: 'Две жалобы с противоположных сторон в течение месяца.' } },
  { id: 'fragmentation', risk: { en: 'Every client gets a private variant.', ru: 'Каждый клиент получает приватный вариант.' }, signal: { en: 'Profiles grow faster than paying clients.', ru: 'Профили растут быстрее числа платящих клиентов.' } },
  { id: 'reputation', risk: { en: 'The product is described by a group, not by a function.', ru: 'Продукт описывают через группу, а не через функцию.' }, signal: { en: 'External mentions lead with an audience label instead of the task.', ru: 'Внешние упоминания начинаются с ярлыка аудитории, а не с задачи.' } },
];

export const NOT_DO: Bi[] = [
  { en: 'No party or religion packs.', ru: 'Никаких партийных или религиозных пакетов.' },
  { en: 'No hidden value choice behind the word neutral.', ru: 'Никакого скрытого ценностного выбора за словом «нейтрально».' },
  { en: 'No free-text list of forbidden topics: only a versioned policy id.', ru: 'Никакого свободного списка запрещённых тем: только версионированный идентификатор политики.' },
  { en: 'No word-list test as proof of neutrality.', ru: 'Никакого теста по списку слов как доказательства нейтральности.' },
  { en: 'No compliance claim that is not backed by a declared check.', ru: 'Никакого заявления о соответствии без объявленной проверки.' },
];

export const DISCLOSURE: Bi = {
  en: 'This is a declared policy for Tvijo agent profiles, not legal advice. The applicable law depends on the jurisdictions named in the profile and can override any statement here. Revision v2 applied the independent Astra review; revision v3 applies the Opus 5.5 review. Model lines are quoted advice from the named models, not votes and not evidence; where a line was not asked a question, it says so. Numbers without a source are not published.',
  ru: 'Это заявленная политика профилей агентов Tvijo, а не юридическая консультация. Применимое право зависит от юрисдикций, указанных в профиле, и может отменять любое утверждение здесь. Ревизия v2 учла независимое ревью Astra; ревизия v3 учитывает ревью Opus 5.5. Линии моделей — пересказ советов названных моделей, а не голоса и не доказательства; если линии вопрос не задавали, так и написано. Числа без источника не публикуются.',
};

// ---- v3 (Opus 5.5 review) ----

export type ModelField = { field: string; values: string[]; why: Bi };

// The axes above describe the task. A model is only choosable when its
// provider route declares the same facts; matching is task profile × model
// profile, and every exclusion carries a reason code.
export const MODEL_PROFILE: ModelField[] = [
  {
    field: 'provider_jurisdiction',
    values: ['EU', 'US', 'UK', 'CN', 'other'],
    why: { en: 'Matched against sanctions, export control and the user’s data jurisdiction.', ru: 'Сверяется с санкциями, экспортным контролем и юрисдикцией данных пользователя.' },
  },
  {
    field: 'hosting_region',
    values: ['EU', 'US', 'UK', 'other', 'unknown'],
    why: { en: 'Matched against storage_region; unknown is treated as not matching.', ru: 'Сверяется со storage_region; unknown считается несовпадением.' },
  },
  {
    field: 'retention_and_training',
    values: ['no_retention', 'retention_declared', 'trains_on_inputs', 'unknown'],
    why: { en: 'Decides whether personal or confidential input may reach this route at all.', ru: 'Решает, может ли персональный или конфиденциальный вход вообще попасть на этот маршрут.' },
  },
  {
    field: 'license_terms',
    values: ['open_weights', 'proprietary_api', 'output_restricted'],
    why: { en: 'Matched against licenses_ip and the client’s distribution model.', ru: 'Сверяется с licenses_ip и моделью распространения клиента.' },
  },
  {
    field: 'fallback_policy',
    values: ['none', 'declared_same_model', 'declared_other_model'],
    why: { en: 'A route that may swap the model is shown as such before the task starts.', ru: 'Маршрут, который может подменить модель, показывается таким до старта задачи.' },
  },
  {
    field: 'measured_on',
    values: ['task_class + receipts', 'not_measured'],
    why: { en: 'Quality is a claim per task class with receipts, not a general ranking.', ru: 'Качество — утверждение по классу задач с квитанциями, а не общий рейтинг.' },
  },
  {
    field: 'price_basis',
    values: ['per_accepted_result', 'per_token_only'],
    why: { en: 'Cheaper failures must not look like savings; cost is compared per accepted result.', ru: 'Дешёвые провалы не должны выглядеть экономией; стоимость сравнивается на принятый результат.' },
  },
  {
    field: 'content_policy',
    values: ['strict', 'standard', 'permissive'],
    why: {
      en: 'A permissive (low-refusal) route is for fiction and ideation only: adult account, explicit opt-in, labelled output, no tools and no actions. Prohibited uses stay refused on every route.',
      ru: 'Разрешающий маршрут (с редкими отказами) — только для вымысла и идей: взрослый аккаунт, явное включение, маркировка результата, без инструментов и действий. Запрещённое отклоняется на любом маршруте.',
    },
  },
];

export type FilterKind = 'hard' | 'soft';

export const FILTER_KINDS: { kind: FilterKind; title: Bi; rule: Bi; axes: string[] }[] = [
  {
    kind: 'hard',
    title: { en: 'Hard filters — exclude a model', ru: 'Жёсткие фильтры — исключают модель' },
    rule: {
      en: 'One mismatch removes the route, with a reason code shown to the user. No preference, price or vote can bring it back.',
      ru: 'Одно несовпадение убирает маршрут с кодом причины, видимым пользователю. Никакое предпочтение, цена или голосование его не возвращают.',
    },
    axes: ['sanctions_export', 'data_jurisdiction', 'licenses_ip', 'sector_regulation', 'financial_regulation', 'age_digital_literacy', 'platform_intermediaries'],
  },
  {
    kind: 'soft',
    title: { en: 'Soft filters — rank what is left', ru: 'Мягкие фильтры — ранжируют оставшееся' },
    rule: {
      en: 'They order the remaining routes. A soft filter never overrides a hard one and never hides why a route ranks lower.',
      ru: 'Они упорядочивают оставшиеся маршруты. Мягкий фильтр никогда не перекрывает жёсткий и не скрывает, почему маршрут ниже.',
    },
    axes: ['culture_language', 'commercial_model', 'environmental', 'organization_type', 'ai_content_labeling', 'public_good'],
  },
];

export const PRECEDENCE: Bi[] = [
  { en: 'Law, sanctions and export control.', ru: 'Закон, санкции и экспортный контроль.' },
  { en: 'Safety invariants of this page.', ru: 'Инварианты безопасности этой страницы.' },
  { en: 'Sector rules.', ru: 'Отраслевые правила.' },
  { en: 'Organization policy of the client.', ru: 'Политика организации клиента.' },
  { en: 'User preference.', ru: 'Предпочтение пользователя.' },
  { en: 'Price and speed.', ru: 'Цена и скорость.' },
];

export const UNKNOWN_RULE: Bi = {
  en: 'An unknown value is treated as the most restrictive value of that field, never as a default. An unknown jurisdiction blocks egress of personal data; an unknown retention policy blocks confidential input. Every hard-filter value carries a source date and a review date; an expired value counts as unknown. If hard filters leave no candidate, a person decides; the safe default is no model.',
  ru: 'Неизвестное значение считается самым строгим значением поля, а не умолчанием. Неизвестная юрисдикция блокирует вывоз персональных данных; неизвестная политика хранения блокирует конфиденциальный вход. У каждого значения жёсткого фильтра есть дата источника и дата пересмотра; просроченное значение считается неизвестным. Если жёсткие фильтры не оставили кандидатов, решает человек; безопасное умолчание — никакой модели.',
};

export type ClaimStep = { id: string; title: Bi; meaning: Bi };

export const CLAIM_LADDER: ClaimStep[] = [
  { id: 'hypothesis', title: { en: '1. Hypothesis', ru: '1. Гипотеза' }, meaning: { en: 'Stated before any measurement; may be shown only as an idea.', ru: 'Сформулирована до измерений; показывается только как идея.' } },
  { id: 'internal', title: { en: '2. Internal measurement', ru: '2. Внутренний замер' }, meaning: { en: 'Thresholds were written down before the run; the run is isolated and every attempt has a receipt.', ru: 'Пороги записаны до прогона; прогон изолирован, у каждой попытки есть квитанция.' } },
  { id: 'independent', title: { en: '3. Independent verification', ru: '3. Независимая проверка' }, meaning: { en: 'A separate judge re-checks the receipts and the isolation and accepts or rejects the run.', ru: 'Отдельный судья перепроверяет квитанции и изоляцию и принимает или отклоняет прогон.' } },
  { id: 'public', title: { en: '4. Public claim', ru: '4. Публичное утверждение' }, meaning: { en: 'Only now, scoped to the measured task class, with failures published next to successes.', ru: 'Только теперь — в пределах измеренного класса задач, с провалами рядом с успехами.' } },
];

export const CLAIM_STATUS_NOW: Bi = {
  en: 'Rule-pack savings are at step 1. Two benchmark runs exist; neither was accepted by the independent judge. Rule packs remain a convenience preset; we make no claims about savings.',
  ru: 'Экономия от наборов правил — на ступени 1. Есть два прогона сравнения; ни один не принят независимым судьёй. Наборы правил остаются удобным пресетом; никаких утверждений об экономии.',
};

export type Audience = { id: string; title: Bi; hard: Bi; soft: Bi; never: Bi };

export const AUDIENCES: Audience[] = [
  {
    id: 'student',
    title: { en: 'Student', ru: 'Ученик / студент' },
    hard: { en: 'Age and digital literacy; personal data never leaves; no paid route without an adult or teacher.', ru: 'Возраст и цифровая грамотность; персональные данные не уходят; платный маршрут — только со взрослым или учителем.' },
    soft: { en: 'Explanation quality in the student’s language.', ru: 'Качество объяснения на языке ученика.' },
    never: { en: 'Auto-apply changes or submit work as the student’s own.', ru: 'Автоприменение правок или сдача работы как своей.' },
  },
  {
    id: 'solo_dev',
    title: { en: 'Solo developer', ru: 'Разработчик-одиночка' },
    hard: { en: 'Licenses and secret egress.', ru: 'Лицензии и вывоз секретов.' },
    soft: { en: 'Cost per accepted result, then speed; escalation to a stronger model only with a reason code.', ru: 'Стоимость принятого результата, затем скорость; переход на сильную модель — только с кодом причины.' },
    never: { en: 'A silent switch to another model.', ru: 'Молчаливая подмена модели.' },
  },
  {
    id: 'team_dev',
    title: { en: 'Team or enterprise developer', ru: 'Разработчик в команде / компании' },
    hard: { en: 'Data jurisdiction, storage region, provider retention, sector rules and organization policy.', ru: 'Юрисдикция данных, регион хранения, хранение у провайдера, отраслевые правила и политика организации.' },
    soft: { en: 'Measured quality on the team’s own task classes.', ru: 'Измеренное качество на собственных классах задач команды.' },
    never: { en: 'An unpinned model or a fallback that was not declared.', ru: 'Незакреплённая модель или необъявленный запасной маршрут.' },
  },
  {
    id: 'decision_maker',
    title: { en: 'Decision-maker (manager, investor)', ru: 'Тот, кто решает (менеджер, инвестор)' },
    hard: { en: 'Lines from at least two independent vendors, with receipts and stated disagreements.', ru: 'Линии минимум двух независимых вендоров, с квитанциями и названными разногласиями.' },
    soft: { en: 'Brevity: options, the safe default and what each option costs.', ru: 'Краткость: варианты, безопасное умолчание и цена каждого варианта.' },
    never: { en: 'A model deciding on money, public claims or priority.', ru: 'Модель, которая сама решает про деньги, публичные заявления или приоритет.' },
  },
  {
    id: 'creative',
    title: { en: 'Fiction and worldbuilding (for example, a starship for Centavra)', ru: 'Вымысел и миростроение (например, звездолёт для Centavra)' },
    hard: { en: 'Adult account and explicit opt-in for a permissive route; prohibited uses refused on every route; no tools, deploys or money.', ru: 'Взрослый аккаунт и явное включение разрешающего маршрута; запрещённое отклоняется на любом маршруте; без инструментов, выкаток и денег.' },
    soft: { en: 'Range of imagination; a strict and a permissive line may be shown side by side for people to compare.', ru: 'Широта воображения; строгую и разрешающую линии можно показать рядом, чтобы сравнили люди.' },
    never: { en: 'Moving permissive output into code, actions or published facts without a strict-route review and a person’s decision.', ru: 'Перенос результата разрешающего маршрута в код, действия или опубликованные факты без проверки строгим маршрутом и решения человека.' },
  },
];

export type NistRow = { fn: string; have: Bi; gap: Bi };

// Self-assessment against the four NIST AI RMF 1.0 functions. Every row is
// "partially covered": the gap column is what v3 does not yet have.
export const NIST_MAP: NistRow[] = [
  {
    fn: 'GOVERN',
    have: { en: 'Declared policy with revisions, invariants, a person deciding on money and public claims.', ru: 'Объявленная политика с ревизиями, инварианты, человек решает про деньги и публичные заявления.' },
    gap: { en: 'A register of AI systems and model versions; a decommissioning procedure.', ru: 'Реестр ИИ-систем и версий моделей; процедура вывода из эксплуатации.' },
  },
  {
    fn: 'MAP',
    have: { en: 'Axes, lifecycle dimensions, profile fields, filters by audience.', ru: 'Оси, измерения жизненного цикла, поля профиля, фильтры по аудиториям.' },
    gap: { en: 'An impact assessment per task class; a register of third parties (providers, libraries, data).', ru: 'Оценка воздействия по классам задач; реестр третьих сторон (провайдеры, библиотеки, данные).' },
  },
  {
    fn: 'MEASURE',
    have: { en: 'Deterministic checks, a receipt per attempt, an independent judge.', ru: 'Детерминированные проверки, квитанция на каждую попытку, независимый судья.' },
    gap: { en: 'Drift detection when a provider updates a model; checks that the metrics themselves work.', ru: 'Обнаружение дрейфа при обновлении модели провайдером; проверка, что сами метрики работают.' },
  },
  {
    fn: 'MANAGE',
    have: { en: 'Fail-closed budgets, no silent fallback, stop conditions, “does not prove” stated per check.', ru: 'Бюджеты fail-closed, без молчаливой подмены, стоп-условия, «чего не доказывает» у каждой проверки.' },
    gap: { en: 'An incident register and rehearsed rollback.', ru: 'Реестр инцидентов и отрепетированный откат.' },
  },
];

export const STOP_RULE: Bi = {
  en: 'Risk is judged per action, not per tool: the same command is harmless in a sandbox and critical in production. If a risk is unacceptable — money that cannot be returned, harm to people, an irreversible action — the work stops; it is not “reduced to acceptable”.',
  ru: 'Риск оценивается по действию, а не по инструменту: одна и та же команда безобидна в песочнице и критична на проде. Если риск неприемлем — деньги, которые не вернуть, вред людям, необратимое действие, — работа останавливается, а не «снижается до приемлемого».',
};

// ---- Model lines ----

export type Verdict = 'agree' | 'amend' | 'disagree' | 'not_asked';

export type DecisionId = 'a' | 'b' | 'c' | 'd';

export const LINE_QUESTION: Bi = {
  en: 'The question: should we keep paying to prove that rule packs save money, and what must a person decide? Rule packs already run; their savings are not proven; the first comparison run was contaminated, and the second stopped on a detector for “the agent may have read the fix” and was rejected by the independent judge.',
  ru: 'Вопрос: стоит ли дальше платить за доказательство, что наборы правил экономят деньги, и что должен решить человек? Наборы уже работают; экономия не доказана; первый прогон сравнения загрязнён, второй остановился на детекторе «агент мог подсмотреть исправление» и отклонён независимым судьёй.',
};

export const DECISIONS: { id: DecisionId; label: Bi; safeDefault: Bi }[] = [
  {
    id: 'a',
    label: { en: 'Pay for a clean comparison run', ru: 'Платить за чистый прогон сравнения' },
    safeDefault: { en: 'Only after isolation; one capped run.', ru: 'Только после изоляции; один прогон с потолком.' },
  },
  {
    id: 'b',
    label: { en: 'Claim savings in public', ru: 'Заявлять экономию публично' },
    safeDefault: { en: 'No, until the pre-set thresholds pass and receipts are independently checked.', ru: 'Нет, пока не пройдены заранее заданные пороги и квитанции не проверены независимо.' },
  },
  {
    id: 'c',
    label: { en: 'Isolation before UI work', ru: 'Изоляция раньше работы над UI' },
    safeDefault: { en: 'Isolation first (no model calls); UI may run in parallel.', ru: 'Сначала изоляция (без вызовов моделей); UI можно параллельно.' },
  },
  {
    id: 'd',
    label: { en: 'Apply packs to our own agent rules', ru: 'Применять наборы к нашим правилам агентов' },
    safeDefault: { en: 'Only after the method is proven; the safety core is never shortened.', ru: 'Только после того, как методика доказана; ядро безопасности не сокращается никогда.' },
  },
];

export type ModelLine = {
  id: string;
  model: string;
  route: Bi;
  role: Bi;
  receipt: Bi;
  summary: Bi;
  verdicts: Record<DecisionId, Verdict>;
  points: Bi[];
  disagrees: Bi;
};

export const LINES: ModelLine[] = [
  {
    id: 'deepseek_v41_flash',
    model: 'DeepSeek V4.1 Flash',
    route: { en: 'Tvijo terminal', ru: 'терминал Tvijo' },
    role: { en: 'Answered the operator: does a person need to fill in a questionnaire to decide?', ru: 'Ответил оператору: нужно ли человеку заполнять анкету, чтобы решить?' },
    receipt: { en: '2026-10-21 · answer took 43 s · receipt not attached to this page', ru: '2026-10-21 · ответ за 43 с · квитанция к странице не приложена' },
    summary: {
      en: 'No questionnaire. Only three decisions belong to a person — money, publicity and priority — and each has a safe default. Isolation and a deterministic leak check come first; they need no model calls.',
      ru: 'Анкеты не будет. Человеку принадлежат только три решения — деньги, публичность и приоритет, — и у каждого есть безопасное умолчание. Сначала изоляция и детерминированная проверка утечки; вызовов моделей они не требуют.',
    },
    verdicts: { a: 'agree', b: 'agree', c: 'agree', d: 'agree' },
    points: [
      { en: 'Replace the heuristic “peeked” detector with a byte check: the fix must be absent from the snapshot.', ru: 'Заменить эвристический детектор «подсмотрел» проверкой байтов: исправления не должно быть в снимке.' },
      { en: 'Snapshot from an archive into a fresh repository without remotes or history; offline network; result written into the receipt.', ru: 'Снимок из архива в новый репозиторий без remotes и истории; офлайн-сеть; результат пишется в квитанцию.' },
      { en: 'Calibrate the detector on a clean and a planted snapshot: PASS on the first, FAIL on the second.', ru: 'Откалибровать детектор на чистом и подложенном снимке: PASS на первом, FAIL на втором.' },
      { en: 'Fail the thresholds → packs stay UX presets and the initiative is culled with an autopsy.', ru: 'Не прошли пороги → наборы остаются UX-пресетами, инициатива отбраковывается с разбором.' },
    ],
    disagrees: { en: 'None stated; it set the defaults the other lines answer.', ru: 'Не указано; задал умолчания, на которые отвечают остальные линии.' },
  },
  {
    id: 'devstral_2512',
    model: 'Devstral 2512',
    route: { en: 'DSHREM, read-only', ru: 'DSHREM, только чтение' },
    role: { en: 'Drafted policy v1: axes, profile fields, invariants.', ru: 'Написал черновик политики v1: оси, поля профиля, инварианты.' },
    receipt: { en: '2026-10-21 · three metered calls, USD 0.029 in total', ru: '2026-10-21 · три измеренных вызова, всего USD 0.029' },
    summary: {
      en: 'No political packs. Jurisdiction, sector, risk appetite, licenses and privacy change requirements far more than party politics.',
      ru: 'Никаких политических пакетов. Юрисдикция, отрасль, риск-аппетит, лицензии и приватность меняют требования гораздо сильнее, чем партии.',
    },
    verdicts: { a: 'not_asked', b: 'not_asked', c: 'not_asked', d: 'not_asked' },
    points: [
      { en: 'Neutral tool plus sector profiles; no custom value variant per client.', ru: 'Нейтральный инструмент плюс отраслевые профили; никаких ценностных вариантов под клиента.' },
      { en: 'Named the segmentation risks: echo chambers, capture, complaints, fragmentation.', ru: 'Назвал риски сегментации: эхо-камеры, захват, жалобы, фрагментация.' },
    ],
    disagrees: { en: 'Not asked about rule packs.', ru: 'Про наборы правил не спрашивали.' },
  },
  {
    id: 'astra_6_ultra',
    model: 'Astra 6 Ultra',
    route: { en: 'independent judge, read-only', ru: 'независимый судья, только чтение' },
    role: { en: 'Reviewed v1 into v2; judged the second comparison run.', ru: 'Отрецензировал v1 в v2; судил второй прогон сравнения.' },
    receipt: { en: '2026-10-21 · subscription session, no API spend', ru: '2026-10-21 · подписочная сессия, без расхода API' },
    summary: {
      en: 'The same axis values fit an agent that proposes a change and one that ships it, but authority and impact differ — hence nine lifecycle dimensions. The second run is rejected: the detector hit does not prove the fix was read, and the trace cannot prove it was not.',
      ru: 'Одни и те же значения осей подходят агенту, который предлагает правку, и агенту, который её выкатывает, но полномочия и последствия различаются — отсюда девять измерений. Второй прогон отклонён: срабатывание детектора не доказывает чтение фикса, а трасса не доказывает, что его не читали.',
    },
    verdicts: { a: 'not_asked', b: 'not_asked', c: 'not_asked', d: 'not_asked' },
    points: [
      { en: 'Split age from AI-content labelling; split visibility, personal data and sensitivity.', ru: 'Отделил возраст от маркировки ИИ-контента; разделил видимость, персональные данные и чувствительность.' },
      { en: 'Unverified outcomes stay unverified: continuing the rejected run is forbidden.', ru: 'Непроверенный исход остаётся непроверенным: продолжать отклонённый прогон запрещено.' },
    ],
    disagrees: { en: 'Its verdict is why the defaults exist; it was not asked to vote on them.', ru: 'Его вердикт — причина умолчаний; голосовать за них его не просили.' },
  },
  {
    id: 'opus_55',
    model: 'Opus 5.5',
    route: { en: 'Claude Code, author of v3', ru: 'Claude Code, автор v3' },
    role: { en: 'Reviewed v2 into v3 and answered the rule-pack question.', ru: 'Отрецензировал v2 в v3 и ответил на вопрос о наборах правил.' },
    receipt: { en: '2026-10-21 · subscription session, no API spend', ru: '2026-10-21 · подписочная сессия, без расхода API' },
    summary: {
      en: 'The blocking gap is method, not a human choice. Axes describe only the task; model choice needs a declared model profile, hard filters that exclude, soft filters that rank, and a fixed precedence. Savings are compared per accepted result.',
      ru: 'Блокирует методика, а не выбор человека. Оси описывают только задачу; для выбора модели нужен объявленный профиль модели, жёсткие фильтры, которые исключают, мягкие, которые ранжируют, и фиксированный порядок старшинства. Экономия сравнивается на принятый результат.',
    },
    verdicts: { a: 'amend', b: 'amend', c: 'agree', d: 'amend' },
    points: [
      { en: 'Money for a run: only after the detector is calibrated and the cap covers the whole task matrix — a partial run proves nothing.', ru: 'Деньги на прогон: только после калибровки детектора и если потолок покрывает всю матрицу задач — частичный прогон ничего не доказывает.' },
      { en: 'Public claim: measure cost per accepted result, require two isolated runs, publish failures next to successes.', ru: 'Публичное заявление: считать стоимость принятого результата, требовать два изолированных прогона, публиковать провалы рядом с успехами.' },
      { en: 'Own agent rules: the safety core is an enumerated list guarded by a test, so “never shortened” is checkable.', ru: 'Наши правила агентов: ядро безопасности — перечисленный список под тестом, чтобы «не сокращается» было проверяемо.' },
      { en: 'When every line agrees, look for a shared blind spot before acting: agreement is advice, not evidence.', ru: 'Если все линии согласны, сначала поискать общий слепой участок: согласие — совет, а не доказательство.' },
    ],
    disagrees: {
      en: 'DeepSeek: “85% of cost” is undefined — per task, a pack that quits early looks cheaper while failing more; count per accepted result. GLM: political regime and religious law become hard only through a named legal obligation, never as a ranking of people; and a culled entry is kept with its autopsy, not deleted.',
      ru: 'DeepSeek: «85% стоимости» не определено — на задачу набор, который рано сдаётся, выглядит дешевле, хотя проваливает больше; считать на принятый результат. GLM: политический режим и религиозное право становятся жёсткими только через названное правовое обязательство, а не как ранжирование людей; отбракованная запись остаётся с разбором, а не удаляется.',
    },
  },
  {
    id: 'glm_53_flash',
    model: 'GLM 5.3 Flash',
    route: { en: 'DSHREM, read-only', ru: 'DSHREM, только чтение' },
    role: { en: 'Answered the rule-pack question and the model-choice question.', ru: 'Ответил на вопрос о наборах правил и о выборе модели.' },
    receipt: { en: '2026-10-21 · one metered task, USD 0.0022, 10,679 tokens', ru: '2026-10-21 · одна измеренная задача, USD 0.0022, 10 679 токенов' },
    summary: {
      en: 'Agrees with DeepSeek on isolation, the public-claim thresholds and parallel UI. Jurisdiction and financial and data regulation are hard filters; the nine lifecycle dimensions should rank, not gate.',
      ru: 'Согласен с DeepSeek про изоляцию, пороги публичного заявления и параллельный UI. Юрисдикция, финансовое регулирование и регулирование данных — жёсткие фильтры; девять измерений жизненного цикла должны ранжировать, а не блокировать.',
    },
    verdicts: { a: 'agree', b: 'agree', c: 'agree', d: 'amend' },
    points: [
      { en: 'Hard filters it lists: political regime, religious law, sanctions, data jurisdiction, financial and sector regulation, licenses.', ru: 'Его жёсткие фильтры: политический режим, религиозное право, санкции, юрисдикция данных, финансовое и отраслевое регулирование, лицензии.' },
      { en: 'Missing axis: reproducibility — two runs of the same pack must state whether the result is stable.', ru: 'Не хватает оси воспроизводимости: два запуска одного набора должны показывать, стабилен ли результат.' },
      { en: 'Missing invariant: provenance — which model produced each line of evidence must be recorded.', ru: 'Не хватает инварианта происхождения: какая модель дала каждую строку доказательства, должно записываться.' },
      { en: 'People decide money caps, what counts as verified savings, closing an initiative and changes to the axis policy; models only propose.', ru: 'Люди решают потолки денег, что считается подтверждённой экономией, закрытие инициативы и изменения политики осей; модели только предлагают.' },
    ],
    disagrees: {
      en: 'DeepSeek on the fate: a failed run should not remove the pack — keep it labelled “preset, not savings” with a dated public autopsy.',
      ru: 'DeepSeek по судьбе: провал прогона не должен убирать набор — оставить его с пометкой «пресет, не экономия» и датированным публичным разбором.',
    },
  },
  {
    id: 'mimo_26_flash',
    model: 'MiMo 2.6 Flash',
    route: { en: 'DSHREM, read-only', ru: 'DSHREM, только чтение' },
    role: { en: 'Answered the rule-pack question and the model-choice question.', ru: 'Ответил на вопрос о наборах правил и о выборе модели.' },
    receipt: { en: '2026-10-21 · second attempt completed, USD 0.0028, 15,517 tokens; the first attempt failed (USD 0.0073) and is kept in the record', ru: '2026-10-21 · вторая попытка завершена, USD 0.0028, 15 517 токенов; первая провалилась (USD 0.0073) и сохранена в записи' },
    summary: {
      en: 'Axes work as model filters only when split: jurisdiction, licenses, labelling and sector rules exclude a model; the rest only rank it. Accepts the rule-pack defaults with one amendment on the safety core.',
      ru: 'Оси годятся как фильтры моделей только с делением: юрисдикция, лицензии, маркировка и отрасль исключают модель, остальное лишь ранжирует. Принимает умолчания по наборам правил с одной поправкой про ядро безопасности.',
    },
    verdicts: { a: 'agree', b: 'agree', c: 'agree', d: 'amend' },
    points: [
      { en: 'v2 describes the task, not the model: without a rule for what excludes and what reorders, the “filters” cannot be implemented as written.', ru: 'v2 описывает задачу, а не модель: без правила, что исключает, а что меняет порядок, «фильтры» в текущем виде не реализуемы.' },
      { en: 'No precedence when axes conflict: two agents can pick opposite models from identical answers.', ru: 'Нет старшинства при конфликте осей: два агента могут из одинаковых ответов выбрать противоположные модели.' },
      { en: 'Axis values carry no source date or valid-until, while laws, licenses and sanctions change: a hard filter can go stale silently.', ru: 'У значений осей нет даты источника и срока действия, а законы, лицензии и санкции меняются: жёсткий фильтр может молча устареть.' },
      { en: 'If hard filters leave zero candidates, people choose; the safe default is no model.', ru: 'Если жёсткие фильтры не оставили кандидатов, выбирают люди; безопасное умолчание — никакой модели.' },
    ],
    disagrees: {
      en: 'Astra 6 Ultra, partly: the lifecycle dimensions fixed “propose vs ship” but describe runs, not model eligibility. Treats political regime and religious law as soft — the opposite of GLM.',
      ru: 'Astra 6 Ultra, частично: измерения жизненного цикла поправили «предложить vs выкатить», но описывают запуски, а не допуск модели. Политический режим и религиозное право считает мягкими — противоположно GLM.',
    },
  },
];
