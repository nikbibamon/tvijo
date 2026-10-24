import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bibamoney — business plan',
  description:
    'How each measured asset becomes revenue: scored 0–100 against five declared criteria, with concrete actions. Scores are expert judgement, not measurements — and are labelled as such.',
  robots: { index: false, follow: false },
};

/**
 * Business plan companion to the evidence report at /bibamoney.
 *
 * The report states what exists; this page states what we do about it. One honesty rule
 * carries over: measured numbers stay measured, and everything that is a judgement call
 * (every score below) is labelled as judgement, never dressed up as data.
 */

const CRITERIA = [
  { k: 'Готовность', d: 'Насколько продукт существует сегодня, а не в планах' },
  { k: 'Юр. чистота', d: 'Можно ли это продавать без правовых мин (ToS, ПДн, финрегуляторика)' },
  { k: 'Спрос', d: 'Подтверждён ли рынок публичными ценами конкурентов, а не верой' },
  { k: 'Скорость', d: 'Как быстро возможен первый счёт (10 = дни, 1 = годы)' },
  { k: 'Риск', d: '10 = почти нечему сломаться или аукнуться' },
];

const ASSETS: {
  name: string;
  scores: [number, number, number, number, number];
  how: string;
  actions: string[];
  caveat?: string;
}[] = [
  {
    name: 'News Signals API',
    scores: [8, 9, 8, 9, 8],
    how: 'Подписка на API производных сигналов: sentiment, классификация, сущности, ссылка на источник. Тарифы $0 / $49 / $199 в месяц — коридор подтверждён публичными ценами Finlight ($29–249), Marketaux (~$166–199) и NewsAPI Business ($449). Эндпоинт уже в проде за токеном и квотой.',
    actions: [
      'Страница документации API с примерами и тарифами',
      'Листинг на RapidAPI + запуск на ProductHunt',
      '3 SEO-статьи в KB под «news sentiment api» / «financial news api» (draft → human review → publish)',
      'Первые 3 платящих клиента — цель к 15.08.2026; первому — ручной инвойс',
    ],
  },
  {
    name: 'Локализация как услуга',
    scores: [7, 9, 7, 8, 8],
    how: 'Не платформа-конкурент Lokalise, а продуктизированная услуга: «ваше приложение на 11 языках через CI, фикс-прайс за язык». Ниша подтверждена: Lingo.dev продаёт AI-конвейер за $99/мес + токены, TMS-платформы берут $144–1 245/мес. Наш кейс — этот же сайт: 300 488 локализованных строк собственным конвейером.',
    actions: [
      'Посадочная страница модуля с кейсом и фикс-прайсом',
      '2 пилотных клиента по цене ниже рынка в обмен на отзыв',
      'Оценка качества выборочно человеком — метрика качества, не только объёма',
    ],
  },
  {
    name: 'SEC-данные как обогащение (EDGAR)',
    scores: [5, 10, 5, 5, 7],
    how: 'Единственные данные с идеальной юридической чистотой — EDGAR это public domain. Сами по себе они не товар (все берут их бесплатно), но они делают дороже другие продукты: фундаментальные показатели компании рядом с новостным сигналом в Signals API, и SEO-страницы «per-ticker» для органического трафика.',
    actions: [
      'Перезапустить остановившийся 14.06 пайплайн EDGAR (поэтому в отчёте он «static»)',
      'Поле fundamentals в ответе Signals API — платная надстройка тарифа $199',
      'Шаблон per-ticker страниц для SEO',
    ],
    caveat: '«Static» в отчёте означает: конвейер перестал писать. Свежесть — условие монетизации: без перезапуска пайплайна этот актив не продаётся.',
  },
  {
    name: 'AI-OS managed + мультимодельный совет',
    scores: [5, 8, 7, 4, 6],
    how: 'Не софт-артефакт (извлечение из монолита — месяцы), а управляемый деплой: «поставим и обслужим контур маршрутизации с аудит-следом решений». Рынок платит $49–2 999/мес за этажи этой лестницы (Portkey → Langfuse Enterprise → TrueFoundry). Дифференциатор — совет с протоколом разногласий: ни один проверенный конкурент не продаёт мультивендорный вердикт с записанным dissent.',
    actions: [
      '1–2 пилотных managed-клиента на нашей инфраструктуре',
      'Кейс-страница совета: три готовых экспоната разногласий уже в отчёте',
      'Семантический кэш — в оффер как измеренная маржа (25.7% hit-rate)',
    ],
    caveat: 'Никаких «SOC2» до реального аудита и никаких SLA до резервирования.',
  },
  {
    name: 'Backtest lab',
    scores: [4, 6, 5, 2, 3],
    how: 'Пока не продукт — внутренний R&D. Продавать можно будет только как research-софт ($19–49/мес, уровень TradingView-подписок) и только после ворот валидации. Любая продажа «сигналов» или «доходности» закрыта регуляторикой (CFTC 4.41, FINRA 2210) и вердиктами собственного совета.',
    actions: [
      'Ворота валидации из вердикта совета: ≥50 OOS-сделок, profit factor ≥1.5, кап 15%, стоп книги −2%',
      'Стресс-тесты ZigZag: survivorship, chop-regime, slippage, funding — до forward-paper',
      'Аутентификация веб-интерфейса и мульти-биржа — до любого показа наружу',
    ],
    caveat: 'Явный запрет: не наращивать свипы. 920 952 прогона — это уже избыточная оптимизация; новые свипы на тех же данных углубляют переобучение, а не приближают продукт.',
  },
  {
    name: 'Справочник компаний',
    scores: [2, 2, 3, 2, 2],
    how: 'Как товар — закрыт: происхождение данных и персональные поля делают продажу датасета юридическим риском. Единственная роль — внутреннее топливо: lead-скоринг для продаж остальных модулей.',
    actions: ['Не продавать. Использовать внутри. Точка.'],
  },
];

