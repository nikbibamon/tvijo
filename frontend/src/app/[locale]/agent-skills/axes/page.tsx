import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AUDIENCES,
  AXES,
  CLAIM_LADDER,
  CLAIM_STATUS_NOW,
  DECISIONS,
  DIMENSIONS,
  DISCLOSURE,
  FILTER_KINDS,
  INTRO,
  INVARIANTS,
  LINE_QUESTION,
  LINES,
  MODEL_PROFILE,
  NIST_MAP,
  NOT_DO,
  POLICY_ID,
  PRECEDENCE,
  PROFILES,
  REVISIONS,
  RISKS,
  STOP_RULE,
  TESTS,
  TITLE,
  UNKNOWN_RULE,
  type Bi,
  type Verdict,
} from '@/data/agent-axes';
import styles from './axes.module.css';

const ruLocale = (locale: string) => locale.toLowerCase().startsWith('ru');
const pick = (value: Bi, ru: boolean): string => (ru ? value.ru : value.en);
const statusLabel: Record<string, { en: string; ru: string }> = {
  confirmed: { en: 'confirmed by check', ru: 'подтверждено проверкой' },
  partial: { en: 'partially covered', ru: 'покрыто частично' },
  not_checked: { en: 'not checked', ru: 'не проверено' },
};
const verdictLabel: Record<Verdict, Bi> = {
  agree: { en: 'agree', ru: 'согласен' },
  amend: { en: 'amend', ru: 'с поправкой' },
  disagree: { en: 'disagree', ru: 'против' },
  not_asked: { en: 'not asked', ru: 'не спрашивали' },
};
const axisTitle = (id: string, ru: boolean): string => {
  const axis = AXES.find((item) => item.id === id);
  return axis ? pick(axis.title, ru) : id;
};

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const ru = ruLocale(params.locale);
  return {
    title: pick(TITLE, ru),
    description: pick(INTRO, ru),
    alternates: { canonical: `https://tvijo.com/${params.locale}/agent-skills/axes` },
    robots: { index: true, follow: true },
  };
}

