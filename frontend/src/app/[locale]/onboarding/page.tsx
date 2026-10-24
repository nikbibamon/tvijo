'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import { portalApiFetch } from '@/lib/portal-auth-fetch';
import { parseLocale } from '@/i18n/config';

// ---------- constants ----------
const ROLES = [
  { value: 'trader', label: 'Trader', icon: '📈', desc: 'Active trading on exchanges' },
  { value: 'investor', label: 'Investor', icon: '💰', desc: 'Long-term portfolio building' },
  { value: 'manager', label: 'Manager / PM', icon: '📋', desc: 'Team & project leadership' },
  { value: 'devops', label: 'DevOps Engineer', icon: '⚙️', desc: 'Infrastructure & CI/CD' },
  { value: 'boss', label: 'CEO / Founder', icon: '👔', desc: 'Business strategy & growth' },
  { value: 'designer', label: 'UI/UX Designer', icon: '🎨', desc: 'Figma, prototyping, UX research' },
  { value: 'admin_mod', label: 'Admin / Moderator', icon: '🛡️', desc: 'Platform management' },
  { value: 'architect', label: 'Software Architect', icon: '🏗️', desc: 'System design & patterns' },
  { value: 'developer', label: 'Software Developer', icon: '💻', desc: 'Frontend / Backend / Full-stack' },
  { value: 'data_analyst', label: 'Data Analyst', icon: '📊', desc: 'SQL, Python, dashboards, ML' },
  { value: 'qa', label: 'QA Engineer', icon: '✅', desc: 'Testing & quality assurance' },
  { value: 'content', label: 'Content Creator', icon: '✍️', desc: 'SEO writing, marketing' },
];

const TRADER_LEVELS = [
  { value: 'newbie', label: 'Beginner', desc: 'Less than 1 year of experience', icon: '🌱' },
  { value: 'middle', label: 'Intermediate', desc: '1–3 years, familiar with basics', icon: '📗' },
  { value: 'pro', label: 'Advanced', desc: '3–5 years, consistent strategies', icon: '🎯' },
  { value: 'expert', label: 'Expert', desc: '5+ years, profitable track record', icon: '🏆' },
];

const TECH_LEVELS = [
  { value: 'junior', label: 'Junior', desc: '0–2 years in industry', icon: '🌱' },
  { value: 'middle', label: 'Middle', desc: '2–5 years, independent work', icon: '📗' },
  { value: 'senior', label: 'Senior', desc: '5+ years, mentoring others', icon: '🎯' },
  { value: 'lead', label: 'Lead / Principal', desc: '8+ years, architecture decisions', icon: '🏆' },
];

const INCOME_LEVELS = [
  { value: '<10k', label: 'Up to $10K', desc: 'per month', color: 'from-blue-500/20 to-blue-600/10' },
  { value: '10k-100k', label: '$10K — $100K', desc: 'per month', color: 'from-green-500/20 to-green-600/10' },
  { value: '100k-1m', label: '$100K — $1M', desc: 'per month', color: 'from-purple-500/20 to-purple-600/10' },
  { value: '>1m', label: '$1M+', desc: 'per month', color: 'from-orange-500/20 to-orange-600/10' },
];

const INTERESTS = [
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'stocks', label: 'Stocks', icon: '📈' },
  { value: 'forex', label: 'Forex', icon: '💱' },
  { value: 'commodities', label: 'Commodities', icon: '🛢️' },
  { value: 'etf', label: 'ETFs', icon: '📦' },
  { value: 'bonds', label: 'Bonds', icon: '📜' },
  { value: 'business', label: 'Business', icon: '🏢' },
  { value: 'technology', label: 'Technology', icon: '🤖' },
];

const TECH_ROLES = ['devops', 'architect', 'developer', 'data_analyst', 'qa'];
const TRADER_ROLES = ['trader', 'investor'];

