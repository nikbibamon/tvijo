'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

/* ─────────────────────────  DATA  ───────────────────────── */

type Choice = 'a' | 'b' | null;

interface Question {
  id: string;
  title: string;
  context?: string;
  optionA: { label: string; source: string; detail: string };
  optionB: { label: string; source: string; detail: string };
}

interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
  questions: Question[];
}

const SURVEY: Category[] = [
  /* ── 1 Architecture ───────────────────────────────────── */
  {
    id: 'arch',
    icon: '🏗️',
    title: 'Архитектура платформы',
    description: 'Фундаментальные решения о стеке и структуре системы',
    questions: [
      {
        id: 'arch-1',
        title: 'Bubbles vs Bundles — объединять или держать параллельно?',
        context: 'Сейчас два маршрута (/bubbles и /bundles) с похожим UX.',
        optionA: {
          label: 'Объединить в один интерфейс',
          source: 'GPT 5.4',
          detail: 'Один маршрут /bubbles с режимами "простой граф" и "decision map". Упрощает UX, единый data-layer, меньше дублирования кода. Сложнее технически на старте, но лучше для пользователя.',
        },
        optionB: {
          label: 'Держать параллельно',
          source: 'Cascade',
          detail: 'Bubbles — лёгкий режим для знакомства, Bundles — продвинутый для работы. Два отдельных маршрута, проще разрабатывать независимо. Объединение — после стабилизации обоих.',
        },
      },
      {
        id: 'arch-2',
        title: 'Real-time: Node.js Socket.IO или Django Channels?',
        context: 'Сейчас гибрид: Django backend + Node.js Decision Map.',
        optionA: {
          label: 'Перевести всё на Django Channels',
          source: 'GPT 5.4',
          detail: 'Единый стек — проще поддерживать, единая авторизация, единый деплой. Django Channels достаточно зрелый для WebSocket. Меньше точек отказа.',
        },
        optionB: {
          label: 'Оставить гибрид (Node.js + Django)',
          source: 'Cascade',
          detail: 'Node.js Decision Map уже работает с real-time. Миграция дорогая и рискованная. Гибрид: Django — бизнес-логика, Node.js — realtime engine. Вынести в сервис с чёткими контрактами.',
        },
      },
      {
        id: 'arch-3',
        title: 'Event-driven backbone — сразу или позже?',
        context: 'Доменные события (bundle.created, contribution.approved, ...) для автоматизации.',
        optionA: {
          label: 'Закладывать с самого начала',
          source: 'Cascade',
          detail: 'Django signals + Celery tasks с первого дня. Каждое действие эмитит событие → обработчики для аналитики, наград, уведомлений. Дороже переделывать потом.',
        },
        optionB: {
          label: 'Начать с простого CRUD, добавить позже',
          source: 'GPT 5.4',
          detail: 'Сначала рабочий MVP без overengineering. Event bus добавить когда появятся 3+ потребителя событий. Premature abstraction опаснее технического долга.',
        },
      },
      {
        id: 'arch-4',
        title: 'Multi-tenant / Workspace модель — когда?',
        context: 'Organization → Workspace → Users, Bundles, AI Policies.',
        optionA: {
          label: 'Заложить в схему сразу (даже пустую)',
          source: 'Cascade',
          detail: 'Добавить Organization/Workspace FK на все модели сейчас, даже если один tenant. Рефакторинг потом — дорого. Миграция существующих данных — больно.',
        },
        optionB: {
          label: 'Отложить до реального B2B клиента',
          source: 'GPT 5.4',
          detail: 'YAGNI. Мультиарендность без клиента — мёртвый код. Сначала доказать product-market fit на одном community. Tenant-модель — когда первый B2B.',
        },
      },
    ],
  },
  /* ── 2 AI Integration ─────────────────────────────────── */
  {
    id: 'ai',
    icon: '🧠',
    title: 'AI интеграция',
    description: 'Модели, контекст, RAG, галлюцинации, собственная модель',
    questions: [
      {
        id: 'ai-1',
        title: 'RAG: pgvector или Qdrant?',
        context: 'Для семантического поиска по узлам карт и KB-статьям.',
        optionA: {
          label: 'pgvector (в рамках PostgreSQL)',
          source: 'Cascade',
          detail: 'Нулевые дополнительные зависимости — уже есть Postgres. Достаточно для MVP (до ~1M векторов). Проще деплой и бэкап. Переход на Qdrant потом если нужно.',
        },
        optionB: {
          label: 'Qdrant (выделенный сервис)',
          source: 'GPT 5.4',
          detail: 'Лучшая производительность на scale. Встроенная фильтрация, ANN-индексы. Docker-контейнер рядом. Если RAG — core feature, лучше сразу правильный инструмент.',
        },
      },
      {
        id: 'ai-2',
        title: 'Контекст: сразу CAG+RAG или только CAG на старте?',
        context: 'CAG = полная карта в промпт; RAG = эмбеддинги + поиск.',
        optionA: {
          label: 'Только CAG на старте',
          source: 'Cascade',
          detail: 'Карты сейчас небольшие, влезают в контекст Claude (200K). CAG проще реализовать. RAG добавить когда карты станут >50K токенов.',
        },
        optionB: {
          label: 'Сразу закладывать переключение CAG↔RAG',
          source: 'GPT 5.4',
          detail: 'Поля llm_context_mode уже есть. Написать ContextManager с if/else сразу. Даже если RAG stub — архитектура готова. KB-статьи уже могут быть большими.',
        },
      },
      {
        id: 'ai-3',
        title: 'Собственная модель — приоритет или далёкая цель?',
        context: 'Fine-tuning Llama 3 / Mistral на данных одобренных вкладов.',
        optionA: {
          label: 'Далёкая цель (6+ месяцев)',
          source: 'Cascade',
          detail: 'Сначала нужны данные (1000+ одобренных вкладов). Claude/GPT достаточно. Fine-tuning без данных — бессмысленно. Начать собирать training data сейчас.',
        },
        optionB: {
          label: 'Подготовку начать сразу',
          source: 'GPT 5.4',
          detail: 'Формат данных для training определить сейчас. Каждый одобренный вклад автоматически пишется в JSONL. Инфра для vLLM описать в docker-compose. Когда данных хватит — запуск за дни.',
        },
      },
      {
        id: 'ai-4',
        title: 'AI-агенты для автоматизации — сейчас или потом?',
        context: 'moderation_agent, qa_agent, digest_agent, ops_agent.',
        optionA: {
          label: 'Заложить 1-2 агента сразу (moderation + digest)',
          source: 'Cascade',
          detail: 'moderation_agent для первичной оценки вкладов экономит время админа. digest_agent для недельных отчётов. Human-in-the-loop обязательно.',
        },
        optionB: {
          label: 'Сначала rule-based, агенты позже',
          source: 'GPT 5.4',
          detail: 'Агенты дорогие (токены). На MVP хватит if/else правил. Агенты — когда объём модерации > 50 вкладов/день и есть бюджет на токены.',
        },
      },
      {
        id: 'ai-5',
        title: 'Anti-hallucination: строгий или мягкий режим?',
        context: 'Политика проверки AI-ответов.',
        optionA: {
          label: 'Строгий: require_moderation по умолчанию',
          source: 'Cascade',
          detail: 'Каждый AI-output проходит модерацию. Дороже по времени, но безопаснее. Доверие пользователей выше. Подходит для контрибьюшн-экономики.',
        },
        optionB: {
          label: 'Мягкий: flag_unverified + выборочная модерация',
          source: 'GPT 5.4',
          detail: 'Флаг "⚠️ не подтверждено" на AI-контенте. Модерация только для критических действий. Быстрее, дешевле, не блокирует workflow.',
        },
      },
    ],
  },
  /* ── 3 Rewards & Motivation ───────────────────────────── */
  {
    id: 'rewards',
    icon: '💰',
    title: 'Система мотивации и заработка',
    description: 'Ранги, ставки, оценка качества, анти-фрод',
    questions: [
      {
        id: 'rew-1',
        title: 'Стартовая ставка — 50% или 30% от токенов?',
        context: 'Novice получает X% от потраченных AI-токенов за одобренный вклад.',
        optionA: {
          label: '50% — щедро, привлекает пользователей',
          source: 'Cascade',
          detail: 'Высокая ставка = сильный онбординг. Привлекает первых пользователей. Снижение потом через ранговую систему (30% → 50% → 70% → 90%).',
        },
        optionB: {
          label: '30% Novice → рост по рангам до 90%',
          source: 'GPT 5.4',
          detail: 'Начинать низко, расти по мере доказательства качества. Защищает бюджет. Мотивирует повышать ранг. 30% → 50% → 70% → 90%.',
        },
      },
      {
        id: 'rew-2',
        title: 'Quality score — rule-based или ML?',
        context: 'Оценка качества каждого вклада.',
        optionA: {
          label: 'Rule-based на старте',
          source: 'Оба согласны',
          detail: 'Фиксированные баллы за тип вклада + множитель за approval rate. Прозрачно, предсказуемо, не требует данных.',
        },
        optionB: {
          label: 'ML с самого начала',
          source: 'Альтернатива',
          detail: 'Обучить модель на первых 100 одобренных вкладах. Точнее, но требует данных и инфры. Black box для пользователей.',
        },
      },
      {
        id: 'rew-3',
        title: 'Минимальный порог вывода заработка?',
        context: 'С какой суммы пользователь может вывести.',
        optionA: {
          label: '$10 — низкий порог, быстрее первый успех',
          source: 'Cascade',
          detail: 'Пользователь быстрее чувствует результат. Важно для вовлечения на ранних этапах. Высокие операционные расходы на мелкие выплаты.',
        },
        optionB: {
          label: '$50 — защита от фрода и мелких выплат',
          source: 'GPT 5.4',
          detail: 'Фильтрует случайных пользователей. Меньше операционных расходов. Мотивирует накапливать вклады. Стандарт для affiliate программ.',
        },
      },
      {
        id: 'rew-4',
        title: 'Валюта заработка?',
        context: 'В чём считается и выплачивается зарплата.',
        optionA: {
          label: 'Внутренние "BibaTokens" → вывод в USD/USDT',
          source: 'Cascade',
          detail: 'Внутренняя валюта даёт гибкость. Можно менять курс, добавлять бонусы. Вывод в USDT при достижении порога.',
        },
        optionB: {
          label: 'Прямой USD-эквивалент',
          source: 'GPT 5.4',
          detail: 'Прозрачнее для пользователя. "Вы заработали $23.50" понятнее чем "4700 BibaTokens". Проще бухгалтерия.',
        },
      },
    ],
  },
  /* ── 4 Business Model ─────────────────────────────────── */
  {
    id: 'biz',
    icon: '📊',
    title: 'Бизнес-модель и монетизация',
    description: 'Pricing, go-to-market, стратегия выхода',
    questions: [
      {
        id: 'biz-1',
        title: 'Стратегия: Open-core, SaaS-first или Hybrid?',
        context: 'Как позиционировать продукт на рынке.',
        optionA: {
          label: 'Open-core (community edition + paid features)',
          source: 'Cascade',
          detail: 'Открытое ядро привлекает разработчиков и community. Платные enterprise features: SSO, audit, self-host support. Модель GitLab/Mattermost.',
        },
        optionB: {
          label: 'SaaS-first, self-host позже',
          source: 'GPT 5.4',
          detail: 'Быстрее monetization. Контроль инфры и данных. Self-host — Enterprise tier. Модель Linear/Notion.',
        },
      },
      {
        id: 'biz-2',
        title: 'Pricing: 4 тира или 2 простых?',
        context: 'Free / Pro / Team / Enterprise vs Free / Paid.',
        optionA: {
          label: '4 тира: Free → Pro → Team → Enterprise',
          source: 'Cascade',
          detail: 'Полный спектр от community до enterprise. Каждый тир добавляет ценность. Сложнее управлять, но покрывает все сегменты.',
        },
        optionB: {
          label: '2 тира: Free + Pro (Enterprise по запросу)',
          source: 'GPT 5.4',
          detail: 'Проще для старта. Free = ограниченные токены. Pro = всё остальное. Enterprise = custom pricing по запросу. Не усложнять пока нет трафика.',
        },
      },
      {
        id: 'biz-3',
        title: 'AI-ключи: прокси через backend или свои ключи пользователям?',
        context: 'Как давать доступ к AI для участников.',
        optionA: {
          label: 'Прокси через наш backend',
          source: 'Оба согласны',
          detail: 'Полный контроль расходов, лимитов, логирования. Единый billing. Пользователь не видит API-ключ. Можно переключать модели незаметно.',
        },
        optionB: {
          label: 'BYOK (Bring Your Own Key)',
          source: 'Альтернатива',
          detail: 'Пользователь вводит свой ключ. Нулевые AI-расходы для нас. Но теряем контроль, логирование, и value proposition заработка.',
        },
      },
      {
        id: 'biz-4',
        title: 'Реферальные ссылки провайдеров — на какой странице?',
        context: 'Vultr / Hetzner / DigitalOcean рефералки.',
        optionA: {
          label: 'Отдельная страница "Deploy Your Own"',
          source: 'Cascade',
          detail: 'Полноценный гайд по self-host с реферальными ссылками. Отдельный SEO-трафик. Подробные инструкции.',
        },
        optionB: {
          label: 'Блок внутри How It Works / Pricing',
          source: 'GPT 5.4',
          detail: 'Не создавать отдельную страницу ради 3 ссылок. Блок "Want your own instance?" на странице pricing.',
        },
      },
    ],
  },
  /* ── 5 Enterprise & Security ──────────────────────────── */
  {
    id: 'enterprise',
    icon: '🔒',
    title: 'Enterprise, безопасность и governance',
    description: 'RBAC, audit, compliance, SRE',
    questions: [
      {
        id: 'ent-1',
        title: 'RBAC: 7 ролей или 4 базовых?',
        context: 'Guest/Member/Contributor/Reviewer/Operator/Admin/Owner.',
        optionA: {
          label: '4 базовых: Viewer, Editor, Moderator, Admin',
          source: 'GPT 5.4',
          detail: 'Проще реализовать и понять. Достаточно для MVP. Расширить позже. Меньше сложности в permissions-коде.',
        },
        optionB: {
          label: '7 ролей с самого начала',
          source: 'Cascade',
          detail: 'Полная ролевая модель. Reviewer и Operator критичны для contribution economy. Переделывать роли потом — ломает существующие данные.',
        },
      },
      {
        id: 'ent-2',
        title: 'Audit log — обязательно сейчас?',
        context: 'Запись всех действий: кто, что, когда.',
        optionA: {
          label: 'Да, с первого дня',
          source: 'Оба согласны',
          detail: 'Contribution economy = прозрачность = доверие. Audit log нужен для: модерации, анти-фрода, отчётности, compliance. Django-auditlog — готовый пакет.',
        },
        optionB: {
          label: 'Отложить, логи достаточны',
          source: 'Альтернатива',
          detail: 'Structured logs (stdout JSON) + Sentry. Для MVP хватит. Audit model — когда появится real compliance requirement.',
        },
      },
      {
        id: 'ent-3',
        title: 'SSO/OAuth — в MVP roadmap?',
        context: 'Google, GitHub, Microsoft авторизация.',
        optionA: {
          label: 'Google + GitHub OAuth сразу',
          source: 'GPT 5.4',
          detail: 'Снижает барьер регистрации в 3-5 раз. Django-allauth — простая интеграция. Критично для community acquisition.',
        },
        optionB: {
          label: 'Email/password + JWT достаточно для старта',
          source: 'Cascade',
          detail: 'Уже работает Django JWT. OAuth добавляет сложность. Сначала доказать ценность продукта, потом упрощать регистрацию.',
        },
      },
    ],
  },
  /* ── 6 Priorities & Execution ─────────────────────────── */
  {
    id: 'exec',
    icon: '🎯',
    title: 'Приоритеты и порядок реализации',
    description: 'Что делать первым, вторым, третьим',
    questions: [
      {
        id: 'exec-1',
        title: 'Волна 1 — правильный приоритет?',
        context: 'MVP заработка: RewardProfile + Contributions + Token logging + How It Works.',
        optionA: {
          label: 'Да, заработок первым — это core value',
          source: 'Cascade',
          detail: 'Contribution economy — главный differentiator. Без неё проект = обычный mindmap. Сначала покажем ценность, потом улучшаем.',
        },
        optionB: {
          label: 'Нет, сначала social layer (голосования, комментарии)',
          source: 'GPT 5.4',
          detail: 'Заработок без социального слоя — непонятен. Пользователь должен видеть активность, комментарии, голоса ПРЕЖДЕ чем думать о заработке.',
        },
      },
      {
        id: 'exec-2',
        title: 'CI/CD и тесты — инвестировать сейчас?',
        context: 'Backend CI + Frontend CI + Deploy pipeline.',
        optionA: {
          label: 'Минимум CI сразу (lint + tests + deploy)',
          source: 'Cascade',
          detail: 'GitHub Actions уже есть. Добавить lint + pytest + typecheck = 2 часа работы. Окупается с первого merge.',
        },
        optionB: {
          label: 'Ручной деплой пока хватает',
          source: 'Альтернатива',
          detail: 'Команда маленькая, деплой раз в неделю. CI/CD — overengineering на стадии MVP.',
        },
      },
      {
        id: 'exec-3',
        title: 'AI eval suite — нужен?',
        context: 'Автоматическая оценка качества AI-ответов.',
        optionA: {
          label: 'Базовый eval с самого начала',
          source: 'GPT 5.4',
          detail: 'Невозможно улучшать AI без измерений. Простые метрики: node_reference_accuracy, moderation_pass_rate, avg_token_cost. Eval dataset из 50 примеров.',
        },
        optionB: {
          label: 'Отложить до production AI usage',
          source: 'Cascade',
          detail: 'Eval без данных — абстракция. Сначала собрать реальные AI-вызовы (100+), потом строить eval. Human feedback как eval на старте.',
        },
      },
      {
        id: 'exec-4',
        title: 'North Star Metric — какая?',
        context: 'Главная метрика успеха продукта.',
        optionA: {
          label: 'Количество реализованных улучшений (idea → done)',
          source: 'Cascade',
          detail: 'Полный цикл: предложение → одобрение → реализация → внедрение. Отражает реальную ценность системы.',
        },
        optionB: {
          label: 'Monthly Active Contributors',
          source: 'GPT 5.4',
          detail: 'Сколько людей активно вносят вклад каждый месяц. Проще измерить, ближе к retention. "Реализованные улучшения" зависят от admin bottleneck.',
        },
      },
    ],
  },
];