export default function AgentAxesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const ru = ruLocale(locale);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={`/${locale}`} className={styles.logo} aria-label="Tvijo home">
            <span>Tvijo</span>
            <i aria-hidden="true" />
          </Link>
          <nav className={styles.nav} aria-label="Agent skills">
            <Link href={`/${locale}/agent-skills`}>
              {ru ? 'Наборы правил' : 'Skill packs'}
            </Link>
            <Link href={`/${locale}/privacy`}>{ru ? 'Приватность' : 'Privacy'}</Link>
            <Link href={`/${locale}/terms`}>{ru ? 'Условия' : 'Terms'}</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{POLICY_ID}</p>
          <h1>{pick(TITLE, ru)}</h1>
          <p className={styles.lede}>{pick(INTRO, ru)}</p>
          <nav className={styles.jump} aria-label={ru ? 'Разделы' : 'Sections'}>
            <a href="#lines">{ru ? 'Линии моделей' : 'Model lines'}</a>
            <a href="#axes">{ru ? 'Оси' : 'Axes'}</a>
            <a href="#choosing">{ru ? 'Выбор модели' : 'Choosing a model'}</a>
            <a href="#claims">{ru ? 'Лестница утверждений' : 'Claim ladder'}</a>
            <a href="#nist">NIST AI RMF</a>
            <a href="#invariants">{ru ? 'Инварианты' : 'Invariants'}</a>
          </nav>
        </section>

        <section className={styles.section} aria-labelledby="revisions">
          <h2 id="revisions">{ru ? 'Ревизии политики' : 'Policy revisions'}</h2>
          <div className={styles.revs}>
            {REVISIONS.map((rev) => (
              <div key={rev.id} className={`${styles.rev} ${styles[rev.state]}`}>
                <b>{pick(rev.label, ru)}</b>
                <span>{pick(rev.note, ru)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="lines">
          <h2 id="lines">{ru ? 'Линии моделей' : 'Model lines'}</h2>
          <p className={styles.question}>{pick(LINE_QUESTION, ru)}</p>
          <div className={styles.tableWrap}>
            <table className={`${styles.table} ${styles.matrix}`}>
              <thead>
                <tr>
                  <th>{ru ? 'Решение человека · безопасное умолчание' : 'Human decision · safe default'}</th>
                  {LINES.map((line) => (
                    <th key={line.id}>{line.model}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DECISIONS.map((decision) => (
                  <tr key={decision.id}>
                    <td>
                      <b>{pick(decision.label, ru)}</b>
                      <div className={styles.cellNote}>{pick(decision.safeDefault, ru)}</div>
                    </td>
                    {LINES.map((line) => {
                      const verdict = line.verdicts[decision.id];
                      return (
                        <td key={line.id}>
                          <span className={`${styles.verdict} ${styles[`v_${verdict}`]}`}>
                            {pick(verdictLabel[verdict], ru)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.lines}>
            {LINES.map((line) => (
              <article key={line.id} className={styles.line} id={`line-${line.id}`}>
                <header>
                  <h3>{line.model}</h3>
                  <span className={styles.route}>{pick(line.route, ru)}</span>
                </header>
                <p className={styles.role}>{pick(line.role, ru)}</p>
                <p>{pick(line.summary, ru)}</p>
                <ul className={styles.points}>
                  {line.points.map((point) => (
                    <li key={point.en}>{pick(point, ru)}</li>
                  ))}
                </ul>
                <p className={styles.disagree}>
                  <strong>{ru ? 'Разногласие: ' : 'Disagrees: '}</strong>
                  {pick(line.disagrees, ru)}
                </p>
                <p className={styles.receipt}>{pick(line.receipt, ru)}</p>
              </article>
            ))}
          </div>
          <p className={styles.sectionNote}>
            {ru
              ? 'Линии — советы, а не голоса. Решения о деньгах, публичных заявлениях и приоритете принимает человек; совпадение линий не доказывает правоту.'
              : 'Lines are advice, not votes. A person decides on money, public claims and priority; lines agreeing with each other does not make them right.'}
          </p>
        </section>

        <section className={styles.section} aria-labelledby="axes">
          <h2 id="axes">{ru ? 'Оси' : 'Axes'}</h2>
          <div className={styles.axes}>
            {AXES.map((axis) => (
              <article key={axis.id} className={styles.card} id={axis.id}>
                <h3>{pick(axis.title, ru)}</h3>
                <p>{pick(axis.changes, ru)}</p>
                <p className={styles.invariant}>
                  <strong>{ru ? 'Не меняется: ' : 'Fixed: '}</strong>
                  {pick(axis.invariant, ru)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="choosing">
          <h2 id="choosing">{ru ? 'Выбор модели через оси (v3)' : 'Choosing a model through the axes (v3)'}</h2>
          <p className={styles.sectionNote}>
            {ru
              ? 'Оси описывают задачу. Модель можно выбрать, только если её маршрут объявляет те же факты о себе: выбор — это совпадение профиля задачи и профиля модели, а у каждого исключения есть код причины.'
              : 'The axes describe the task. A model is choosable only when its route declares the same facts about itself: choice is a match between the task profile and the model profile, and every exclusion has a reason code.'}
          </p>
          <p className={styles.sectionNote}>
            <span className={`${styles.status} ${styles.not_checked}`}>{ru ? 'объявлено, не применяется' : 'declared, not enforced'}</span>{' '}
            {ru
              ? 'Это политика v3. Шлюз пока не применяет эти фильтры автоматически; пока он этого не делает, модель выбирает пользователь, а неизвестный маршрут завершается кодом ошибки.'
              : 'This is v3 policy. The gateway does not apply these filters automatically yet; until it does, the user picks the model and an unknown route fails with an error code.'}
          </p>
          <div className={styles.filters}>
            {FILTER_KINDS.map((group) => (
              <article key={group.kind} className={`${styles.card} ${styles[`f_${group.kind}`]}`}>
                <h3>{pick(group.title, ru)}</h3>
                <p>{pick(group.rule, ru)}</p>
                <ul className={styles.chips}>
                  {group.axes.map((id) => (
                    <li key={id}>
                      <a href={`#${id}`}>{axisTitle(id, ru)}</a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h3 className={styles.subhead}>{ru ? 'Профиль модели — вторая половина фильтра' : 'Model profile — the other half of the filter'}</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Поле' : 'Field'}</th>
                  <th>{ru ? 'Значения' : 'Values'}</th>
                  <th>{ru ? 'Зачем' : 'Why'}</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_PROFILE.map((field) => (
                  <tr key={field.field}>
                    <td><code>{field.field}</code></td>
                    <td>{field.values.join(', ')}</td>
                    <td>{pick(field.why, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.subhead}>{ru ? 'Порядок старшинства при конфликте осей' : 'Precedence when axes conflict'}</h3>
          <ol className={styles.precedence}>
            {PRECEDENCE.map((item) => (
              <li key={item.en}>{pick(item, ru)}</li>
            ))}
          </ol>
          <p className={styles.sectionNote}>{pick(UNKNOWN_RULE, ru)}</p>

          <h3 className={styles.subhead}>{ru ? 'Фильтры по аудиториям' : 'Filters by audience'}</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Кто' : 'Who'}</th>
                  <th>{ru ? 'Жёстко' : 'Hard'}</th>
                  <th>{ru ? 'Ранжирование' : 'Ranking'}</th>
                  <th>{ru ? 'Никогда' : 'Never'}</th>
                </tr>
              </thead>
              <tbody>
                {AUDIENCES.map((audience) => (
                  <tr key={audience.id}>
                    <td><b>{pick(audience.title, ru)}</b></td>
                    <td>{pick(audience.hard, ru)}</td>
                    <td>{pick(audience.soft, ru)}</td>
                    <td>{pick(audience.never, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="claims">
          <h2 id="claims">{ru ? 'Лестница утверждений' : 'Claim ladder'}</h2>
          <ol className={styles.ladder}>
            {CLAIM_LADDER.map((step) => (
              <li key={step.id}>
                <b>{pick(step.title, ru)}</b>
                <span>{pick(step.meaning, ru)}</span>
              </li>
            ))}
          </ol>
          <p className={styles.statusNow}>{pick(CLAIM_STATUS_NOW, ru)}</p>
        </section>

        <section className={styles.section} aria-labelledby="nist">
          <h2 id="nist">{ru ? 'Карта по NIST AI RMF: что есть и чего нет' : 'NIST AI RMF map: what we have and what is missing'}</h2>
          <p className={styles.sectionNote}>
            {ru ? 'Самооценка по четырём функциям ' : 'Self-assessment against the four functions of the '}
            <a href="https://www.nist.gov/itl/ai-risk-management-framework" rel="noreferrer" target="_blank">
              NIST AI Risk Management Framework 1.0
            </a>
            {ru ? '. Каждая строка покрыта частично.' : '. Every row is partially covered.'}
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Функция' : 'Function'}</th>
                  <th>{ru ? 'Есть' : 'Have'}</th>
                  <th>{ru ? 'Нет или частично' : 'Missing or partial'}</th>
                </tr>
              </thead>
              <tbody>
                {NIST_MAP.map((row) => (
                  <tr key={row.fn}>
                    <td><code>{row.fn}</code></td>
                    <td>{pick(row.have, ru)}</td>
                    <td>{pick(row.gap, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.statusNow}>{pick(STOP_RULE, ru)}</p>
        </section>

        <section className={styles.section} aria-labelledby="dimensions">
          <h2 id="dimensions">
            {ru ? 'Измерения жизненного цикла (v2)' : 'Lifecycle dimensions (v2)'}
          </h2>
          <p className={styles.sectionNote}>
            {ru
              ? 'Это второй слой: он описывает, как агент действует, а не только в каких условиях. Добавлен по ревью Astra.'
              : 'This second layer describes how the agent acts, not only under which conditions. Added after the Astra review.'}
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Измерение' : 'Dimension'}</th>
                  <th>{ru ? 'Вопрос' : 'Question'}</th>
                  <th>{ru ? 'Пример' : 'Example'}</th>
                  <th>{ru ? 'Проверка' : 'Check'}</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim) => (
                  <tr key={dim.id}>
                    <td><code>{dim.id}</code></td>
                    <td>{pick(dim.question, ru)}</td>
                    <td>{pick(dim.example, ru)}</td>
                    <td>{pick(dim.check, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="profiles">
          <h2 id="profiles">{ru ? 'Поля профиля' : 'Profile fields'}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Поле' : 'Field'}</th>
                  <th>{ru ? 'Значения' : 'Values'}</th>
                  <th>{ru ? 'Зачем' : 'Why'}</th>
                </tr>
              </thead>
              <tbody>
                {PROFILES.map((profile) => (
                  <tr key={profile.field}>
                    <td><code>{profile.field}</code></td>
                    <td>
                      {profile.values.join(', ')}
                      {profile.note ? <div className={styles.cellNote}>{pick(profile.note, ru)}</div> : null}
                    </td>
                    <td>{pick(profile.why, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="invariants">
          <h2 id="invariants">{ru ? 'Инварианты и статус гарантий' : 'Invariants and guarantee status'}</h2>
          <ol className={styles.invariants}>
            {INVARIANTS.map((item) => (
              <li key={item.id}>
                <strong>
                  {pick(item.rule, ru)}
                  <span className={`${styles.status} ${styles[item.status]}`}>
                    {pick(statusLabel[item.status], ru)}
                  </span>
                </strong>
                <span>{pick(item.check, ru)}</span>
              </li>
            ))}
          </ol>
          <p className={styles.sectionNote}>
            {ru
              ? '«Покрыто частично» означает: проверка есть, но она не видит весь путь данных или не все действия.'
              : '“Partially covered” means the check exists but does not see the whole data path or every action.'}
          </p>
        </section>

        <section className={styles.section} aria-labelledby="tests">
          <h2 id="tests">{ru ? 'Проверки' : 'Checks'}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Проверка' : 'Check'}</th>
                  <th>PASS</th>
                  <th>FAIL</th>
                  <th>{ru ? 'Чего не доказывает' : 'Does not prove'}</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map((test) => (
                  <tr key={test.id}>
                    <td><code>{test.id}</code></td>
                    <td>{pick(test.pass, ru)}</td>
                    <td>{pick(test.fail, ru)}</td>
                    <td>{pick(test.notProve, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="risks">
          <h2 id="risks">{ru ? 'Риски сегментации' : 'Segmentation risks'}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ru ? 'Риск' : 'Risk'}</th>
                  <th>{ru ? 'Ранний признак' : 'Early signal'}</th>
                </tr>
              </thead>
              <tbody>
                {RISKS.map((risk) => (
                  <tr key={risk.id}>
                    <td>{pick(risk.risk, ru)}</td>
                    <td>{pick(risk.signal, ru)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="not-do">
          <h2 id="not-do">{ru ? 'Чего мы не делаем' : 'What we do not do'}</h2>
          <ul className={styles.list}>
            {NOT_DO.map((item) => (
              <li key={item.en}>{pick(item, ru)}</li>
            ))}
          </ul>
        </section>

        <section className={styles.disclosure} aria-label="Disclosure">
          <p>{pick(DISCLOSURE, ru)}</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href={`/${locale}`} className={styles.logo} aria-label="Tvijo home">
            <span>Tvijo</span>
            <i aria-hidden="true" />
          </Link>
          <nav aria-label="Footer">
            <Link href={`/${locale}/agent-skills`}>
              {ru ? 'Наборы правил' : 'Skill packs'}
            </Link>
            <Link href={`/${locale}/security`}>{ru ? 'Безопасность' : 'Security'}</Link>
            <Link href={`/${locale}/privacy`}>{ru ? 'Приватность' : 'Privacy'}</Link>
            <Link href={`/${locale}/terms`}>{ru ? 'Условия' : 'Terms'}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
