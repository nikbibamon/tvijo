import type { Locale } from './config';

/**
 * Execution Contract marketing band (Part C3).
 *
 * Own-release-cadence dictionary (the module-catalog/workspace pattern): the
 * public Translations contract (typeof en) spans 11 locale files, so a small
 * new surface gets its own typed dict with EN base + RU/UK rather than forcing
 * every locale file to change. Locales without an entry fall back to EN.
 */

type ContractBandCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  splitTitle: [string, string, string];
  splitText: [string, string, string];
  statusTitle: string;
  statusLine: string;
  trustLine: string;
  learnMore: string;
};

const EN: ContractBandCopy = {
  eyebrow: 'EXECUTION CONTRACT',
  title: 'Verified rules for every agent run',
  subtitle:
    'Before any agent acts, Tvijo writes an Execution Contract: what to do, ' +
    'which knowledge to use, which tools are allowed, how much it may cost, ' +
    'and how the result will be accepted. The run then returns a result with ' +
    'an Evidence Pack you can audit.',
  splitTitle: ['Contract', 'Binding', 'Authorization'],
  splitText: [
    'What result is authorized.',
    'Which model and tool perform it.',
    'Whether each action is allowed right now.',
  ],
  statusTitle: 'Run state machine',
  statusLine: 'Approved → Bound → Running → Verification → Passed / Rework / Blocked',
  trustLine:
    'Every metric on this page is measured. Where a number is a sample, it is labeled DEMO DATA.',
  learnMore: 'See how runs are governed',
};

const RU: ContractBandCopy = {
  eyebrow: 'EXECUTION CONTRACT',
  title: 'Проверяемые правила для каждого запуска агента',
  subtitle:
    'Прежде чем агент начнёт действовать, Tvijo фиксирует Execution Contract: что ' +
    'делать, какие знания использовать, какие инструменты разрешены, сколько это ' +
    'может стоить и как результат будет принят. Запуск возвращает результат с ' +
    'Evidence Pack, который можно проверить.',
  splitTitle: ['Контракт', 'Binding', 'Authorization'],
  splitText: [
    'Какой результат разрешён.',
    'Какая модель и инструмент его выполняют.',
    'Разрешено ли каждое действие прямо сейчас.',
  ],
  statusTitle: 'Стейт-машина запуска',
  statusLine: 'Approved → Bound → Running → Verification → Passed / Rework / Blocked',
  trustLine:
    'Каждая метрика на этой странице измерена. Если число — пример, оно помечено как DEMO DATA.',
  learnMore: 'Как управляются запуски',
};

const UK: ContractBandCopy = {
  eyebrow: 'EXECUTION CONTRACT',
  title: 'Перевірені правила для кожного запуску агента',
  subtitle:
    'Перш ніж агент почне діяти, Tvijo фіксує Execution Contract: що робити, які ' +
    'знання використовувати, які інструменти дозволені, скільки це може коштувати ' +
    'і як результат буде прийнято. Запуск повертає результат з Evidence Pack, який ' +
    'можна перевірити.',
  splitTitle: ['Контракт', 'Binding', 'Authorization'],
  splitText: [
    'Який результат дозволено.',
    'Яка модель та інструмент його виконують.',
    'Чи дозволена кожна дія зараз.',
  ],
  statusTitle: 'Стейт-машина запуску',
  statusLine: 'Approved → Bound → Running → Verification → Passed / Rework / Blocked',
  trustLine:
    'Кожна метрика на цій сторінці виміряна. Якщо число — приклад, воно позначене як DEMO DATA.',
  learnMore: 'Як керуються запуски',
};

const BANDS: Record<string, ContractBandCopy> = { en: EN, ru: RU, uk: UK };

export function getHomeContract(locale: Locale | string): ContractBandCopy {
  return BANDS[locale] ?? EN;
}
