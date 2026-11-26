"use client";

import { useId, useState } from "react";
import styles from "./decision-math-lab.module.css";

export type DecisionMathLabProps = { locale: "en" | "ru" };
type Locale = DecisionMathLabProps["locale"];
const t = (locale: Locale, ru: string, en: string) => locale === "ru" ? ru : en;
const fmt = (value: number, locale: Locale, digits = 3) => value.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: digits });
function decimal(value: string): number | null {
  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function integer(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}

export default function DecisionMathLab({ locale }: DecisionMathLabProps) {
  const id = useId();
  return <section className={styles.lab} aria-labelledby={`${id}-heading`} lang={locale}>
    <header className={styles.header}>
      <span className={styles.eyebrow}>DECISION MATH LAB</span>
      <h2 id={`${id}-heading`}>{t(locale, "Математика решения: потери и обновление вероятности", "Decision mathematics: loss and probability updating")}</h2>
      <p>{t(locale, "Два учебных сценария с ручным вводом. Все суммы — условные единицы, все вероятности — допущения примера. Это не цены API, не данные AA и не прогноз доходности.", "Two educational scenarios with manual inputs. All amounts are arbitrary units and all probabilities are example assumptions. These are not API prices, AA data, or return forecasts.")}</p>
    </header>
    <ExpectedLoss locale={locale} />
    <BayesianUpdate locale={locale} />
  </section>;
}

function ExpectedLoss({ locale }: DecisionMathLabProps) {
  const id = useId();
  const [probability, setProbability] = useState(80);
  const [autoText, setAutoText] = useState("1");
  const [errorText, setErrorText] = useState("100");
  const [reviewText, setReviewText] = useState("8");
  const [residualText, setResidualText] = useState("0.02");
  const autoCost = decimal(autoText);
  const errorLoss = decimal(errorText);
  const reviewCost = decimal(reviewText);
  const residual = decimal(residualText);
  const valid = autoCost !== null && errorLoss !== null && reviewCost !== null && residual !== null && residual <= 1
    && Number.isFinite(autoCost + errorLoss) && Number.isFinite(reviewCost + residual * errorLoss);
  const p = probability / 100;
  const autoExpected = valid ? autoCost + (1 - p) * errorLoss : null;
  const reviewExpected = valid ? reviewCost + residual * errorLoss : null;
  const threshold = valid && errorLoss > 0 ? 1 - (reviewExpected! - autoCost) / errorLoss : null;
  const finiteThreshold = threshold !== null && Number.isFinite(threshold);
  const delta = autoExpected !== null && reviewExpected !== null ? autoExpected - reviewExpected : null;
  const tolerance = Math.max(1, autoExpected ?? 0, reviewExpected ?? 0) * Number.EPSILON * 8;
  const equal = delta !== null && Math.abs(delta) <= tolerance;
  const comparison = delta === null ? "" : equal
    ? t(locale, "Ожидаемые потери равны: математический критерий не выбирает вариант.", "Expected losses are equal: this mathematical criterion does not choose an option.")
    : delta < 0
      ? t(locale, "В этом сценарии ожидаемые потери автоматического варианта меньше.", "In this scenario, the automatic option has lower expected loss.")
      : t(locale, "В этом сценарии ожидаемые потери варианта с проверкой меньше.", "In this scenario, the review option has lower expected loss.");
  return <article className={styles.panel} aria-labelledby={`${id}-title`}>
    <div className={styles.panelHeading}><div><span className={styles.badge}>{t(locale, "УЧЕБНЫЙ СЦЕНАРИЙ 01", "EDUCATIONAL SCENARIO 01")}</span><h3 id={`${id}-title`}>{t(locale, "Ожидаемые потери: обработка или проверка", "Expected loss: processing or review")}</h3></div><span className={styles.unit}>{t(locale, "Единица: условная сумма", "Unit: arbitrary amount")}</span></div>
    <p className={styles.intro}>{t(locale, "p — предполагаемая вероятность правильного результата. Цена ошибки и остаточная вероятность ошибки после проверки задаются отдельно. Сравнение работает только в рамках этих допущений.", "p is the assumed probability of a correct result. Error loss and the residual error probability after review are separate inputs. The comparison applies only under these assumptions.")}</p>
    <div className={styles.lossLayout}>
      <div>
        <label className={styles.rangeLabel} htmlFor={`${id}-p`}>{t(locale, "Вероятность правильного результата p", "Probability of a correct result p")}<strong>{fmt(probability, locale, 1)}%</strong><input id={`${id}-p`} type="range" min="0" max="100" step="0.5" value={probability} onChange={e => setProbability(Number(e.target.value))} /></label>
        <div className={styles.inputs}>
          <label htmlFor={`${id}-auto`}>autoCost <span>{t(locale, "Полная стоимость автоматического варианта", "Complete cost of the automatic option")}</span><input id={`${id}-auto`} inputMode="decimal" value={autoText} onChange={e => setAutoText(e.target.value)} aria-invalid={autoCost === null} /></label>
          <label htmlFor={`${id}-error`}>errorLoss <span>{t(locale, "Потеря при ошибочном результате", "Loss from an incorrect result")}</span><input id={`${id}-error`} inputMode="decimal" value={errorText} onChange={e => setErrorText(e.target.value)} aria-invalid={errorLoss === null} /></label>
          <label htmlFor={`${id}-review`}>reviewCost <span>{t(locale, "Полная стоимость варианта с проверкой", "Complete cost of the review option")}</span><input id={`${id}-review`} inputMode="decimal" value={reviewText} onChange={e => setReviewText(e.target.value)} aria-invalid={reviewCost === null} /></label>
          <label htmlFor={`${id}-residual`}>reviewResidualError <span>{t(locale, "Вероятность ошибки после проверки: 0–1", "Error probability after review: 0–1")}</span><input id={`${id}-residual`} inputMode="decimal" value={residualText} onChange={e => setResidualText(e.target.value)} aria-invalid={residual === null || residual > 1} /></label>
        </div>
        <p className={styles.note}>{t(locale, "reviewCost здесь включает все затраты варианта с проверкой. Если он содержит предварительную автоматическую обработку, включите её стоимость сюда, чтобы не потерять или не удвоить расход.", "reviewCost includes the complete review workflow. If that workflow starts with automatic processing, include its cost here to avoid missing or double-counting it.")}</p>
      </div>
      <div>
        <div className={styles.formulas}><code>E(auto) = autoCost + (1 − p) × errorLoss</code><code>E(review) = reviewCost + reviewResidualError × errorLoss</code></div>
        {valid && autoExpected !== null && reviewExpected !== null ? <>
          <div className={styles.lossResults} aria-live="polite"><div><span>{t(locale, "Автоматический вариант", "Automatic option")}</span><strong>{fmt(autoExpected, locale)}</strong></div><div><span>{t(locale, "Вариант с проверкой", "Review option")}</span><strong>{fmt(reviewExpected, locale)}</strong></div><p>{comparison}</p></div>
          <div className={styles.threshold} aria-live="polite"><strong>{t(locale, "Точка равенства", "Break-even threshold")}</strong><code>p* = 1 − (E(review) − autoCost) / errorLoss</code>
            {errorLoss === 0 ? <p>{t(locale, "errorLoss = 0: порог не определён. Остаётся сравнение двух прямых затрат; p не влияет на выбор по этому критерию.", "errorLoss = 0: the threshold is undefined. Only the two direct costs remain; p does not affect this criterion.")}</p>
              : !finiteThreshold ? <p>{t(locale, "Порог выходит за конечный числовой диапазон. Прямые ожидаемые потери показаны выше; порог на графике не отмечен.", "The threshold exceeds the finite numeric range. Direct expected losses appear above; no threshold is plotted.")}</p>
              : <><p className={styles.thresholdValue}>{fmt(threshold!, locale, 4)} <span>({fmt(threshold! * 100, locale, 2)}%)</span></p><p>{threshold! < 0
                ? t(locale, "Сырой порог меньше 0 и не обрезается до нуля. Автоматический вариант имеет меньшие ожидаемые потери при любом p ∈ [0, 1].", "The raw threshold is below 0 and is not clamped. The automatic option has lower expected loss for every p ∈ [0, 1].")
                : threshold! > 1
                  ? t(locale, "Сырой порог больше 1 и не обрезается до единицы. Вариант с проверкой имеет меньшие ожидаемые потери при любом p ∈ [0, 1].", "The raw threshold is above 1 and is not clamped. The review option has lower expected loss for every p ∈ [0, 1].")
                  : t(locale, "При p > p* потери автоматического варианта меньше; при p < p* меньше потери проверки; при p = p* — равенство. Это граница учебной модели, не команда к действию.", "For p > p*, the automatic option has lower loss; for p < p*, review has lower loss; p = p* is a tie. This is an educational model boundary, not an instruction to act.")}</p></>}
          </div>
        </> : <p className={styles.error} role="alert">{t(locale, "Введите конечные неотрицательные суммы и остаточную вероятность от 0 до 1. Пустое поле не считается нулём.", "Enter finite nonnegative amounts and a residual probability from 0 to 1. A blank field is not zero.")}</p>}
      </div>
    </div>
    {valid && autoCost !== null && errorLoss !== null && reviewExpected !== null && autoExpected !== null && <LossChart autoCost={autoCost} errorLoss={errorLoss} reviewExpected={reviewExpected} p={p} threshold={finiteThreshold ? threshold : null} locale={locale} />}
    <p className={styles.note}>{t(locale, "Модель предполагает одинаковую потерю при ошибке и постоянную остаточную вероятность ошибки проверки. Она не учитывает все виды последствий, неоднородность задач или зависимость ошибок. Никакие действия не запускаются.", "The model assumes a common error loss and a constant residual error probability after review. It does not represent every consequence, task heterogeneity, or error dependence. No actions are executed.")}</p>
  </article>;
}

function LossChart({ autoCost, errorLoss, reviewExpected, p, threshold, locale }: { autoCost: number; errorLoss: number; reviewExpected: number; p: number; threshold: number | null; locale: Locale }) {
  const id = useId();
  const left = 72; const right = 520; const top = 34; const bottom = 220;
  const rawMax = Math.max(autoCost + errorLoss, reviewExpected, 1);
  const max = Number.isFinite(rawMax * 1.08) ? rawMax * 1.08 : rawMax;
  const x = (value: number) => left + value * (right - left);
  const y = (value: number) => bottom - value / max * (bottom - top);
  const auto = (probability: number) => autoCost + (1 - probability) * errorLoss;
  const samples = Array.from(new Set([0, 0.25, 0.5, 0.75, 1, p])).sort((a, b) => a - b);
  const axisNumber = (value: number) => Math.abs(value) >= 100000 ? value.toExponential(1) : fmt(value, locale, 1);
  return <figure className={styles.figure}>
    <figcaption>{t(locale, "Учебная зависимость ожидаемых потерь от p", "Educational expected-loss curves across p")}</figcaption>
    <div className={styles.legend}><span><i className={styles.autoSwatch} />{t(locale, "Автоматический вариант", "Automatic option")}</span><span><i className={styles.reviewSwatch} />{t(locale, "Вариант с проверкой", "Review option")}</span><span>{t(locale, "● текущая вероятность", "● current probability")}</span>{threshold !== null && threshold >= 0 && threshold <= 1 && <span className={styles.thresholdLegend}>p* · {t(locale, "порог равенства", "break-even threshold")}</span>}</div>
    <svg className={styles.chart} viewBox="0 0 560 268" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{t(locale, "Ожидаемые потери двух вариантов", "Expected losses of two options")}</title>
      <desc id={`${id}-description`}>{t(locale, "По горизонтали вероятность правильного результата от 0 до 100 процентов; по вертикали условные потери. Текущие значения и значения на контрольных точках представлены в таблице ниже.", "The horizontal axis shows correct-result probability from 0 to 100 percent; the vertical axis shows arbitrary loss units. Current and checkpoint values are provided in the table below.")}</desc>
      <text x={left} y="17" className={styles.axisTitle}>{t(locale, "Ожидаемые потери, у.е.", "Expected loss, arbitrary units")}</text>
      {[0, 0.5, 1].map(fraction => <g key={fraction}><line x1={left} x2={right} y1={y(max * fraction)} y2={y(max * fraction)} className={styles.gridLine} /><text x={left - 9} y={y(max * fraction) + 4} textAnchor="end" className={styles.axisText}>{axisNumber(max * fraction)}</text></g>)}
      {[0, 0.25, 0.5, 0.75, 1].map(value => <g key={value}><line x1={x(value)} x2={x(value)} y1={top} y2={bottom} className={styles.gridLine} /><text x={x(value)} y={bottom + 20} textAnchor="middle" className={styles.axisText}>{value * 100}%</text></g>)}
      <text x={(left + right) / 2} y="260" textAnchor="middle" className={styles.axisTitle}>{t(locale, "Вероятность правильного результата p", "Probability of a correct result p")}</text>
      {threshold !== null && threshold >= 0 && threshold <= 1 && <line x1={x(threshold)} x2={x(threshold)} y1={top} y2={bottom} className={styles.thresholdLine} />}
      <line x1={x(0)} x2={x(1)} y1={y(auto(0))} y2={y(auto(1))} className={styles.autoLine} />
      <line x1={x(0)} x2={x(1)} y1={y(reviewExpected)} y2={y(reviewExpected)} className={styles.reviewLine} />
      <line x1={x(p)} x2={x(p)} y1={top} y2={bottom} className={styles.currentLine} />
      <circle cx={x(p)} cy={y(auto(p))} r="5.5" className={styles.autoPoint} />
      <circle cx={x(p)} cy={y(reviewExpected)} r="4" className={styles.reviewPoint} />
    </svg>
    <details className={styles.tableDetails}><summary>{t(locale, "Точные значения и доступная таблица", "Exact values and accessible table")}</summary><div className={styles.tableWrap}><table><caption>{t(locale, "Учебные ожидаемые потери в условных единицах; отображение округлено.", "Educational expected loss in arbitrary units; display values are rounded.")}</caption><thead><tr><th scope="col">p</th><th scope="col">E(auto)</th><th scope="col">E(review)</th></tr></thead><tbody>{samples.map(value => <tr key={value} className={Math.abs(value - p) < 1e-12 ? styles.currentRow : undefined}><th scope="row">{fmt(value * 100, locale, 1)}%{Math.abs(value - p) < 1e-12 && <span> · {t(locale, "текущее", "current")}</span>}</th><td>{fmt(auto(value), locale, 4)}</td><td>{fmt(reviewExpected, locale, 4)}</td></tr>)}</tbody></table></div></details>
  </figure>;
}

function BayesianUpdate({ locale }: DecisionMathLabProps) {
  const id = useId();
  const [alphaText, setAlphaText] = useState("1");
  const [betaText, setBetaText] = useState("1");
  const [nText, setNText] = useState("10");
  const [kText, setKText] = useState("7");
  const alpha = decimal(alphaText); const beta = decimal(betaText); const n = integer(nText); const k = integer(kText);
  const valid = alpha !== null && alpha > 0 && beta !== null && beta > 0 && n !== null && k !== null && k <= n
    && Number.isFinite(alpha + beta + n);
  const posteriorAlpha = valid ? alpha + k : null;
  const posteriorBeta = valid ? beta + (n - k) : null;
  const priorMean = valid ? alpha / (alpha + beta) : null;
  const posteriorMean = valid ? (alpha + k) / (alpha + beta + n) : null;
  return <article className={styles.panel} aria-labelledby={`${id}-title`}>
    <div className={styles.panelHeading}><div><span className={styles.badge}>{t(locale, "УЧЕБНЫЙ СЦЕНАРИЙ 02", "EDUCATIONAL SCENARIO 02")}</span><h3 id={`${id}-title`}>{t(locale, "Beta–binomial: как наблюдения меняют вероятность", "Beta–binomial: how observations update probability")}</h3></div></div>
    <p className={styles.intro}>{t(locale, "До наблюдений p описывается Beta(α, β). Затем наблюдаем k успехов в n независимых испытаниях Бернулли с общей вероятностью p. Все четыре числа ниже — ручной учебный ввод.", "Before observing data, p has a Beta(α, β) prior. Then we observe k successes in n independent Bernoulli trials sharing p. All four numbers below are manual educational inputs.")}</p>
    <div className={styles.bayesLayout}>
      <div><div className={styles.inputs}>
        <label htmlFor={`${id}-alpha`}>α · prior<input id={`${id}-alpha`} value={alphaText} onChange={e => setAlphaText(e.target.value)} inputMode="decimal" aria-invalid={alpha === null || alpha <= 0} /><span>α &gt; 0</span></label>
        <label htmlFor={`${id}-beta`}>β · prior<input id={`${id}-beta`} value={betaText} onChange={e => setBetaText(e.target.value)} inputMode="decimal" aria-invalid={beta === null || beta <= 0} /><span>β &gt; 0</span></label>
        <label htmlFor={`${id}-n`}>n · {t(locale, "независимых испытаний", "independent trials")}<input id={`${id}-n`} value={nText} onChange={e => setNText(e.target.value)} inputMode="numeric" aria-invalid={n === null} /><span>{t(locale, "Целое n ≥ 0", "Integer n ≥ 0")}</span></label>
        <label htmlFor={`${id}-k`}>k · {t(locale, "успехов", "successes")}<input id={`${id}-k`} value={kText} onChange={e => setKText(e.target.value)} inputMode="numeric" aria-invalid={k === null || (n !== null && k > n)} /><span>{t(locale, "Целое 0 ≤ k ≤ n", "Integer 0 ≤ k ≤ n")}</span></label>
      </div><p className={styles.note}>{t(locale, "Повторные попытки одной задачи и связанные документы не считаются автоматически независимыми наблюдениями. Нельзя увеличивать n числом LLM-вызовов. При разных вероятностях успеха нужна более подходящая модель.", "Repeated attempts on one task and related documents are not automatically independent observations. LLM call counts do not increase n. Varying success probabilities require a more suitable model.")}</p></div>
      <div className={styles.posterior} aria-live="polite">
        <code>p | data ~ Beta(α + k, β + n − k)</code>
        {valid && posteriorAlpha !== null && posteriorBeta !== null && priorMean !== null && posteriorMean !== null ? <>
          <strong className={styles.posteriorValue}>Beta({fmt(posteriorAlpha, locale, 4)}; {fmt(posteriorBeta, locale, 4)})</strong>
          <div className={styles.meanRow}><label htmlFor={`${id}-prior-mean`}>{t(locale, "Среднее prior", "Prior mean")} <strong>{fmt(priorMean * 100, locale, 2)}%</strong></label><meter id={`${id}-prior-mean`} min={0} max={1} value={priorMean}>{fmt(priorMean, locale, 4)}</meter><code>α / (α + β)</code></div>
          <div className={styles.meanRow}><label htmlFor={`${id}-posterior-mean`}>{t(locale, "Среднее posterior", "Posterior mean")} <strong>{fmt(posteriorMean * 100, locale, 2)}%</strong></label><meter id={`${id}-posterior-mean`} min={0} max={1} value={posteriorMean}>{fmt(posteriorMean, locale, 4)}</meter><code>(α + k) / (α + β + n)</code></div>
          <p>{n === 0 ? t(locale, "Новых наблюдений нет: posterior совпадает с prior.", "No new observations: the posterior equals the prior.") : t(locale, "Среднее posterior сочетает исходные допущения и наблюдения. Сила влияния prior зависит от α + β; это параметр модели, а не количество уже измеренных задач.", "The posterior mean combines prior assumptions with observations. Prior influence depends on α + β; this is a model parameter, not the count of already measured tasks.")}</p>
        </> : <p className={styles.error} role="alert">{t(locale, "Нужны конечные α > 0, β > 0 и целые 0 ≤ k ≤ n. Пустые поля, отрицательные значения и переполнение не принимаются.", "Enter finite α > 0, β > 0 and integers 0 ≤ k ≤ n. Blank fields, negative values, and overflow are invalid.")}</p>}
      </div>
    </div>
    <p className={styles.scopeNote}>{t(locale, "Показаны параметры распределения и среднее. Credible interval здесь не вычисляется. Среднее не является гарантией следующего результата, а учебное обновление не подтверждает надёжность реальной системы.", "This panel shows distribution parameters and the mean. No credible interval is computed. The mean does not guarantee the next outcome, and an educational update does not establish real-system reliability.")}</p>
  </article>;
}

export { DecisionMathLab };
