// Honest competitor comparisons for tvijo.com /compare pages.
//
// Positioning rule (see memory: tvijo-marketing-trust-positioning):
// TVIJO is NOT "better than" any of these tools. It is one control plane that
// spans routing + spend + governance, where each competitor owns one strong
// category. Every page must lead with what the competitor does WELL, then show
// where TVIJO's single-layer approach differs. No fabricated benchmarks.

export type CompareValue = true | false | 'partial' | string;

export interface CompareRow {
  capability: string;
  tvijo: CompareValue;
  competitor: CompareValue;
}

export interface Comparison {
  slug: string; // e.g. "tvijo-vs-portkey"
  competitor: string; // "Portkey"
  category: string; // "AI gateway"
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  competitorSummary: string; // honest, positive description of the competitor
  tvijoSummary: string;
  rows: CompareRow[];
  chooseCompetitor: string[];
  chooseTvijo: string[];
  honestNote: string; // "TVIJO is not a replacement for X..."
}

export const comparisons: Comparison[] = [
  {
    slug: "tvijo-vs-portkey",
    competitor: "Portkey",
    category: "AI gateway",
    metaTitle: "TVIJO vs Portkey — AI gateway + governance compared",
    metaDescription:
      "Portkey is a strong AI gateway for routing, caching and cost tracking. See where TVIJO differs by adding governance, audit evidence and EU AI Act readiness on top.",
    headline: "TVIJO vs Portkey",
    intro:
      "Both sit in front of your model providers. Portkey is a focused, mature AI gateway. TVIJO is a broader control plane that adds a governance and audit-evidence layer on top of the same gateway capabilities.",
    competitorSummary:
      "Portkey is an excellent AI gateway: a unified API across providers, smart routing and fallbacks, caching, request logging, budget limits and guardrails. If you primarily need a fast, reliable gateway in front of many LLMs, Portkey does that job very well.",
    tvijoSummary:
      "TVIJO covers the same gateway essentials — routing, BYOK, budget guards, PII handling — but its centre of gravity is governance: turning every request into board- and auditor-ready evidence, with EU AI Act readiness workflows built in.",
    rows: [
      { capability: "Unified multi-provider API", tvijo: true, competitor: true },
      { capability: "Smart routing & fallbacks", tvijo: true, competitor: true },
      { capability: "Caching", tvijo: "partial", competitor: true },
      { capability: "Budget guards / spend caps", tvijo: true, competitor: true },
      { capability: "BYOK key vault", tvijo: true, competitor: true },
      { capability: "PII / secrets guard", tvijo: true, competitor: true },
      { capability: "Audit evidence export (auditor-ready)", tvijo: true, competitor: "partial" },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: false },
      { capability: "Risk classification & policy packs", tvijo: true, competitor: "partial" },
    ],
    chooseCompetitor: [
      "You mainly need a battle-tested gateway with caching and fallbacks.",
      "Your priority is raw latency, throughput and provider coverage.",
      "You already have governance handled elsewhere.",
    ],
    chooseTvijo: [
      "You need audit evidence and compliance reporting, not just logs.",
      "EU AI Act readiness is on your roadmap.",
      "You want routing, spend and governance in one cockpit instead of stitched tools.",
    ],
    honestNote:
      "TVIJO is not a drop-in replacement for Portkey's gateway depth. If gateway performance is your only need, Portkey is a great choice. TVIJO is for teams that also need governance and audit evidence in the same layer.",
  },
  {
    slug: "tvijo-vs-langfuse",
    competitor: "Langfuse",
    category: "LLM observability (open source)",
    metaTitle: "TVIJO vs Langfuse — observability + governance compared",
    metaDescription:
      "Langfuse is a leading open-source LLM observability and tracing tool. See where TVIJO differs by adding routing, spend control and audit evidence around it.",
    headline: "TVIJO vs Langfuse",
    intro:
      "Langfuse is best-in-class for open-source LLM tracing and evals. TVIJO is a control plane: it does lighter observability but adds the routing, spend and governance layers Langfuse intentionally leaves to other tools.",
    competitorSummary:
      "Langfuse is a strong open-source observability platform: detailed traces, evals, prompt management, datasets and self-hostable analytics for LLM apps. If deep tracing and experimentation are your priority, Langfuse is excellent and developer-loved.",
    tvijoSummary:
      "TVIJO focuses on operating and governing AI in production — routing across providers, capping spend, enforcing policy, and producing audit evidence. Its tracing is intentionally lighter than a dedicated observability tool's.",
    rows: [
      { capability: "Deep tracing of LLM calls", tvijo: "partial", competitor: true },
      { capability: "Evals & experiments", tvijo: "partial", competitor: true },
      { capability: "Prompt management", tvijo: "partial", competitor: true },
      { capability: "Self-hostable / open source", tvijo: "partial", competitor: true },
      { capability: "Model routing across providers", tvijo: true, competitor: false },
      { capability: "Budget guards / spend caps", tvijo: true, competitor: false },
      { capability: "BYOK key vault", tvijo: true, competitor: false },
      { capability: "Audit evidence export (auditor-ready)", tvijo: true, competitor: "partial" },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: false },
    ],
    chooseCompetitor: [
      "You want the deepest possible tracing and evals.",
      "You prefer a self-hosted, open-source stack.",
      "Experimentation and prompt iteration are your main workflow.",
    ],
    chooseTvijo: [
      "You need routing and spend control, not just visibility.",
      "You need compliance evidence for reviews and auditors.",
      "You want one operating layer rather than observability plus separate tools.",
    ],
    honestNote:
      "TVIJO is not a replacement for Langfuse-grade observability. Many teams run Langfuse for deep tracing and use a control plane like TVIJO for routing, spend and governance. The two are complementary.",
  },
  {
    slug: "tvijo-vs-langsmith",
    competitor: "LangSmith",
    category: "LLM observability & evals",
    metaTitle: "TVIJO vs LangSmith — evals/observability + governance compared",
    metaDescription:
      "LangSmith is a powerful tracing and eval platform, strongest in the LangChain ecosystem. See where TVIJO differs by adding routing, spend control and audit evidence.",
    headline: "TVIJO vs LangSmith",
    intro:
      "LangSmith is a mature observability and evaluation platform for LLM apps. TVIJO is a control plane: lighter on evals, but it adds the routing, spend and governance layers LangSmith doesn't aim to cover.",
    competitorSummary:
      "LangSmith is excellent for tracing, debugging and evaluating LLM applications, with especially deep integration into the LangChain ecosystem. If your team builds on LangChain and lives in evals and traces, LangSmith is a natural fit.",
    tvijoSummary:
      "TVIJO is framework-neutral and production-operations focused: route requests across providers, enforce budgets and policy, and generate audit evidence. Tracing and evals are present but intentionally lighter than a dedicated tool's.",
    rows: [
      { capability: "Deep tracing & debugging", tvijo: "partial", competitor: true },
      { capability: "Evaluation suites", tvijo: "partial", competitor: true },
      { capability: "LangChain-native integration", tvijo: false, competitor: true },
      { capability: "Framework-neutral", tvijo: true, competitor: "partial" },
      { capability: "Model routing across providers", tvijo: true, competitor: false },
      { capability: "Budget guards / spend caps", tvijo: true, competitor: false },
      { capability: "BYOK key vault", tvijo: true, competitor: false },
      { capability: "Audit evidence export (auditor-ready)", tvijo: true, competitor: "partial" },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: false },
    ],
    chooseCompetitor: [
      "You build on LangChain and want native tracing.",
      "Evals and prompt debugging are your core workflow.",
      "You need the deepest evaluation tooling available.",
    ],
    chooseTvijo: [
      "You want provider-neutral routing and spend control.",
      "You need compliance evidence, not just traces.",
      "You want governance + routing + spend in one place.",
    ],
    honestNote:
      "TVIJO is not a replacement for LangSmith's evals. Teams often keep LangSmith for evaluation depth and add TVIJO as the routing, spend and governance layer above their model providers.",
  },
  {
    slug: "tvijo-vs-credo-ai",
    competitor: "Credo AI",
    category: "AI governance platform",
    metaTitle: "TVIJO vs Credo AI — AI governance compared",
    metaDescription:
      "Credo AI is an enterprise AI governance platform. See where TVIJO differs as a lighter, builder-friendly governance layer that also includes model routing, BYOK and spend control.",
    headline: "TVIJO vs Credo AI",
    intro:
      "Both care about AI governance and compliance. Credo AI is a heavyweight enterprise governance suite. TVIJO is a lighter, builder-friendly layer that bundles governance together with real model routing, BYOK and spend control.",
    competitorSummary:
      "Credo AI is a comprehensive enterprise governance platform: policy registries, risk and compliance frameworks, model registries and stakeholder workflows. For large regulated organisations with dedicated governance teams, it is deep and well-established.",
    tvijoSummary:
      "TVIJO brings governance to smaller AI teams and startups without a separate governance department — audit evidence and EU AI Act readiness, but combined with the operational gateway (routing, BYOK, budget guards) that Credo AI leaves to other systems.",
    rows: [
      { capability: "Policy registry & frameworks", tvijo: "partial", competitor: true },
      { capability: "Risk classification", tvijo: true, competitor: true },
      { capability: "Audit evidence export", tvijo: true, competitor: true },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: true },
      { capability: "Model routing across providers", tvijo: true, competitor: false },
      { capability: "Budget guards / spend caps", tvijo: true, competitor: false },
      { capability: "BYOK key vault", tvijo: true, competitor: false },
      { capability: "Live request-level controls (PII, policy lanes)", tvijo: true, competitor: "partial" },
      { capability: "Lightweight / fast to adopt", tvijo: true, competitor: "partial" },
    ],
    chooseCompetitor: [
      "You're a large enterprise with a dedicated governance team.",
      "You need an exhaustive policy and framework registry.",
      "Governance program management is the whole job.",
    ],
    chooseTvijo: [
      "You're a startup or SMB team that needs governance without the weight.",
      "You want governance plus the actual gateway (routing, BYOK, spend) in one tool.",
      "You need to move from zero to audit-ready quickly.",
    ],
    honestNote:
      "TVIJO is not a full enterprise governance suite like Credo AI. It is a lighter, more builder-friendly layer that also handles routing and spend. Large governance programs may still prefer a dedicated suite.",
  },
  {
    slug: "tvijo-vs-litellm",
    competitor: "LiteLLM",
    category: "LLM gateway / proxy",
    metaTitle: "TVIJO vs LiteLLM — LLM gateway + governance compared",
    metaDescription:
      "LiteLLM is a popular open-source LLM gateway and proxy. See where TVIJO differs by adding audit evidence, EU AI Act readiness and governance workflows around routing and spend.",
    headline: "TVIJO vs LiteLLM",
    intro:
      "LiteLLM is a strong open-source gateway for standardizing calls across many LLM providers. TVIJO is a control plane: it includes gateway-style routing and spend controls, then adds governance, BYOK workflows and audit evidence for teams preparing for AI compliance reviews.",
    competitorSummary:
      "LiteLLM is excellent when teams need a unified API, provider fallback, usage tracking, budget controls and a self-hostable proxy in front of many models. It is widely adopted by engineering teams that want a practical gateway layer.",
    tvijoSummary:
      "TVIJO focuses on the operating and governance layer around those model calls: who made the request, which policy approved it, what it cost, which key lane was used, and what evidence can be exported for security, procurement or EU AI Act reviews.",
    rows: [
      { capability: "Unified multi-provider API", tvijo: true, competitor: true },
      { capability: "Model routing & fallbacks", tvijo: true, competitor: true },
      { capability: "Budget guards / spend caps", tvijo: true, competitor: true },
      { capability: "Usage logging", tvijo: true, competitor: true },
      { capability: "BYOK key vault", tvijo: true, competitor: "partial" },
      { capability: "PII / secrets guard", tvijo: true, competitor: "partial" },
      { capability: "Audit evidence export (auditor-ready)", tvijo: true, competitor: "partial" },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: false },
      { capability: "Governance review workspace", tvijo: true, competitor: false },
    ],
    chooseCompetitor: [
      "You primarily need an open-source LLM proxy.",
      "Your engineering team wants gateway primitives and will build governance elsewhere.",
      "Self-hosting and provider abstraction are the main requirements.",
    ],
    chooseTvijo: [
      "You need governance evidence on top of routing and spend controls.",
      "CISO, procurement or compliance teams need reviewable audit packs.",
      "EU AI Act readiness and BYOK workflows matter as much as gateway routing.",
    ],
    honestNote:
      "TVIJO is not a replacement for teams that only want a lightweight open-source proxy. LiteLLM is excellent for that job. TVIJO is for teams that need the gateway plus governance, audit evidence and compliance workflows in one layer.",
  },
  {
    slug: "tvijo-vs-n8n",
    competitor: "n8n",
    category: "Workflow automation",
    metaTitle: "TVIJO vs n8n — automation + AI governance compared",
    metaDescription:
      "n8n is a powerful workflow automation and agent-building tool. See where TVIJO differs by governing, routing and capping the AI calls your automations make.",
    headline: "TVIJO vs n8n",
    intro:
      "These solve different problems. n8n is for building automations and agent workflows. TVIJO governs, routes and controls the AI requests those workflows make. They work best together.",
    competitorSummary:
      "n8n is a flexible, popular workflow automation platform with hundreds of integrations and the ability to build AI agents and pipelines, self-hosted or cloud. For wiring systems together and orchestrating steps, n8n is excellent.",
    tvijoSummary:
      "TVIJO doesn't build the workflow — it sits underneath the AI calls a workflow makes: routing each call to the right model, capping spend, masking PII, and recording audit evidence for every request, no matter which tool triggered it.",
    rows: [
      { capability: "Visual workflow / automation builder", tvijo: false, competitor: true },
      { capability: "Large integration catalogue", tvijo: "partial", competitor: true },
      { capability: "Build AI agents / pipelines", tvijo: "partial", competitor: true },
      { capability: "Model routing across providers", tvijo: true, competitor: "partial" },
      { capability: "Budget guards / spend caps on AI calls", tvijo: true, competitor: false },
      { capability: "BYOK key vault", tvijo: true, competitor: "partial" },
      { capability: "PII / secrets guard", tvijo: true, competitor: false },
      { capability: "Audit evidence export (auditor-ready)", tvijo: true, competitor: false },
      { capability: "EU AI Act readiness workflows", tvijo: true, competitor: false },
    ],
    chooseCompetitor: [
      "You need to build and orchestrate multi-step automations.",
      "You want a huge catalogue of app integrations.",
      "Your priority is wiring systems together, not governing AI spend.",
    ],
    chooseTvijo: [
      "You need to govern and cap the AI calls your automations make.",
      "You want audit evidence for every model request.",
      "You want routing and spend control independent of the orchestrator.",
    ],
    honestNote:
      "TVIJO is not a workflow builder and won't replace n8n. The natural setup is n8n (or any orchestrator) building the workflow, with TVIJO governing, routing and recording the AI requests inside it.",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

// Maps the homepage comparison table column label -> /compare slug.
export const COMPARE_COLUMN_SLUGS: Record<string, string> = {
  Portkey: "tvijo-vs-portkey",
  Langfuse: "tvijo-vs-langfuse",
  LangSmith: "tvijo-vs-langsmith",
  "Credo AI": "tvijo-vs-credo-ai",
  LiteLLM: "tvijo-vs-litellm",
};
