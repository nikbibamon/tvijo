export const MODULE_SLUGS = [
  'news-analyzer',
  'ai-os',
  'backtest-lab',
  'company-directory',
  'localization-pipeline',
  'trading-terminal',
] as const;

export type ModuleSlug = (typeof MODULE_SLUGS)[number];