/* ─────────────────────────  HELPERS  ────────────────────── */

function buildSummary(answers: Record<string, Choice>) {
  const lines: string[] = ['=== Tvijo Strategic Survey Results ===', `Date: ${new Date().toISOString()}`, ''];
  for (const cat of SURVEY) {
    lines.push(`## ${cat.icon} ${cat.title}`);
    for (const q of cat.questions) {
      const choice = answers[q.id];
      const mark = choice === 'a' ? '→ A' : choice === 'b' ? '→ B' : '⏭ skip';
      const picked = choice === 'a' ? q.optionA : choice === 'b' ? q.optionB : null;
      lines.push(`  ${q.id}: ${mark} | ${q.title}`);
      if (picked) lines.push(`    Выбор: ${picked.label} (${picked.source})`);
    }
    lines.push('');
  }
  const total = SURVEY.reduce((s, c) => s + c.questions.length, 0);
  const answered = Object.values(answers).filter(Boolean).length;
  lines.push(`Answered: ${answered}/${total}`);
  return lines.join('\n');
}

/* ─────────────────────────  PAGE  ──────────────────────── */

export default function StrategicSurveyPage() {
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const pick = useCallback((qid: string, val: Choice) => {
    setAnswers(prev => ({ ...prev, [qid]: prev[qid] === val ? null : val }));
    setCopied(false);
    setSaved(false);
  }, []);

  const total = SURVEY.reduce((s, c) => s + c.questions.length, 0);
  const answered = Object.values(answers).filter(Boolean).length;
  const progress = Math.round((answered / total) * 100);

  const handleCopy = () => {
    const text = buildSummary(answers);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSave = async () => {
    const payload = {
      answers,
      summary: buildSummary(answers),
      timestamp: new Date().toISOString(),
      total,
      answered,
    };
    try {
      localStorage.setItem('tvijo-strategic-survey', JSON.stringify(payload));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* noop */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0c0c18] to-slate-950 text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        {/* ─── HERO ─── */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
            Strategic Plan Survey
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Сравнение рекомендаций <span className="text-blue-400 font-semibold">Cascade</span> и{' '}
            <span className="text-emerald-400 font-semibold">GPT&nbsp;5.4</span> по ключевым решениям развития DecMap + Bubbles.
            <br />
            Выберите предпочтительный вариант по каждому вопросу.
          </p>
        </section>

        {/* ─── PROGRESS ─── */}
        <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 -mx-4 px-4 py-3 mb-8">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-400">Прогресс: <span className="text-white font-semibold">{answered}/{total}</span></span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ─── CATEGORIES ─── */}
        {SURVEY.map(cat => (
          <section key={cat.id} className="mb-14">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="text-xl font-bold text-white">{cat.title}</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-10">{cat.description}</p>

            <div className="space-y-6">
              {cat.questions.map(q => {
                const choice = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 md:p-6 transition-all"
                  >
                    {/* question header */}
                    <h3 className="font-semibold text-white text-[15px] leading-snug mb-1">
                      {q.title}
                    </h3>
                    {q.context && (
                      <p className="text-gray-500 text-xs mb-4">{q.context}</p>
                    )}

                    {/* options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Option A */}
                      <button
                        onClick={() => pick(q.id, 'a')}
                        className={`text-left rounded-xl p-4 border-2 transition-all ${
                          choice === 'a'
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5'
                            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            q.optionA.source.includes('Cascade')
                              ? 'bg-blue-500/20 text-blue-400'
                              : q.optionA.source.includes('GPT')
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {q.optionA.source}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            choice === 'a' ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                          }`}>
                            {choice === 'a' && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-white mb-1.5">{q.optionA.label}</div>
                        <p className="text-xs text-gray-400 leading-relaxed">{q.optionA.detail}</p>
                      </button>

                      {/* Option B */}
                      <button
                        onClick={() => pick(q.id, 'b')}
                        className={`text-left rounded-xl p-4 border-2 transition-all ${
                          choice === 'b'
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            q.optionB.source.includes('Cascade')
                              ? 'bg-blue-500/20 text-blue-400'
                              : q.optionB.source.includes('GPT')
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {q.optionB.source}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            choice === 'b' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                          }`}>
                            {choice === 'b' && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-white mb-1.5">{q.optionB.label}</div>
                        <p className="text-xs text-gray-400 leading-relaxed">{q.optionB.detail}</p>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* ─── RESULTS / ACTIONS ─── */}
        <section className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-2 text-center">Результаты</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Ответов: <span className="text-white font-semibold">{answered}</span> из {total}.
            {answered === total && ' Все вопросы отвечены!'}
          </p>

          {/* mini summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {SURVEY.map(cat => {
              const catAnswered = cat.questions.filter(q => answers[q.id]).length;
              return (
                <div key={cat.id} className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-700/30">
                  <div className="text-lg">{cat.icon}</div>
                  <div className="text-xs text-gray-400 mt-1">{cat.title}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{catAnswered}/{cat.questions.length}</div>
                </div>
              );
            })}
          </div>

          {/* actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
            >
              {copied ? '✅ Скопировано!' : '📋 Копировать результаты'}
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-8 py-3 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10 transition-all"
            >
              {saved ? '✅ Сохранено!' : '💾 Сохранить локально'}
            </button>
          </div>

          {/* raw output for copy */}
          {answered > 0 && (
            <details className="mt-6">
              <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors">
                Показать текст результатов
              </summary>
              <pre className="mt-3 bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {buildSummary(answers)}
              </pre>
            </details>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
