/**
 * FinAI - AI-Powered Financial Intelligence Platform
 * Inspired by Hex/Fin architecture
 */

import { Suspense } from 'react';
import { 
  HeroSection, 
  AIEngineSection, 
  PerformanceMetrics,
  SemanticModelsSection,
  InteractiveDashboard,
  IntegrationsGrid,
  AwardsSection,
  PricingSection 
} from '@/components/finai';

export const metadata = {
  title: 'FinAI - AI-Powered Financial Intelligence | Tvijo',
  description: 'AI-powered market intelligence for financial analysis, market insights, and data-driven research. Public beta.',
};

export default function FinAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Performance Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <PerformanceMetrics />
      </Suspense>

      {/* AI Engine Architecture */}
      <AIEngineSection />

      {/* Interactive Dashboard Demo */}
      <Suspense fallback={<DashboardSkeleton />}>
        <InteractiveDashboard />
      </Suspense>

      {/* Semantic Models */}
      <SemanticModelsSection />

      {/* Integrations */}
      <IntegrationsGrid />

      {/* Awards & Recognition */}
      <AwardsSection />

      {/* Pricing */}
      <PricingSection />
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-800/50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="h-[600px] bg-slate-800/50 rounded-2xl animate-pulse" />
    </div>
  );
}
