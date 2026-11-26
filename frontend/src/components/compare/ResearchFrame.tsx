import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import ResearchAtlas, { type ResearchAtlasProps } from './ResearchAtlas';
import DecisionMathLab from './DecisionMathLab';
import { atlasCatalog } from '@/data/model-atlas/catalog';
import { atlasLocaleAvailable } from '@/lib/model-atlas/routes';

export function ResearchEntry({ locale }: { locale: string }) {
  if (!atlasLocaleAvailable(locale)) return null;
  const ru = locale === 'ru';
  const lang = ru ? 'ru' : 'en';
  return <section className="mt-10 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.04] p-6 sm:p-8" aria-labelledby="atlas-entry">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Model Atlas · Tvijo / Hotido / FinEdg</p>
    <h2 id="atlas-entry" className="mt-3 text-2xl font-semibold text-white">{ru ? 'Какая конфигурация подходит нашей задаче?' : 'Which configuration fits our task?'}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{ru ? 'Матрица трёх проектов и восьми призм: вероятности, математика, данные, маркетинг, экономика, управление, автономность и улучшение. Английские термины с русскими объяснениями, точные конфигурации и план собственных испытаний.' : 'Three projects and eight lenses: probability, mathematics, data, marketing, economics, management, autonomy and improvement. Read benchmark definitions, compare complete configurations and design your own evaluation.'}</p>
    <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
      <Link href={`/${lang}/compare/research`} className="rounded-lg bg-cyan-300 px-4 py-3 text-slate-950 hover:bg-cyan-200">{ru ? 'Открыть матрицу →' : 'Explore the matrix →'}</Link>
      <Link href={`/${lang}/compare/benchmarks`} className="rounded-lg border border-white/15 px-4 py-3 text-slate-100 hover:bg-white/5">{ru ? 'Как читать бенчмарки' : 'Read benchmarks'}</Link>
      <Link href={`/${lang}/compare/experiments`} className="rounded-lg border border-white/15 px-4 py-3 text-slate-100 hover:bg-white/5">{ru ? 'Собственные испытания' : 'Own evaluations'}</Link>
    </div>
  </section>;
}

export default function ResearchFrame({ locale, view, projectId }: { locale: string; view: ResearchAtlasProps['view']; projectId?: string }) {
  if (!atlasLocaleAvailable(locale)) notFound();
  if (locale !== 'en' && locale !== 'ru') notFound();
  if (projectId && !atlasCatalog.projects.some(p => p.id === projectId)) notFound();
  const ru = locale === 'ru';
  const suffix = view === 'overview' ? '/research' : view === 'project' ? `/research/${projectId}` : `/${view}`;
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <Navbar />
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <nav aria-label={ru ? 'Путь по сайту' : 'Breadcrumb'} className="flex flex-wrap gap-2">
          <Link href={`/${locale}`} className="hover:text-white">Tvijo</Link><span aria-hidden="true">/</span>
          <Link href={`/${locale}/compare`} className="hover:text-white">{ru ? 'Сравнение' : 'Compare'}</Link><span aria-hidden="true">/</span>
          <Link href={`/${locale}/compare/research`} className="text-cyan-300">Model Atlas</Link>
        </nav>
        {atlasLocaleAvailable(ru ? 'en' : 'ru') ? <Link href={`/${ru ? 'en' : 'ru'}/compare${suffix}`} hrefLang={ru ? 'en' : 'ru'} className="rounded-lg border border-white/15 px-3 py-2 text-slate-200 hover:border-cyan-300/50">{ru ? 'English' : 'По-русски'}</Link> : null}
      </div>
      <ResearchAtlas catalog={atlasCatalog} locale={locale} view={view} projectId={projectId} />
      {view === 'experiments' && <DecisionMathLab locale={locale} />}
      {view === 'overview' && <section id="protocol" className="mt-12 scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8" aria-labelledby="protocol-title">
        <h2 id="protocol-title" className="text-2xl font-semibold text-white">{ru ? 'Как превратить матрицу в доказанный выбор' : 'Turn the matrix into an evidenced decision'}</h2>
        <ol className="mt-5 grid list-decimal gap-4 pl-5 text-sm leading-7 text-slate-300 sm:grid-cols-2 sm:gap-x-10">
          <li>{ru ? 'Закрепить модель, provider, версии harness и runtime, effort, инструменты, память, ограничения и полный бюджет.' : 'Pin the model, provider, harness/runtime versions, effort, tools, memory, scope and complete budget.'}</li>
          <li>{ru ? 'Заранее определить единицу наблюдения, критерий приёмки и закрытый набор. Повторы одной задачи учитывать как зависимые.' : 'Predeclare the observation unit, acceptance criteria and protected dataset. Repetitions of one task remain dependent.'}</li>
          <li>{ru ? 'Проверять одни и те же задачи всеми кандидатами. Сохранять неудачи, задержки, промежуточные вызовы и расходы.' : 'Evaluate candidates on the same cases. Preserve failures, latency, intermediate calls and cost records.'}</li>
          <li>{ru ? 'Сначала проверить обязательные ограничения. Затем сравнить качество с неопределённостью, полную стоимость и время среди прошедших кандидатов.' : 'Check mandatory constraints first. Then compare quality with uncertainty, complete cost and time among eligible candidates.'}</li>
          <li>{ru ? 'Для маркетинга использовать рандомизацию и зрелую конверсию; для FinEdg — хронологические окна, исторические версии данных и PAPER.' : 'Use randomization and mature conversion for marketing; chronological windows, data vintages and PAPER for FinEdg.'}</li>
          <li>{ru ? 'Новый кандидат проходит shadow → sandbox → ограниченный пилот. Защищённая выборка, лимит экспериментов и проверенный откат остаются частью процесса.' : 'Move a candidate through shadow, sandbox and a bounded pilot. Preserve a protected holdout, experiment budget and verified rollback.'}</li>
        </ol>
        <p className="mt-6 text-sm leading-7 text-slate-400">{ru ? 'В этой версии 24 проектных протокола являются предложениями. Собственные модельные испытания ещё не запускались; отсутствие измерений обозначено явно.' : 'The 24 project protocols in this version are proposals. No measured Atlas snapshot has been imported for these protocols; local fixture trials are reported separately.'}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-cyan-300">
          <Link href={`/${locale}/compare/experiments`}>{ru ? 'Сформировать план испытания →' : 'Prepare an evaluation plan →'}</Link>
          <a href="/model-atlas/evaluation-episode.schema.json" download>{ru ? 'Схема квитанции прогона JSON' : 'Evaluation receipt JSON schema'}</a>
        </div>
      </section>}
    </main>
    <Footer />
  </div>;
}
