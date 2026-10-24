import type { Locale } from './config';

type ModuleCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  evidence: string;
  measuredOn: string;
  source: string;
  sourceLink: string;
  pricing: string;
  customPricing: string;
  requestDemo: string;
  contactSales: string;
  askRoadmap: string;
  available: string;
  beta: string;
  roadmap: string;
  limitations: string;
  researchDisclaimer: string;
  backToModules: string;
  noModules: string;
  categories: Record<string, string>;
};

const EN: ModuleCopy = {
  eyebrow: 'Tvijo module catalogue',
  title: 'Software built from a running platform',
  subtitle: 'Explore the modules backed by measured system evidence. Pricing is currently handled by request; checkout is intentionally not enabled.',
  evidence: 'Measured evidence',
  measuredOn: 'Measured on',
  source: 'Source',
  sourceLink: 'Open evidence report',
  pricing: 'Commercial model',
  customPricing: 'Custom pricing — talk to the team',
  requestDemo: 'Request a demo',
  contactSales: 'Contact sales',
  askRoadmap: 'Ask about the roadmap',
  available: 'Available',
  beta: 'Beta',
  roadmap: 'Roadmap',
  limitations: 'Scope and limitations',
  researchDisclaimer: 'Research software only; not investment advice. Backtests do not establish future returns, and the execution pipeline is not production-ready.',
  backToModules: 'Back to modules',
  noModules: 'The catalogue is temporarily unavailable. Please open the evidence report or contact the team.',
  categories: {
    news: 'News analysis',
    'ai-infra': 'AI infrastructure',
    'trading-research': 'Trading research',
    data: 'Data',
  },
};

const RU: ModuleCopy = {
  eyebrow: 'Каталог модулей Tvijo',
  title: 'Программные модули работающей платформы',
  subtitle: 'Изучите модули, подтверждённые измеренными данными системы. Оплата пока не подключена: коммерческие условия обсуждаются индивидуально.',
  evidence: 'Измеренные данные',
  measuredOn: 'Дата измерения',
  source: 'Источник',
  sourceLink: 'Открыть отчёт с доказательствами',
  pricing: 'Коммерческая модель',
  customPricing: 'Индивидуальная стоимость — обсудить с командой',
  requestDemo: 'Запросить демо',
  contactSales: 'Связаться с продажами',
  askRoadmap: 'Спросить о roadmap',
  available: 'Доступен',
  beta: 'Бета',
  roadmap: 'В roadmap',
  limitations: 'Область применения и ограничения',
  researchDisclaimer: 'Только исследовательское ПО, не инвестиционная рекомендация. Бэктесты не доказывают будущую доходность, а execution pipeline не готов к production.',
  backToModules: 'Назад к модулям',
  noModules: 'Каталог временно недоступен. Откройте отчёт с доказательствами или свяжитесь с командой.',
  categories: {
    news: 'Анализ новостей',
    'ai-infra': 'AI-инфраструктура',
    'trading-research': 'Исследование торговли',
    data: 'Данные',
  },
};

export function getModuleCopy(locale: Locale): ModuleCopy {
  return locale === 'ru' ? RU : EN;
}
