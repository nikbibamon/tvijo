import type { Locale } from './config';

/**
 * Sandbox launcher copy (APP-013-p2 tail: one-time entry into the personal
 * DSH sandbox). Lives OUTSIDE the `Translations` contract for the same reason
 * as `workspace.ts`: the workspace surface releases on its own cadence.
 * English is the source of truth; RU and UK follow.
 */

type SandboxCopy = {
  button: string;
  launching: string;
  notConfigured: string;
  notAvailable: string;
  suspended: string;
  genericError: string;
};

const EN: SandboxCopy = {
  button: 'Open sandbox',
  launching: 'Opening…',
  notConfigured: 'The sandbox is not connected yet.',
  notAvailable: 'The sandbox is not available for this account yet.',
  suspended: 'This sandbox is suspended. Contact support.',
  genericError: 'Could not open the sandbox. Try again.',
};

const RU: SandboxCopy = {
  button: 'Открыть песочницу',
  launching: 'Открываю…',
  notConfigured: 'Песочница ещё не подключена.',
  notAvailable: 'Песочница для этого аккаунта пока недоступна.',
  suspended: 'Песочница приостановлена. Обратитесь в поддержку.',
  genericError: 'Не удалось открыть песочницу. Попробуйте ещё раз.',
};

const UK: SandboxCopy = {
  button: 'Відкрити пісочницю',
  launching: 'Відкриваю…',
  notConfigured: 'Пісочницю ще не підключено.',
  notAvailable: 'Пісочниця для цього акаунта поки недоступна.',
  suspended: 'Пісочницю призупинено. Зверніться до підтримки.',
  genericError: 'Не вдалося відкрити пісочницю. Спробуйте ще раз.',
};

export function getSandboxCopy(locale: Locale): SandboxCopy {
  if (locale === 'uk') return UK;
  if (locale === 'ru') return RU;
  return EN;
}
