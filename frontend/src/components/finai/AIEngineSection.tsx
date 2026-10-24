'use client';

import { Search, Database, BarChart3, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export function AIEngineSection() {
  const stages = [
    {
      number: 1,
      title: 'Refine the Query',
      description: 'Optimizes user input for comprehension. The AI engine parses financial terminology, market context, and temporal references to ensure accurate analysis.',
      icon: Search,
      color: 'blue',
      badge: 'QUERY OPTIMIZATION'
    },
    {
      number: 2,
      title: 'Retrieve Relevant Data',
      description: 'Powered by our proprietary fin-cx-retrieval model, searches across all market data sources and selects the most relevant information for accurate insights.',
      icon: Database,
      color: 'purple',
      badge: 'POWERED BY FIN-CX'
    },
    {
      number: 3,
      title: 'Rerank for Precision',
      description: 'The fin-cx-reranker model scores retrieved data for relevance and accuracy, then selects optimal data points for the AI to analyze.',
      icon: BarChart3,
      color: 'pink',
      badge: 'POWERED BY FIN-CX'
    },
    {
      number: 4,
      title: 'Generate Analysis',
      description: 'Using a bespoke generative process powered by GPT-4o, creates insights with the highest accuracy potential. Custom guidance controls tone and depth.',
      icon: Sparkles,
      color: 'orange',
      badge: 'AI GENERATION'
    },
    {
      number: 5,
      title: 'Validate Accuracy',
      description: 'Final validation step checks whether the analysis meets accuracy and safety standards, ensuring reliable financial intelligence.',
      icon: CheckCircle2,
      color: 'green',
      badge: 'QUALITY ASSURANCE'
    },
    {
      number: 6,
      title: 'Engine Optimization',
      description: 'Integrated performance tools continuously optimize analysis speed, efficiency, and precision based on real-world usage patterns.',
      icon: Zap,
      color: 'yellow',
      badge: 'PERFORMANCE'
    }
  ];

  return (
    <section className="relative px-4 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      
      <div className="container relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20">
            <Sparkles className="h-4 w-4" />
            <span>FIG 4.A - FIN AI ENGINE™</span>
          </div>
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            The Most Advanced{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Financial AI
            </span>
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
            A 6-stage pipeline that transforms your questions into actionable market intelligence
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative">
          {/* Central Pipeline */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 opacity-20" />

          {/* Stages */}
          <div className="space-y-12">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isEven = idx % 2 === 0;
              
              return (
                <div
                  key={idx}
                  className={`relative flex items-center gap-8 ${
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block rounded-2xl border border-slate-700 bg-slate-900/90 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/90 ${
                      isEven ? 'ml-auto' : 'mr-auto'
                    } max-w-md`}>
                      <div className={`mb-3 flex items-center gap-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <span className={`rounded-full bg-${stage.color}-500/10 px-3 py-1 text-xs font-semibold text-${stage.color}-400 border border-${stage.color}-500/20`}>
                          {stage.badge}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        [{stage.number}] {stage.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-400">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 bg-slate-900 shadow-2xl transition-all hover:scale-110 border-${stage.color}-500/50`}>
                      <Icon className={`h-8 w-8 text-${stage.color}-400`} />
                    </div>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 -z-10 rounded-2xl bg-${stage.color}-500/20 blur-xl`} />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-20 grid gap-6 md:grid-cols-4">
          {[
            { label: 'Processing Speed', value: '<90s', sublabel: 'Average analysis time' },
            { label: 'Coverage', value: '50+', sublabel: 'Data sources' },
            { label: 'Data Sources', value: '50+', sublabel: 'Real-time feeds' },
            { label: 'Monthly Cost', value: '$150', sublabel: 'AI processing budget' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-slate-300">{stat.label}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
