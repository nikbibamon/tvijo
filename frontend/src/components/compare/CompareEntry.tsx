import Link from 'next/link';
import pilot from '@/data/harness-pilot.json';
import { atlasCatalog } from '@/data/model-atlas/catalog';

export default function CompareEntry({ locale }: { locale: 'en' | 'ru' }) {
  const ru = locale === 'ru';
  const link = 'text-blue-300 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300';
  return <section aria-labelledby="compare-ways" className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-slate-300 sm:p-8">
    <h2 id="compare-ways" className="text-2xl font-semibold text-white">{ru ? 'Три способа сравнить' : 'Three ways to compare'}</h2>
    <div className="mt-5 grid gap-6 md:grid-cols-3">
      <article>
        <h3 className="font-semibold text-white"><a className={link} href={`/${locale}/compare#our-trials`}>{ru ? 'Наши испытания' : 'Our trials'}</a></h3>
        <p className="mt-3 break-words text-xs">{pilot.campaign} · <time dateTime={pilot.checked_on}>{ru ? '9 ноября 2026' : '9 Nov 2026'}</time></p>
        <p className="mt-2 text-sm leading-6">{ru ? 'Восемь запланированных слотов на двух независимых фикстурах. Оценщик опубликован вместе с пилотом; область проверки PILOT-B пояснена под таблицей.' : 'Eight planned slots on two independent task fixtures. Evaluator published with the pilot; PILOT-B scope is explained below its table.'}</p>
        <p className="mt-2 text-sm leading-6">{ru ? 'Ограничение: этот пилот не определяет универсального победителя.' : 'Limit: this pilot does not establish a universal winner.'}</p>
        <Link className={`${link} mt-3 inline-block text-sm`} href="/en/compare/experiments">{ru ? 'Испытания и протоколы (EN)' : 'Trials and protocols'}</Link>
      </article>
      <article>
        <h3 className="font-semibold text-white"><Link className={link} href="/en/compare/research">{ru ? 'Модели и конфигурации (Model Atlas, EN)' : 'Models and configurations (Model Atlas)'}</Link></h3>
        <p className="mt-3 text-xs">{atlasCatalog.version} · <time dateTime={atlasCatalog.updatedAt}>{ru ? '9 ноября 2026' : '9 Nov 2026'}</time></p>
        <p className="mt-2 text-sm leading-6">{ru ? 'Определения бенчмарков и протоколы выбора конфигурации под задачу.' : 'Benchmark definitions and protocols for choosing a configuration for a task.'}</p>
        <p className="mt-2 text-sm leading-6">{ru ? 'Ограничение: для этих протоколов не импортирован измеренный срез Atlas; локальные испытания показаны отдельно.' : 'Limit: no measured Atlas snapshot has been imported for these protocols; local fixture trials are reported separately.'}</p>
        <Link className={`${link} mt-3 inline-block text-sm`} href="/en/compare/benchmarks">{ru ? 'Бенчмарки (EN)' : 'Benchmarks'}</Link>
      </article>
      <article>
        <h3 className="font-semibold text-white"><a className={link} href={`/${locale}/compare#product-comparisons`}>{ru ? 'Сравнение продуктов (шлюз / наблюдаемость / управление)' : 'Product comparisons (gateway / observability / governance)'}</a></h3>
        <p className="mt-3 text-sm leading-6">{ru ? 'Сопоставление функций и сценариев применения по слоям продукта.' : 'Capabilities and workflow fit compared by product layer.'}</p>
        <p className="mt-2 text-sm leading-6">{ru ? 'Ограничение: это описания продуктов; выборка испытаний, версия оценщика и дата проверки в этих данных не записаны.' : 'Limit: these are product descriptions; a trial sample, evaluator version and check date are not recorded in this data.'}</p>
      </article>
    </div>
    <a className={`${link} mt-6 inline-block text-sm`} href={`/wiki/${ru ? 'ru/' : ''}tvijo-agent-evaluation-method/`}>{ru ? 'Как мы оцениваем' : 'How we evaluate'}</a>
  </section>;
}
