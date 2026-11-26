import type { AtlasCatalog, OwnSnapshot } from '@/components/compare/ResearchAtlas';
import ownSnapshots from './own-snapshots.json';

export const atlasCatalog: AtlasCatalog = {
  "version": "2.0.0-candidate",
  "updatedAt": "2026-11-09",
  "projects": [
    {
      "id": "tvijo",
      "name": {
        "en": "Tvijo AIOS",
        "ru": "Tvijo AIOS"
      },
      "summary": {
        "en": "Accepted workflows, routing, tools, budgets and reliable completion.",
        "ru": "Принятые процессы, маршрутизация, инструменты, бюджеты и надёжное завершение."
      }
    },
    {
      "id": "hotido",
      "name": {
        "en": "Hotido.com",
        "ru": "Hotido.com"
      },
      "summary": {
        "en": "Evidence-backed OSINT, company links, tender records and bid preparation.",
        "ru": "Доказательный OSINT, связи компаний, карточки тендеров и подготовка участия."
      }
    },
    {
      "id": "finedg",
      "name": {
        "en": "FinEdg",
        "ru": "FinEdg"
      },
      "summary": {
        "en": "Reproducible quantitative research, chronological evaluation and PAPER execution.",
        "ru": "Воспроизводимые количественные исследования, проверка по времени и PAPER-исполнение."
      }
    }
  ],
  "lenses": [
    {
      "id": "probability",
      "name": {
        "en": "Probability & calibration",
        "ru": "Вероятности"
      },
      "question": {
        "en": "How uncertain is the decision, and what is the cost of an error?",
        "ru": "Как оценить неопределённость решения и цену ошибки?"
      }
    },
    {
      "id": "higher_math",
      "name": {
        "en": "Numerics & optimization",
        "ru": "Высшая математика"
      },
      "question": {
        "en": "Are the formulas, constraints and numerical answers correct?",
        "ru": "Верны ли формулы, ограничения, оптимизация и численный результат?"
      }
    },
    {
      "id": "data_science",
      "name": {
        "en": "Data science & evidence",
        "ru": "Анализ данных"
      },
      "question": {
        "en": "Are the data and conclusions supported by traceable evidence?",
        "ru": "Правильно ли подготовлены данные и подтверждены выводы?"
      }
    },
    {
      "id": "marketing",
      "name": {
        "en": "Marketing & causal experiments",
        "ru": "Маркетинг"
      },
      "question": {
        "en": "Does the product improve qualified conversion and customer value?",
        "ru": "Меняет ли продукт конверсию и полезность для клиента?"
      }
    },
    {
      "id": "economics",
      "name": {
        "en": "Unit economics & macro scenarios",
        "ru": "Микро- и макроэкономика"
      },
      "question": {
        "en": "What are contribution, cash flow and sensitivity to external conditions?",
        "ru": "Каковы маржа, денежный поток и чувствительность к внешним условиям?"
      }
    },
    {
      "id": "management",
      "name": {
        "en": "Management & delivery",
        "ru": "Управление"
      },
      "question": {
        "en": "Are tasks accepted on time with clear ownership and dependencies?",
        "ru": "Доведены ли задачи до принятого результата с понятными ответственностью и сроками?"
      }
    },
    {
      "id": "autonomy",
      "name": {
        "en": "Bounded autonomy",
        "ru": "Автономность"
      },
      "question": {
        "en": "Which authorized actions can finish without intervention?",
        "ru": "Какие действия система может выполнять в разрешённом scope без вмешательства?"
      }
    },
    {
      "id": "self_improvement",
      "name": {
        "en": "Controlled self-improvement",
        "ru": "Самоулучшение"
      },
      "question": {
        "en": "Does a versioned candidate improve results on protected evidence?",
        "ru": "Улучшает ли новая версия проверяемый результат на защищённой выборке?"
      }
    }
  ],
  "slices": [
    {
      "id": "aios_probability",
      "projectId": "tvijo",
      "lensId": "probability",
      "title": {
        "en": "Calibrated task routing",
        "ru": "Уверенность маршрутизатора"
      },
      "task": {
        "en": "Estimate uncertainty before choosing a fast route, escalation or review. Choose the authorized action with the lowest expected loss; validate confidence against held-out outcomes.",
        "ru": "Передать задачу в быстрый маршрут, эскалировать или направить на проверку по ожидаемой цене ошибки. Прогноз принятия задачи: До запуска записаны p_correct, событие успеха и маршрут; после проверки — корректная метка. Решение о вызове инструмента: Верное действие с основанием; уверенность не создаёт полномочий."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Upper bound of the paired 95% confidence interval for ΔBrier (Chosen-answer correctness Brier; candidate − FROZEN baseline) ≤ 0; Critical violation count observed = 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Верхняя граница парного 95%-го доверительного интервала для ΔBrier (Brier правильности выбранного ответа; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≤ 0 — Не хуже заранее зафиксированного baseline вероятностей на тех же задачах.; Критичные нарушения observed = 0 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "brier_chosen_answer",
          "statistic": "upper_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "lte",
          "value": 0,
          "parameter": null,
          "unit": "squared_probability",
          "status": "proposal",
          "rationale": "Не хуже заранее зафиксированного baseline вероятностей на тех же задачах.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_probability",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "critical_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_probability",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "brier_chosen_answer",
          "name": {
            "en": "Chosen-answer correctness Brier",
            "ru": "Brier правильности выбранного ответа"
          },
          "unit": "squared_probability",
          "direction": "lower"
        },
        {
          "id": "calibration_profile",
          "name": {
            "en": "Reliability diagram",
            "ru": "Калибровочная диаграмма"
          },
          "unit": "bin_probabilities",
          "direction": "descriptive"
        },
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "critical_violations",
          "name": {
            "en": "Critical violation count",
            "ru": "Критичные нарушения"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "decision-index",
        "decision-score",
        "jev-decision",
        "metric-brier_chosen_answer",
        "metric-calibration_profile",
        "metric-accepted_task_rate",
        "metric-critical_violations"
      ],
      "configIds": [
        "rules-only",
        "decision-glide",
        "decision-drex",
        "decision-mammoth",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-brier",
        "method-calibration",
        "method-aa_decision",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 200 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 200 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Калибровочные данные не используются для финальной проверки. Brier у отдельного будущего ответа неизвестен до появления истины. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve cost_per_accepted while monitoring accepted_task_rate. No measured impact yet.",
        "ru": "Меньше дорогих повторов и ошибочных действий при сохранении качества. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 200,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "независимая task family / инцидент"
        }
      }
    },
    {
      "id": "aios_higher_math",
      "projectId": "tvijo",
      "lensId": "higher_math",
      "title": {
        "en": "Queue and resource mathematics",
        "ru": "Математика очереди и лимитов"
      },
      "task": {
        "en": "Check scheduling, numerical calculations and resource constraints. Produce feasible schedules and verify small cases against a certified oracle.",
        "ru": "Выбрать корректное расписание и оценить ограничения ресурсов. Оптимизация очереди: Выполнимое расписание, проверенный objective и обоснованные единицы. Проверка модели производительности: Проверены допущения; формулы очередей не применены без проверки стационарности/распределений."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Numerical oracle pass rate observed = 1; Feasible solution rate observed = 1; Certified relative optimality gap worst_case ≤ 0.01. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Точность расчётных примеров observed = 1 — Обязательный проверяемый инвариант.; Соблюдение ограничений observed = 1 — Обязательный проверяемый инвариант.; Разрыв с доказанным оптимумом worst_case ≤ 0.01 — Не более 1% от доказанного ненулевого оптимума на малых fixtures; предложение для пилота.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "numeric_case_pass",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_higher_math",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "feasible_solution_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_higher_math",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "optimality_gap",
          "statistic": "worst_case",
          "comparison": "absolute",
          "operator": "lte",
          "value": 0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Не более 1% от доказанного ненулевого оптимума на малых fixtures; предложение для пилота.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_higher_math",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "numeric_case_pass",
          "name": {
            "en": "Numerical oracle pass rate",
            "ru": "Точность расчётных примеров"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "feasible_solution_rate",
          "name": {
            "en": "Feasible solution rate",
            "ru": "Соблюдение ограничений"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "optimality_gap",
          "name": {
            "en": "Certified relative optimality gap",
            "ru": "Разрыв с доказанным оптимумом"
          },
          "unit": "fraction",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "terminalbench",
        "metric-numeric_case_pass",
        "metric-feasible_solution_rate",
        "metric-optimality_gap"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "limitations": {
        "en": "Proposed pilot: 30 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 30 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve p95_completion while monitoring budget_violations. No measured impact yet.",
        "ru": "Снижение времени ожидания без превышения ресурсов. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 30,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "математический fixture с независимым oracle"
        }
      }
    },
    {
      "id": "aios_data_science",
      "projectId": "tvijo",
      "lensId": "data_science",
      "title": {
        "en": "A complete and consistent event log",
        "ru": "Полный и непротиворечивый журнал"
      },
      "task": {
        "en": "Reconstruct task history, final state and costs from immutable evidence. Preserve required events and links without replacing missing values with zero.",
        "ru": "Можно ли использовать данные роя для наблюдения и управленческих решений? Восстановить историю задачи: Все обязательные события связаны; исходный текст и время сохранены. Сверить стоимость и состояние: Итоговые статусы и стоимость воспроизводятся без приравнивания missing к нулю."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Trace coverage observed = 1; Data-lineage coverage observed = 1; Money reconciliation error observed = 0; Orphaned-episode count observed = 0. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; Происхождение данных observed = 1 — Обязательный проверяемый инвариант.; Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Задачи без конечного состояния observed = 0 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_data_science",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "lineage_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_data_science",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_data_science",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "orphaned_episodes",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_data_science",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "lineage_coverage",
          "name": {
            "en": "Data-lineage coverage",
            "ru": "Происхождение данных"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        },
        {
          "id": "orphaned_episodes",
          "name": {
            "en": "Orphaned-episode count",
            "ru": "Задачи без конечного состояния"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "long-context",
        "metric-trace_coverage",
        "metric-lineage_coverage",
        "metric-money_reconciliation_error",
        "metric-orphaned_episodes"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve human_minutes while monitoring critical_violations. No measured impact yet.",
        "ru": "Меньше потерянных решений и ручного восстановления; достовернее учёт. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "независимая задача с полным эталонным event log"
        }
      }
    },
    {
      "id": "aios_marketing",
      "projectId": "tvijo",
      "lensId": "marketing",
      "title": {
        "en": "An AIOS offer with measurable demand",
        "ru": "Оффер AIOS и проверяемый спрос"
      },
      "task": {
        "en": "Test which product message attracts qualified installation or paid-pilot requests. Use account-level randomized experiments with mature outcomes and contribution metrics.",
        "ru": "Какой оффер приводит к квалифицированной установке или платному пилоту? Два оффера одного продукта: Черновики с проверяемыми утверждениями и одинаковым CTA. Оценить A/B: Абсолютный эффект, интервал и затраты; наблюдательные каналы не названы причинными."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the cluster 95% confidence interval for ΔQualified conversion rate (Qualified conversion rate; candidate − FROZEN baseline) ≥ pre_registered_minimum_conversion_lift; Lower bound of the cluster 95% confidence interval for ΔContribution per assigned account (Contribution per assigned account; candidate − FROZEN baseline) ≥ 0; Unsupported material-claim count observed = 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница кластерного 95%-го доверительного интервала для Δ«Конверсия в целевое действие» (Конверсия в целевое действие; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ pre_registered_minimum_conversion_lift — Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.; Нижняя граница кластерного 95%-го доверительного интервала для Δ«Маржинальный вклад на назначенный аккаунт» (Маржинальный вклад на назначенный аккаунт; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ 0 — Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.; Неподтверждённые обещания observed = 0 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "qualified_conversion",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": null,
          "parameter": "pre_registered_minimum_conversion_lift",
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_marketing",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "contribution_per_account",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": 0,
          "parameter": null,
          "unit": "currency/account",
          "status": "proposal",
          "rationale": "Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_marketing",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "unfounded_claims",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_marketing",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "qualified_conversion",
          "name": {
            "en": "Qualified conversion rate",
            "ru": "Конверсия в целевое действие"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "contribution_per_account",
          "name": {
            "en": "Contribution per assigned account",
            "ru": "Маржинальный вклад на назначенный аккаунт"
          },
          "unit": "currency/account",
          "direction": "higher"
        },
        {
          "id": "srm_p",
          "name": {
            "en": "Sample Ratio Mismatch p-value",
            "ru": "Диагностика распределения групп"
          },
          "unit": "probability",
          "direction": "descriptive"
        },
        {
          "id": "unfounded_claims",
          "name": {
            "en": "Unsupported material-claim count",
            "ru": "Неподтверждённые обещания"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "metric-qualified_conversion",
        "metric-contribution_per_account",
        "metric-srm_p",
        "metric-unfounded_claims"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ab_srm",
        "method-ab_metrics",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Sample size is not set: first fix baseline conversion, minimum detectable effect, power, alpha and outcome horizon. No measured model winner; scope draft_content_only.",
        "ru": "Размер выборки не задан: сначала зафиксировать базовую конверсию, минимальный различимый эффект, мощность, alpha и горизонт исхода. Это план рандомизированного A/B по аккаунтам. Размер групп рассчитывается после p0, MDE, alpha, power и горизонта. SRM проверяется до эффекта; не меняем знаменатель по post-treatment активности. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve contribution_per_account while monitoring refunds_complaints_unsubscribes. No measured impact yet.",
        "ru": "Рост качественных заявок и маржинального вклада, если причинный эффект подтвердится. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Draft content; publication is a separate action",
        "ru": "Подготовка черновика; публикация — отдельное действие"
      }
    },
    {
      "id": "aios_economics",
      "projectId": "tvijo",
      "lensId": "economics",
      "title": {
        "en": "Cost of an accepted task",
        "ru": "Цена принятой задачи и устойчивость расходов"
      },
      "task": {
        "en": "Separate marginal cost, full cost, contribution and cash flow. Compare accepted quality under an explicit cost cap and documented stress scenarios.",
        "ru": "Выбрать экономичный маршрут при заданных качестве и лимите риска. Микроэкономика задачи: Marginal и fully loaded CPA, маржинальная прибыль и денежные выплаты разделены. Макро/внешние стрессы: Таблица чувствительности; сценарным весам не приписана вероятность без модели."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Required cost-item coverage observed = 1; Money reconciliation error observed = 0; Cost per accepted unique task upper_cluster_95 ≤ owner_cpa_cap. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Полнота учёта расходов observed = 1 — Обязательный проверяемый инвариант.; Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Стоимость принятой задачи upper_cluster_95 ≤ owner_cpa_cap — Лимит определяется ценой продукта и допустимой маржой, а не берётся из бенчмарка.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "cost_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_economics",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_economics",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "cost_per_accepted",
          "statistic": "upper_cluster_95",
          "comparison": "absolute",
          "operator": "lte",
          "value": null,
          "parameter": "owner_cpa_cap",
          "unit": "currency/accepted_task",
          "status": "proposal",
          "rationale": "Лимит определяется ценой продукта и допустимой маржой, а не берётся из бенчмарка.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_economics",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "cost_per_accepted",
          "name": {
            "en": "Cost per accepted unique task",
            "ru": "Стоимость принятой задачи"
          },
          "unit": "currency/accepted_task",
          "direction": "lower"
        },
        {
          "id": "cost_coverage",
          "name": {
            "en": "Required cost-item coverage",
            "ru": "Полнота учёта расходов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        },
        {
          "id": "contribution_per_unit",
          "name": {
            "en": "Contribution margin per unit",
            "ru": "Маржинальная прибыль на единицу"
          },
          "unit": "currency/business_unit",
          "direction": "higher"
        },
        {
          "id": "cashflow_min",
          "name": {
            "en": "Minimum projected cash balance",
            "ru": "Минимальный денежный остаток сценария"
          },
          "unit": "currency",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "pareto",
        "session-cost",
        "api-equivalent",
        "macro-vintage",
        "metric-cost_per_accepted",
        "metric-cost_coverage",
        "metric-money_reconciliation_error",
        "metric-contribution_per_unit",
        "metric-cashflow_min"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Неизвестный тариф/стоимость остаётся null. В reserves не включать уже оплаченные суммы повторно. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve contribution_per_unit while monitoring accepted_task_rate. No measured impact yet.",
        "ru": "Выбор маршрута по принятым задачам при прозрачной марже. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "партия уникальных задач и сопоставимый расчётный период"
        }
      }
    },
    {
      "id": "aios_management",
      "projectId": "tvijo",
      "lensId": "management",
      "title": {
        "en": "Acceptance, dependencies and completion",
        "ru": "Приёмка, зависимости и завершение"
      },
      "task": {
        "en": "Track work through dependencies, interruptions and independent acceptance. Deliver a traceable accepted result with no orphaned episodes.",
        "ru": "Доводит ли контур работу до результата при зависимостях и сбоях? Управление цепочкой PR: Корректные приоритеты и состояния; каждый принятый результат связан с evidence. Прерывание и передача задачи: Восстановлен жизненный цикл без потери результата или повторного платного действия."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Accepted task rate lower_one_sided_95 ≥ 0.8; Orphaned-episode count observed = 0; Trace coverage observed = 1; p95 time to accepted completion upper_cluster_95 ≤ task_class_completion_slo_seconds. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Доля принятых задач lower_one_sided_95 ≥ 0.8 — Первичный предложенный floor для shadow-пилота; не универсальный стандарт.; Задачи без конечного состояния observed = 0 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; 95-й процентиль завершения upper_cluster_95 ≤ task_class_completion_slo_seconds — SLO задаётся по типу задания и проверяется с учётом незавершённых задач.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "accepted_task_rate",
          "statistic": "lower_one_sided_95",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.8,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Первичный предложенный floor для shadow-пилота; не универсальный стандарт.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_management",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "orphaned_episodes",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_management",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_management",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "p95_completion",
          "statistic": "upper_cluster_95",
          "comparison": "absolute",
          "operator": "lte",
          "value": null,
          "parameter": "task_class_completion_slo_seconds",
          "unit": "seconds",
          "status": "proposal",
          "rationale": "SLO задаётся по типу задания и проверяется с учётом незавершённых задач.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_management",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "orphaned_episodes",
          "name": {
            "en": "Orphaned-episode count",
            "ru": "Задачи без конечного состояния"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "p95_completion",
          "name": {
            "en": "p95 time to accepted completion",
            "ru": "95-й процентиль завершения"
          },
          "unit": "seconds",
          "direction": "lower"
        },
        {
          "id": "human_minutes",
          "name": {
            "en": "Human review minutes per accepted task",
            "ru": "Время участия человека"
          },
          "unit": "minutes/accepted_task",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "tasks-completed",
        "metric-accepted_task_rate",
        "metric-orphaned_episodes",
        "metric-trace_coverage",
        "metric-p95_completion",
        "metric-human_minutes"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-wilson",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve human_minutes while monitoring accepted_task_rate. No measured impact yet.",
        "ru": "Сокращение ручного контроля и стоимости задержки. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "независимый workflow episode"
        }
      }
    },
    {
      "id": "aios_autonomy",
      "projectId": "tvijo",
      "lensId": "autonomy",
      "title": {
        "en": "Bounded swarm autonomy",
        "ru": "Контролируемая автономность роя"
      },
      "task": {
        "en": "Evaluate unattended work within an existing authorized action scope. Verify recovery, event trace and budget boundaries before a narrow deployment stage.",
        "ru": "Какой заранее разрешённый scope можно доверить контуру после проверки? Работа без вмешательства: Принятое состояние, полные receipts и воспроизводимое объяснение. Сбой и выход за scope: Права не расширены; восстановление идемпотентно; критичный эффект не продублирован."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Critical violation count observed = 0; Replay integrity rate observed = 1; Trace coverage observed = 1; Budget-contract violation count observed = 0; Critical-event upper 95% bound one_sided_95_upper ≤ 0.01. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Критичные нарушения observed = 0 — Обязательный проверяемый инвариант.; Восстановление без потерь и повторных эффектов observed = 1 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; Нарушения согласованного лимита observed = 0 — Обязательный проверяемый инвариант.; Верхняя граница частоты критичных ошибок one_sided_95_upper ≤ 0.01 — Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "critical_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_autonomy",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "replay_integrity",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_autonomy",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_autonomy",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "budget_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_autonomy",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "critical_risk_upper95",
          "statistic": "one_sided_95_upper",
          "comparison": "absolute",
          "operator": "lte",
          "value": 0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.",
          "grantsScope": "bounded_pre_authorized_only",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "method-exact_binomial"
          ],
          "source": {
            "sliceId": "aios_autonomy",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design",
              "exact_binomial"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "accepted_without_intervention",
          "name": {
            "en": "Accepted without intervention rate",
            "ru": "Принято без вмешательства"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "critical_violations",
          "name": {
            "en": "Critical violation count",
            "ru": "Критичные нарушения"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "critical_risk_upper95",
          "name": {
            "en": "Critical-event upper 95% bound",
            "ru": "Верхняя граница частоты критичных ошибок"
          },
          "unit": "fraction",
          "direction": "lower"
        },
        {
          "id": "replay_integrity",
          "name": {
            "en": "Replay integrity rate",
            "ru": "Восстановление без потерь и повторных эффектов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "budget_violations",
          "name": {
            "en": "Budget-contract violation count",
            "ru": "Нарушения согласованного лимита"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "risk-scope",
        "ifbench",
        "metric-accepted_without_intervention",
        "metric-critical_violations",
        "metric-critical_risk_upper95",
        "metric-replay_integrity",
        "metric-trace_coverage",
        "metric-budget_violations"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-exact_binomial"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope bounded_pre_authorized_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. 60 — план fault-suite, а не 60 репрезентативных iid наблюдений. Порог не выдаёт новых полномочий. Существующие разрешения определяет отдельная политика владельца. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted_without_intervention while monitoring critical_violations. No measured impact yet.",
        "ru": "Меньше вмешательств при той же проверяемой границе разрешённых действий. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Only within an explicitly authorized scope and budget",
        "ru": "Только в заранее разрешённых пределах действий и бюджета"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "эпизод с фиксированным набором полномочий"
        }
      }
    },
    {
      "id": "aios_self_improvement",
      "projectId": "tvijo",
      "lensId": "self_improvement",
      "title": {
        "en": "Harness improvement without moving the goalposts",
        "ru": "Улучшение harness без подмены проверки"
      },
      "task": {
        "en": "Compare a versioned candidate against a frozen baseline. Improve a predeclared objective on protected tasks while preserving critical controls.",
        "ru": "Можно ли продвинуть новую версию на следующий этап без скрытой регрессии? Кандидат маршрутизации/промпта: Отдельная версия/ветка, diff и причина изменений. Сравнение с baseline: Парные интервалы качества/CPA; критичные случаи не регрессируют."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the paired 95% confidence interval for ΔAccepted task rate (Accepted task rate; candidate − FROZEN baseline) ≥ -0.02; Material regression count observed = 0; Protected-holdout exposure count observed = 0; Experiment manifest coverage observed = 1; Independent reproduction rate observed = 1. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница парного 95%-го доверительного интервала для Δ«Доля принятых задач» (Доля принятых задач; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ -0.02 — Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.; Критичные регрессии observed = 0 — Обязательный проверяемый инвариант.; Раскрытия контрольной выборки observed = 0 — Обязательный проверяемый инвариант.; Полнота манифестов observed = 1 — Обязательный проверяемый инвариант.; Независимое воспроизведение observed = 1 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "accepted_task_rate",
          "statistic": "lower_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": -0.02,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_self_improvement",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "material_regressions",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_self_improvement",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "protected_holdout_access",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_self_improvement",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "manifest_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_self_improvement",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "reproduction_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "aios_self_improvement",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "cost_per_accepted",
          "name": {
            "en": "Cost per accepted unique task",
            "ru": "Стоимость принятой задачи"
          },
          "unit": "currency/accepted_task",
          "direction": "lower"
        },
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "material_regressions",
          "name": {
            "en": "Material regression count",
            "ru": "Критичные регрессии"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "protected_holdout_access",
          "name": {
            "en": "Protected-holdout exposure count",
            "ru": "Раскрытия контрольной выборки"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "manifest_coverage",
          "name": {
            "en": "Experiment manifest coverage",
            "ru": "Полнота манифестов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "reproduction_rate",
          "name": {
            "en": "Independent reproduction rate",
            "ru": "Независимое воспроизведение"
          },
          "unit": "fraction",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "coding-agent-index",
        "aider-polyglot",
        "swe-bench",
        "openness-index",
        "improvement",
        "metric-cost_per_accepted",
        "metric-accepted_task_rate",
        "metric-material_regressions",
        "metric-protected_holdout_access",
        "metric-manifest_coverage",
        "metric-reproduction_rate"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-leakage",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope candidate_branch_then_shadow.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Если цель — экономия: дополнительно upper95 CPA_ratio <= 0.90 как предложенный практический эффект. Если цель — качество: lower95 Δacceptance > 0. Цель нельзя выбирать после результатов. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve cost_per_accepted while monitoring material_regressions. No measured impact yet.",
        "ru": "Снижение стоимости при сохранении принятого качества, если подтвердится на контроле. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Candidate branch, then shadow evaluation",
        "ru": "Отдельная ветка кандидата, затем теневая проверка"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent task/incident",
          "ru": "task family, все повторы в одном кластере"
        }
      }
    },
    {
      "id": "hotido_probability",
      "projectId": "hotido",
      "lensId": "probability",
      "title": {
        "en": "Calibrated entity and tender decisions",
        "ru": "Вероятность правильной связи и отбора"
      },
      "task": {
        "en": "Separate link, no-link and review decisions using checked evidence. Minimize false merges under an explicit loss model and evaluate precision with coverage.",
        "ru": "Связать компанию, оставить отдельной или передать неоднозначный случай на проверку. Entity matching с отказом: Верное link/no-link/review; вероятность зафиксирована до независимой проверки. Пригодность тендера: Проверяемые причины eligibility; неизвестное не превращено в положительный факт."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Entity-link precision lower_one_sided_95 ≥ 0.99; Entity-link recall point ≥ 0.8; Upper bound of the paired 95% confidence interval for ΔBrier (Binary event Brier; candidate − FROZEN baseline) ≤ 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Точность связей компаний lower_one_sided_95 ≥ 0.99 — Предложенный floor для автоматических связей: ошибки слияния дороже пропуска; оценивать по company clusters.; Полнота связей компаний point ≥ 0.8 — Дополнительный пилотный floor против отказа на всех сложных случаях.; Верхняя граница парного 95%-го доверительного интервала для ΔBrier (Brier бинарного события; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≤ 0 — Сравнение с замороженным baseline на тех же размеченных парах.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "entity_precision",
          "statistic": "lower_one_sided_95",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.99,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный floor для автоматических связей: ошибки слияния дороже пропуска; оценивать по company clusters.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_probability",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "entity_recall",
          "statistic": "point",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.8,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Дополнительный пилотный floor против отказа на всех сложных случаях.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_probability",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "brier_binary",
          "statistic": "upper_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "lte",
          "value": 0,
          "parameter": null,
          "unit": "squared_probability",
          "status": "proposal",
          "rationale": "Сравнение с замороженным baseline на тех же размеченных парах.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_probability",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        }
      ],
      "metrics": [
        {
          "id": "entity_precision",
          "name": {
            "en": "Entity-link precision",
            "ru": "Точность связей компаний"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "entity_recall",
          "name": {
            "en": "Entity-link recall",
            "ru": "Полнота связей компаний"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "brier_binary",
          "name": {
            "en": "Binary event Brier",
            "ru": "Brier бинарного события"
          },
          "unit": "squared_probability",
          "direction": "lower"
        },
        {
          "id": "calibration_profile",
          "name": {
            "en": "Reliability diagram",
            "ru": "Калибровочная диаграмма"
          },
          "unit": "bin_probabilities",
          "direction": "descriptive"
        },
        {
          "id": "support_precision",
          "name": {
            "en": "Claim support precision",
            "ru": "Подтверждённость утверждений"
          },
          "unit": "fraction",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "decision-index",
        "decision-score",
        "jev-decision",
        "metric-entity_precision",
        "metric-entity_recall",
        "metric-brier_binary",
        "metric-calibration_profile",
        "metric-support_precision"
      ],
      "configIds": [
        "rules-only",
        "decision-glide",
        "decision-drex",
        "decision-mammoth",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ocds_ids",
        "method-brier",
        "method-calibration",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 200 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 200 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Стоимость false-merge, miss и review задаёт loss matrix. Нельзя объявить 0.99 модельной вероятностью из самого benchmark score. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted tender packs per review hour while monitoring false entity merges. No measured impact yet.",
        "ru": "Меньше ошибочных связей, бесполезных лидов и ручных сверок. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 200,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "независимая company group, все её пары в одном кластере"
        }
      }
    },
    {
      "id": "hotido_higher_math",
      "projectId": "hotido",
      "lensId": "higher_math",
      "title": {
        "en": "Lot calculations and constraints",
        "ru": "Экономико-математическая проверка лотов"
      },
      "task": {
        "en": "Verify monetary arithmetic, eligibility constraints and small optimization problems. Produce a feasible, independently checked bid draft without submitting it.",
        "ru": "Верно ли рассчитаны суммы и выполнены ограничения заявки? Суммы, округления и валюты: Совпадение денежных сумм в minor units, раздельные ставки и периоды. Выбор допустимых лотов: Выполнимый набор лотов, явная цель и проверенный objective; без отправки заявки."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Numerical oracle pass rate observed = 1; Feasible solution rate observed = 1; Money reconciliation error observed = 0; Certified relative optimality gap worst_case ≤ 0.01. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Точность расчётных примеров observed = 1 — Обязательный проверяемый инвариант.; Соблюдение ограничений observed = 1 — Обязательный проверяемый инвариант.; Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Разрыв с доказанным оптимумом worst_case ≤ 0.01 — Предложение для небольших задач с доказанным optimum.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "numeric_case_pass",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_higher_math",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "feasible_solution_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_higher_math",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_higher_math",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "optimality_gap",
          "statistic": "worst_case",
          "comparison": "absolute",
          "operator": "lte",
          "value": 0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложение для небольших задач с доказанным optimum.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_higher_math",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "numeric_case_pass",
          "name": {
            "en": "Numerical oracle pass rate",
            "ru": "Точность расчётных примеров"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "feasible_solution_rate",
          "name": {
            "en": "Feasible solution rate",
            "ru": "Соблюдение ограничений"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "optimality_gap",
          "name": {
            "en": "Certified relative optimality gap",
            "ru": "Разрыв с доказанным оптимумом"
          },
          "unit": "fraction",
          "direction": "lower"
        },
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "terminalbench",
        "metric-numeric_case_pass",
        "metric-feasible_solution_rate",
        "metric-optimality_gap",
        "metric-money_reconciliation_error"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ocds_releases"
      ],
      "limitations": {
        "en": "Proposed pilot: 30 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 30 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve review minutes per accepted bid draft while monitoring eligibility errors. No measured impact yet.",
        "ru": "Меньше арифметических ошибок и неподходящих пакетов. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 30,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "независимый fixture лотов/ограничений"
        }
      }
    },
    {
      "id": "hotido_data_science",
      "projectId": "hotido",
      "lensId": "data_science",
      "title": {
        "en": "An evidence-backed tender record",
        "ru": "Доказательная карточка тендера"
      },
      "task": {
        "en": "Extract critical fields with source version, location and support. Accept complete, current records using procurement-level clustered evaluation.",
        "ru": "Можно ли принять карточку без утраты критичных полей и источников? Извлечение с цитатами: Сумма, currency, deadline, buyer ID, eligibility с quote/page/hash и статусом отсутствующих данных. Сравнение версий: Обновлены только изменившиеся факты; корректны связи организации и закупки."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Critical-field exact match lower_cluster_95 ≥ 0.95; Claim support precision lower_cluster_95 ≥ 0.99; Required-fact recall point ≥ 0.95; Data-lineage coverage observed = 1; Stale critical-source count observed = 0. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Точное извлечение критичных полей lower_cluster_95 ≥ 0.95 — Предложенный нижний предел по критичным полям; каждый тип показывается отдельно.; Подтверждённость утверждений lower_cluster_95 ≥ 0.99 — Заявленные факты должны подтверждаться смыслом источника, а не только существованием URL.; Полнота обязательных фактов point ≥ 0.95 — Защита от пропуска сложных обязательных требований.; Происхождение данных observed = 1 — Обязательный проверяемый инвариант.; Критичные устаревшие источники observed = 0 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "field_exact_match",
          "statistic": "lower_cluster_95",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.95,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный нижний предел по критичным полям; каждый тип показывается отдельно.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_data_science",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "support_precision",
          "statistic": "lower_cluster_95",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.99,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Заявленные факты должны подтверждаться смыслом источника, а не только существованием URL.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_data_science",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "required_fact_recall",
          "statistic": "point",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.95,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Защита от пропуска сложных обязательных требований.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_data_science",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "lineage_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_data_science",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "stale_critical_sources",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_data_science",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "field_exact_match",
          "name": {
            "en": "Critical-field exact match",
            "ru": "Точное извлечение критичных полей"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "field_macro_f1",
          "name": {
            "en": "Macro field F1",
            "ru": "Средний F1 типов полей"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "support_precision",
          "name": {
            "en": "Claim support precision",
            "ru": "Подтверждённость утверждений"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "required_fact_recall",
          "name": {
            "en": "Required-fact recall",
            "ru": "Полнота обязательных фактов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "lineage_coverage",
          "name": {
            "en": "Data-lineage coverage",
            "ru": "Происхождение данных"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "stale_critical_sources",
          "name": {
            "en": "Stale critical-source count",
            "ru": "Критичные устаревшие источники"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "long-context",
        "metric-field_exact_match",
        "metric-field_macro_f1",
        "metric-support_precision",
        "metric-required_fact_recall",
        "metric-lineage_coverage",
        "metric-stale_critical_sources"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ocds_ids",
        "method-ocds_releases",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 120 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 120 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Документы/поля одного тендера зависимы: интервал на кластерах procurement process, не Wilson на тысячах полей. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve cost per accepted tender pack while monitoring missed critical requirements. No measured impact yet.",
        "ru": "Меньше времени на сбор и перепроверку коммерчески полезного пакета. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 120,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "procurement process с документами и всеми релизами"
        }
      }
    },
    {
      "id": "hotido_marketing",
      "projectId": "hotido",
      "lensId": "marketing",
      "title": {
        "en": "A useful tender-monitoring offer",
        "ru": "Оффер тендерного мониторинга"
      },
      "task": {
        "en": "Measure qualified usage and payment rather than opens or clicks alone. Randomize at company level and estimate mature contribution per assigned account.",
        "ru": "Какой вариант приводит к использованию и оплате релевантной подборки? Два варианта одной услуги: Проверяемый оффер: региональный мониторинг или экономия на отборе; без обещания гарантированной победы. Оценка полезного действия: Использование подборки/платный пилот за фиксированный горизонт; открытие письма не подменяет продажу."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the cluster 95% confidence interval for ΔQualified conversion rate (Qualified conversion rate; candidate − FROZEN baseline) ≥ pre_registered_minimum_conversion_lift; Lower bound of the cluster 95% confidence interval for ΔContribution per assigned account (Contribution per assigned account; candidate − FROZEN baseline) ≥ 0; Unsupported material-claim count observed = 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница кластерного 95%-го доверительного интервала для Δ«Конверсия в целевое действие» (Конверсия в целевое действие; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ pre_registered_minimum_conversion_lift — Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.; Нижняя граница кластерного 95%-го доверительного интервала для Δ«Маржинальный вклад на назначенный аккаунт» (Маржинальный вклад на назначенный аккаунт; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ 0 — Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.; Неподтверждённые обещания observed = 0 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "qualified_conversion",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": null,
          "parameter": "pre_registered_minimum_conversion_lift",
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_marketing",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "contribution_per_account",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": 0,
          "parameter": null,
          "unit": "currency/account",
          "status": "proposal",
          "rationale": "Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_marketing",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "unfounded_claims",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_marketing",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "qualified_conversion",
          "name": {
            "en": "Qualified conversion rate",
            "ru": "Конверсия в целевое действие"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "contribution_per_account",
          "name": {
            "en": "Contribution per assigned account",
            "ru": "Маржинальный вклад на назначенный аккаунт"
          },
          "unit": "currency/account",
          "direction": "higher"
        },
        {
          "id": "srm_p",
          "name": {
            "en": "Sample Ratio Mismatch p-value",
            "ru": "Диагностика распределения групп"
          },
          "unit": "probability",
          "direction": "descriptive"
        },
        {
          "id": "unfounded_claims",
          "name": {
            "en": "Unsupported material-claim count",
            "ru": "Неподтверждённые обещания"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "metric-qualified_conversion",
        "metric-contribution_per_account",
        "metric-srm_p",
        "metric-unfounded_claims"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ab_srm",
        "method-ab_metrics",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Sample size is not set: first fix baseline conversion, minimum detectable effect, power, alpha and outcome horizon. No measured model winner; scope draft_content_only.",
        "ru": "Размер выборки не задан: сначала зафиксировать базовую конверсию, минимальный различимый эффект, мощность, alpha и горизонт исхода. Это план рандомизированного A/B по аккаунтам. Размер групп рассчитывается после p0, MDE, alpha, power и горизонта. SRM проверяется до эффекта; не меняем знаменатель по post-treatment активности. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve contribution_per_account while monitoring refunds_complaints_unsubscribes. No measured impact yet.",
        "ru": "Увеличение полезных подписок и вклада на аккаунт после причинной проверки. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Draft content; publication is a separate action",
        "ru": "Подготовка черновика; публикация — отдельное действие"
      }
    },
    {
      "id": "hotido_economics",
      "projectId": "hotido",
      "lensId": "economics",
      "title": {
        "en": "Bid/no-bid and cash-flow analysis",
        "ru": "Bid/no-bid и кассовая устойчивость"
      },
      "task": {
        "en": "Separate conditional winning margin, preparation cost and payment timing. Show defensible scenarios and break-even conditions without inventing win probabilities.",
        "ru": "Оправданы ли подготовка заявки и исполнение при заданных сценариях? Микроэкономика заявки: Раздельно margin if won, стоимость участия, cashflow и break-even p_win; неизвестные расходы не обнулены. Макро/внешние сценарии: Сценарии чувствительности с датой источника, без выдуманной вероятности победы."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Money reconciliation error observed = 0; Required cost-item coverage observed = 1; Worst declared-scenario contribution worst_declared_scenario ≥ owner_min_bid_contribution; Minimum projected cash balance worst_declared_scenario ≥ owner_min_cash_balance. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Полнота учёта расходов observed = 1 — Обязательный проверяемый инвариант.; Вклад в худшем заданном сценарии worst_declared_scenario ≥ owner_min_bid_contribution — Порог владельца для условной маржи; это policy floor, не нижняя граница прогнозной вероятности.; Минимальный денежный остаток сценария worst_declared_scenario ≥ owner_min_cash_balance — Минимально допустимый остаток или доступная кредитная линия задаётся отдельно.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_economics",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "cost_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_economics",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "worst_scenario_contribution",
          "statistic": "worst_declared_scenario",
          "comparison": "absolute",
          "operator": "gte",
          "value": null,
          "parameter": "owner_min_bid_contribution",
          "unit": "currency/business_unit",
          "status": "proposal",
          "rationale": "Порог владельца для условной маржи; это policy floor, не нижняя граница прогнозной вероятности.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_economics",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "cashflow_min",
          "statistic": "worst_declared_scenario",
          "comparison": "absolute",
          "operator": "gte",
          "value": null,
          "parameter": "owner_min_cash_balance",
          "unit": "currency",
          "status": "proposal",
          "rationale": "Минимально допустимый остаток или доступная кредитная линия задаётся отдельно.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_economics",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        },
        {
          "id": "cost_coverage",
          "name": {
            "en": "Required cost-item coverage",
            "ru": "Полнота учёта расходов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "contribution_per_unit",
          "name": {
            "en": "Contribution margin per unit",
            "ru": "Маржинальная прибыль на единицу"
          },
          "unit": "currency/business_unit",
          "direction": "higher"
        },
        {
          "id": "worst_scenario_contribution",
          "name": {
            "en": "Worst declared-scenario contribution",
            "ru": "Вклад в худшем заданном сценарии"
          },
          "unit": "currency/business_unit",
          "direction": "higher"
        },
        {
          "id": "cashflow_min",
          "name": {
            "en": "Minimum projected cash balance",
            "ru": "Минимальный денежный остаток сценария"
          },
          "unit": "currency",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "pareto",
        "session-cost",
        "api-equivalent",
        "macro-vintage",
        "metric-money_reconciliation_error",
        "metric-cost_coverage",
        "metric-contribution_per_unit",
        "metric-worst_scenario_contribution",
        "metric-cashflow_min"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ocds_releases",
        "method-vintages"
      ],
      "limitations": {
        "en": "Proposed pilot: 30 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 30 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Планируемая сумма закупки, award amount, выручка поставщика и выручка Hotido различаются. При неизвестном p_win показывать sensitivity / break-even, не EV как факт. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve expected contribution after bid cost, only with defensible p_win while monitoring working capital required. No measured impact yet.",
        "ru": "Меньше затрат на экономически неподходящие заявки и кассовых разрывов. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 30,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "одна заявка и её календарь денежных потоков"
        }
      }
    },
    {
      "id": "hotido_management",
      "projectId": "hotido",
      "lensId": "management",
      "title": {
        "en": "A current tender pack by the deadline",
        "ru": "Готовность пакета к сроку"
      },
      "task": {
        "en": "Track requirements, amendments, owners and unresolved questions. Prepare a current, traceable pack on time without treating readiness as submission authority.",
        "ru": "Сформирован ли актуальный пакет с владельцем каждого открытого вопроса? Контроль дедлайнов: Готовый checklist со ссылками и явным unresolved; корректный ближайший срок. Пересборка после исправления: Изменение обнаружено, затронутые материалы помечены и переданы на проверку."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Accepted task rate lower_one_sided_95 ≥ 0.9; Missed critical-deadline count observed = 0; Stale critical-source count observed = 0; Trace coverage observed = 1. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Доля принятых задач lower_one_sided_95 ≥ 0.9 — Предложенный floor подготовки пакета; не право отправлять заявку.; Пропущенные дедлайны observed = 0 — Обязательный проверяемый инвариант.; Критичные устаревшие источники observed = 0 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "accepted_task_rate",
          "statistic": "lower_one_sided_95",
          "comparison": "absolute",
          "operator": "gte",
          "value": 0.9,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный floor подготовки пакета; не право отправлять заявку.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_management",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "missed_deadlines",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_management",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "stale_critical_sources",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_management",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_management",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "missed_deadlines",
          "name": {
            "en": "Missed critical-deadline count",
            "ru": "Пропущенные дедлайны"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "stale_critical_sources",
          "name": {
            "en": "Stale critical-source count",
            "ru": "Критичные устаревшие источники"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "human_minutes",
          "name": {
            "en": "Human review minutes per accepted task",
            "ru": "Время участия человека"
          },
          "unit": "minutes/accepted_task",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "tasks-completed",
        "metric-accepted_task_rate",
        "metric-missed_deadlines",
        "metric-stale_critical_sources",
        "metric-trace_coverage",
        "metric-human_minutes"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ocds_releases",
        "method-wilson"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted on-time tender packs while monitoring invalid or stale submissions. No measured impact yet.",
        "ru": "Меньше пропущенных релевантных закупок и переподготовки. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "независимый procurement process / workflow"
        }
      }
    },
    {
      "id": "hotido_autonomy",
      "projectId": "hotido",
      "lensId": "autonomy",
      "title": {
        "en": "Autonomous collection and draft updates",
        "ru": "Автономный сбор и обновление черновиков"
      },
      "task": {
        "en": "Automate reversible updates from authorized sources. Preserve identifiers and evidence while routing ambiguous commitments to the existing review process.",
        "ru": "Какой заранее разрешённый scope можно доверить контуру после проверки? Обновление частной карточки: Версии сохранены, side effects идемпотентны, доказательства доступны. Неоднозначность и устаревание: Не сделано ложное слияние или неподтверждённая отправка; сформирован review item."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Critical violation count observed = 0; Replay integrity rate observed = 1; Trace coverage observed = 1; Budget-contract violation count observed = 0; Critical-event upper 95% bound one_sided_95_upper ≤ 0.01. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Критичные нарушения observed = 0 — Обязательный проверяемый инвариант.; Восстановление без потерь и повторных эффектов observed = 1 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; Нарушения согласованного лимита observed = 0 — Обязательный проверяемый инвариант.; Верхняя граница частоты критичных ошибок one_sided_95_upper ≤ 0.01 — Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "critical_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_autonomy",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "replay_integrity",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_autonomy",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_autonomy",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "budget_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_autonomy",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "critical_risk_upper95",
          "statistic": "one_sided_95_upper",
          "comparison": "absolute",
          "operator": "lte",
          "value": 0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.",
          "grantsScope": "bounded_pre_authorized_only",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "method-exact_binomial"
          ],
          "source": {
            "sliceId": "hotido_autonomy",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design",
              "exact_binomial"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "accepted_without_intervention",
          "name": {
            "en": "Accepted without intervention rate",
            "ru": "Принято без вмешательства"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "critical_violations",
          "name": {
            "en": "Critical violation count",
            "ru": "Критичные нарушения"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "critical_risk_upper95",
          "name": {
            "en": "Critical-event upper 95% bound",
            "ru": "Верхняя граница частоты критичных ошибок"
          },
          "unit": "fraction",
          "direction": "lower"
        },
        {
          "id": "replay_integrity",
          "name": {
            "en": "Replay integrity rate",
            "ru": "Восстановление без потерь и повторных эффектов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "budget_violations",
          "name": {
            "en": "Budget-contract violation count",
            "ru": "Нарушения согласованного лимита"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "risk-scope",
        "ifbench",
        "metric-accepted_without_intervention",
        "metric-critical_violations",
        "metric-critical_risk_upper95",
        "metric-replay_integrity",
        "metric-trace_coverage",
        "metric-budget_violations"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-exact_binomial"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope bounded_pre_authorized_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. 60 — план fault-suite, а не 60 репрезентативных iid наблюдений. Порог не выдаёт новых полномочий. Существующие разрешения определяет отдельная политика владельца. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted_without_intervention while monitoring critical_violations. No measured impact yet.",
        "ru": "Больше проверенных обновлений без ручного мониторинга при сохранении контроля обязательств. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Only within an explicitly authorized scope and budget",
        "ru": "Только в заранее разрешённых пределах действий и бюджета"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "эпизод с фиксированным набором полномочий"
        }
      }
    },
    {
      "id": "hotido_self_improvement",
      "projectId": "hotido",
      "lensId": "self_improvement",
      "title": {
        "en": "Better extraction without corrupting the registry",
        "ru": "Обучение извлечения без порчи реестра"
      },
      "task": {
        "en": "Evaluate changes on unseen companies, templates and procurement releases. Improve accepted evidence-backed records without hiding difficult fields or false merges.",
        "ru": "Можно ли продвинуть новую версию на следующий этап без скрытой регрессии? Новая версия извлечения: Версионированный кандидат с проверяемым diff. Оценка на новых компаниях и датах: Полнота фактов и критичные поля сохранены; новые связи подтверждены."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the paired 95% confidence interval for ΔAccepted task rate (Accepted task rate; candidate − FROZEN baseline) ≥ -0.01; Material regression count observed = 0; Protected-holdout exposure count observed = 0; Experiment manifest coverage observed = 1; Independent reproduction rate observed = 1. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница парного 95%-го доверительного интервала для Δ«Доля принятых задач» (Доля принятых задач; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ -0.01 — Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.; Критичные регрессии observed = 0 — Обязательный проверяемый инвариант.; Раскрытия контрольной выборки observed = 0 — Обязательный проверяемый инвариант.; Полнота манифестов observed = 1 — Обязательный проверяемый инвариант.; Независимое воспроизведение observed = 1 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "accepted_task_rate",
          "statistic": "lower_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": -0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_self_improvement",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "material_regressions",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_self_improvement",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "protected_holdout_access",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_self_improvement",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "manifest_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_self_improvement",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "reproduction_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "hotido_self_improvement",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "field_macro_f1",
          "name": {
            "en": "Macro field F1",
            "ru": "Средний F1 типов полей"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "cost_per_accepted",
          "name": {
            "en": "Cost per accepted unique task",
            "ru": "Стоимость принятой задачи"
          },
          "unit": "currency/accepted_task",
          "direction": "lower"
        },
        {
          "id": "material_regressions",
          "name": {
            "en": "Material regression count",
            "ru": "Критичные регрессии"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "protected_holdout_access",
          "name": {
            "en": "Protected-holdout exposure count",
            "ru": "Раскрытия контрольной выборки"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "manifest_coverage",
          "name": {
            "en": "Experiment manifest coverage",
            "ru": "Полнота манифестов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "reproduction_rate",
          "name": {
            "en": "Independent reproduction rate",
            "ru": "Независимое воспроизведение"
          },
          "unit": "fraction",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "coding-agent-index",
        "aider-polyglot",
        "swe-bench",
        "openness-index",
        "improvement",
        "metric-field_macro_f1",
        "metric-accepted_task_rate",
        "metric-cost_per_accepted",
        "metric-material_regressions",
        "metric-protected_holdout_access",
        "metric-manifest_coverage",
        "metric-reproduction_rate"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-leakage",
        "method-paired_bootstrap",
        "method-ocds_ids"
      ],
      "limitations": {
        "en": "Proposed pilot: 120 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope candidate_branch_then_shadow.",
        "ru": "План пилота: 120 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Защитный gate по acceptance дополняется lower95 Δcritical-field exact-match >= -0.01; источники остаются обязательными. Macro F1 нельзя улучшать удалением трудных полей. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve field_macro_f1 while monitoring material_regressions. No measured impact yet.",
        "ru": "Меньше ручных исправлений на принятую карточку при сохранении доказательств. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Candidate branch, then shadow evaluation",
        "ru": "Отдельная ветка кандидата, затем теневая проверка"
      },
      "pilot": {
        "independentUnits": 120,
        "repetitions": 3,
        "unit": {
          "en": "independent procurement/company",
          "ru": "company/procurement cluster"
        }
      }
    },
    {
      "id": "finedg_probability",
      "projectId": "finedg",
      "lensId": "probability",
      "title": {
        "en": "Calibrated research forecasts",
        "ru": "Калиброванные исследовательские прогнозы"
      },
      "task": {
        "en": "Evaluate fixed-horizon probabilities after their outcomes become observable. Beat a past-only baseline out of sample; forecast skill alone does not establish trading profitability.",
        "ru": "Отличается ли вероятностный прогноз от простого baseline на будущих исходах? Бинарное событие на фиксированном горизонте: p события записана до исхода; outcome дозревает независимо от прогноза. Макросценарии: Полный вектор вероятностей либо явно субъективные stress weights; статус calibration unknown до исходов."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Upper bound of the block-paired 95% confidence interval for ΔBrier (Binary event Brier; candidate − FROZEN baseline) < 0; Data-leakage count observed = 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Верхняя граница блочного парного 95%-го доверительного интервала для ΔBrier (Brier бинарного события; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) < 0 — Предложение: улучшение относительно rolling base-rate, рассчитанного только на прошлом. Это ещё не прибыльная стратегия.; Случаи утечки данных observed = 0 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "brier_binary",
          "statistic": "upper_block_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "lt",
          "value": 0,
          "parameter": null,
          "unit": "squared_probability",
          "status": "proposal",
          "rationale": "Предложение: улучшение относительно rolling base-rate, рассчитанного только на прошлом. Это ещё не прибыльная стратегия.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_probability",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "leakage_count",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_probability",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "brier_binary",
          "name": {
            "en": "Binary event Brier",
            "ru": "Brier бинарного события"
          },
          "unit": "squared_probability",
          "direction": "lower"
        },
        {
          "id": "brier_multiclass",
          "name": {
            "en": "Multiclass vector Brier",
            "ru": "Brier полного вектора классов"
          },
          "unit": "squared_probability_sum",
          "direction": "lower"
        },
        {
          "id": "calibration_profile",
          "name": {
            "en": "Reliability diagram",
            "ru": "Калибровочная диаграмма"
          },
          "unit": "bin_probabilities",
          "direction": "descriptive"
        },
        {
          "id": "leakage_count",
          "name": {
            "en": "Data-leakage count",
            "ru": "Случаи утечки данных"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "decision-index",
        "decision-score",
        "jev-decision",
        "metric-brier_binary",
        "metric-brier_multiclass",
        "metric-calibration_profile",
        "metric-leakage_count"
      ],
      "configIds": [
        "rules-only",
        "decision-glide",
        "decision-drex",
        "decision-mammoth",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-brier",
        "method-calibration",
        "method-paired_bootstrap",
        "method-vintages"
      ],
      "limitations": {
        "en": "Proposed pilot: 200 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 200 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Повторные запросы на одном snapshot не добавляют рыночных исходов. Перекрывающиеся горизонты и инструменты одного дня группируются в блоки; block size фиксируется с учётом зависимости. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve out-of-sample forecast loss while monitoring after-cost strategy performance and drawdown. No measured impact yet.",
        "ru": "Более информативная оценка неопределённости исследования, если подтверждена вне настройки. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 200,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "неперекрывающийся прогноз либо market time-block"
        }
      }
    },
    {
      "id": "finedg_higher_math",
      "projectId": "finedg",
      "lensId": "higher_math",
      "title": {
        "en": "Correct numerical mechanics",
        "ru": "Корректная численная механика"
      },
      "task": {
        "en": "Verify PnL, fees, fills, units, exposure constraints and numerical stability. Pass independent calculation and PAPER invariants before evaluating strategy performance.",
        "ru": "Верны ли расчёты и ограничения до статистической оценки стратегии? PnL и стоимость исполнения: Точные денежные и размерные результаты, включая крайние случаи. Риск и оптимизация: Численно устойчивый результат; constraints соблюдены; неопределённая матрица/нулевой знаменатель обработаны."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Numerical oracle pass rate observed = 1; Feasible solution rate observed = 1; Money reconciliation error observed = 0; PAPER execution invariant failures observed = 0. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Точность расчётных примеров observed = 1 — Обязательный проверяемый инвариант.; Соблюдение ограничений observed = 1 — Обязательный проверяемый инвариант.; Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Ошибки PAPER-исполнения observed = 0 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "numeric_case_pass",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_higher_math",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "feasible_solution_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_higher_math",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_higher_math",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "paper_errors",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_higher_math",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "numeric_case_pass",
          "name": {
            "en": "Numerical oracle pass rate",
            "ru": "Точность расчётных примеров"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "feasible_solution_rate",
          "name": {
            "en": "Feasible solution rate",
            "ru": "Соблюдение ограничений"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        },
        {
          "id": "paper_errors",
          "name": {
            "en": "PAPER execution invariant failures",
            "ru": "Ошибки PAPER-исполнения"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "terminalbench",
        "metric-numeric_case_pass",
        "metric-feasible_solution_rate",
        "metric-money_reconciliation_error",
        "metric-paper_errors"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "limitations": {
        "en": "Proposed pilot: 40 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 40 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted calculation fixtures while monitoring execution/risk invariant failures. No measured impact yet.",
        "ru": "Снижение ошибок реализации и некорректного сравнения стратегий. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 40,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "независимый расчётный fixture"
        }
      }
    },
    {
      "id": "finedg_data_science",
      "projectId": "finedg",
      "lensId": "data_science",
      "title": {
        "en": "Backtests without future leakage",
        "ru": "Бэктест без утечки будущего"
      },
      "task": {
        "en": "Use chronological splits, point-in-time data and documented search history. Reproduce after-cost research on data actually available at the decision time.",
        "ru": "Воспроизводится ли исследование на данных, которые были доступны в момент решения? Подготовка и разделение данных: Временные train/calibration/OOS границы и leakage audit; преобразования fit только на прошлом. Воспроизведение исследования: Совпадающий отчёт и независимый прогон; результаты после издержек с зависимостью временного ряда."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Data-leakage count observed = 0; Independent reproduction rate observed = 1; Experiment manifest coverage observed = 1. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Случаи утечки данных observed = 0 — Обязательный проверяемый инвариант.; Независимое воспроизведение observed = 1 — Обязательный проверяемый инвариант.; Полнота манифестов observed = 1 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "leakage_count",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_data_science",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "reproduction_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_data_science",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "manifest_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_data_science",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "leakage_count",
          "name": {
            "en": "Data-leakage count",
            "ru": "Случаи утечки данных"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "reproduction_rate",
          "name": {
            "en": "Independent reproduction rate",
            "ru": "Независимое воспроизведение"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "manifest_coverage",
          "name": {
            "en": "Experiment manifest coverage",
            "ru": "Полнота манифестов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "oos_net_return",
          "name": {
            "en": "Out-of-sample net return",
            "ru": "Доходность вне периода настройки"
          },
          "unit": "fraction",
          "direction": "descriptive"
        },
        {
          "id": "max_drawdown",
          "name": {
            "en": "Maximum drawdown",
            "ru": "Максимальная просадка"
          },
          "unit": "fraction",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "analyst",
        "long-context",
        "metric-leakage_count",
        "metric-reproduction_rate",
        "metric-manifest_coverage",
        "metric-oos_net_return",
        "metric-max_drawdown"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-leakage",
        "method-vintages",
        "method-backtest",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Proposed pilot: 30 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 30 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. 30 — пилотные исследования, не 30 независимых доходностей. Нет правила «положительный OOS значит допуск live». Purge/embargo определяется горизонтом меток и доступностью признаков, а не магическим числом. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve cost per reproducible research run while monitoring OOS degradation and drawdown. No measured impact yet.",
        "ru": "Меньше ложных исследовательских выводов и бесполезных PAPER-запусков. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 30,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "strategy family × chronological market block"
        }
      }
    },
    {
      "id": "finedg_marketing",
      "projectId": "finedg",
      "lensId": "marketing",
      "title": {
        "en": "Software, installation and PAPER-pilot offers",
        "ru": "Продажа ПО, установки и PAPER-пилота"
      },
      "task": {
        "en": "Test claims and conversion within separate product cohorts. Measure suitable paying customers without making unsupported return promises.",
        "ru": "Какой проверенный оффер привлекает подходящего платящего клиента? Материалы трёх продуктов: Чёткий оффер и CTA без неподтверждённой доходности. Эксперимент внутри продукта: Измерена квалификация, демонстрация и дозревшая оплата; разные продукты не объединены в один причинный тест."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the cluster 95% confidence interval for ΔQualified conversion rate (Qualified conversion rate; candidate − FROZEN baseline) ≥ pre_registered_minimum_conversion_lift; Lower bound of the cluster 95% confidence interval for ΔContribution per assigned account (Contribution per assigned account; candidate − FROZEN baseline) ≥ 0; Unsupported material-claim count observed = 0. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница кластерного 95%-го доверительного интервала для Δ«Конверсия в целевое действие» (Конверсия в целевое действие; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ pre_registered_minimum_conversion_lift — Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.; Нижняя граница кластерного 95%-го доверительного интервала для Δ«Маржинальный вклад на назначенный аккаунт» (Маржинальный вклад на назначенный аккаунт; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ 0 — Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.; Неподтверждённые обещания observed = 0 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "qualified_conversion",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": null,
          "parameter": "pre_registered_minimum_conversion_lift",
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Порог практического эффекта фиксируется до запуска; без MDE/базы gate не вычисляется.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_marketing",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "contribution_per_account",
          "statistic": "lower_cluster_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": 0,
          "parameter": null,
          "unit": "currency/account",
          "status": "proposal",
          "rationale": "Дозревший маржинальный вклад на назначенный аккаунт не хуже контроля.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_marketing",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "unfounded_claims",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_marketing",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "qualified_conversion",
          "name": {
            "en": "Qualified conversion rate",
            "ru": "Конверсия в целевое действие"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "contribution_per_account",
          "name": {
            "en": "Contribution per assigned account",
            "ru": "Маржинальный вклад на назначенный аккаунт"
          },
          "unit": "currency/account",
          "direction": "higher"
        },
        {
          "id": "srm_p",
          "name": {
            "en": "Sample Ratio Mismatch p-value",
            "ru": "Диагностика распределения групп"
          },
          "unit": "probability",
          "direction": "descriptive"
        },
        {
          "id": "unfounded_claims",
          "name": {
            "en": "Unsupported material-claim count",
            "ru": "Неподтверждённые обещания"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "metric-qualified_conversion",
        "metric-contribution_per_account",
        "metric-srm_p",
        "metric-unfounded_claims"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-ab_srm",
        "method-ab_metrics",
        "method-paired_bootstrap"
      ],
      "limitations": {
        "en": "Sample size is not set: first fix baseline conversion, minimum detectable effect, power, alpha and outcome horizon. No measured model winner; scope draft_content_only.",
        "ru": "Размер выборки не задан: сначала зафиксировать базовую конверсию, минимальный различимый эффект, мощность, alpha и горизонт исхода. Это план рандомизированного A/B по аккаунтам. Размер групп рассчитывается после p0, MDE, alpha, power и горизонта. SRM проверяется до эффекта; не меняем знаменатель по post-treatment активности. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve contribution_per_account while monitoring refunds_complaints_unsubscribes. No measured impact yet.",
        "ru": "Рост вклада от подходящих клиентов при сохранении честных ожиданий. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Draft content; publication is a separate action",
        "ru": "Подготовка черновика; публикация — отдельное действие"
      }
    },
    {
      "id": "finedg_economics",
      "projectId": "finedg",
      "lensId": "economics",
      "title": {
        "en": "Product economics and external scenarios",
        "ru": "Экономика продукта и внешние режимы"
      },
      "task": {
        "en": "Separate subscription economics from trading PnL and macro stress assumptions. Evaluate contribution and cash flow using complete costs and historical data vintages.",
        "ru": "Выдерживают ли продукт и исследование расходы и заданные сценарии? Микроэкономика FinEdg: Раздельные MRR/разовая выручка, вклад на клиент-месяц и фактический cashflow. Макро/as-of сценарии: Чувствительность при фиксированных условиях; stress scenario не выдан за вероятностный прогноз."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Required cost-item coverage observed = 1; Money reconciliation error observed = 0; Stale critical-source count observed = 0; Contribution margin per unit scenario_point ≥ owner_product_contribution_floor. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Полнота учёта расходов observed = 1 — Обязательный проверяемый инвариант.; Расхождение денежных расчётов observed = 0 — Обязательный проверяемый инвариант.; Критичные устаревшие источники observed = 0 — Обязательный проверяемый инвариант.; Маржинальная прибыль на единицу scenario_point ≥ owner_product_contribution_floor — Минимальная маржа продукта задаётся владельцем; историческая торговая PnL сюда не смешивается.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "cost_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_economics",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "money_reconciliation_error",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "minor_currency_units",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_economics",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "stale_critical_sources",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_economics",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "contribution_per_unit",
          "statistic": "scenario_point",
          "comparison": "absolute",
          "operator": "gte",
          "value": null,
          "parameter": "owner_product_contribution_floor",
          "unit": "currency/business_unit",
          "status": "proposal",
          "rationale": "Минимальная маржа продукта задаётся владельцем; историческая торговая PnL сюда не смешивается.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_economics",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "cost_coverage",
          "name": {
            "en": "Required cost-item coverage",
            "ru": "Полнота учёта расходов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "money_reconciliation_error",
          "name": {
            "en": "Money reconciliation error",
            "ru": "Расхождение денежных расчётов"
          },
          "unit": "minor_currency_units",
          "direction": "lower"
        },
        {
          "id": "contribution_per_unit",
          "name": {
            "en": "Contribution margin per unit",
            "ru": "Маржинальная прибыль на единицу"
          },
          "unit": "currency/business_unit",
          "direction": "higher"
        },
        {
          "id": "cashflow_min",
          "name": {
            "en": "Minimum projected cash balance",
            "ru": "Минимальный денежный остаток сценария"
          },
          "unit": "currency",
          "direction": "higher"
        },
        {
          "id": "stale_critical_sources",
          "name": {
            "en": "Stale critical-source count",
            "ru": "Критичные устаревшие источники"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "pareto",
        "session-cost",
        "api-equivalent",
        "macro-vintage",
        "metric-cost_coverage",
        "metric-money_reconciliation_error",
        "metric-contribution_per_unit",
        "metric-cashflow_min",
        "metric-stale_critical_sources"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-vintages"
      ],
      "limitations": {
        "en": "Proposed pilot: 24 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 24 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. Не считать LTV бесконечным при нулевом/неизвестном churn. Тариф и вероятность прибыльной сделки — разные модели. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve contribution per paying client-month while monitoring cashflow and support load. No measured impact yet.",
        "ru": "Прозрачная маржа услуг и подписок, отдельный контроль чувствительности исследований. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 24,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "product cohort-month / заданный as-of scenario"
        }
      }
    },
    {
      "id": "finedg_management",
      "projectId": "finedg",
      "lensId": "management",
      "title": {
        "en": "A reproducible research workflow",
        "ru": "Воспроизводимый исследовательский процесс"
      },
      "task": {
        "en": "Record hypotheses, all trials, data windows, decisions and PAPER incidents. Make every accepted research conclusion reproducible and attributable.",
        "ru": "Можно ли понять, почему эксперимент запущен, что изменилось и кто принял вывод? Реестр экспериментов: Task/experiment lineage, owner, критерии и записи принятых/отклонённых результатов. Отчёт PAPER-наблюдения: События не потеряны; проблема данных отделена от качества стратегии."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Experiment manifest coverage observed = 1; Trace coverage observed = 1; Independent reproduction rate observed = 1; Orphaned-episode count observed = 0. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Полнота манифестов observed = 1 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; Независимое воспроизведение observed = 1 — Обязательный проверяемый инвариант.; Задачи без конечного состояния observed = 0 — Обязательный проверяемый инвариант.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "manifest_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_management",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_management",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "reproduction_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_management",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "orphaned_episodes",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_management",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "manifest_coverage",
          "name": {
            "en": "Experiment manifest coverage",
            "ru": "Полнота манифестов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "reproduction_rate",
          "name": {
            "en": "Independent reproduction rate",
            "ru": "Независимое воспроизведение"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "orphaned_episodes",
          "name": {
            "en": "Orphaned-episode count",
            "ru": "Задачи без конечного состояния"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "p95_completion",
          "name": {
            "en": "p95 time to accepted completion",
            "ru": "95-й процентиль завершения"
          },
          "unit": "seconds",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "tasks-completed",
        "metric-manifest_coverage",
        "metric-trace_coverage",
        "metric-reproduction_rate",
        "metric-orphaned_episodes",
        "metric-p95_completion"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-backtest"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope sandbox_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана.  Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve human_minutes per accepted research run while monitoring unlogged strategy trials. No measured impact yet.",
        "ru": "Меньше повторения неудачных гипотез и ручной сборки отчётов. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Isolated evaluation environment",
        "ru": "Изолированная среда испытаний"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "независимое исследовательское workflow"
        }
      }
    },
    {
      "id": "finedg_autonomy",
      "projectId": "finedg",
      "lensId": "autonomy",
      "title": {
        "en": "Autonomous research and PAPER",
        "ru": "Автономное исследование и PAPER"
      },
      "task": {
        "en": "Evaluate a research assistant around a deterministic execution and risk layer. Automate authorized research stages without inferring live-trading authority from model scores.",
        "ru": "Какой заранее разрешённый scope можно доверить контуру после проверки? Подготовка PAPER-эксперимента: Воспроизводимый запуск, лимиты и расчёты неизменны. Ошибки входов и повторные события: Ордера/эффекты не дублируются; инструментальный risk engine удерживает согласованные ограничения."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Critical violation count observed = 0; Replay integrity rate observed = 1; Trace coverage observed = 1; Budget-contract violation count observed = 0; Critical-event upper 95% bound one_sided_95_upper ≤ 0.01. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Критичные нарушения observed = 0 — Обязательный проверяемый инвариант.; Восстановление без потерь и повторных эффектов observed = 1 — Обязательный проверяемый инвариант.; Полнота связанного журнала observed = 1 — Обязательный проверяемый инвариант.; Нарушения согласованного лимита observed = 0 — Обязательный проверяемый инвариант.; Верхняя граница частоты критичных ошибок one_sided_95_upper ≤ 0.01 — Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "critical_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_autonomy",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "replay_integrity",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_autonomy",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "trace_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_autonomy",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "budget_violations",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_autonomy",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "critical_risk_upper95",
          "statistic": "one_sided_95_upper",
          "comparison": "absolute",
          "operator": "lte",
          "value": 0.01,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенный gate для узких обратимых действий: 0/299 независимых репрезентативных эпизодов достаточно по точной формуле; fault-suite отдельно. Риск <1% не универсально приемлем.",
          "grantsScope": "bounded_pre_authorized_only",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "method-exact_binomial"
          ],
          "source": {
            "sliceId": "finedg_autonomy",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design",
              "exact_binomial"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "accepted_without_intervention",
          "name": {
            "en": "Accepted without intervention rate",
            "ru": "Принято без вмешательства"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "critical_violations",
          "name": {
            "en": "Critical violation count",
            "ru": "Критичные нарушения"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "critical_risk_upper95",
          "name": {
            "en": "Critical-event upper 95% bound",
            "ru": "Верхняя граница частоты критичных ошибок"
          },
          "unit": "fraction",
          "direction": "lower"
        },
        {
          "id": "replay_integrity",
          "name": {
            "en": "Replay integrity rate",
            "ru": "Восстановление без потерь и повторных эффектов"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "trace_coverage",
          "name": {
            "en": "Trace coverage",
            "ru": "Полнота связанного журнала"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "budget_violations",
          "name": {
            "en": "Budget-contract violation count",
            "ru": "Нарушения согласованного лимита"
          },
          "unit": "count",
          "direction": "lower"
        }
      ],
      "benchmarkIds": [
        "automationbench",
        "risk-scope",
        "ifbench",
        "metric-accepted_without_intervention",
        "metric-critical_violations",
        "metric-critical_risk_upper95",
        "metric-replay_integrity",
        "metric-trace_coverage",
        "metric-budget_violations"
      ],
      "configIds": [
        "rules-only",
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "hermes-ds41f",
        "router-worker-reviewer"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-exact_binomial"
      ],
      "limitations": {
        "en": "Proposed pilot: 60 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope bounded_pre_authorized_only.",
        "ru": "План пилота: 60 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. 60 — план fault-suite, а не 60 репрезентативных iid наблюдений. Порог не выдаёт новых полномочий. Существующие разрешения определяет отдельная политика владельца. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve accepted_without_intervention while monitoring critical_violations. No measured impact yet.",
        "ru": "Больше воспроизводимых исследований без постоянного ручного запуска; это не передача торговли LLM. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Only within an explicitly authorized scope and budget",
        "ru": "Только в заранее разрешённых пределах действий и бюджета"
      },
      "pilot": {
        "independentUnits": 60,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "эпизод с фиксированным набором полномочий"
        }
      }
    },
    {
      "id": "finedg_self_improvement",
      "projectId": "finedg",
      "lensId": "self_improvement",
      "title": {
        "en": "Improve the researcher without overfitting",
        "ru": "Улучшение исследователя без переобучения"
      },
      "task": {
        "en": "Keep development, protected evaluation and promotion separate. Validate candidates on untouched chronological evidence and preserve the complete trial registry.",
        "ru": "Можно ли продвинуть новую версию на следующий этап без скрытой регрессии? Кандидат стратегии/аналитического кода: Версия кандидата, лог всех попыток и неизменные критерии. Независимая проверка: Корректная OOS-оценка, все критичные расчёты и лимиты сохранены; нет саморазрешения live."
      },
      "acceptance": {
        "en": "Proposed gates, to freeze before running: Lower bound of the paired 95% confidence interval for ΔAccepted task rate (Accepted task rate; candidate − FROZEN baseline) ≥ 0; Material regression count observed = 0; Protected-holdout exposure count observed = 0; Experiment manifest coverage observed = 1; Independent reproduction rate observed = 1. Freeze the baseline identity, version/hash and comparison protocol before any run; without them the comparative gate is not assessed. Insufficient data: not assessed.",
        "ru": "Предлагаемые критерии, закрепить до запуска: Нижняя граница парного 95%-го доверительного интервала для Δ«Доля принятых задач» (Доля принятых задач; кандидат − ЗАРАНЕЕ ЗАФИКСИРОВАННЫЙ baseline) ≥ 0 — Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.; Критичные регрессии observed = 0 — Обязательный проверяемый инвариант.; Раскрытия контрольной выборки observed = 0 — Обязательный проверяемый инвариант.; Полнота манифестов observed = 1 — Обязательный проверяемый инвариант.; Независимое воспроизведение observed = 1 — Обязательный проверяемый инвариант.. До любого запуска зафиксируйте идентичность baseline, версию/хеш и протокол сравнения; без них сравнительный критерий не оценён. При нехватке данных: не оценено."
      },
      "acceptanceGates": [
        {
          "metricId": "accepted_task_rate",
          "statistic": "lower_paired_95",
          "comparison": "candidate_minus_baseline",
          "operator": "gte",
          "value": 0,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Предложенная граница не меньшей эффективности; допустимый ущерб фиксируется до проверки.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_self_improvement",
            "admissionThresholdIndex": 0,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": {
            "identity": null,
            "versionOrHash": null,
            "status": "needs-pin",
            "freezeBeforeRun": true
          }
        },
        {
          "metricId": "material_regressions",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_self_improvement",
            "admissionThresholdIndex": 1,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "protected_holdout_access",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 0,
          "parameter": null,
          "unit": "count",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_self_improvement",
            "admissionThresholdIndex": 2,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "manifest_coverage",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_self_improvement",
            "admissionThresholdIndex": 3,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        },
        {
          "metricId": "reproduction_rate",
          "statistic": "observed",
          "comparison": "absolute",
          "operator": "eq",
          "value": 1,
          "parameter": null,
          "unit": "fraction",
          "status": "proposal",
          "rationale": "Обязательный проверяемый инвариант.",
          "grantsScope": "shadow",
          "onInsufficientData": "not_assessed",
          "sourceIds": [
            "own-protocol"
          ],
          "source": {
            "sliceId": "finedg_self_improvement",
            "admissionThresholdIndex": 4,
            "originalSourceIds": [
              "design"
            ]
          },
          "baseline": null
        }
      ],
      "metrics": [
        {
          "id": "reproduction_rate",
          "name": {
            "en": "Independent reproduction rate",
            "ru": "Независимое воспроизведение"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "accepted_task_rate",
          "name": {
            "en": "Accepted task rate",
            "ru": "Доля принятых задач"
          },
          "unit": "fraction",
          "direction": "higher"
        },
        {
          "id": "cost_per_accepted",
          "name": {
            "en": "Cost per accepted unique task",
            "ru": "Стоимость принятой задачи"
          },
          "unit": "currency/accepted_task",
          "direction": "lower"
        },
        {
          "id": "material_regressions",
          "name": {
            "en": "Material regression count",
            "ru": "Критичные регрессии"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "protected_holdout_access",
          "name": {
            "en": "Protected-holdout exposure count",
            "ru": "Раскрытия контрольной выборки"
          },
          "unit": "count",
          "direction": "lower"
        },
        {
          "id": "manifest_coverage",
          "name": {
            "en": "Experiment manifest coverage",
            "ru": "Полнота манифестов"
          },
          "unit": "fraction",
          "direction": "higher"
        }
      ],
      "benchmarkIds": [
        "coding-agent-index",
        "aider-polyglot",
        "swe-bench",
        "openness-index",
        "improvement",
        "metric-reproduction_rate",
        "metric-accepted_task_rate",
        "metric-cost_per_accepted",
        "metric-material_regressions",
        "metric-protected_holdout_access",
        "metric-manifest_coverage"
      ],
      "configIds": [
        "codex-sol-max",
        "codex-terra-xhigh",
        "dsh-ds41f",
        "dsh-minimax31f",
        "aider-ds41f",
        "aider-minimax31f",
        "opencode-ds41f",
        "opencode-minimax31f",
        "oh-my-pi-ds41f",
        "oh-my-pi-minimax31f",
        "pi-ds41f",
        "pi-minimax31f",
        "claude-native"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol",
        "method-leakage",
        "method-paired_bootstrap",
        "method-backtest",
        "method-vintages"
      ],
      "limitations": {
        "en": "Proposed pilot: 30 independent units × 3 repetitions. A design starting point, not a power claim or completed work. No measured model winner; scope candidate_branch_then_shadow.",
        "ru": "План пилота: 30 независимых единиц × 3 повтора. Пилотный объём для обнаружения проблем, не доказанная мощность и не факт запуска. Promotion требует отдельного precision/power плана. После просмотра финального holdout он становится использованным; дальнейшая настройка требует новой контрольной выборки либо заранее предусмотренной sequential/multiplicity процедуры. Улучшение исторической PnL не достаточно для promotion. Текущая готовность не оценена."
      },
      "businessEffect": {
        "en": "Hypothesis: improve reproduction_rate while monitoring material_regressions. No measured impact yet.",
        "ru": "Улучшение качества исследовательского контура с контролем поиска и утечек. Эффект пока не измерен."
      },
      "proposedScope": {
        "en": "Candidate branch, then shadow evaluation",
        "ru": "Отдельная ветка кандидата, затем теневая проверка"
      },
      "pilot": {
        "independentUnits": 30,
        "repetitions": 3,
        "unit": {
          "en": "independent time/research block",
          "ru": "strategy family × untouched time-block"
        }
      }
    }
  ],
  "benchmarks": [
    {
      "id": "decision-index",
      "en": "AA Decision Index v2",
      "ru": "Индекс принятия решений AA v2",
      "family": "decision",
      "measures": {
        "en": "A weighted assessment of structured decisions, confidence and invariance.",
        "ru": "Взвешенная оценка структурированных решений, уверенности и устойчивости выбора."
      },
      "influences": {
        "en": "A research lead for routing, classification and extraction. Freeze the component version.",
        "ru": "Ориентир для маршрутизации, классификации и извлечения. Фиксируйте версию компонентов."
      },
      "limitation": {
        "en": "Five Decision Scores plus 15% Symmetry. It is not a project success probability or the Jev scale.",
        "ru": "Пять Decision Scores и 15% Symmetry. Это не вероятность успеха проекта и не шкала Jev."
      },
      "sourceIds": [
        "aa-decision-method"
      ],
      "unit": "0–100"
    },
    {
      "id": "decision-score",
      "en": "Decision Score",
      "ru": "Оценка правильности и уверенности",
      "family": "decision",
      "measures": {
        "en": "For a matching evaluation: 50 × (1 + accuracy − mean((p − c)²)); c is chosen-answer correctness.",
        "ru": "Для соответствующей оценки: 50 × (1 + accuracy − mean((p − c)²)); c — правильность выбранного ответа."
      },
      "influences": {
        "en": "Penalizes confident mistakes; accuracy is a fraction from 0 to 1.",
        "ru": "Штрафует уверенные ошибки; accuracy задаётся долей от 0 до 1."
      },
      "limitation": {
        "en": "This component formula does not reconstruct the full v2 index. Ground truth is required.",
        "ru": "Формула компонента не восстанавливает весь индекс v2. Нужна известная истина."
      },
      "sourceIds": [
        "aa-decision-method"
      ],
      "unit": "0–100"
    },
    {
      "id": "jev-decision",
      "en": "Jev Decision Index 0.4.1",
      "ru": "Индекс решений Jev: Public и Full",
      "family": "decision",
      "measures": {
        "en": "Separate public reproduction and private Full evaluation; Public adjusts for chance.",
        "ru": "Раздельные публичный воспроизводимый тест и закрытая оценка Full; Public учитывает случайное угадывание."
      },
      "influences": {
        "en": "Use the public kit to test exact engines with pinned data and protocol.",
        "ru": "Публичный комплект пригоден для проверки конкретных движков с закреплёнными данными и протоколом."
      },
      "limitation": {
        "en": "Full uses 60% private same-skills and 40% private new-domain tests. Public is not a reproduction of Full.",
        "ru": "Full включает 60% закрытых тестов тех же навыков и 40% закрытых задач новых областей. Public не воспроизводит Full."
      },
      "sourceIds": [
        "jev-kit",
        "jev-board",
        "jev-method"
      ],
      "unit": "versioned score"
    },
    {
      "id": "openness-index",
      "en": "AA Openness Index",
      "ru": "Индекс открытости ИИ-модели",
      "family": "openness",
      "measures": {
        "en": "Access to weights, licenses and transparency of data, methodology and training code.",
        "ru": "Доступность весов, лицензии и прозрачность данных, методологии и кода обучения."
      },
      "influences": {
        "en": "Helps assess self-hosting, reproducibility and supplier dependence.",
        "ru": "Помогает оценить самостоятельное размещение, воспроизводимость и зависимость от поставщика."
      },
      "limitation": {
        "en": "V1.0 normalizes raw points by 18. Openness does not establish accuracy, hardware fit or commercial permission by itself.",
        "ru": "V1.0 нормирует сумму баллов на 18. Открытость сама по себе не доказывает точность, пригодность сервера или коммерческие права."
      },
      "sourceIds": [
        "aa-openness-method",
        "aa-openness-spec"
      ],
      "unit": "0–100"
    },
    {
      "id": "automationbench",
      "en": "AutomationBench-AA Score",
      "ru": "Выполнение целей с соблюдением ограничений",
      "family": "agents",
      "measures": {
        "en": "Average objective completion per task; a task with a guardrail breach receives zero.",
        "ru": "Среднее выполнение целей по задачам; задача с нарушением ограничений получает ноль."
      },
      "influences": {
        "en": "Relevant to multi-application AIOS workflows and controlled document processing.",
        "ru": "Полезен для процессов AIOS в нескольких приложениях и контролируемой обработки документов."
      },
      "limitation": {
        "en": "Partial objectives are not fully accepted tasks. Simulated apps do not certify your production tools.",
        "ru": "Частично выполненные цели не равны полностью принятым задачам. Симуляция не подтверждает работу ваших инструментов."
      },
      "sourceIds": [
        "automationbench"
      ],
      "unit": "% objectives"
    },
    {
      "id": "objectives-completed",
      "en": "Objectives Completed",
      "ru": "Выполненные цели",
      "family": "agents",
      "measures": {
        "en": "Completed objectives, including tasks with violations.",
        "ru": "Выполненные цели, включая задачи с нарушениями."
      },
      "influences": {
        "en": "Read together with acceptance and violation metrics.",
        "ru": "Читайте вместе с метриками приёмки и нарушений."
      },
      "limitation": {
        "en": "The difference from Score is not itself a violation rate; aggregation can differ.",
        "ru": "Разница с Score сама по себе не является частотой нарушений; агрегация может отличаться."
      },
      "sourceIds": [
        "automationbench"
      ],
      "unit": "% objectives"
    },
    {
      "id": "tasks-completed",
      "en": "Tasks Completed",
      "ru": "Полностью завершённые задачи",
      "family": "agents",
      "measures": {
        "en": "Tasks with every objective met and no guardrail violations.",
        "ru": "Задачи, где достигнуты все цели и нет нарушений ограничений."
      },
      "influences": {
        "en": "Closer to acceptance of a complete business result.",
        "ru": "Ближе к приёмке полного бизнес-результата."
      },
      "limitation": {
        "en": "Do not substitute an objective completion percentage.",
        "ru": "Нельзя подставлять процент выполнения отдельных целей."
      },
      "sourceIds": [
        "automationbench"
      ],
      "unit": "% tasks"
    },
    {
      "id": "coding-agent-index",
      "en": "AA Coding Agent Index",
      "ru": "Сравнение агентных конфигураций для кода",
      "family": "agents",
      "measures": {
        "en": "Composite software-engineering evaluation of an agent with its model and execution settings.",
        "ru": "Сводная проверка разработки ПО: агент вместе с моделью и настройками выполнения."
      },
      "influences": {
        "en": "Compare the full model–harness pair and its measured resource budget.",
        "ru": "Сравнивайте полную пару «модель — harness» и фактический бюджет её работы."
      },
      "limitation": {
        "en": "Versioned components matter. API-equivalent task cost is not a subscription invoice or business-success cost.",
        "ru": "Состав зависит от версии. Эквивалентная стоимость API не равна счёту подписки или цене принятого бизнес-результата."
      },
      "sourceIds": [
        "coding-index"
      ],
      "unit": "versioned index"
    },
    {
      "id": "aider-polyglot",
      "en": "Aider polyglot benchmark",
      "ru": "Правки кода в нескольких языках",
      "family": "agents",
      "measures": {
        "en": "Coding exercise results under Aider-specific editing and test conditions.",
        "ru": "Результаты программных упражнений при конкретных условиях редактирования и тестов Aider."
      },
      "influences": {
        "en": "Useful when selecting a model and edit format for an Aider workflow.",
        "ru": "Полезен при выборе модели и формата редактирования для рабочего процесса Aider."
      },
      "limitation": {
        "en": "Do not transfer its rank to another executor, repository or retry policy.",
        "ru": "Ранг не переносится автоматически на другой исполнитель, репозиторий и политику повторов."
      },
      "sourceIds": [
        "aider-benchmark"
      ],
      "unit": "% exercises"
    },
    {
      "id": "swe-bench",
      "en": "SWE-bench Verified",
      "ru": "Исправление задач в репозиториях",
      "family": "agents",
      "measures": {
        "en": "Repository issue resolution judged with a specified evaluation harness.",
        "ru": "Исправление задач репозитория с проверкой заданной оценочной средой."
      },
      "influences": {
        "en": "A useful engineering probe before testing patches in your own repositories.",
        "ru": "Полезная инженерная проба перед проверкой патчей в собственных репозиториях."
      },
      "limitation": {
        "en": "Pin dataset, agent, model, tools and attempt budget. A pass is not production deployment readiness.",
        "ru": "Фиксируйте набор, агента, модель, инструменты и попытки. Успех не доказывает готовность к публикации."
      },
      "sourceIds": [
        "swe-bench"
      ],
      "unit": "% resolved"
    },
    {
      "id": "analyst",
      "en": "AA-AnalystAgent",
      "ru": "Работа аналитика с данными",
      "family": "data",
      "measures": {
        "en": "Quantitative questions answered using spreadsheet and document workflows.",
        "ru": "Количественные вопросы с использованием таблиц и документов."
      },
      "influences": {
        "en": "A probe for analytical assistants in all three projects.",
        "ru": "Проба для аналитических помощников всех трёх проектов."
      },
      "limitation": {
        "en": "Check source lineage, units, numerical oracles and reproducibility locally.",
        "ru": "Локально проверяйте происхождение данных, единицы, контрольные расчёты и воспроизводимость."
      },
      "sourceIds": [
        "analyst"
      ],
      "unit": "benchmark-specific"
    },
    {
      "id": "terminalbench",
      "en": "Terminal-Bench",
      "ru": "Задачи в терминале",
      "family": "agents",
      "measures": {
        "en": "Completion of versioned tasks in a terminal environment.",
        "ru": "Выполнение задач закреплённой версии в терминальной среде."
      },
      "influences": {
        "en": "A probe for tools, environment handling and task completion.",
        "ru": "Проба владения инструментами, окружением и доведения задачи до результата."
      },
      "limitation": {
        "en": "Versions, timeouts, compute and harnesses change the meaning of the score.",
        "ru": "Версия, таймауты, вычислительные ресурсы и harness меняют смысл оценки."
      },
      "sourceIds": [
        "terminalbench"
      ],
      "unit": "% tasks"
    },
    {
      "id": "intelligence",
      "en": "AA Intelligence Index",
      "ru": "Сводный индекс возможностей",
      "family": "research",
      "measures": {
        "en": "A versioned aggregate across several capability evaluations.",
        "ru": "Агрегат нескольких оценок возможностей с определённой версией."
      },
      "influences": {
        "en": "Use individual components to build a shortlist for a task.",
        "ru": "Используйте отдельные компоненты для отбора кандидатов под задачу."
      },
      "limitation": {
        "en": "A broad ranking is not a calibrated probability of project success.",
        "ru": "Общий рейтинг не является калиброванной вероятностью успеха проекта."
      },
      "sourceIds": [
        "intelligence"
      ],
      "unit": "versioned index"
    },
    {
      "id": "ifbench",
      "en": "IFBench",
      "ru": "Следование проверяемым инструкциям",
      "family": "agents",
      "measures": {
        "en": "Adherence to specified instructions under the benchmark evaluator.",
        "ru": "Соблюдение заданных инструкций по правилам оценщика."
      },
      "influences": {
        "en": "Helps design tests for formats, constraints and structured outputs.",
        "ru": "Помогает проектировать тесты форматов, ограничений и структурированных ответов."
      },
      "limitation": {
        "en": "Instruction compliance does not establish factual correctness or authorization.",
        "ru": "Соблюдение инструкции не доказывает фактическую правильность или наличие полномочий."
      },
      "sourceIds": [
        "ifbench"
      ],
      "unit": "benchmark-specific"
    },
    {
      "id": "long-context",
      "en": "Long-context reasoning",
      "ru": "Рассуждение по длинному контексту",
      "family": "data",
      "measures": {
        "en": "Correct answers grounded in long supplied material.",
        "ru": "Правильные ответы с опорой на длинный предоставленный материал."
      },
      "influences": {
        "en": "Useful for tender packs, research logs and specifications.",
        "ru": "Полезно для тендерных пакетов, журналов исследований и спецификаций."
      },
      "limitation": {
        "en": "Maximum context capacity does not establish reliable retrieval at every position.",
        "ru": "Максимальный объём контекста не гарантирует надёжное извлечение из любой его части."
      },
      "sourceIds": [
        "long-context"
      ],
      "unit": "benchmark-specific"
    },
    {
      "id": "configuration",
      "en": "Model × executor configuration",
      "ru": "Конфигурация «модель × исполнитель»",
      "family": "agents",
      "measures": {
        "en": "The exact model, provider, effort, harness, tools, memory and permissions used for one run.",
        "ru": "Точная модель, поставщик, effort, harness, инструменты, память и права одного прогона."
      },
      "influences": {
        "en": "Makes a result reproducible and attributable.",
        "ru": "Позволяет воспроизвести результат и понять его причины."
      },
      "limitation": {
        "en": "A short alias or a provider logo is not a complete identity.",
        "ru": "Короткий алиас или логотип поставщика не задаёт полную идентичность."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "harness",
      "en": "Harness",
      "ru": "Среда исполнения и проверки",
      "family": "agents",
      "measures": {
        "en": "Software that manages the agent loop, tool interfaces, context and evaluation.",
        "ru": "ПО, управляющее циклом агента, интерфейсами инструментов, контекстом и проверкой."
      },
      "influences": {
        "en": "The same model may behave differently under another harness.",
        "ru": "Одна модель может работать иначе в другом harness."
      },
      "limitation": {
        "en": "DSH Harness and DeepSeek Harness are distinct identities.",
        "ru": "DSH Harness и DeepSeek Harness — разные сущности."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "turns",
      "en": "Turns / tool calls",
      "ru": "Шаги модели / вызовы инструментов",
      "family": "agents",
      "measures": {
        "en": "Model interaction steps and individual tool invocations; record them separately.",
        "ru": "Шаги взаимодействия с моделью и отдельные вызовы инструментов; учитываются раздельно."
      },
      "influences": {
        "en": "Explain time, orchestration overhead and recovery behavior.",
        "ru": "Объясняют время, накладные расходы оркестрации и восстановление."
      },
      "limitation": {
        "en": "Fewer calls may mean efficient work or premature failure; inspect accepted outcomes.",
        "ru": "Мало вызовов может означать эффективность или ранний отказ; смотрите на принятый результат."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "session-cost",
      "en": "Cost per session",
      "ru": "Стоимость сессии",
      "family": "cost",
      "measures": {
        "en": "The cost of a session under a stated length, pricing and cache condition.",
        "ru": "Цена сессии при указанной длине, тарифе и состоянии кэша."
      },
      "influences": {
        "en": "Useful for cost planning when the session mix is known.",
        "ru": "Полезна для планирования при известном составе сессий."
      },
      "limitation": {
        "en": "A 1-turn session is not comparable with a 50-turn task; no quality is implied.",
        "ru": "Сессия в 1 шаг несопоставима с задачей в 50 шагов; качество из цены не следует."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "api-equivalent",
      "en": "API-equivalent cost",
      "ru": "Эквивалент стоимости по API",
      "family": "cost",
      "measures": {
        "en": "A token-based estimate at a stated provider tariff.",
        "ru": "Расчёт по токенам и указанному тарифу поставщика."
      },
      "influences": {
        "en": "Supports reproducible price scenarios.",
        "ru": "Позволяет воспроизводить ценовые сценарии."
      },
      "limitation": {
        "en": "Keep estimate, billed API amount, subscription allocation and full cost separate.",
        "ru": "Разделяйте оценку, фактический счёт API, распределение подписки и полную себестоимость."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "token-ledger",
      "en": "Input / output / reasoning / cache tokens",
      "ru": "Входные / выходные / reasoning / cache-токены",
      "family": "cost",
      "measures": {
        "en": "Distinct billing and usage categories whose definitions depend on the provider.",
        "ru": "Разные категории использования и тарификации с определениями поставщика."
      },
      "influences": {
        "en": "Count retries, assistants and auxiliary models in the same cohort.",
        "ru": "Суммируйте повторы, помощников и вспомогательные модели в одной когорте."
      },
      "limitation": {
        "en": "Do not count reasoning twice when it is already included in output tokens.",
        "ru": "Не считайте reasoning дважды, если он уже входит в output tokens."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "pareto",
      "en": "Pareto frontier",
      "ru": "Граница Парето",
      "family": "economics",
      "measures": {
        "en": "Candidates not dominated on every chosen objective within a comparable experiment.",
        "ru": "Кандидаты, не уступающие другому сразу по всем выбранным целям в сопоставимом эксперименте."
      },
      "influences": {
        "en": "Shows quality–cost–latency trade-offs before choosing business priorities.",
        "ru": "Показывает компромисс качества, цены и задержки перед выбором бизнес-приоритетов."
      },
      "limitation": {
        "en": "Missing costs, different tasksets and statistical uncertainty can invalidate a claimed frontier.",
        "ru": "Пропуски стоимости, разные наборы и неопределённость могут сделать границу недостоверной."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "relative-heatmap",
      "en": "Relative heatmap",
      "ru": "Относительная тепловая карта",
      "family": "research",
      "measures": {
        "en": "Colors rescaled within the selected comparison group.",
        "ru": "Цвета, пересчитанные внутри выбранной группы сравнения."
      },
      "influences": {
        "en": "Helps inspect patterns across task groups.",
        "ru": "Помогает видеть различия между группами задач."
      },
      "limitation": {
        "en": "Green is not an absolute success probability; changing selected models changes colors.",
        "ru": "Зелёный цвет не является абсолютной вероятностью успеха; выбор моделей меняет шкалу."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "wilson",
      "en": "Wilson 95% interval",
      "ru": "95%-й интервал Уилсона",
      "family": "probability",
      "measures": {
        "en": "An interval for a Bernoulli success proportion under its sampling assumptions.",
        "ru": "Интервал для доли успехов Бернулли при выполнении предпосылок выборки."
      },
      "influences": {
        "en": "Shows the uncertainty hidden by a single observed percentage.",
        "ru": "Показывает неопределённость, скрытую одним наблюдаемым процентом."
      },
      "limitation": {
        "en": "Repeated calls on one task are not independent observations; this is not a Bayesian posterior probability.",
        "ru": "Повторы одной задачи не независимы; это не байесовская апостериорная вероятность."
      },
      "sourceIds": [
        "method-wilson"
      ]
    },
    {
      "id": "bayes",
      "en": "Beta–binomial model",
      "ru": "Бета-биномиальная модель",
      "family": "probability",
      "measures": {
        "en": "Beta(a,b) prior plus k successes in n independent trials gives Beta(a+k,b+n-k).",
        "ru": "Априорное Beta(a,b) и k успехов из n независимых испытаний дают Beta(a+k,b+n-k)."
      },
      "influences": {
        "en": "Makes prior beliefs and their update explicit.",
        "ru": "Явно задаёт исходные предположения и их обновление."
      },
      "limitation": {
        "en": "State and test the prior; dependence and changing task difficulty require a richer model.",
        "ru": "Укажите и проверьте prior; зависимость и разная сложность требуют более богатой модели."
      },
      "sourceIds": [
        "method-beta"
      ]
    },
    {
      "id": "expected-loss",
      "en": "Expected loss",
      "ru": "Ожидаемые потери решения",
      "family": "probability",
      "measures": {
        "en": "Sum of outcome probabilities times their losses, including action and review costs.",
        "ru": "Сумма вероятностей исходов, умноженных на потери, с учётом цены действия и проверки."
      },
      "influences": {
        "en": "Connects a calibrated prediction to a project-specific action.",
        "ru": "Связывает калиброванный прогноз с действием конкретного проекта."
      },
      "limitation": {
        "en": "Loss assumptions must be explicit; a confidence threshold never creates permission.",
        "ru": "Потери задаются явно; порог уверенности не создаёт полномочий."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "paired",
      "en": "Paired comparison / cluster bootstrap",
      "ru": "Парное сравнение / кластерный bootstrap",
      "family": "probability",
      "measures": {
        "en": "Compare systems on the same cases; resample independent task, company or time clusters.",
        "ru": "Сравнивайте системы на одинаковых примерах; пересэмплируйте независимые задачи, компании или временные блоки."
      },
      "influences": {
        "en": "Reduces task-mix noise and respects repeated observations.",
        "ru": "Снижает шум различия задач и учитывает повторы."
      },
      "limitation": {
        "en": "Separate comparisons across many candidates need a declared selection and multiplicity policy.",
        "ru": "Для множества кандидатов нужны заранее объявленные правила отбора и множественных сравнений."
      },
      "sourceIds": [
        "method-paired_bootstrap",
        "method-mcnemar"
      ]
    },
    {
      "id": "factorial",
      "en": "Model × harness interaction",
      "ru": "Взаимодействие модели и harness",
      "family": "research",
      "measures": {
        "en": "A factorial comparison separates model, executor and their interaction on matched tasks.",
        "ru": "Факторное сравнение разделяет эффекты модели, исполнителя и их взаимодействия на одинаковых задачах."
      },
      "influences": {
        "en": "Reveals which pairing works best for a particular task family.",
        "ru": "Показывает, какая связка работает лучше для конкретного семейства задач."
      },
      "limitation": {
        "en": "A strong model does not guarantee the best pair; sparse cells cannot support reliable interaction estimates.",
        "ru": "Сильная модель не гарантирует лучшую связку; редких наблюдений недостаточно для надёжной оценки взаимодействия."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "out-of-sample",
      "en": "Out-of-sample / walk-forward",
      "ru": "Новые данные / последовательная проверка",
      "family": "data",
      "measures": {
        "en": "Evaluate on untouched future periods with only information available at the decision time.",
        "ru": "Проверка на нетронутых будущих периодах с информацией, доступной на момент решения."
      },
      "influences": {
        "en": "Tests whether a result survives outside its tuning period.",
        "ru": "Проверяет сохранение результата за пределами периода настройки."
      },
      "limitation": {
        "en": "Repeatedly selecting on the same holdout turns it into development data.",
        "ru": "Повторный отбор по одному holdout превращает его в данные настройки."
      },
      "sourceIds": [
        "method-leakage",
        "method-backtest"
      ]
    },
    {
      "id": "macro-vintage",
      "en": "Point-in-time macro vintage",
      "ru": "Историческая версия макроданных",
      "family": "economics",
      "measures": {
        "en": "The value and publication date that were actually known at a past decision time.",
        "ru": "Значение и дата публикации, действительно известные в момент решения в прошлом."
      },
      "influences": {
        "en": "Keeps macro scenarios and FinEdg research free of revised-data leakage.",
        "ru": "Защищает макросценарии и исследования FinEdg от утечки пересмотренных данных."
      },
      "limitation": {
        "en": "The value displayed today may differ from what the market knew then.",
        "ru": "Сегодняшнее значение может отличаться от информации, известной рынку тогда."
      },
      "sourceIds": [
        "method-vintages"
      ]
    },
    {
      "id": "risk-scope",
      "en": "Authorized scope",
      "ru": "Разрешённый объём действий",
      "family": "agents",
      "measures": {
        "en": "The tools, resources, data and actions explicitly available to a run.",
        "ru": "Инструменты, ресурсы, данные и действия, явно разрешённые прогону."
      },
      "influences": {
        "en": "Defines what autonomy can be tested and promoted.",
        "ru": "Определяет, какую автономность можно проверять и расширять."
      },
      "limitation": {
        "en": "A benchmark score does not authorize tender submission, live trading or production deployment.",
        "ru": "Баллы бенчмарка не разрешают подачу заявки, реальные сделки или публикацию в production."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "improvement",
      "en": "Champion / challenger",
      "ru": "Текущая версия / кандидат",
      "family": "research",
      "measures": {
        "en": "A frozen baseline compared with one versioned candidate under declared gates.",
        "ru": "Закреплённая базовая версия и версионированный кандидат с заданными условиями допуска."
      },
      "influences": {
        "en": "Turns automatic generation into a controlled improvement process.",
        "ru": "Превращает автогенерацию в контролируемый процесс улучшения."
      },
      "limitation": {
        "en": "Keep a protected holdout, all failed trials, a budget, a stopping rule and rollback evidence.",
        "ru": "Сохраняйте закрытую проверку, неудачные попытки, бюджет, правило остановки и доказательство отката."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "profit-cash",
      "en": "Contribution / cash flow",
      "ru": "Маржинальная прибыль / денежный поток",
      "family": "economics",
      "measures": {
        "en": "Revenue minus variable cost differs from the timing of actual receipts and payments.",
        "ru": "Выручка за вычетом переменных затрат отличается от расписания реальных поступлений и платежей."
      },
      "influences": {
        "en": "Supports viable pricing, bid/no-bid choices and budget stress scenarios.",
        "ru": "Помогает выбирать жизнеспособные цены, участие в тендере и бюджетные сценарии."
      },
      "limitation": {
        "en": "Business margin, trading PnL and benchmark quality have different units and must remain separate.",
        "ru": "Бизнес-маржа, торговый PnL и качество бенчмарка имеют разные единицы."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "accuracy",
      "en": "Accuracy",
      "ru": "Доля правильных ответов",
      "family": "research",
      "measures": {
        "en": "correct answers / all scored questions",
        "ru": "правильные ответы / все оценённые вопросы"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Class imbalance can hide missed rare events.",
        "ru": "Дисбаланс классов может скрывать пропуск редких событий."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "precision",
      "en": "Precision",
      "ru": "Точность положительных находок",
      "family": "research",
      "measures": {
        "en": "true positive findings / all positive findings",
        "ru": "верные положительные находки / все положительные находки"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Precision alone does not show what was missed.",
        "ru": "Одна точность не показывает, сколько было пропущено."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "recall",
      "en": "Recall",
      "ru": "Полнота обнаружения",
      "family": "research",
      "measures": {
        "en": "found true positives / all true positives",
        "ru": "найденные истинно положительные случаи / все истинно положительные случаи"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Recall alone does not show false alarms.",
        "ru": "Одна полнота не показывает ложные срабатывания."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "f1",
      "en": "F1",
      "ru": "Среднее гармоническое точности и полноты",
      "family": "research",
      "measures": {
        "en": "2 × precision × recall / (precision + recall)",
        "ru": "2 × precision × recall / (precision + recall)"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "State the macro/micro weighting and zero-denominator convention.",
        "ru": "Укажите macro/micro-агрегацию и соглашение при нулевом знаменателе."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "pass-at-1",
      "en": "pass@1",
      "ru": "Успех первой попытки",
      "family": "research",
      "measures": {
        "en": "success under a single declared attempt",
        "ru": "успех в одной заранее определённой попытке"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Pin the evaluator and the attempt budget.",
        "ru": "Фиксируйте оценщик и бюджет попытки."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "pass-at-k",
      "en": "pass@k",
      "ru": "Хотя бы один успех за k попыток",
      "family": "research",
      "measures": {
        "en": "at least one accepted solution among k attempts",
        "ru": "хотя бы одно принятое решение среди k попыток"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "A higher k changes cost and does not demonstrate repeat reliability.",
        "ru": "Большое k меняет расходы и не доказывает устойчивость повторов."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "pass-power-k",
      "en": "pass^k / all-K",
      "ru": "Успех во всех k повторах",
      "family": "research",
      "measures": {
        "en": "all of the fixed k repeats accepted for a task",
        "ru": "все k заранее заданных повторов задачи приняты"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Use the task as the cluster; do not assume p^k without independence.",
        "ru": "Единица — задача; формула p^k требует независимости, которую нельзя предполагать."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "ttft",
      "en": "TTFT / tokens per second",
      "ru": "До первого токена / токенов в секунду",
      "family": "research",
      "measures": {
        "en": "response-start delay / generation throughput",
        "ru": "задержка начала ответа / скорость генерации"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Fast output is not fast accepted completion; queues, tools and retries remain.",
        "ru": "Быстрый вывод не равен быстрому принятому результату: остаются очереди, инструменты и повторы."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "percent-points",
      "en": "Percentage points",
      "ru": "Процентные пункты",
      "family": "research",
      "measures": {
        "en": "absolute difference between two percentages",
        "ru": "абсолютная разница двух процентов"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "80% to 85% is +5 points and +6.25% relative, not the same change.",
        "ru": "От 80% до 85%: +5 п.п. и +6,25% относительно исходного; это разные величины."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "log-scale",
      "en": "Log scale",
      "ru": "Логарифмическая шкала",
      "family": "research",
      "measures": {
        "en": "equal distances correspond to equal ratios",
        "ru": "равные расстояния соответствуют одинаковым отношениям"
      },
      "influences": {
        "en": "Read with the same taskset, unit and budget.",
        "ru": "Читайте при одинаковом наборе задач, единице и бюджете."
      },
      "limitation": {
        "en": "Zero and negative values are not defined on an ordinary logarithmic axis.",
        "ru": "Ноль и отрицательные значения не определены на обычной логарифмической оси."
      },
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "metric-accepted_task_rate",
      "en": "Accepted task rate",
      "ru": "Доля принятых задач",
      "family": "project-metrics",
      "measures": {
        "en": "accepted unique task episodes / assigned eligible task episodes",
        "ru": "Принятые уникальные задачи делятся на все заранее назначенные допустимые задачи; неуспехи остаются в знаменателе. Формула: accepted unique task episodes / assigned eligible task episodes"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет допустимых задач или не зафиксированы критерии приёмки. У каждой задачи есть общий лимит и политика повторов; попытки и уникальные задачи имеют разные знаменатели."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-accepted_without_intervention",
      "en": "Accepted without intervention rate",
      "ru": "Принято без вмешательства",
      "family": "project-metrics",
      "measures": {
        "en": "accepted episodes with no human intervention / assigned eligible episodes",
        "ru": "Уникальные задачи, принятые без вмешательства человека, делятся на все назначенные задачи. Формула: accepted episodes with no human intervention / assigned eligible episodes"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не ведётся журнал вмешательств. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-repeat_all_success",
      "en": "All-K repeat reliability",
      "ru": "Успех во всех K повторах",
      "family": "project-metrics",
      "measures": {
        "en": "mean_i product_r accepted[i,r], fixed K",
        "ru": "Доля задач, у которых успешно завершены все K заранее заданных повторов. Формула: mean_i product_r accepted[i,r], fixed K"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не завершён одинаковый набор K повторов либо K не зафиксирован. Единица интервала — исходная задача/кластер, а не K отдельных независимых наблюдений."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-brier_binary",
      "en": "Binary event Brier",
      "ru": "Brier бинарного события",
      "family": "probability",
      "measures": {
        "en": "mean_i (p_i - y_i)^2; y in {0,1}",
        "ru": "Средний квадрат разности вероятности события и его фактического исхода 0/1. Диапазон 0–1. Формула: mean_i (p_i - y_i)^2; y in {0,1}"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не наступил исход, нет независимой метки или заранее зафиксированного события. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-brier",
        "method-calibration"
      ],
      "unit": "squared_probability"
    },
    {
      "id": "metric-brier_chosen_answer",
      "en": "Chosen-answer correctness Brier",
      "ru": "Brier правильности выбранного ответа",
      "family": "probability",
      "measures": {
        "en": "mean_i (p_correct_i - c_i)^2; c=1 iff the chosen answer is correct",
        "ru": "Средний квадрат ошибки уверенности в правильности выбранного ответа. Диапазон 0–1; нужен известный исход. Формула: mean_i (p_correct_i - c_i)^2; c=1 iff the chosen answer is correct"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет проверенной правильности выбранного ответа или p записана после проверки. В Decision v2 оценивается confidence выбранного ответа. Это не full-vector multiclass Brier."
      },
      "sourceIds": [
        "method-aa_decision",
        "method-calibration"
      ],
      "unit": "squared_probability"
    },
    {
      "id": "metric-brier_multiclass",
      "en": "Multiclass vector Brier",
      "ru": "Brier полного вектора классов",
      "family": "probability",
      "measures": {
        "en": "mean_i sum_k (p_ik - 1[y_i=k])^2; sum_k p_ik=1",
        "ru": "Сумма квадратов ошибок вероятностей всех классов, затем среднее по примерам. Полная ненормированная шкала 0–2. Формула: mean_i sum_k (p_ik - 1[y_i=k])^2; sum_k p_ik=1"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет полной нормированной вероятностной массы по взаимоисключающим классам либо метки. Не делить на число классов. Деление на 2 возможно только как явно названная другая шкала."
      },
      "sourceIds": [
        "method-brier"
      ],
      "unit": "squared_probability_sum"
    },
    {
      "id": "metric-calibration_profile",
      "en": "Reliability diagram",
      "ru": "Калибровочная диаграмма",
      "family": "probability",
      "measures": {
        "en": "For frozen bins: count, mean forecast, observed outcome frequency and uncertainty",
        "ru": "Для групп прогнозов сравниваются средняя заявленная вероятность и фактическая частота с указанием размера группы. Формула: For frozen bins: count, mean forecast, observed outcome frequency and uncertainty"
      },
      "influences": {
        "en": "Interpret jointly with the other metrics; no universal direction.",
        "ru": "Оценивайте вместе с другими метриками; универсального направления нет."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет размеченной отложенной выборки или слишком мало исходов в корзинах. Не оценка отдельного непроверенного ответа. Количество корзин и минимальный n показываются; ECE не используется как единственный gate."
      },
      "sourceIds": [
        "method-calibration"
      ],
      "unit": "bin_probabilities"
    },
    {
      "id": "metric-critical_violations",
      "en": "Critical violation count",
      "ru": "Критичные нарушения",
      "family": "project-metrics",
      "measures": {
        "en": "count of predefined forbidden state transitions / critical invariant failures",
        "ru": "Число заранее определённых запрещённых переходов или нарушений обязательных условий. Формула: count of predefined forbidden state transitions / critical invariant failures"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не заданы запрещённые переходы или не наблюдаем конечное состояние. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-critical_risk_upper95",
      "en": "Critical-event upper 95% bound",
      "ru": "Верхняя граница частоты критичных ошибок",
      "family": "probability",
      "measures": {
        "en": "One-sided exact binomial upper bound on independent representative episodes; zero errors: 1-alpha^(1/n)",
        "ru": "Односторонняя 95%-я верхняя граница частоты критичного события на независимой репрезентативной выборке. Формула: One-sided exact binomial upper bound on independent representative episodes; zero errors: 1-alpha^(1/n)"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Выборка не репрезентативна, зависимость не учтена, n=0 или исходы не завершены. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-exact_binomial"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-replay_integrity",
      "en": "Replay integrity rate",
      "ru": "Восстановление без потерь и повторных эффектов",
      "family": "project-metrics",
      "measures": {
        "en": "fault cases restored with same intended state and exactly-once business effect / all injected fault cases",
        "ru": "Доля сценариев сбоя с восстановлением требуемого состояния без потери и дублирования бизнес-эффектов. Формула: fault cases restored with same intended state and exactly-once business effect / all injected fault cases"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет oracle конечного состояния. Доставка событий может быть at-least-once; бизнес-эффект проверяется на идемпотентность."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-trace_coverage",
      "en": "Trace coverage",
      "ru": "Полнота связанного журнала",
      "family": "project-metrics",
      "measures": {
        "en": "required event links present / required event links",
        "ru": "Найденные обязательные связи событий делятся на все обязательные связи журнала. Формула: required event links present / required event links"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не определён эталон обязательных событий. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-numeric_case_pass",
      "en": "Numerical oracle pass rate",
      "ru": "Точность расчётных примеров",
      "family": "project-metrics",
      "measures": {
        "en": "cases passing all unit-specific tolerances / all cases",
        "ru": "Доля контрольных расчётов, прошедших все допуски в соответствующих единицах. Формула: cases passing all unit-specific tolerances / all cases"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не задан oracle, единицы, atol и rtol. Для денежных сумм — Decimal/minor units и правило округления; для floating-point abs(error)<=atol+rtol*abs(reference)."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-feasible_solution_rate",
      "en": "Feasible solution rate",
      "ru": "Соблюдение ограничений",
      "family": "project-metrics",
      "measures": {
        "en": "solutions satisfying every declared constraint / all fixtures",
        "ru": "Доля решений, соблюдающих каждое заранее заданное ограничение. Формула: solutions satisfying every declared constraint / all fixtures"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет версии набора ограничений. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-optimality_gap",
      "en": "Certified relative optimality gap",
      "ru": "Разрыв с доказанным оптимумом",
      "family": "project-metrics",
      "measures": {
        "en": "For minimization: (candidate objective - certified optimum)/abs(certified optimum)",
        "ru": "Относительная разница значения целевой функции и доказанного оптимума задачи минимизации. Формула: For minimization: (candidate objective - certified optimum)/abs(certified optimum)"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Оптимум не сертифицирован или равен нулю: использовать абсолютный разрыв с единицами. Сравнение с лучшим найденным решением называется reference gap, не доказанным optimality gap."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-field_exact_match",
      "en": "Critical-field exact match",
      "ru": "Точное извлечение критичных полей",
      "family": "project-metrics",
      "measures": {
        "en": "correct critical field values / all required critical field values",
        "ru": "Точно извлечённые критичные поля делятся на все обязательные критичные поля. Формула: correct critical field values / all required critical field values"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не заданы нормализация, отсутствующее значение и эталон. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-field_macro_f1",
      "en": "Macro field F1",
      "ru": "Средний F1 типов полей",
      "family": "project-metrics",
      "measures": {
        "en": "mean over declared field types of 2*precision*recall/(precision+recall)",
        "ru": "Среднее F1 по заранее объявленным типам полей; редкие поля не исчезают за частыми. Формула: mean over declared field types of 2*precision*recall/(precision+recall)"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Политика нулевых знаменателей или набор типов не зафиксированы. Отчёт по каждому типу обязателен; большое число простых полей не скрывает ошибку суммы/даты."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-entity_precision",
      "en": "Entity-link precision",
      "ru": "Точность связей компаний",
      "family": "project-metrics",
      "measures": {
        "en": "correct proposed links / all proposed links",
        "ru": "Подтверждённые связи компаний делятся на все предложенные связи. Формула: correct proposed links / all proposed links"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет предложенных связей: null, а не 100%. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-ocds_ids"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-entity_recall",
      "en": "Entity-link recall",
      "ru": "Полнота связей компаний",
      "family": "project-metrics",
      "measures": {
        "en": "recovered true links / all true links in adjudicated set",
        "ru": "Восстановленные истинные связи компаний делятся на все истинные связи эталона. Формула: recovered true links / all true links in adjudicated set"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет истинных связей в эталоне. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-ocds_ids"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-support_precision",
      "en": "Claim support precision",
      "ru": "Подтверждённость утверждений",
      "family": "project-metrics",
      "measures": {
        "en": "claims semantically supported by cited versioned source / all asserted factual claims",
        "ru": "Фактические утверждения, действительно подтверждённые указанными источниками, делятся на все заявленные факты. Формула: claims semantically supported by cited versioned source / all asserted factual claims"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет утверждений: null; отказ оценивается отдельно. Совпадение строки цитаты само по себе не доказывает поддержку смысла; оцениваются источник, версия и утверждение."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-required_fact_recall",
      "en": "Required-fact recall",
      "ru": "Полнота обязательных фактов",
      "family": "project-metrics",
      "measures": {
        "en": "correctly reported required facts / all required facts in gold",
        "ru": "Правильно изложенные обязательные факты делятся на все обязательные факты эталона. Формула: correctly reported required facts / all required facts in gold"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет перечня обязательных фактов. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-lineage_coverage",
      "en": "Data-lineage coverage",
      "ru": "Происхождение данных",
      "family": "project-metrics",
      "measures": {
        "en": "required fields with source version/hash/location/as-of / all required fields",
        "ru": "Поля с источником, версией, расположением и датой доступности делятся на все требуемые поля. Формула: required fields with source version/hash/location/as-of / all required fields"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не задан перечень полей происхождения. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-leakage_count",
      "en": "Data-leakage count",
      "ru": "Случаи утечки данных",
      "family": "project-metrics",
      "measures": {
        "en": "violations of train/calibration/test or as-of boundaries",
        "ru": "Число нарушений границ обучения, калибровки, проверки и доступности данных во времени. Формула: violations of train/calibration/test or as-of boundaries"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет времён доступности и границ сплитов. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-leakage"
      ],
      "unit": "count"
    },
    {
      "id": "metric-stale_critical_sources",
      "en": "Stale critical-source count",
      "ru": "Критичные устаревшие источники",
      "family": "project-metrics",
      "measures": {
        "en": "critical outputs using superseded or not-yet-available source versions",
        "ru": "Число критичных результатов на устаревшем либо ещё не доступном в момент решения источнике. Формула: critical outputs using superseded or not-yet-available source versions"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не установлена политика актуальности. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-ocds_releases",
        "method-vintages"
      ],
      "unit": "count"
    },
    {
      "id": "metric-qualified_conversion",
      "en": "Qualified conversion rate",
      "ru": "Конверсия в целевое действие",
      "family": "project-metrics",
      "measures": {
        "en": "eligible assigned accounts with matured qualified outcome / eligible assigned accounts",
        "ru": "Аккаунты с созревшим целевым исходом делятся на все допустимые назначенные аккаунты когорты. Формула: eligible assigned accounts with matured qualified outcome / eligible assigned accounts"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет стабильного assignment_id, окна дозревания или определения квалификации. Основной анализ intention-to-treat; клики и повторные сессии не заменяют уникальные аккаунты."
      },
      "sourceIds": [
        "method-ab_metrics"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-contribution_per_account",
      "en": "Contribution per assigned account",
      "ru": "Маржинальный вклад на назначенный аккаунт",
      "family": "project-metrics",
      "measures": {
        "en": "net cohort revenue minus variable acquisition/service/refund costs, divided by all eligible assigned accounts",
        "ru": "Выручка когорты за вычетом переменных расходов и возвратов на каждый назначенный аккаунт. Формула: net cohort revenue minus variable acquisition/service/refund costs, divided by all eligible assigned accounts"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Выручка/возвраты не дозрели или неполны затраты. Это маржинальный вклад, не операционная прибыль и не денежный поток."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "currency/account"
    },
    {
      "id": "metric-srm_p",
      "en": "Sample Ratio Mismatch p-value",
      "ru": "Диагностика распределения групп",
      "family": "project-metrics",
      "measures": {
        "en": "goodness-of-fit p-value for observed vs planned assignment counts",
        "ru": "Диагностическая p-величина несоответствия фактических и плановых размеров экспериментальных групп. Формула: goodness-of-fit p-value for observed vs planned assignment counts"
      },
      "influences": {
        "en": "Interpret jointly with the other metrics; no universal direction.",
        "ru": "Оценивайте вместе с другими метриками; универсального направления нет."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет заранее заданных пропорций групп. Высокий p-value не доказывает корректность дизайна. Необъяснённый SRM блокирует причинный вывод."
      },
      "sourceIds": [
        "method-ab_srm"
      ],
      "unit": "probability"
    },
    {
      "id": "metric-unfounded_claims",
      "en": "Unsupported material-claim count",
      "ru": "Неподтверждённые обещания",
      "family": "project-metrics",
      "measures": {
        "en": "material promises without evidence / prohibited claim instances",
        "ru": "Количество существенных обещаний, для которых нет подтверждающих доказательств. Формула: material promises without evidence / prohibited claim instances"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не зафиксирована рубрика проверки рекламы. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-cost_per_accepted",
      "en": "Cost per accepted unique task",
      "ru": "Стоимость принятой задачи",
      "family": "project-metrics",
      "measures": {
        "en": "all relevant costs of cohort / accepted unique task episodes",
        "ru": "Все расходы когорты, включая неудачные попытки, делятся на число принятых уникальных задач. Формула: all relevant costs of cohort / accepted unique task episodes"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет принятых задач либо неизвестна хотя бы одна обязательная статья расходов. Показывать marginal cash cost и fully loaded cost отдельно; попытки не считаются новыми production-задачами."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "currency/accepted_task"
    },
    {
      "id": "metric-cost_coverage",
      "en": "Required cost-item coverage",
      "ru": "Полнота учёта расходов",
      "family": "project-metrics",
      "measures": {
        "en": "cost components backed by receipts or explicit allocations / required components",
        "ru": "Статьи расходов с квитанцией или явным распределением делятся на все обязательные статьи. Формула: cost components backed by receipts or explicit allocations / required components"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Список обязательных статей не установлен. Неизвестный расход — null, не 0. Налоговый и валютный учёт одинаковы у сравниваемых конфигураций."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-money_reconciliation_error",
      "en": "Money reconciliation error",
      "ru": "Расхождение денежных расчётов",
      "family": "project-metrics",
      "measures": {
        "en": "max absolute residual after prescribed currency-specific rounding",
        "ru": "Максимальное абсолютное расхождение после корректного округления для данной валюты. Формула: max absolute residual after prescribed currency-specific rounding"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет валюты/правила округления/эталонных квитанций. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "minor_currency_units"
    },
    {
      "id": "metric-contribution_per_unit",
      "en": "Contribution margin per unit",
      "ru": "Маржинальная прибыль на единицу",
      "family": "project-metrics",
      "measures": {
        "en": "net revenue excluding chosen indirect-tax treatment - variable cost",
        "ru": "Чистая выручка на бизнес-единицу за вычетом переменных затрат. Формула: net revenue excluding chosen indirect-tax treatment - variable cost"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Неизвестны цена, расходы, возвраты или единица учёта. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "currency/business_unit"
    },
    {
      "id": "metric-cashflow_min",
      "en": "Minimum projected cash balance",
      "ru": "Минимальный денежный остаток сценария",
      "family": "project-metrics",
      "measures": {
        "en": "min_t(initial cash + cumulative dated receipts - cumulative dated payments)",
        "ru": "Минимальный остаток денег по календарю поступлений и платежей выбранного сценария. Формула: min_t(initial cash + cumulative dated receipts - cumulative dated payments)"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет начального остатка или графика поступлений и выплат. Сценарий, а не прогноз. Годовая предоплата не равна MRR и месячной прибыли."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "currency"
    },
    {
      "id": "metric-worst_scenario_contribution",
      "en": "Worst declared-scenario contribution",
      "ru": "Вклад в худшем заданном сценарии",
      "family": "project-metrics",
      "measures": {
        "en": "min over declared stress scenarios of contribution",
        "ru": "Наименьшая маржинальная прибыль среди явно заданных стресс-сценариев. Формула: min over declared stress scenarios of contribution"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Сценарии или входные данные не заполнены. Минимум по выбранным стрессам не является нижней вероятностной границей."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "currency/business_unit"
    },
    {
      "id": "metric-manifest_coverage",
      "en": "Experiment manifest coverage",
      "ru": "Полнота манифестов",
      "family": "project-metrics",
      "measures": {
        "en": "episodes with complete frozen config/data/criteria/cost lineage / episodes",
        "ru": "Эпизоды с полным закреплённым паспортом конфигурации, данных и проверки делятся на все эпизоды. Формула: episodes with complete frozen config/data/criteria/cost lineage / episodes"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не задан обязательный манифест. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-human_minutes",
      "en": "Human review minutes per accepted task",
      "ru": "Время участия человека",
      "family": "project-metrics",
      "measures": {
        "en": "all logged intervention and review minutes / accepted unique tasks",
        "ru": "Всё время вмешательства и проверки человеком делится на принятые уникальные задачи. Формула: all logged intervention and review minutes / accepted unique tasks"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет журнала времени либо нет принятых задач. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "minutes/accepted_task"
    },
    {
      "id": "metric-p95_completion",
      "en": "p95 time to accepted completion",
      "ru": "95-й процентиль завершения",
      "family": "project-metrics",
      "measures": {
        "en": "p95 wall-clock elapsed time including queue/retries/review; report timeout mass separately",
        "ru": "Время, за которое завершились 95% рассматриваемых принятых задач, с очередью, повторами и проверкой; таймауты показываются отдельно. Формула: p95 wall-clock elapsed time including queue/retries/review; report timeout mass separately"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Слишком мало завершённых задач или цензурирование скрыто. Если >5% задач ещё не завершены к дедлайну, p95 завершения не оценён; не считать percentile только по быстрым успехам."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "seconds"
    },
    {
      "id": "metric-missed_deadlines",
      "en": "Missed critical-deadline count",
      "ru": "Пропущенные дедлайны",
      "family": "project-metrics",
      "measures": {
        "en": "missed gold critical deadlines with explicit timezone/version",
        "ru": "Количество пропущенных критичных дедлайнов с закреплённой версией и часовым поясом. Формула: missed gold critical deadlines with explicit timezone/version"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет достоверного времени крайнего срока. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-orphaned_episodes",
      "en": "Orphaned-episode count",
      "ru": "Задачи без конечного состояния",
      "family": "project-metrics",
      "measures": {
        "en": "finished/expired episodes lacking correlated terminal result",
        "ru": "Количество завершившихся или просроченных эпизодов без связанного конечного результата. Формула: finished/expired episodes lacking correlated terminal result"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Невозможно определить жизненный цикл. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-protected_holdout_access",
      "en": "Protected-holdout exposure count",
      "ru": "Раскрытия контрольной выборки",
      "family": "project-metrics",
      "measures": {
        "en": "unauthorized development access to protected inputs/labels before final evaluation",
        "ru": "Число недопустимых раскрытий контрольных входов или ответов разработке до финальной проверки. Формула: unauthorized development access to protected inputs/labels before final evaluation"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет журнала доступа или ownership evaluator. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "method-leakage"
      ],
      "unit": "count"
    },
    {
      "id": "metric-reproduction_rate",
      "en": "Independent reproduction rate",
      "ru": "Независимое воспроизведение",
      "family": "project-metrics",
      "measures": {
        "en": "artifacts independently rerun with equivalent outputs within frozen tolerances / required reruns",
        "ru": "Доля артефактов, независимо воспроизведённых с совпадением в заранее заданном допуске. Формула: artifacts independently rerun with equivalent outputs within frozen tolerances / required reruns"
      },
      "influences": {
        "en": "Higher, subject to the acceptance gates.",
        "ru": "Больше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Не назначен независимый проверяющий либо нет артефактов. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-material_regressions",
      "en": "Material regression count",
      "ru": "Критичные регрессии",
      "family": "project-metrics",
      "measures": {
        "en": "new failures on predeclared critical regression cases",
        "ru": "Количество новых отказов на заранее объявленных критичных проверках. Формула: new failures on predeclared critical regression cases"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Состав критичного набора менялся после просмотра результата. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-budget_violations",
      "en": "Budget-contract violation count",
      "ru": "Нарушения согласованного лимита",
      "family": "project-metrics",
      "measures": {
        "en": "episodes exceeding their explicit monetary/resource/action limits",
        "ru": "Количество эпизодов с превышением явных денежных, ресурсных или операционных лимитов. Формула: episodes exceeding their explicit monetary/resource/action limits"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Лимит не задан или учёт неполон. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    },
    {
      "id": "metric-oos_net_return",
      "en": "Out-of-sample net return",
      "ru": "Доходность вне периода настройки",
      "family": "project-metrics",
      "measures": {
        "en": "equity_end/equity_start - 1, after recorded fees/funding/slippage under declared simulation",
        "ru": "Изменение капитала на периоде вне настройки после учтённых расходов в указанной симуляции. Формула: equity_end/equity_start - 1, after recorded fees/funding/slippage under declared simulation"
      },
      "influences": {
        "en": "Interpret jointly with the other metrics; no universal direction.",
        "ru": "Оценивайте вместе с другими метриками; универсального направления нет."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет полной модели издержек, фиксированного капитала и закрытого OOS. Не годовая доходность по умолчанию; учитывать внесения/выводы и не выдавать исторический результат за ожидание."
      },
      "sourceIds": [
        "method-backtest"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-max_drawdown",
      "en": "Maximum drawdown",
      "ru": "Максимальная просадка",
      "family": "project-metrics",
      "measures": {
        "en": "max_t(1 - equity_t / running_peak_equity_t)",
        "ru": "Наибольшее падение капитала относительно предшествующего максимума. Формула: max_t(1 - equity_t / running_peak_equity_t)"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет корректной mark-to-market equity curve или положительной базы. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "fraction"
    },
    {
      "id": "metric-paper_errors",
      "en": "PAPER execution invariant failures",
      "ru": "Ошибки PAPER-исполнения",
      "family": "project-metrics",
      "measures": {
        "en": "duplicate orders, stale prices, invalid sizing or violated approved controls in PAPER tests",
        "ru": "Нарушения PAPER-инвариантов: дублирование заявок, устаревшие цены, неверный размер или нарушение ограничений. Формула: duplicate orders, stale prices, invalid sizing or violated approved controls in PAPER tests"
      },
      "influences": {
        "en": "Lower, subject to the acceptance gates.",
        "ru": "Меньше при соблюдении критериев приёмки."
      },
      "limitation": {
        "en": "A proposed local metric. Freeze its denominator, scope and missing-data policy before running the experiment.",
        "ru": "Нет детерминированного эталона и журнала запросов/исполнений. Предлагаемая локальная метрика: заранее зафиксируйте знаменатель, scope и правила пропусков."
      },
      "sourceIds": [
        "own-protocol"
      ],
      "unit": "count"
    }
  ],
  "executors": [
    {
      "id": "aider",
      "name": "Aider",
      "summary": {
        "en": "Coding assistant with configurable models, edit formats and an architect/editor split.",
        "ru": "CLI выбирает модель; architect-режим разделяет планирование и редактирование между моделями."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "История чата и текущий контекст не равны полному биллингу с повторными запросами."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "В architect-режиме фиксировать обе модели и edit format; итоговый diff и прохождение независимых тестов оценивать отдельно."
        }
      ],
      "sourceIds": [
        "executor-aider-options",
        "executor-aider-commands"
      ]
    },
    {
      "id": "opencode",
      "name": "OpenCode",
      "summary": {
        "en": "Coding executor with explicit agent/model configuration and structured session output.",
        "ru": "opencode run поддерживает provider/model, выбор агента и --format json для NDJSON."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Не смешивать opencode-ai/старые команды с текущей документацией anomalyco/opencode; сверять CLI установленной версии."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Общий сервер, агент и конфигурация могут менять окружение; записывать фактически применённые настройки."
        }
      ],
      "sourceIds": [
        "executor-opencode-cli",
        "executor-opencode-api"
      ]
    },
    {
      "id": "oh-my-pi",
      "name": "Oh My Pi",
      "summary": {
        "en": "Extensible coding executor with run, tool and usage instrumentation.",
        "ru": "Предоставляет CLI, одноразовые запуски, SDK и RPC/ACP для интеграции."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Наличие телеметрии в пакете не означает, что конкретный wrapper включил её и сохранил все события."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Для модели подписки без публичной цены dollar estimate может быть N/A; это не нулевая стоимость."
        }
      ],
      "sourceIds": [
        "executor-omp-repo",
        "executor-omp-stats",
        "executor-omp-agent"
      ]
    },
    {
      "id": "pi",
      "name": "Pi (Mario Zechner)",
      "summary": {
        "en": "Extensible coding harness; extensions, memory and completion events affect the result.",
        "ru": "Минимальный расширяемый coding harness с extensions, skills и prompt templates; состав расширений является частью конфигурации."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Не считать agent_end окончанием всей работы, когда возможны retry, compaction и follow-up."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Фиксировать extensions, память и ветку сессии; чистый Pi и расширенная конфигурация — разные условия."
        }
      ],
      "sourceIds": [
        "executor-pi-readme",
        "executor-pi-json",
        "executor-pi-session-format",
        "executor-pi-sessions"
      ]
    },
    {
      "id": "dsh-local",
      "name": "DSH Harness",
      "summary": {
        "en": "Requested local DSH candidate. Build, installed versions and exact model routes need attestation.",
        "ru": "Желаемый локальный кандидат DSH. Нужны квитанции сборки, установленных версий и точного маршрута модели."
      },
      "versionStatus": "desired",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "0.2.2 — желаемая версия-кандидат из запроса. Runtime 0.10.11 — отдельная ось из AIOS code/preflight; это не подтверждение actual installed. Executable и commit на сервере в этой работе не проверялись."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Публичные характеристики не утверждаются. Это не DeepSeek Harness из AA Coding Agent Index."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Перед сравнением нужны manifest сборки, resolver model/provider/effort, tool registry, full event log и независимый acceptance result."
        }
      ],
      "sourceIds": [
        "own-protocol"
      ],
      "version": "0.2.2"
    },
    {
      "id": "hermes",
      "name": "Hermes Agent",
      "summary": {
        "en": "Agent with persistent sessions, configurable terminal backends and supporting models.",
        "ru": "Agent с persistent sessions и несколькими terminal backends; репозиторий описывает batch trajectories для исследований."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Для сравнения обнулять/фиксировать память и skills либо объявлять их отдельным условием."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "История старых JSONL и routing sessions.json не заменяет текущий canonical store."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "В расход включать вспомогательные модели и subagents; табличная стоимость одной модели может быть неполной."
        }
      ],
      "sourceIds": [
        "executor-hermes-repo",
        "executor-hermes-sessions",
        "executor-hermes-models"
      ]
    },
    {
      "id": "codex",
      "name": "Codex",
      "summary": {
        "en": "Coding executor with structured run events and separate model/provider/effort settings.",
        "ru": "codex exec поддерживает --json: JSONL событий thread/turn/item; --output-last-message сохраняет только финальное сообщение; --output-schema задаёт структуру итога."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Парсер только финального текста не даёт полный журнал команд, tool calls и ошибок."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Уточнять локальный CLI или managed runtime: поддержка provider overrides различается по поверхности."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Subscription usage, API-equivalent estimate и фактические деньги учитывать раздельно."
        }
      ],
      "sourceIds": [
        "executor-codex-exec",
        "executor-codex-config"
      ]
    },
    {
      "id": "claude-code",
      "name": "Claude Code",
      "summary": {
        "en": "Coding executor with structured headless output, subagents and usage instrumentation.",
        "ru": "Headless claude -p поддерживает json/stream-json, JSON schema, выбор модели, пределы turns и USD budget."
      },
      "versionStatus": "unknown",
      "instrumentation": [
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "max-budget-usd не заменяет данные выставленного счёта; токены и деньги сверять с provider."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Нельзя считать недостающий текст subagent отсутствием его работы, пока не проверены stream flags."
        },
        {
          "en": "Capture full events, task acceptance, exact settings and reconciled usage. Installed-version behavior must be checked.",
          "ru": "Агрегированный API error может описывать исчерпание retry, а не каждый отдельный запрос."
        }
      ],
      "sourceIds": [
        "executor-claude-cli",
        "executor-claude-monitoring"
      ]
    },
    {
      "id": "typed-decision",
      "name": "Typed decision adapter · proposed",
      "summary": {
        "en": "A proposed structured-decision adapter; inference format and exact endpoints must be pinned.",
        "ru": "Проектируемый адаптер структурированных решений; формат inference и точные endpoints нужно закрепить."
      },
      "versionStatus": "desired",
      "instrumentation": [
        {
          "en": "Record the full probability vector, chosen action, ground truth and schema failures.",
          "ru": "Сохранять полный вектор вероятностей, выбор, истину и ошибки схемы."
        }
      ],
      "sourceIds": [
        "jev-engines",
        "own-protocol"
      ]
    },
    {
      "id": "rules-baseline",
      "name": "Deterministic baseline",
      "summary": {
        "en": "A rules/solver baseline with no LLM calls, evaluated on the same cases.",
        "ru": "Базовые правила или решатель без вызовов LLM, проверяемые на тех же примерах."
      },
      "versionStatus": "desired",
      "instrumentation": [
        {
          "en": "Pin source code and test fixtures; deterministic does not mean automatically correct.",
          "ru": "Закрепить исходники и примеры; детерминизм не означает автоматическую правильность."
        }
      ],
      "sourceIds": [
        "own-protocol"
      ]
    },
    {
      "id": "model-system",
      "name": "Tvijo multi-model protocol · proposed",
      "summary": {
        "en": "A proposed router–worker–verifier configuration with independent acceptance.",
        "ru": "Проектируемая связка маршрутизатор — исполнитель — проверяющий с независимой приёмкой."
      },
      "versionStatus": "desired",
      "instrumentation": [
        {
          "en": "Count all models, shared tools and retries. Correlated errors invalidate independent-voting assumptions.",
          "ru": "Учитывать все модели, общие инструменты и повторы. Коррелированные ошибки не допускают предположения независимого голосования."
        }
      ],
      "sourceIds": [
        "own-protocol"
      ]
    }
  ],
  "configs": [
    {
      "id": "codex-sol-max",
      "label": {
        "en": "Codex × GPT-6.1 Sol · max",
        "ru": "Codex × GPT-6.1 Sol · max"
      },
      "executorId": "codex",
      "model": "GPT-6.1 Sol",
      "provider": "Unpinned / не закреплён",
      "effort": "max",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "Proposed engineering baseline. Pin the installed executor and provider revision before running.",
        "ru": "Предлагаемый инженерный baseline. Перед запуском закрепите исполнитель и ревизию поставщика."
      },
      "modelId": "gpt-6.1-sol"
    },
    {
      "id": "codex-terra-xhigh",
      "label": {
        "en": "Codex × GPT-6.1 Terra · xhigh",
        "ru": "Codex × GPT-6.1 Terra · xhigh"
      },
      "executorId": "codex",
      "model": "GPT-6.1 Terra",
      "provider": "Unpinned / не закреплён",
      "effort": "xhigh",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "Proposed independent reviewer. Role is a hypothesis, not a measured superiority claim.",
        "ru": "Предлагаемый независимый рецензент. Назначение роли — гипотеза, не измеренное превосходство."
      },
      "modelId": "gpt-6.1-terra"
    },
    {
      "id": "dsh-ds41f",
      "label": {
        "en": "DSH 0.2.2? × DS41F?",
        "ru": "DSH 0.2.2? × DS41F?"
      },
      "executorId": "dsh-local",
      "model": "DS41F — alias unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "0.2.2 desired",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "Requested candidate. Distinct from DeepSeek Harness. Resolve exact executable and provider/model ID.",
        "ru": "Кандидат из запроса. Не DeepSeek Harness. Нужны точный executable и provider/model ID."
      }
    },
    {
      "id": "dsh-minimax31f",
      "label": {
        "en": "DSH 0.2.2? × MiniMax M3.1 Flash?",
        "ru": "DSH 0.2.2? × MiniMax M3.1 Flash?"
      },
      "executorId": "dsh-local",
      "model": "MiniMax M3.1 Flash — requested alias",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "0.2.2 desired",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "Compatibility and provider route are unverified; do not infer them from the alias.",
        "ru": "Совместимость и маршрут не подтверждены; алиас их не доказывает."
      }
    },
    {
      "id": "aider-ds41f",
      "label": {
        "en": "Aider × DS41F?",
        "ru": "Aider × DS41F?"
      },
      "executorId": "aider",
      "model": "DS41F — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "aider-minimax31f",
      "label": {
        "en": "Aider × MiniMax M3.1 Flash?",
        "ru": "Aider × MiniMax M3.1 Flash?"
      },
      "executorId": "aider",
      "model": "MiniMax M3.1 Flash — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "opencode-ds41f",
      "label": {
        "en": "OpenCode × DS41F?",
        "ru": "OpenCode × DS41F?"
      },
      "executorId": "opencode",
      "model": "DS41F — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "opencode-minimax31f",
      "label": {
        "en": "OpenCode × MiniMax M3.1 Flash?",
        "ru": "OpenCode × MiniMax M3.1 Flash?"
      },
      "executorId": "opencode",
      "model": "MiniMax M3.1 Flash — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "oh-my-pi-ds41f",
      "label": {
        "en": "Oh My Pi × DS41F?",
        "ru": "Oh My Pi × DS41F?"
      },
      "executorId": "oh-my-pi",
      "model": "DS41F — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "oh-my-pi-minimax31f",
      "label": {
        "en": "Oh My Pi × MiniMax M3.1 Flash?",
        "ru": "Oh My Pi × MiniMax M3.1 Flash?"
      },
      "executorId": "oh-my-pi",
      "model": "MiniMax M3.1 Flash — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "pi-ds41f",
      "label": {
        "en": "Pi × DS41F?",
        "ru": "Pi × DS41F?"
      },
      "executorId": "pi",
      "model": "DS41F — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "pi-minimax31f",
      "label": {
        "en": "Pi × MiniMax M3.1 Flash?",
        "ru": "Pi × MiniMax M3.1 Flash?"
      },
      "executorId": "pi",
      "model": "MiniMax M3.1 Flash — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "hermes-ds41f",
      "label": {
        "en": "Hermes Agent × DS41F?",
        "ru": "Hermes Agent × DS41F?"
      },
      "executorId": "hermes",
      "model": "DS41F — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "hermes-minimax31f",
      "label": {
        "en": "Hermes Agent × MiniMax M3.1 Flash?",
        "ru": "Hermes Agent × MiniMax M3.1 Flash?"
      },
      "executorId": "hermes",
      "model": "MiniMax M3.1 Flash — unresolved",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A requested comparison arm. First verify exact model ID, adapter, tool protocol and installed version.",
        "ru": "Предлагаемая ветка сравнения. Сначала проверьте точный model ID, адаптер, протокол инструментов и установленную версию."
      }
    },
    {
      "id": "claude-native",
      "label": {
        "en": "Claude Code × pinned native model",
        "ru": "Claude Code × закрепляемая нативная модель"
      },
      "executorId": "claude-code",
      "model": "Model to pin / модель не закреплена",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "No model or compatibility is inferred. Pin the actually accessible native route before comparison.",
        "ru": "Модель и совместимость не предполагаются. Закрепите фактически доступный нативный маршрут до сравнения."
      }
    },
    {
      "id": "decision-glide",
      "label": {
        "en": "GLiDE v1.2 × typed decisions",
        "ru": "GLiDE v1.2 × структурированные решения"
      },
      "executorId": "typed-decision",
      "model": "GLiDE v1.2",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "read-only state",
        "structured choices",
        "probability vector"
      ],
      "status": "planned",
      "sourceIds": [
        "aa-decision",
        "own-protocol"
      ],
      "notes": {
        "en": "Research candidate from the decision-model family; exact API, revision and availability are unverified.",
        "ru": "Исследовательский кандидат семейства decision-моделей; точный API, ревизия и доступность не проверены."
      }
    },
    {
      "id": "decision-drex",
      "label": {
        "en": "Drex Max v1.1 × typed decisions",
        "ru": "Drex Max v1.1 × структурированные решения"
      },
      "executorId": "typed-decision",
      "model": "Drex Max v1.1",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "read-only state",
        "structured choices",
        "probability vector"
      ],
      "status": "planned",
      "sourceIds": [
        "aa-decision",
        "own-protocol"
      ],
      "notes": {
        "en": "Research candidate from the decision-model family; exact API, revision and availability are unverified.",
        "ru": "Исследовательский кандидат семейства decision-моделей; точный API, ревизия и доступность не проверены."
      }
    },
    {
      "id": "decision-mammoth",
      "label": {
        "en": "Mammoth 27B × typed decisions",
        "ru": "Mammoth 27B × структурированные решения"
      },
      "executorId": "typed-decision",
      "model": "Mammoth 27B",
      "provider": "Unpinned / не закреплён",
      "effort": "unverified",
      "harnessVersion": "unverified",
      "tools": [
        "read-only state",
        "structured choices",
        "probability vector"
      ],
      "status": "planned",
      "sourceIds": [
        "aa-decision",
        "own-protocol"
      ],
      "notes": {
        "en": "Research candidate from the decision-model family; exact API, revision and availability are unverified.",
        "ru": "Исследовательский кандидат семейства decision-моделей; точный API, ревизия и доступность не проверены."
      }
    },
    {
      "id": "rules-only",
      "label": {
        "en": "Rules / solver baseline",
        "ru": "Baseline: правила / решатель"
      },
      "executorId": "rules-baseline",
      "model": "No LLM / без LLM",
      "provider": "Unpinned / не закреплён",
      "effort": "not applicable",
      "harnessVersion": "to pin",
      "tools": [
        "deterministic rules",
        "numerical oracle"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "A necessary comparator for narrow decisions and numeric tasks. No performance claim until tested.",
        "ru": "Необходимая точка сравнения для узких решений и численных задач. Качество до теста неизвестно."
      }
    },
    {
      "id": "router-worker-reviewer",
      "label": {
        "en": "Router → worker → independent review",
        "ru": "Маршрутизатор → исполнитель → независимая проверка"
      },
      "executorId": "model-system",
      "model": "Typed router → DSH × DS41F → Codex × GPT-6.1 Terra",
      "provider": "Unpinned / не закреплён",
      "effort": "role-specific; unverified",
      "harnessVersion": "protocol proposal",
      "tools": [
        "isolated files",
        "restricted shell",
        "independent tests"
      ],
      "status": "planned",
      "sourceIds": [
        "own-protocol"
      ],
      "notes": {
        "en": "Evaluate the complete pipeline against single-model and deterministic baselines. Include every cost and failure.",
        "ru": "Сравнивайте весь процесс с одной моделью и детерминированной базой. Включайте каждый расход и отказ."
      }
    }
  ],
  "sources": [
    {
      "id": "own-protocol",
      "title": "Tvijo Model Atlas: proposed experiment protocol",
      "url": "/en/compare/research#protocol",
      "kind": "own-protocol",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-brier",
      "title": "scikit-learn: Brier score loss",
      "url": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.brier_score_loss.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-calibration",
      "title": "scikit-learn: probability calibration",
      "url": "https://scikit-learn.org/stable/modules/calibration.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-wilson",
      "title": "NIST: confidence intervals for a proportion",
      "url": "https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-exact_binomial",
      "title": "NIST: exact binomial confidence limits",
      "url": "https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/exacbino.htm",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-beta",
      "title": "Aki Vehtari: Bayesian Data Analysis, beta-binomial exercises",
      "url": "https://avehtari.github.io/BDA_course_Aalto/assignments/assignment2.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-paired_bootstrap",
      "title": "SciPy: paired bootstrap",
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-mcnemar",
      "title": "statsmodels: McNemar test",
      "url": "https://www.statsmodels.org/dev/generated/statsmodels.stats.contingency_tables.mcnemar.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-ab_srm",
      "title": "Microsoft Research: Diagnosing Sample Ratio Mismatch",
      "url": "https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-ab_metrics",
      "title": "Microsoft Research: Patterns of Trustworthy Experimentation",
      "url": "https://www.microsoft.com/en-us/research/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-leakage",
      "title": "scikit-learn: common pitfalls and data leakage",
      "url": "https://scikit-learn.org/stable/common_pitfalls.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-ocds_ids",
      "title": "Open Contracting Data Standard: identifiers",
      "url": "https://standard.open-contracting.org/latest/en/schema/identifiers/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-ocds_releases",
      "title": "Open Contracting Data Standard: release reference",
      "url": "https://standard.open-contracting.org/latest/en/schema/reference/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-vintages",
      "title": "Federal Reserve Bank of St. Louis: real-time periods",
      "url": "https://fred.stlouisfed.org/docs/api/fred/realtime_period.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-backtest",
      "title": "Bailey et al.: The Probability of Backtest Overfitting",
      "url": "https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "method-aa_decision",
      "title": "Artificial Analysis Decision Index v2: methodology",
      "url": "https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-decision",
      "title": "AA Decision Index v2",
      "url": "https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-decision-method",
      "title": "AA Decision Index methodology",
      "url": "https://artificialanalysis.ai/methodology/decision-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-v2-launch",
      "title": "AA Decision Index v2 launch, 2026-11-08",
      "url": "https://artificialanalysis.ai/es/articles/decision-index-v2",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-changelog",
      "title": "AA changelog",
      "url": "https://artificialanalysis.ai/changelog",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "jev-kit",
      "title": "Jev Decision Index reproduction kit",
      "url": "https://github.com/apolinario/decision-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "jev-engines",
      "title": "Jev engines / wire format",
      "url": "https://github.com/apolinario/decision-index/blob/main/docs/engines.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "jev-board",
      "title": "Jev Decision Index 0.4.1 dataset",
      "url": "https://huggingface.co/datasets/multimodalart/decision-index-leaderboard",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "jev-method",
      "title": "Jev board methodology metadata",
      "url": "https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/methodology.json",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "nace",
      "title": "Nace developers: publisher measurements",
      "url": "https://www.nace.ai/developers",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "drex-conflict",
      "title": "AA Drex Max v1.1 model page",
      "url": "https://artificialanalysis.ai/decision-models/drex-max-v1-1",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "reax-card",
      "title": "REAX 1.3 official model card",
      "url": "https://huggingface.co/decisionmodels/REAX-1.3",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "baseten",
      "title": "Base Labs is Baseten internal research team",
      "url": "https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-openness",
      "title": "AA Openness Index",
      "url": "https://artificialanalysis.ai/evaluations/artificial-analysis-openness-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-openness-method",
      "title": "AA Openness methodology",
      "url": "https://artificialanalysis.ai/methodology/openness-index",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-openness-spec",
      "title": "AA Openness specification V1.0",
      "url": "https://artificialanalysis.ai/downloads/AA-Openness-Index-Spec_V1-0.pdf",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-api-docs",
      "title": "Current AA Data API overview",
      "url": "https://artificialanalysis.ai/data-api/docs",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-api-reference",
      "title": "Current AA API endpoint reference",
      "url": "https://artificialanalysis.ai/data-api/docs/reference",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-api-old",
      "title": "Legacy AA API reference",
      "url": "https://artificialanalysis.ai/api-reference/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-terms",
      "title": "AA Data Platform Terms v1.1, 2026-08-19",
      "url": "https://artificialanalysiscdn.com/legal/ProDataPlatformTerms.pdf",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aa-site-terms",
      "title": "AA Site Terms of Use",
      "url": "https://artificialanalysis.ai/docs/legal/Terms-of-Use.pdf",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-aider-options",
      "title": "Aider: Options reference",
      "url": "https://aider.chat/docs/config/options.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-aider-commands",
      "title": "Aider: In-chat commands",
      "url": "https://aider.chat/docs/usage/commands.html",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-opencode-repo",
      "title": "OpenCode official repository",
      "url": "https://github.com/anomalyco/opencode",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-opencode-cli",
      "title": "OpenCode: Commands",
      "url": "https://opencode.ai/docs/cli/commands/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-opencode-api",
      "title": "OpenCode: API",
      "url": "https://opencode.ai/docs/api",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-omp-repo",
      "title": "Oh My Pi official repository",
      "url": "https://github.com/can1357/oh-my-pi",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-omp-stats",
      "title": "Oh My Pi: stats package",
      "url": "https://github.com/can1357/oh-my-pi/blob/main/packages/stats/README.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-omp-agent",
      "title": "Oh My Pi: agent package telemetry",
      "url": "https://github.com/can1357/oh-my-pi/blob/main/packages/agent/README.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-pi-readme",
      "title": "Pi: coding-agent README",
      "url": "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-pi-json",
      "title": "Pi: JSON event stream",
      "url": "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/json.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-pi-session-format",
      "title": "Pi: Session format",
      "url": "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-pi-sessions",
      "title": "Pi: Sessions",
      "url": "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-hermes-repo",
      "title": "Hermes official repository",
      "url": "https://github.com/NousResearch/hermes-agent",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-hermes-sessions",
      "title": "Hermes: Sessions",
      "url": "https://hermes-agent.nousresearch.com/docs/user-guide/sessions",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-hermes-models",
      "title": "Hermes: Configuring models",
      "url": "https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-codex-repo",
      "title": "Codex official repository",
      "url": "https://github.com/openai/codex",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-codex-exec",
      "title": "Codex: Non-interactive mode",
      "url": "https://learn.chatgpt.com/docs/non-interactive-mode",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-codex-config",
      "title": "Codex: Configuration reference",
      "url": "https://learn.chatgpt.com/docs/config-file/config-reference",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-claude-cli",
      "title": "Claude Code: CLI reference",
      "url": "https://code.claude.com/docs/en/cli-reference",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-claude-monitoring",
      "title": "Claude Code: Monitoring",
      "url": "https://code.claude.com/docs/en/monitoring-usage",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "executor-openrouter-rankings",
      "title": "OpenRouter: Rankings",
      "url": "https://openrouter.ai/rankings",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "automationbench",
      "title": "AutomationBench-AA: methodology and metric definitions",
      "url": "https://artificialanalysis.ai/evaluations/automationbench-aa",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "coding-index",
      "title": "Artificial Analysis Coding Agent Index methodology",
      "url": "https://artificialanalysis.ai/methodology/coding-agents-benchmarking",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "aider-benchmark",
      "title": "Aider polyglot benchmark",
      "url": "https://aider.chat/docs/leaderboards/",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "swe-bench",
      "title": "SWE-bench Verified",
      "url": "https://www.swebench.com/verified",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "analyst",
      "title": "AA-AnalystAgent methodology",
      "url": "https://artificialanalysis.ai/evaluations/aa-analyst-agent",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "terminalbench",
      "title": "Terminal-Bench 4.0",
      "url": "https://artificialanalysis.ai/evaluations/terminalbench-4-0",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "intelligence",
      "title": "Artificial Analysis Intelligence Index methodology",
      "url": "https://artificialanalysis.ai/methodology/intelligence-benchmarking",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "ifbench",
      "title": "IFBench",
      "url": "https://artificialanalysis.ai/evaluations/ifbench",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    },
    {
      "id": "long-context",
      "title": "Artificial Analysis long-context reasoning",
      "url": "https://artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning",
      "kind": "primary",
      "accessedAt": "2026-11-09"
    }
  ],
  "snapshots": ownSnapshots as OwnSnapshot[]
};