const COUNCIL_DECISIONS = [
  {
    q: 'Отключить Groq, раз он «нежизнеспособен»?',
    a: 'Нет — данные говорят обратное. Groq обслужил 46 402 вызова со средней латентностью 0.68s (лучшая из всех) за $7.79, и на нём живёт классификация новостей. Отказы (18 из 85 панельных ответов совета) — это не «нежизнеспособность», а бесплатный тариф: квота 100 000 токенов/день, которую большие промпты совета выедают. Решение: убрать Groq из дефолт-панели совета (или оплатить тир), оставив его в новостной классификации, где он лучший по цене/скорости.',
  },
  {
    q: 'Провести тотальную оптимизацию по MoonBot?',
    a: 'Нет — вердикт совета прямо противоположный. Проблема MoonBot не в недооптимизации, а в survivorship bias: из 8 отобранных трейдеров только у одного робастные доказательства (1 019 OOS-сделок). Новые прогоны оптимизатора на тех же данных сделают переобучение глубже. Что делать вместо: ворота валидации (≥50 OOS-сделок, PF≥1.5, кап 15%, стоп −2%) и forward-paper без денег. Оптимизация после валидации, не вместо неё.',
  },
  {
    q: 'И по ZigZag тоже оптимизация?',
    a: 'Тоже нет: совет сказал «не начинать forward-paper, пока нет стресс-тестов». Порядок: survivorship-тест, chop-regime, slippage, funding — и только пережившая их конфигурация идёт в forward-paper. «70% шанс, что edge испарится» — это спекуляция панелиста, но строгие ворота арбитра — уже принятое решение, его и исполняем.',
  },
];

function ScoreBar({ scores }: { scores: [number, number, number, number, number] }) {
  const total = scores.reduce((a, b) => a + b, 0) * 2;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full ${total >= 70 ? 'bg-emerald-400' : total >= 50 ? 'bg-cyan-300' : 'bg-amber-300'}`}
          style={{ width: `${total}%` }}
        />
      </div>
      <span className="text-lg font-black tabular-nums text-white">{total}</span>
      <span className="text-xs text-slate-500">/ 100</span>
    </div>
  );
}

export default function BusinessPlan() {
  return (
    <main className="min-h-screen bg-[#041922] text-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <header>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-1.5 text-xs font-semibold text-cyan-200">
            Companion to the evidence report · scores are judgement, labelled as such
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            Как активы становятся выручкой
            <span className="block text-emerald-400">план, оценки, решения</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
            <Link href="/bibamoney" className="text-emerald-300 underline-offset-4 hover:underline">
              Доказательный отчёт
            </Link>{' '}
            фиксирует, что существует и что измерено. Эта страница — что мы с этим делаем. Каждый
            актив оценён 0–100 по пяти объявленным критериям. Оценки — экспертное суждение, а не
            измерение, и пересматриваются при новых данных.
          </p>
        </header>

        <section className="border-t border-white/[0.06] py-10">
          <h2 className="text-xl font-bold text-white">Критерии (каждый 0–10, сумма ×2)</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CRITERIA.map((c) => (
              <div key={c.k} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-sm font-bold text-emerald-300">{c.k}</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.06] py-10">
          <h2 className="text-2xl font-bold tracking-tight text-white">Активы, по убыванию приоритета</h2>
          <div className="mt-6 space-y-5">
            {ASSETS.map((a) => (
              <article key={a.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{a.name}</h3>
                  <ScoreBar scores={a.scores} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-500">
                  {CRITERIA.map((c, i) => (
                    <span key={c.k}>
                      {c.k}: <span className="text-slate-300">{a.scores[i]}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  <span className="font-semibold text-emerald-300">Как зарабатываем: </span>
                  {a.how}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {a.actions.map((act) => (
                    <li key={act} className="flex gap-2 text-sm leading-6 text-slate-400">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
                      {act}
                    </li>
                  ))}
                </ul>
                {a.caveat && (
                  <p className="mt-3 border-l-2 border-amber-300/40 pl-3 text-xs leading-6 text-slate-400">
                    {a.caveat}
                  </p>
                )}
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
            Семантический кэш (173 353 записи) в списке отсутствует намеренно: это не отдельный
            товар, а маржа — измеренные 25.7% попаданий срезали счёт примерно на пятую часть, и в
            managed-оффере AI-OS он продаётся как свойство, а не как SKU.
          </p>
        </section>

        <section className="border-t border-white/[0.06] py-10">
          <h2 className="text-2xl font-bold tracking-tight text-white">Решения по вердиктам совета</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Вопросы владельца — ответы по данным, не по ощущениям.
          </p>
          <div className="mt-6 space-y-4">
            {COUNCIL_DECISIONS.map((d) => (
              <article key={d.q} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                <h3 className="text-sm font-bold text-cyan-200">{d.q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{d.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.06] py-10">
          <h2 className="text-xl font-bold text-white">Первая веха</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Три платящих клиента News Signals API к <span className="font-bold text-white">15 августа 2026</span>.
            Если к этой дате их нет — план пересматривается, а не пере-рассказывается.
          </p>
        </section>

        <footer className="border-t border-white/[0.06] py-10">
          <Link
            href="/bibamoney"
            className="inline-flex items-center gap-2 rounded text-sm font-semibold text-emerald-300 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            ← К доказательному отчёту
          </Link>
        </footer>
      </div>
    </main>
  );
}
