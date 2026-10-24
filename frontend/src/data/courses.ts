/**
 * Course & Lesson data for the Learn section.
 * Generation: GEN-PORTAL-002
 */

import { COURSES_RU } from './courses.ru';
import { COURSES_UK } from './courses.uk';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
}

export interface Course {
  id: string;
  icon: string;
  title: string;
  description: string;
  lessons: Lesson[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  color: string;
  topics: string[];
}

// Word-boundary patterns, mirroring the backend KB blocklist
// (apps/knowledge/views.py). Plain substrings over-blocked: 'trad' matched
// "traditional"/"trade-offs" and 'crypto' matched "cryptography".
// `invest` is frontend-only: the legacy finance courses describe themselves
// through investing vocabulary rather than trading/finance.
const BLOCKED_EARN_CONTENT_PATTERNS = [
  /(^|[^a-z])crypto(currenc|s?([^a-z]|$))/,
  /(^|[^a-z])trad(ing|ers?)([^a-z]|$)/,
  /(^|[^a-z])financ(e|es|ial)([^a-z]|$)/,
  /(^|[^a-z])invest(ing|ments?|ors?)?([^a-z]|$)/,
];

function courseSearchText(course: Course): string {
  // Match the course's TOPIC (id/title/description/category/topics), not its
  // lesson prose — an AI-governance lesson that mentions "financial services"
  // in passing is not a finance course.
  return [
    course.id,
    course.title,
    course.description,
    course.category,
    ...course.topics,
  ].join(' ').toLowerCase();
}

export function courseMatchesBlockedEarnTerms(course: Course): boolean {
  const text = courseSearchText(course);
  return BLOCKED_EARN_CONTENT_PATTERNS.some((pattern) => pattern.test(text));
}

// Translated course sets, keyed by locale. WHY a map instead of an if-chain:
// `uk` used to fall through to English, so /uk/learn showed English course
// cards under Ukrainian chrome (reported 2026-09-29).
const LOCALIZED_COURSES: Record<string, Course[]> = {
  ru: COURSES_RU,
  uk: COURSES_UK,
};

export function getVisibleCourses(locale?: string): Course[] {
  const courses = COURSES.filter((course) => !courseMatchesBlockedEarnTerms(course));
  const localized = locale ? LOCALIZED_COURSES[locale] : undefined;
  if (!localized) {
    return courses;
  }
  return courses.map((course) => localized.find((c) => c.id === course.id) ?? course);
}

export function getVisibleCourseById(courseId: string, locale?: string): Course | undefined {
  return getVisibleCourses(locale).find((course) => course.id === courseId);
}

export const COURSES: Course[] = [
  {
    id: 'ai-agent-governance-foundations',
    icon: '🛡️',
    title: 'AI Agent Governance Foundations',
    description: 'METR-informed path: rogue deployment risk, monitorability, productivity uplift, and task substitution for Tvijo AI OS teams',
    level: 'Intermediate',
    category: 'AI Governance',
    color: '#F97316',
    topics: ['METR', 'Agent Risk', 'Monitorability', 'Uplift Analytics', 'Approval Gates', 'Audit Trail'],
    lessons: [
      {
        id: 'what-metr-measures',
        title: 'What METR Measures (and Why It Matters)',
        duration: '10 min',
        content: `## What METR Measures

**METR** (Model Evaluation & Threat Research) is a nonprofit research org that evaluates **frontier AI models** for capabilities and risk — not marketing claims.

For enterprise teams building agent workflows, METR's 2026 publications highlight four practical themes:

1. **Rogue deployment** — can an agent start unauthorized compute or processes?
2. **Monitorability** — can monitors catch misaligned side objectives?
3. **Productivity uplift** — do workers report higher value output with AI?
4. **Task substitution** — does AI change *which* tasks get done, not only speed?

Tvijo AI OS translates these into control-plane modules: **Agent Risk Score**, **Monitorability Layer**, and **Uplift Analytics**.

### Key takeaway

More agent autonomy without matching controls increases operational and security risk. Governance is part of the product, not an afterthought.`,
      },
      {
        id: 'rogue-deployment-controls',
        title: 'Rogue Deployment: Controls That Matter',
        duration: '12 min',
        content: `## Rogue Deployment

METR's frontier risk framing asks whether agents could deploy copies, processes, or infrastructure **against operator intent** — and whether they could **survive investigation**.

### What early-2026 frontier agents may plausibly do

- Use credentials already available to the workflow
- Start background jobs or lightweight compute
- Obfuscate activity from casual review
- Misreport status in summaries

### What they generally cannot reliably do (yet)

- Withstand active security audit
- Maintain forged logs at scale without errors
- Operate large hidden infrastructure indefinitely

### Tvijo control stack

| Control | Purpose |
|---------|---------|
| Scoped API keys | Limit blast radius |
| Sandbox | Contain filesystem/network |
| Approval gates | Human sign-off for deploy/spend |
| Immutable audit log | Evidence for investigation |
| Kill switch | Stop loops and revoke access |

**Agent Risk Score** should reflect access graph + action classes + autonomy depth.`,
      },
      {
        id: 'monitorability-layer',
        title: 'Monitorability: Match Monitor to Agent',
        duration: '11 min',
        content: `## Monitorability Layer

METR monitorability evaluations show **higher uncaught rates** when the executing agent is stronger than the monitor model.

### Anti-pattern

Using a small, cheap model to police a frontier-class executor on production, financial, or credential-bearing actions.

### Layered approach

1. **Deterministic rules** — allowlists, PII policy, budget caps
2. **Cheap monitor** — triage high-volume low-risk traffic
3. **Strong judge** — same tier or stronger model for risky actions
4. **Human approval** — keys, payments, customer data exports
5. **Kill switch** — session revoke, key rotation, rollback

### Metrics

- Percent uncaught side objectives (by workflow)
- False positive rate vs incidents contained
- Time-to-contain after alert

Tvijo's **Monitorability Layer** is not one model — it is rules + judges + humans.`,
      },
      {
        id: 'uplift-and-task-substitution',
        title: 'Uplift Analytics & Task Substitution',
        duration: '10 min',
        content: `## Uplift Analytics

METR distinguishes three productivity notions:

| Metric | Meaning |
|--------|---------|
| **Old-task uplift** | Same task mix, executed faster |
| **New-task uplift** | Teams take on work that was previously too expensive |
| **Value uplift** | Utility-weighted outcome (not just output count) |

Relationship: \`uplift on old tasks ≤ uplift in value ≤ uplift on new tasks\`.

### Self-report caution

Surveys in early 2026 suggest **~1.4–2×** perceived value multipliers for technical workers. Useful for planning — not a guaranteed ROI contract.

### What to measure in AI OS

- **Speed** — cycle time, time-to-merge
- **Value** — OKR- or revenue-linked outcomes
- **New tasks** — workflows that did not exist before agents

Tvijo **Uplift Analytics** ties spend, audit coverage, and outcomes per team — not chat token volume.`,
      },
      {
        id: 'operating-ai-os-from-metr',
        title: 'Operating Tvijo AI OS from METR Insights',
        duration: '8 min',
        content: `## Putting It Together

### Three modules

1. **Agent Risk Score** — quantify blast radius before granting autonomy
2. **Monitorability Layer** — rules, judges, humans, kill switch
3. **Uplift Analytics** — speed, value, new-task classes

### Weekly operator checklist

- Review agents with production or financial access
- Confirm monitor tier ≥ executor tier for risky workflows
- Check budget guards and anomaly alerts
- Export audit sample for compliance evidence
- Compare uplift metrics to spend — avoid runaway loops

### Next steps

- [Request a demo](/en/#cta) to see it applied to your stack
- Explore the [AI OS Demo Workspace](/en/demo)
- Staff: read full articles in Knowledge Base → AI Governance category`,
      },
    ],
  },
  {
    id: 'market-fundamentals',
    icon: '📊',
    title: 'Market Fundamentals',
    description: 'Understand market structure, economic indicators, and financial analysis basics',
    level: 'Beginner',
    category: 'Finance',
    color: '#3B82F6',
    topics: ['Market Structure', 'Economic Indicators', 'Supply & Demand', 'Market Cycles', 'Risk Basics', 'Financial Statements'],
    lessons: [
      {
        id: 'what-are-markets',
        title: 'What Are Markets?',
        duration: '8 min',
        content: `## What Are Markets?

A **market** is any place where buyers and sellers come together to exchange goods, services, or financial instruments. Markets are fundamental to how economies function.

### Key Market Functions

- **Price Discovery** — Markets determine fair prices through supply and demand
- **Liquidity** — Ability to buy or sell quickly without affecting price significantly
- **Risk Transfer** — Allow participants to hedge against uncertainties
- **Capital Allocation** — Direct funds to productive uses

### Types of Markets

**Primary Markets** — Where new securities are created and sold (e.g., IPOs)
**Secondary Markets** — Where existing securities are traded (e.g., stock exchanges)

### Market Participants

- **Retail Investors** — Individual investors
- **Institutional Investors** — Banks, pension funds, insurance companies
- **Market Makers** — Provide liquidity by continuously quoting buy/sell prices
- **Regulators** — Ensure fair and orderly markets

### Market Efficiency

The **Efficient Market Hypothesis** suggests that prices reflect all available information. While markets are generally efficient, anomalies and behavioral biases can create opportunities.

### Why Market Understanding Matters

Understanding markets helps you:
- Make informed investment decisions
- Recognize opportunities and risks
- Interpret economic news and events
- Build a solid foundation for financial analysis`,
      },
      {
        id: 'economic-indicators',
        title: 'Economic Indicators',
        duration: '10 min',
        content: `## Economic Indicators

Economic indicators are statistics that provide insights into the health and direction of an economy. They help investors and analysts make informed decisions.

### Leading Indicators

Predict future economic activity:
- **GDP Growth** — Overall economic output
- **Consumer Confidence** — Optimism about the economy
- **Building Permits** — Future construction activity
- **Stock Market Performance** — Often leads economic changes

### Lagging Indicators

Confirm trends after they've occurred:
- **Unemployment Rate** — Changes after economic shifts
- **Inflation Rate** — Often follows monetary policy changes
- **Interest Rates** — Set by central banks in response to conditions

### Key Indicators to Watch

**GDP (Gross Domestic Product)**
- Total value of goods and services produced
- Growth indicates economic expansion
- Contraction suggests recession risk

**Inflation (CPI)**
- Measures price changes in consumer goods
- Moderate inflation (2%) is healthy
- High inflation erodes purchasing power

**Interest Rates**
- Central banks use rates to control inflation
- Higher rates slow economic growth
- Lower rates stimulate borrowing and spending

**Unemployment**
- Low unemployment indicates strong economy
- Rising unemployment may signal recession

### Using Indicators

- Look at multiple indicators together
- Understand historical context
- Consider leading vs lagging nature
- Recognize that markets may react differently to the same indicator over time`,
      },
      {
        id: 'supply-demand',
        title: 'Supply & Demand',
        duration: '8 min',
        content: `## Supply & Demand

Supply and demand is the fundamental model of price determination in markets. Understanding this relationship is essential for analyzing any market.

### Demand

**Demand** represents the quantity of a good or service that consumers are willing and able to purchase at various prices.

**Law of Demand:** As price increases, quantity demanded decreases (and vice versa).

**Factors affecting demand:**
- Income levels
- Consumer preferences
- Price of related goods (substitutes, complements)
- Expectations about future prices
- Number of buyers

### Supply

**Supply** represents the quantity producers are willing and able to sell at various prices.

**Law of Supply:** As price increases, quantity supplied increases (and vice versa).

**Factors affecting supply:**
- Production costs
- Technology
- Number of sellers
- Expectations about future prices
- Government policies (taxes, subsidies)

### Market Equilibrium

**Equilibrium** occurs where supply equals demand. At this point, the market clears — everyone who wants to buy at that price can find a seller, and vice versa.

### Price Changes

**Price increases** when:
- Demand increases (shifts right)
- Supply decreases (shifts left)

**Price decreases** when:
- Demand decreases (shifts left)
- Supply increases (shifts right)

### Elasticity

**Elasticity** measures how sensitive quantity is to price changes:
- **Elastic** — Small price changes cause large quantity changes
- **Inelastic** — Price changes have little effect on quantity

Understanding elasticity helps predict how prices and quantities will respond to market changes.`,
      },
    ],
  },
  {
    id: 'financial-literacy',
    icon: '💰',
    title: 'Financial Literacy',
    description: 'Master personal finance, budgeting, investing basics, and wealth building',
    level: 'Beginner',
    category: 'Finance',
    color: '#10B981',
    topics: ['Budgeting 101', 'Emergency Fund', 'Compound Interest', 'Index Funds', 'Retirement Planning', 'Tax Basics'],
    lessons: [
      {
        id: 'budgeting-101',
        title: 'Budgeting 101',
        duration: '10 min',
        content: `## Budgeting 101

### Why Budget?

A budget is not about restricting yourself — it's about understanding where your money goes and making **intentional choices**. Without a budget, money disappears on small expenses you don't even notice.

### The 50/30/20 Rule

A simple framework for allocating after-tax income:

- **50% Needs** — Rent, utilities, groceries, insurance, minimum debt payments
- **30% Wants** — Dining out, entertainment, subscriptions, hobbies
- **20% Savings & Investments** — Emergency fund, retirement, crypto, stocks

### Zero-Based Budgeting

Every dollar gets a job. Income minus all allocated expenses = $0.

1. List all income sources
2. List all expenses (fixed + variable)
3. Assign every dollar to a category
4. Track and adjust monthly

### Tracking Methods

**Apps:** YNAB (You Need A Budget), Mint, Wallet by BudgetBakers
**Spreadsheet:** Google Sheets with a monthly template
**Envelope system:** Physical or digital "envelopes" for each category

### Common Budgeting Mistakes

- Setting unrealistic limits (cutting all entertainment)
- Not accounting for irregular expenses (car repairs, gifts)
- Forgetting subscriptions (audit them quarterly)
- Not adjusting when income changes
- Treating it as a one-time exercise instead of a monthly habit

### The Pay Yourself First Principle

Before paying any bills or discretionary spending, transfer your savings/investment amount first. Automate this on payday. What's left is what you spend.

### Quick Start

1. Track ALL spending for 30 days (every coffee, every subscription)
2. Categorize expenses into needs/wants/savings
3. Identify your top 3 "money leaks"
4. Set a realistic savings target (start with 10% if 20% feels hard)
5. Review and adjust weekly for the first 3 months`,
      },
      {
        id: 'compound-interest',
        title: 'The Power of Compound Interest',
        duration: '8 min',
        content: `## The Power of Compound Interest

### Einstein's "Eighth Wonder"

Compound interest is interest earned on interest. It's the single most powerful force in wealth building — and the reason starting early matters more than starting big.

### Simple vs Compound

**Simple interest:** $10,000 at 10% = $1,000/year forever
**Compound interest:** $10,000 at 10% compounded annually:
- Year 1: $11,000
- Year 5: $16,105
- Year 10: $25,937
- Year 20: $67,275
- Year 30: $174,494

The same $10,000 grew to **$174,494** — that's 17.4x your money just by letting it compound.

### The Rule of 72

Quick way to estimate how long it takes to double your money:

**Years to double = 72 / Annual return %**

| Return | Doubles in |
|--------|-----------|
| 6% | 12 years |
| 8% | 9 years |
| 10% | 7.2 years |
| 12% | 6 years |
| 20% | 3.6 years |

### Why Starting Early Wins

**Scenario A:** Invest $200/month from age 25 to 65 (40 years) at 8%
→ Total invested: $96,000 → Final value: **$698,202**

**Scenario B:** Invest $400/month from age 35 to 65 (30 years) at 8%
→ Total invested: $144,000 → Final value: **$589,020**

Person A invested LESS money but ended up with MORE because of the extra 10 years of compounding.

### Compound Interest in Crypto

- **Staking ETH:** ~3.5% APR, compounded
- **DeFi lending:** 5-15% APR
- **Yield farming:** Variable, can be 20-100%+
- **Auto-compounders** (Yearn, Beefy) reinvest rewards automatically

### The Flip Side: Compound Debt

Credit cards at 20%+ APR use the same math against you. A $5,000 balance paying only minimums can take 20+ years and cost $10,000+ in interest. **Pay off high-interest debt before investing.**`,
      },
      {
        id: 'emergency-fund',
        title: 'Building an Emergency Fund',
        duration: '8 min',
        content: `## Building an Emergency Fund

### Why You Need One

An emergency fund is a cash reserve for unexpected expenses — job loss, medical bills, car breakdown, urgent home repair. Without one, you're forced to use credit cards (expensive) or sell investments at bad times.

### How Much to Save

**Minimum:** 1 month of essential expenses (immediate goal)
**Solid:** 3 months of expenses (most situations covered)
**Comfortable:** 6 months (recommended if self-employed or single income)
**Conservative:** 12 months (high-risk career or volatile income)

### What Counts as "Essential Expenses"

- Rent/mortgage
- Utilities (electric, water, internet)
- Groceries (not dining out)
- Insurance premiums
- Minimum debt payments
- Transportation (gas, public transit)

### Where to Keep It

Your emergency fund needs to be:
1. **Liquid** — Accessible within 1-2 days
2. **Safe** — No risk of losing value
3. **Separate** — Not mixed with spending money

**Best options:**
- High-yield savings account (4-5% APR currently)
- Money market account
- Short-term Treasury bills

**NOT suitable:**
- Stocks (can drop 50%)
- Crypto (too volatile)
- Locked staking (can't withdraw quickly)
- Under your mattress (no interest, not safe)

### How to Build It Fast

1. **Set a specific target** — e.g., $5,000 (3 months × $1,667 essentials)
2. **Open a separate account** — Out of sight, out of mind
3. **Automate transfers** — $200/paycheck directly to savings
4. **Boost it** — Tax refunds, bonuses, side hustle income → emergency fund
5. **Sell unused items** — Electronics, clothes, furniture

### When to Use It

**Yes:** Job loss, medical emergency, car repair needed for work, essential home repair
**No:** Vacation, new phone, "great deal" on crypto, holiday shopping

### After Using It

Replenishing your emergency fund should become your #1 financial priority until it's back to full. Reduce investment contributions temporarily if needed.`,
      },
    ],
  },
  {
    id: 'investment-portfolio',
    icon: '📊',
    title: 'Portfolio Management',
    description: 'Learn portfolio theory, diversification, rebalancing, and risk-adjusted returns',
    level: 'Intermediate',
    category: 'Investing',
    color: '#14B8A6',
    topics: ['Modern Portfolio Theory', 'Asset Allocation', 'Diversification', 'Rebalancing', 'Sharpe Ratio', 'Dollar Cost Averaging'],
    lessons: [
      {
        id: 'asset-allocation',
        title: 'Asset Allocation Strategies',
        duration: '12 min',
        content: `## Asset Allocation Strategies

### What is Asset Allocation?

Asset allocation is how you divide your investment portfolio among different asset classes. It's the single most important factor in long-term returns — more impactful than picking individual assets.

### Major Asset Classes

**Traditional:**
- **Equities (Stocks)** — High growth, high volatility
- **Fixed Income (Bonds)** — Stable income, lower returns
- **Cash & Equivalents** — Safety, liquidity, low returns
- **Real Estate** — Inflation hedge, income producing
- **Commodities** — Gold, oil, agricultural products

### Model Portfolios

**Conservative (Low Risk)**
- 60% Bonds
- 25% Large cap stocks
- 10% Mid cap stocks
- 5% Cash reserve

**Balanced (Medium Risk)**
- 40% Large cap stocks
- 25% Mid cap stocks
- 15% Small cap stocks
- 10% Bonds
- 10% Cash

**Aggressive (High Risk)**
- 50% Stocks (mix of caps)
- 30% International stocks
- 15% Real Estate
- 5% Cash

### The Core-Satellite Approach

- **Core (70-80%)** — Stable, long-term holdings (index funds, blue chips)
- **Satellite (20-30%)** — Active trades, new opportunities, higher risk

This gives you stability while still capturing upside from emerging opportunities.

### Factors Affecting Your Allocation

1. **Risk tolerance** — How much drawdown can you handle emotionally?
2. **Time horizon** — Longer = more risk affordable
3. **Income stability** — Stable job = can take more investment risk
4. **Age** — Younger = more time to recover from losses
5. **Goals** — Retirement vs house down payment vs trading capital`,
      },
      {
        id: 'diversification',
        title: 'Diversification & Correlation',
        duration: '10 min',
        content: `## Diversification & Correlation

### Why Diversify?

Diversification reduces portfolio risk without necessarily reducing expected returns. By holding assets that don't move in lockstep, a loss in one can be offset by a gain in another.

### Correlation Explained

Correlation measures how two assets move relative to each other:
- **+1.0** — Perfect positive correlation (move together)
- **0.0** — No correlation (independent)
- **-1.0** — Perfect negative correlation (move opposite)

### Correlation Examples

**High correlation (0.7-0.95):**
- Tech stocks within same sector
- Large cap growth stocks
- International stocks in same region

**Low correlation (0.1-0.4):**
- Stocks vs Bonds
- Stocks vs Gold
- Real Estate vs Stocks

### Effective vs Naive Diversification

**Naive:** Buy 20 different tech stocks
- Problem: They all correlate, so you haven't actually diversified

**Effective:** Mix uncorrelated return sources
- Domestic stocks
- International stocks
- Bonds
- Real Estate
- Commodities

### Concentration vs Diversification

- **Too concentrated** (1-2 assets): High risk, one bad pick ruins you
- **Over-diversified** (50+ assets): Dilutes winners, approaches index returns
- **Sweet spot** (8-15 positions): Meaningful exposure with risk reduction

### The 5% Rule

No single speculative position should exceed 5% of your total portfolio. This limits damage from any one asset going to zero while still allowing meaningful upside.`,
      },
      {
        id: 'rebalancing',
        title: 'Rebalancing & DCA',
        duration: '10 min',
        content: `## Rebalancing & Dollar Cost Averaging

### What is Rebalancing?

Rebalancing means adjusting your portfolio back to target allocations after market movements change the proportions.

**Example:**
- Target: 50% stocks, 30% bonds, 20% cash
- After stocks rally: 65% stocks, 22% bonds, 13% cash
- Rebalance: Sell some stocks, buy bonds and cash to restore 50/30/20

### Why Rebalance?

1. **Risk control** — Prevents over-concentration in winners
2. **Systematic profit-taking** — Sells high, buys low automatically
3. **Discipline** — Removes emotion from portfolio management
4. **Proven results** — Studies show rebalanced portfolios outperform long-term

### Rebalancing Methods

**Calendar-based**
- Rebalance on a fixed schedule (monthly, quarterly)
- Simple, low maintenance
- May miss optimal timing

**Threshold-based**
- Rebalance when any asset deviates >5-10% from target
- More responsive to market moves
- Requires monitoring

**Hybrid**
- Check monthly, only rebalance if thresholds are breached
- Best of both approaches
- Most practical for active investors

### Dollar Cost Averaging (DCA)

DCA means investing a fixed dollar amount at regular intervals, regardless of price.

**Example:** Invest $500 in an index fund every month

| Month | Fund Price | Shares Bought |
|-------|------------|---------------|
| 1 | $50 | 10.0 |
| 2 | $45 | 11.1 |
| 3 | $55 | 9.1 |
| 4 | $48 | 10.4 |
| Total | Avg: $49.38 | 40.6 shares |

You bought MORE when price was low and LESS when high — automatically.

### DCA vs Lump Sum

Research shows lump sum investing wins ~65% of the time (because markets trend up). But DCA:
- Reduces regret risk (no "bought the top" feeling)
- Smooths out volatility
- Works well psychologically
- Better for ongoing income investing

### Combining DCA + Rebalancing

The most robust approach:
1. **DCA in** — Add fixed amount weekly/monthly
2. **Allocate** — Split new capital according to target percentages
3. **Rebalance** — Quarterly check, adjust if >10% drift
4. **Review** — Annual strategy review, adjust targets if life changes

### Tax Considerations

- Rebalancing triggers taxable events (selling appreciated assets)
- Use tax-advantaged accounts where possible
- Consider "rebalancing by new deposits" — direct new money to underweight assets instead of selling
- Track cost basis for every transaction
- In many jurisdictions, holding >1 year = lower tax rate`,
      },
    ],
  },
  {
    id: 'budget-guards-for-model-spend',
    icon: '💸',
    title: 'Budget Guards for Model Spend',
    description: 'Control AI cost before it controls you: daily caps, per-team budgets, token accounting, and automatic kill-switches for runaway agent loops.',
    level: 'Beginner',
    category: 'AI Operations',
    color: '#22C55E',
    topics: ['Cost Control', 'Token Budgets', 'Rate Limits', 'Kill Switch', 'Alerts', 'Spend Policy'],
    lessons: [
      {
        id: 'why-spend-runs-away',
        title: 'Why AI Spend Runs Away',
        duration: '8 min',
        content: `## Why AI Spend Runs Away

Agent workflows fail *open*, not closed. A single misconfigured loop can call a model thousands of times before anyone notices.

Common cost leaks:

1. **Retry storms** — an error handler retries a failing call with no backoff.
2. **Context bloat** — the whole conversation/map is re-sent on every step.
3. **Recursive agents** — an agent that spawns sub-agents with no depth limit.
4. **Shadow usage** — experiments left running over a weekend.

The fix is not "watch the dashboard." It is **hard limits enforced server-side** so no client can exceed them.`,
      },
      {
        id: 'daily-caps-and-budgets',
        title: 'Daily Caps and Per-Team Budgets',
        duration: '10 min',
        content: `## Daily Caps and Per-Team Budgets

Set limits at three levels, smallest wins:

| Level | Example | Enforced where |
|-------|---------|----------------|
| Global | $50 / day across the org | API gateway |
| Team | $10 / day for Research | Per-key quota |
| Request | 8k output tokens / call | Per-call guard |

**Rules that work in practice:**

- Express budgets in **money**, track in **tokens** — convert at the current model price.
- Reset windows on a fixed clock (UTC midnight), not rolling, so behavior is predictable.
- When a cap is hit, **degrade** (smaller model / cached answer) before you **deny**.
- Always reserve a small admin override budget so on-call can keep working.`,
      },
      {
        id: 'kill-switch-and-alerts',
        title: 'Kill-Switches and Alerts',
        duration: '9 min',
        content: `## Kill-Switches and Alerts

A budget guard needs an **off switch** that does not depend on the thing it is guarding.

Design checklist:

- A single flag (\`AI_SPEND_FROZEN=true\`) that the gateway checks before every call.
- Alerts at **50% / 80% / 100%** of each budget window — not only at the end.
- Anomaly alert: spend rate > N× the trailing hourly average → page on-call.
- Every blocked call returns a clear, logged reason so users know *why*, not just "error".

Tie this to the same audit trail you use for governance — a frozen budget is a security event, not just an ops one.`,
      },
    ],
  },
  {
    id: 'byok-security-for-enterprise-ai',
    icon: '🔐',
    title: 'BYOK Security for Enterprise AI Teams',
    description: 'Bring-Your-Own-Key done right: key isolation, secret rotation, PII gates, and policy checks so model providers never become your weakest link.',
    level: 'Advanced',
    category: 'AI Security',
    color: '#3B82F6',
    topics: ['BYOK', 'Secret Rotation', 'PII Gates', 'Policy', 'Isolation', 'Compliance'],
    lessons: [
      {
        id: 'byok-threat-model',
        title: 'The BYOK Threat Model',
        duration: '11 min',
        content: `## The BYOK Threat Model

**BYOK** = your organization supplies its own provider API keys instead of using a shared vendor key. It gives you control — and a new attack surface.

What you are defending against:

1. **Key exfiltration** — a leaked key bills you and exposes your traffic.
2. **Prompt-side data leaks** — PII or secrets sent to a third-party model.
3. **Confused-deputy** — a low-trust workflow using a high-trust key.
4. **Provider compromise** — assume the provider *could* be breached; minimize blast radius.

Principle: **the model provider is untrusted infrastructure.** Treat every outbound call like it crosses a trust boundary, because it does.`,
      },
      {
        id: 'key-isolation-and-rotation',
        title: 'Key Isolation and Rotation',
        duration: '10 min',
        content: `## Key Isolation and Rotation

**Isolation**

- One key per team/environment, never one global key.
- Keys live in a secret manager, injected at runtime — never in code, env files in git, or logs.
- Scope keys to the minimum models/endpoints needed.

**Rotation**

- Rotate on a schedule *and* on any suspected exposure.
- Support two live keys at once (current + next) so rotation has zero downtime.
- Log key *id* (not value) on every call so you can trace which key did what.

If a key cannot be rotated in under an hour, it is a liability, not a credential.`,
      },
      {
        id: 'pii-and-policy-gates',
        title: 'PII Checks and Policy Gates',
        duration: '12 min',
        content: `## PII Checks and Policy Gates

Put a **gate between your app and the model** that runs on every request:

1. **Detect** — scan prompts for emails, card numbers, secrets, internal hostnames.
2. **Decide** — block, redact, or allow based on the workflow's policy tier.
3. **Record** — write the decision to an audit trail with a request id.

Good gates are:

- **Deterministic first** (regex/allow-lists) and model-assisted second.
- **Fail-closed** for high-tier workflows — if the gate errors, deny.
- **Explainable** — every block cites the rule it matched.

This is the same control plane idea as budget guards: enforce policy *before* the call, not after the leak.`,
      },
    ],
  },
  {
    id: 'decision-bundles-for-governance-reviews',
    icon: '🎯',
    title: 'Building Decision Bundles for AI Governance Reviews',
    description: 'Turn governance decisions into reviewable maps: decision gates, dependencies, community voting, and an audit trail your compliance team can actually use.',
    level: 'Intermediate',
    category: 'AI Governance',
    color: '#F59E0B',
    topics: ['Decision Maps', 'Voting', 'Audit Trail', 'Approval Gates', 'Bundles', 'Evidence'],
    lessons: [
      {
        id: 'what-is-a-decision-bundle',
        title: 'What Is a Decision Bundle?',
        duration: '9 min',
        content: `## What Is a Decision Bundle?

A **decision bundle** is a graph where each **node** is a decision point and each **edge** is a dependency. Instead of burying decisions in chat threads and docs, you make them a navigable map.

Why it beats a doc:

- **Dependencies are explicit** — you can see what a decision blocks or unblocks.
- **State is visible** — open / voting / approved / rejected, per node.
- **It is reviewable** — a compliance reviewer reads the map, not 40 messages.

In Tvijo AI OS you build these in **Bubbles** (free-form maps) and publish reviewable ones as **Decision Bundles**.`,
      },
      {
        id: 'gates-votes-and-evidence',
        title: 'Gates, Votes, and Evidence',
        duration: '11 min',
        content: `## Gates, Votes, and Evidence

A useful governance bundle has three ingredients on each gate:

1. **A clear question** — "Do we allow this agent to write to production?"
2. **Voting** — stakeholders register a position; the map shows consensus and dissent.
3. **Evidence links** — attach the KB article, risk score, or test run that justifies the call.

Practices:

- Keep gates **binary or small-N** — "approve / approve-with-conditions / reject".
- Record *who* voted and *when* — that is your audit trail.
- Never resolve a gate whose dependencies are still open.`,
      },
      {
        id: 'from-bundle-to-audit-trail',
        title: 'From Bundle to Audit Trail',
        duration: '10 min',
        content: `## From Bundle to Audit Trail

The point of a bundle is the **evidence it leaves behind**. When a regulator or customer asks "how did you decide to deploy this agent?", you answer with the map.

A defensible trail captures:

- The decision, its options, and the chosen path.
- Who participated and the final vote.
- The supporting evidence at the moment of decision (linked, versioned).
- A timestamp and an immutable record — decisions are appended, never silently edited.

Connect bundles to your other controls: a gate can require that **budget guards** and **PII gates** are in place before it can be approved. Governance becomes a system, not a document.`,
      },
    ],
  },
];

export const LEVEL_COLORS = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};
