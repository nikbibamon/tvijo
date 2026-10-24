'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Sparkles, Building2 } from 'lucide-react';
import { parseLocale } from '@/i18n/config';

export function PricingSection() {
  const locale = parseLocale(usePathname());
  const plans = [
    {
      name: 'FinAI with your current setup',
      description: 'AI Agent works seamlessly with your existing infrastructure',
      price: '$0.99',
      period: 'PER ANALYSIS',
      minimum: '50 ANALYSES PER MONTH MINIMUM',
      features: [
        'Real-time market data access',
        'AI-powered analysis',
        'Semantic models',
        'API access',
        'Email support',
        'Basic dashboards'
      ],
      cta: 'Free 14 day trial',
      popular: false
    },
    {
      name: 'FinAI with Tvijo Platform',
      description: 'Combine AI Agent with Tvijo\'s complete financial intelligence suite',
      price: '$0.99',
      period: 'PER ANALYSIS',
      additional: '+ $29',
      additionalPeriod: 'PER USER SEAT PER MONTH',
      additionalLink: 'SEE ALL PLANS',
      features: [
        'Everything in basic plan',
        'Advanced portfolio analytics',
        'Custom AI models',
        'Priority support',
        'Advanced dashboards',
        'Team collaboration',
        'Custom integrations',
        'Dedicated account manager'
      ],
      cta: 'Free 14 day trial',
      popular: true
    }
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20">
            <Sparkles className="h-4 w-4" />
            <span>SIMPLE, TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Get started with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinAI
            </span>
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-3xl border p-8 backdrop-blur-sm transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-purple-500/10'
                  : 'border-slate-700 bg-slate-900/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  {plan.popular ? (
                    <Building2 className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-slate-400" />
                  )}
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <div className="text-sm text-slate-400">
                    <div className="font-semibold">{plan.period}</div>
                    <div className="text-xs">{plan.minimum}</div>
                  </div>
                </div>
                
                {plan.additional && (
                  <div className="mt-4 flex items-baseline gap-2 border-t border-slate-700 pt-4">
                    <span className="text-2xl font-bold text-white">{plan.additional}</span>
                    <div className="text-sm text-slate-400">
                      <div className="font-semibold">{plan.additionalPeriod}</div>
                      {plan.additionalLink && (
                        <Link href={`/${locale}/pricing`} className="text-xs text-blue-400 hover:text-blue-300">
                          {plan.additionalLink} →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link
                href={`/${locale}/pricing`}
                className={`mb-8 block w-full rounded-xl py-4 text-center text-lg font-semibold transition-all hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50'
                    : 'border border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Building2 className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
            </div>
            <p className="mb-6 text-slate-400">
              Custom solutions for large organizations with specific requirements. 
              Dedicated support, SLA guarantees, and custom integrations.
            </p>
            <Link
              href={`/${locale}/demo`}
              className="inline-block rounded-xl border border-slate-600 bg-slate-800 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-slate-700"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-slate-400">
            Questions about pricing?{' '}
            <Link href={`/${locale}/faq`} className="text-blue-400 hover:text-blue-300">
              View our FAQ →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
