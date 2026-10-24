'use client';

import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Users, Heart } from 'lucide-react';

export function AwardsSection() {
  const capabilities = [
    {
      icon: TrendingUp,
      badge: 'Markets',
      title: 'Crypto, equities & macro',
      subtitle: '24/7 coverage',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Star,
      badge: 'Signals',
      title: 'Real-time alerts',
      subtitle: 'News, social & on-chain',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Users,
      badge: 'Access',
      title: 'Public beta',
      subtitle: 'Early access open',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Heart,
      badge: 'Pricing',
      title: 'Free during beta',
      subtitle: 'No card required',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300">
            <Award className="h-4 w-4" />
            <span>FinAI capabilities</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to research markets
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
              >
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                  {cap.badge}
                </div>
                <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cap.color} p-0.5`}>
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {cap.title}
                </h3>
                {cap.subtitle && (
                  <p className="text-sm text-slate-400">{cap.subtitle}</p>
                )}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cap.color}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Honest status bar (no fabricated ratings or user counts) */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-8">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {[
              { value: '24/7', label: 'Coverage', sublabel: 'Crypto + equities + macro' },
              { value: '50+', label: 'Data sources', sublabel: 'News, social, on-chain' },
              { value: 'Beta', label: 'Status', sublabel: 'Public early access' },
              { value: 'Open', label: 'Access', sublabel: 'Public pilot, no waitlist' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-300">{stat.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