// ---------- component ----------
export default function OnboardingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = parseLocale(pathname);

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [platformRole, setPlatformRole] = useState('');
  const [traderLevel, setTraderLevel] = useState('');
  const [techLevel, setTechLevel] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [tradingInterests, setTradingInterests] = useState<string[]>([]);

  // Check auth on mount
  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push(`/${locale}/login`);
    }
  }, [locale, router]);

  const needsTraderLevel = TRADER_ROLES.includes(platformRole);
  const needsTechLevel = TECH_ROLES.includes(platformRole);

  const canProceed = () => {
    switch (step) {
      case 1: return !!platformRole;
      case 2:
        if (needsTraderLevel && !traderLevel) return false;
        if (needsTechLevel && !techLevel) return false;
        return true;
      case 3: return true; // income is optional
      case 4: return true; // interests are optional
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const data: Record<string, any> = {
        platform_role: platformRole,
        onboarding_completed: true,
      };
      if (needsTraderLevel && traderLevel) data.trader_level = traderLevel;
      if (needsTechLevel && techLevel) data.tech_level = techLevel;
      if (monthlyIncome) data.monthly_income = monthlyIncome;
      if (tradingInterests.length > 0) data.trading_interests = tradingInterests;

      // Actually save the profile data
      await portalApiFetch('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      router.push(`/${locale}/profile`);
    } catch (e: any) {
      setError('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  const toggleInterest = (v: string) => {
    setTradingInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  // Auto-skip step 2 if role doesn't need sub-level
  const goNext = () => {
    if (step === 1 && !needsTraderLevel && !needsTechLevel) {
      setStep(3); // skip level step
    } else {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const goBack = () => {
    if (step === 3 && !needsTraderLevel && !needsTechLevel) {
      setStep(1); // skip back over level step
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
  };

  return (
    <div className="bm-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">What&apos;s your primary role?</h1>
            <p className="text-gray-400 mb-6 text-sm">This helps us personalize your Knowledge Base experience.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { setPlatformRole(r.value); setTraderLevel(''); setTechLevel(''); }}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    platformRole === r.value
                      ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Level (conditional) */}
        {step === 2 && needsTraderLevel && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Your trading experience level</h1>
            <p className="text-gray-400 mb-6 text-sm">We&apos;ll recommend articles matching your skill level.</p>
            <div className="grid grid-cols-2 gap-3">
              {TRADER_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setTraderLevel(l.value)}
                  className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                    traderLevel === l.value
                      ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl mb-2">{l.icon}</div>
                  <div className="font-medium">{l.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && needsTechLevel && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Your technical seniority level</h1>
            <p className="text-gray-400 mb-6 text-sm">We&apos;ll adjust content complexity for you.</p>
            <div className="grid grid-cols-2 gap-3">
              {TECH_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setTechLevel(l.value)}
                  className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                    techLevel === l.value
                      ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl mb-2">{l.icon}</div>
                  <div className="font-medium">{l.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Income */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Monthly income range</h1>
            <p className="text-gray-400 mb-6 text-sm">Optional. Helps us recommend appropriate strategies and tools.</p>
            <div className="grid grid-cols-2 gap-3">
              {INCOME_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setMonthlyIncome(prev => prev === l.value ? '' : l.value)}
                  className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                    monthlyIncome === l.value
                      ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="font-semibold text-lg">{l.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{l.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">You can skip this step — it&apos;s completely optional.</p>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">What interests you?</h1>
            <p className="text-gray-400 mb-6 text-sm">Select all that apply. This customizes your news feed and KB recommendations.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INTERESTS.map(i => (
                <button
                  key={i.value}
                  onClick={() => toggleInterest(i.value)}
                  className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                    tradingInterests.includes(i.value)
                      ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl mb-1">{i.icon}</div>
                  <div className="text-sm font-medium">{i.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">Optional — you can always update this in your profile settings.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={goBack}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-lg bg-emerald-400 text-[#001b18] font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-emerald-400 text-[#001b18] font-semibold text-sm disabled:opacity-50 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              {saving ? 'Saving...' : 'Complete Setup →'}
            </button>
          )}
        </div>

        {/* Skip link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Skip for now — I&apos;ll set this up later
          </button>
        </div>
      </main>
    </div>
  );
}
