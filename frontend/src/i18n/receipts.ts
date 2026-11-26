const en = {
  title: 'Gateway task receipts', subtitle: 'Read-only evidence for a selected project. Completion and acceptance are separate.',
  project: 'Project', select: 'Select a project', refresh: 'Refresh', next: 'Next page', first: 'First page',
  disconnected: 'Receipts are not connected to this account. Link Google in your profile, then sign in to the platform with the same Google account.',
  unavailable: 'Receipt history is unavailable. No empty or zero result has been inferred.',
  noProjects: 'No accessible gateway projects', noTasks: 'No task receipts on this page',
  truncated: 'This project list is partial. Open the platform to see more projects.',
  profile: 'Account linking', platform: 'Open platform', local: 'Workspace records',
  localNote: 'The records below belong to the Workspace database. They are separate from gateway receipts above.',
  task: 'Task', state: 'State', acceptance: 'Acceptance', provider: 'Reported provider cost', credit: 'Tvijo Tokens',
  unknown: 'Unknown', details: 'Details', close: 'Close details', tokens: 'Tokens (input / output)',
  payerPlatform: 'Platform API account', payerCustomer: 'Your provider account',
  known: 'Known amount', partial: 'Partial data — the total is not known.', invoice: 'Provider invoice not verified.',
  reserved: 'Reserved', debited: 'Debited', held: 'Held', released: 'Released', revision: 'Receipt revision',
  linkTitle: 'Link Google to this account', linkCopy: 'Confirm your current Tvijo password, then choose Google. Linking never merges accounts by email alone.',
  password: 'Current password', ready: 'Continue to Google', cancel: 'Cancel', linked: 'Google is linked. Receipts use this verified identity.',
  linkSuccess: 'Google linked to your existing account.', linkFailure: 'Linking failed. Confirm your password and use the Google account for this Tvijo account.',
  googleLoading: 'Loading Google sign-in…', googleUnavailable: 'Google sign-in is unavailable. Try again later.', passwordRequired: 'Enter your current password first.',
  signIn: 'Sign in again to continue.',
};
const ru: typeof en = {
  title: 'Квитанции задач шлюза', subtitle: 'Данные выбранного проекта только для чтения. Завершение и приёмка показаны отдельно.',
  project: 'Проект', select: 'Выберите проект', refresh: 'Обновить', next: 'Следующая страница', first: 'Первая страница',
  disconnected: 'Квитанции не подключены к этому аккаунту. Привяжите Google в профиле, затем войдите на платформу с тем же аккаунтом Google.',
  unavailable: 'История квитанций недоступна. Пустой список или нулевой результат не предполагаются.',
  noProjects: 'Нет доступных проектов шлюза', noTasks: 'На этой странице нет квитанций задач',
  truncated: 'Список проектов неполный. Откройте платформу, чтобы увидеть остальные проекты.',
  profile: 'Привязка аккаунта', platform: 'Открыть платформу', local: 'Записи Workspace',
  localNote: 'Записи ниже относятся к базе Workspace. Это отдельный источник от квитанций шлюза выше.',
  task: 'Задача', state: 'Состояние', acceptance: 'Приёмка', provider: 'Учтённые расходы провайдера', credit: 'Токены Tvijo',
  unknown: 'Неизвестно', details: 'Подробнее', close: 'Закрыть подробности', tokens: 'Токены (вход / выход)',
  payerPlatform: 'API-аккаунт платформы', payerCustomer: 'Ваш аккаунт провайдера',
  known: 'Известная сумма', partial: 'Неполные данные — итоговая сумма неизвестна.', invoice: 'Счёт провайдера не проверен.',
  reserved: 'Зарезервировано', debited: 'Списано', held: 'Удерживается', released: 'Освобождено', revision: 'Версия квитанции',
  linkTitle: 'Привязать Google к этому аккаунту', linkCopy: 'Подтвердите текущий пароль Tvijo, затем выберите Google. Совпадение почты само по себе не объединяет аккаунты.',
  password: 'Текущий пароль', ready: 'Продолжить с Google', cancel: 'Отмена', linked: 'Google привязан. Квитанции используют эту подтверждённую учётную запись.',
  linkSuccess: 'Google привязан к вашему существующему аккаунту.', linkFailure: 'Привязка не удалась. Проверьте пароль и используйте Google для этого аккаунта Tvijo.',
  googleLoading: 'Загрузка входа Google…', googleUnavailable: 'Вход Google недоступен. Попробуйте позже.', passwordRequired: 'Сначала введите текущий пароль.',
  signIn: 'Войдите снова, чтобы продолжить.',
};
export const receiptCopy = (locale: string) => locale === 'ru' ? ru : en;

const statusRu: Record<string, string> = { completed: 'Завершено', failed: 'Ошибка', cancelled: 'Отменено', running: 'Выполняется', queued: 'В очереди', accepted: 'Принято', unverified: 'Не проверено', complete: 'Полные данные', partial: 'Неполные данные', unknown: 'Неизвестно', unavailable: 'Недоступно', anomalous: 'Есть несоответствия' };
export const receiptStatus = (locale: string, value: string) => locale === 'ru' ? statusRu[value] || value : value;
