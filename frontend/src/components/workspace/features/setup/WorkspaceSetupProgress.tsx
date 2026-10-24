'use client';

import Link from 'next/link';
import type { BootstrapResponse } from '@/types/workspace';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import type { Locale } from '@/i18n/config';
import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';

type SetupStep = {
  id: 'workspace' | 'provider' | 'budget' | 'run';
  label: string;
  description: string;
  complete: boolean;
  href: string;
  action: string;
};

function setupSteps(bootstrap: BootstrapResponse, runCount: number, steps: ReadonlyArray<{ label: string; description: string; action: string }>): SetupStep[] {
  const budget = bootstrap.budget_summary;
  const budgetConfigured = Boolean(
    budget && (budget.daily_limit !== null || budget.monthly_limit !== null),
  );

  return [
    {
      id: 'workspace',
      label: steps[0].label,
      description: steps[0].description,
      complete: true,
      href: '/workspace',
      action: steps[0].action,
    },
    {
      id: 'provider',
      label: steps[1].label,
      description: steps[1].description,
      complete: bootstrap.connection_summary.verified_credentials > 0,
      href: '/workspace/connections',
      action: steps[1].action,
    },
    {
      id: 'budget',
      label: steps[2].label,
      description: steps[2].description,
      complete: budgetConfigured,
      href: '/workspace/billing',
      action: steps[2].action,
    },
    {
      id: 'run',
      label: steps[3].label,
      description: steps[3].description,
      complete: runCount > 0,
      href: '/workspace/apps',
      action: steps[3].action,
    },
  ];
}

export function WorkspaceSetupProgress({
  bootstrap,
  runCount,
  locale,
  variant = 'home',
}: {
  bootstrap: BootstrapResponse;
  runCount: number;
  locale: Locale;
  variant?: 'home' | 'overview';
}) {
  const copy = getWorkspaceCopy(locale);
  const steps = setupSteps(bootstrap, runCount, copy.setup.steps);
  const completeCount = steps.filter((step) => step.complete).length;
  const currentIndex = steps.findIndex((step) => !step.complete);
  const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex;
  const activeStep = steps[activeIndex];
  const allComplete = completeCount === steps.length;

  return (
    <section className={`twk-setup-progress is-${variant}`} id="workspace-setup">
      <header className="twk-setup-head">
        <h2>{variant === 'home' ? copy.setup.homeTitle : copy.setup.overviewTitle}</h2>
        <span>{formatTemplate(copy.setup.doneOf, { count: completeCount, total: steps.length })}</span>
      </header>

      <ol className="twk-setup-steps">
        {steps.map((step, index) => {
          const current = index === activeIndex && !allComplete;
          return (
            <li className={step.complete ? 'is-complete' : current ? 'is-current' : ''} key={step.id}>
              <span className="twk-step-marker" aria-hidden="true">
                {step.complete ? <WorkspaceIcon name="check" /> : index + 1}
              </span>
              <div>
                <strong>{step.label}</strong>
                {variant === 'home' ? <small>{step.description}</small> : <small>{step.complete ? copy.setup.complete : current ? copy.setup.current : copy.setup.pending}</small>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="twk-setup-action">
        <Link className="twk-primary-button" href={`/${locale}${allComplete ? '/workspace/activity' : activeStep.href}`}>
          {allComplete ? copy.setup.viewActivity : activeStep.action}
        </Link>
        {variant === 'home' ? <Link className="twk-text-link" href={`/${locale}/workspace`}>{copy.setup.openWorkspace}</Link> : null}
      </div>

      {variant === 'overview' ? (
        <aside className="twk-activation-target">
          <WorkspaceIcon name="target" />
          <div><strong>{copy.setup.activationTarget}</strong><span>{copy.setup.activationTargetSub}</span></div>
          <Link href={`/${locale}/proof`}>{copy.setup.whyThisMatters}</Link>
        </aside>
      ) : null}
    </section>
  );
}
