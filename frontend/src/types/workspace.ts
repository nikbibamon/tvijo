/**
 * Tvijo /workspace type contract (ТЗ §10).
 *
 * Single versioned source of truth shared by every workspace screen. No `any`,
 * no inline response shapes scattered across screens. Response shapes mirror the
 * backend `/api/v1/workspace/*` JSON exactly.
 */

export type WorkspaceUser = {
  id: string;
  email: string;
  full_name: string;
  initials: string;
};

export type BootstrapResponse = {
  user: WorkspaceUser;
  environment: string;
  nav_flags: {
    infrastructure: boolean;
    domains: boolean;
    billing: boolean;
    preferences: boolean;
  };
  connection_summary: {
    verified_credentials: number;
    active_keys: number;
  };
  budget_summary: BudgetPolicy | null;
  unread_alerts_count: number;
};

export type BudgetPolicy = {
  currency: string;
  daily_limit: string | null;
  monthly_limit: string | null;
  per_request_limit: string | null;
  warning_ratio: string;
  hard_stop: boolean;
};

export type BudgetPolicyPatch = Partial<
  Pick<BudgetPolicy, 'daily_limit' | 'monthly_limit' | 'per_request_limit' | 'warning_ratio' | 'hard_stop'>
>;

export type ActivityOverview = {
  from: string | null;
  to: string | null;
  timezone: string;
  metrics: {
    spend: string;
    requests: string;
    input_tokens: string;
    output_tokens: string;
    total_tokens: string;
    blended_cost_per_1m_tokens: string | null;
    cache_hit_rate: string | null;
  };
  comparison: unknown;
  top_models: Array<{ model: string; cost: string }>;
  top_providers: Array<{ provider: string; cost: string }>;
  top_api_keys: unknown[];
};

export type CredentialStatus =
  | 'pending'
  | 'verified'
  | 'error'
  | 'revoked';

export type ProviderCredential = {
  id: string;
  provider: string;
  label: string;
  environment: string;
  status: CredentialStatus;
  scopes: string[];
  secret_hint: string;
  fingerprint: string;
  verified_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  /**
   * `status` alone cannot be trusted as proof: the verify endpoint used to
   * stamp `verified` for providers nobody contacted. `live_verified` means the
   * provider confirmed the key; `stored` means it is saved and encrypted but
   * unconfirmed.
   */
  verification_state: 'live_verified' | 'stored' | 'error' | 'revoked';
  /** Whether this provider can be asked about a key at all. */
  has_live_check: boolean;
};

export type ProviderCatalog = {
  model_count: number;
  /** Real model ids for this provider, cheapest first, capped server-side. */
  model_ids: string[];
  input_per_million_usd: { min: string; max: string } | null;
  output_per_million_usd: { min: string; max: string } | null;
  max_context_length: number | null;
  source: string;
  as_of: string | null;
  scope: 'aggregated' | 'vendor_via_openrouter';
};

export type CredentialCreatePayload = {
  provider: string;
  label?: string;
  environment?: string;
  secret: string;
};

export type AccessKey = {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  /** Only present (non-null) in the create response; never reproducible. */
  secret: string | null;
  secret_created: boolean;
};

export type AccessKeyCreatePayload = {
  name: string;
  scopes: string[];
  expires_at?: string | null;
};

export type GatewayKey = {
  id: string;
  name: string;
  remote_key_id: number;
  prefix: string;
  last4: string;
  plan: string;
  scopes: string[];
  base_url: string;
  daily_budget_usd: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  /** Only non-null in the create response. Tvijo cannot show it again. */
  secret: string | null;
  secret_created: boolean;
};

export type GatewayKeyCreatePayload = {
  name: string;
  daily_budget_usd?: string;
};

export type GatewayKeysResponse = {
  configured: boolean;
  keys: GatewayKey[];
};

export type GatewayUsageWindow = {
  requests: number;
  cost_usd: number;
  first_at?: string | null;
  last_at?: string | null;
};

export type GatewayTrace = {
  ts: string | null;
  provider: string | null;
  model: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_s: number;
  cache_hit: boolean;
  ok: boolean;
};

export type GatewayKeyStatus = {
  key: GatewayKey;
  id: number;
  key_prefix: string;
  plan: string;
  scopes: string[];
  daily_budget_usd: string;
  is_active: boolean;
  last_used_at: string | null;
  revoked_at: string | null;
  usage: {
    daily: GatewayUsageWindow;
    monthly: GatewayUsageWindow;
  };
  recent_traces: GatewayTrace[];
};

/**
 * Result of POST /workspace/connections/{id}/verify/.
 *
 * `key_info` is returned only when the provider was actually contacted with a
 * non-generation key check; providers still on the legacy local check omit it.
 */
export type CredentialVerifyResult = {
  id: string;
  provider: string;
  status: string;
  /** `live` when the provider answered; `unavailable` when we have no check. */
  verification?: 'live' | 'unavailable';
  verification_state?: 'live_verified' | 'stored';
  detail?: string;
  verified_at?: string | null;
  /**
   * Allowlisted facts the provider returned. The shape differs by provider —
   * a model listing yields `model_count`, DeepSeek yields a balance, and
   * OpenRouter yields its credit fields — so every field is optional and the
   * UI renders whichever arrived.
   */
  key_info?: {
    label?: string | null;
    limit?: number | null;
    limit_remaining?: number | null;
    is_free_tier?: boolean | null;
    model_count?: number | null;
    endpoint_count?: number | null;
    balance?: string | null;
    currency?: string | null;
    is_available?: boolean | null;
  };
};

export type ModelsProvider = {
  provider: string;
  supported: boolean;
  /** A stored key for this provider can be confirmed against its API. */
  has_live_check: boolean;
  /** Measured from the AI Radar snapshot; null means no data, not zero. */
  catalog: ProviderCatalog | null;
  credential_status: CredentialStatus | 'none';
  available_models: string[] | null;
  catalog_source: string | null;
  routing_defaults: {
    require_parameters: boolean;
    data_collection: string;
    zdr: boolean;
    allow_fallbacks: boolean;
  } | null;
  last_verified_at: string | null;
};

export type ModelsUsage = {
  by_model: Array<{ model: string; calls: number; cost: string }>;
  by_provider: Array<{ provider: string; calls: number; cost: string }>;
};

export type CallLogEntry = {
  id: string;
  provider: string;
  model: string;
  operation: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost: string;
  /**
   * Why `cost` is what it is. `unpriced_model` means $0 was recorded for lack
   * of a price, not because the call was free; `null` means the row predates
   * the router recording it.
   */
  cost_source: 'provider' | 'estimated' | 'unpriced_model' | null;
  /** Paid by the user's own verified key rather than a Tvijo key. */
  byok: boolean;
  latency_ms: number | null;
  created_at: string;
};

export type Run = {
  id: string;
  kind: string;
  route: string;
  model: string;
  status: string;
  cost: number | null;
  created_at: string;
};

export type RunsResponse = {
  runs: Run[];
  count: number;
};

/** Provable guardrail state — never a decorative "Enforced". */
export type BudgetHardCapState = 'not_configured' | 'configured_soft' | 'enforced';

export type GuardrailControlKey =
  | 'spend_cap'
  | 'secret_storage'
  | 'execution_isolation'
  | 'human_acceptance'
  | 'tool_authorization';

export type GuardrailControl = {
  key: GuardrailControlKey;
  state: string;
  /** tool_authorization only: counted decisions over `window_days`. */
  allowed?: number;
  denied?: number;
  window_days?: number;
  /** human_acceptance only: how many approved contracts carry a gate. */
  gated_contracts?: number;
  total_contracts?: number;
};

export type GuardrailsSummary = {
  budget_hard_cap: {
    state: BudgetHardCapState;
    daily_limit: string | null;
    monthly_limit: string | null;
  };
  /** @deprecated kept for one release; use `budget_hard_cap.state`. */
  budget_hard_cap_enforced: boolean;
  budget: BudgetPolicy | null;
  /**
   * Controls the backend can actually prove, in render order. A control it
   * cannot derive is absent from the array rather than reported as unknown:
   * the previous version answered three of them with a hardcoded `true`, so
   * every user saw permanently green tiles that meant nothing.
   */
  controls: GuardrailControl[];
  decision_trail: Array<{
    id: string;
    action: string;
    resource: string;
    created_at: string;
  }>;
};

export type BillingSummary = {
  currency: string;
  /** Total measured spend; equals `byok_spend` + `platform_spend`. */
  measured_spend: string;
  /** Billed by the provider to the user's own key. Tvijo never sees it. */
  byok_spend: string;
  /** Ran on a Tvijo key. The only part Tvijo could ever bill for. */
  platform_spend: string;
  /** Calls recorded at $0 only because no price is known for the model. */
  unpriced_calls: number;
  budget_policy: BudgetPolicy | null;
  transactions: unknown[];
  add_credits_enabled: boolean;
};

/** Billing ledger: BYOK means there is no payment ledger to page through. */
export type BillingTransactions = {
  results: unknown[];
  next_cursor: string | null;
  ledger_available: boolean;
  reason?: string;
};

export type WorkspaceDateFormat = 'iso' | 'eu' | 'us';
export type WorkspaceActivityRange = '7d' | '30d' | '90d';

/** Only settings the backend really stores (ТЗ §10 Preferences). */
export type WorkspacePreferences = {
  timezone: string;
  date_format: WorkspaceDateFormat;
  default_activity_range: WorkspaceActivityRange;
  /** Null until the user saves preferences for the first time. */
  updated_at: string | null;
};

export type WorkspacePreferencesPatch = Partial<
  Pick<WorkspacePreferences, 'timezone' | 'date_format' | 'default_activity_range'>
>;

export type InfraCapability = {
  configured: boolean;
  granted: boolean;
  provisioning_enabled: boolean;
  outcome?: Record<string, unknown>;
  detail?: string;
};

export type InfraCatalog = {
  configured: boolean;
  catalog: unknown;
  detail?: string;
};

export type InfraOrder = {
  id: string;
  provider: string;
  server_type: string;
  location: string;
  status: string;
  customer_quote: string | null;
  created_at: string;
};

export type DomainSearch = {
  id: string;
  domains: string[];
  available: number;
  created_at: string;
};

export type DomainCheckResult = {
  domain: string;
  available: boolean;
  is_premium: boolean;
  price: string | null;
};

export type DomainCheckResponse = {
  configured: boolean;
  results: DomainCheckResult[];
  detail?: string;
};

/* --- Solution catalog + assistant ---------------------------------------
 * specs/2026-08-workspace-solution-catalog-and-assistant.md
 * Availability and delivery come from the server so the UI cannot offer an
 * install path for something that is not built.
 */

export type SkillPack = {
  key: string;
  title: string;
  version: string;
  tier: string;
  score: number;
  files: number;
  bundle?: string[];
  description: string;
  download_url: string;
};

export type SkillPacksResponse = {
  packs: SkillPack[];
  /** Server-side S2S settings exist; this is not a reachability claim. */
  gateway_configured: boolean;
};

export type SolutionAvailability = 'live' | 'assisted' | 'planned';

export type DeliveryKind = 'self_serve' | 'guided' | 'done_for_you';

export type RequestDelivery = DeliveryKind | 'notify' | 'escalation';

export type SolutionDelivery = {
  kind: DeliveryKind;
  available: boolean;
  eta: string;
  steps: string[];
  snippet: string | null;
  note: string;
};

export type SolutionProof = {
  label: string;
  kind: 'own_deployment';
};

export type Solution = {
  id: string;
  /** What the client is told about the first human reply. */
  first_reply_sla: string;
  name: string;
  category: 'support' | 'knowledge' | 'growth' | 'control';
  icon: string;
  summary: string;
  outcome: string;
  pains: string[];
  availability: SolutionAvailability;
  delivery: SolutionDelivery[];
  proof: SolutionProof[];
  workspace_links: string[];
  requires: string[];
};

export type RequestNextStep =
  | 'awaiting_review' | 'scoping' | 'scheduled' | 'delivered' | 'declined';

export type SolutionRequest = {
  id: string;
  solution_id: string;
  delivery: RequestDelivery;
  message: string;
  contact: string;
  status: 'new' | 'in_review' | 'scheduled' | 'done' | 'declined';
  source: 'dashboard' | 'catalog' | 'assistant';
  created_at: string;
  status_changed_at: string;
  next_step: RequestNextStep;
  first_reply_sla: string;
  operator_notified: boolean;
};

export type SolutionCatalog = {
  locale: string;
  solutions: Solution[];
  requests: SolutionRequest[];
};

export type AssistantSource = {
  kind: 'workspace' | 'kb';
  label: string;
  href: string;
};

/** Server-computed setup state — one definition of "configured". */
export type WorkspaceSetupState = {
  steps: { id: 'workspace' | 'provider' | 'budget' | 'run'; complete: boolean }[];
  complete_count: number;
  total: number;
  complete: boolean;
};

export type NextAction = {
  id: 'provider' | 'budget' | 'run' | 'review_activity';
  href: string;
  kind: 'setup' | 'operate';
};

export type WorkspaceDashboard = {
  user: { id: string; email: string; full_name: string };
  environment: string;
  connection_summary: { verified_credentials: number; active_keys: number };
  budget: { configured: boolean; summary: BudgetPolicy | null };
  run_count: number;
  setup: WorkspaceSetupState;
  next_action: NextAction;
  catalog: SolutionCatalog;
};

export type AssistantAnswer = {
  query_id: string;
  answer: string;
  sources: AssistantSource[];
  status: 'answered' | 'unsure';
};

/* ---------------------------- Execution Contracts -------------------------
 * Shapes returned by /api/v1/contracts/ (apps/contracts). The status enum is
 * frozen in plans/0409/10_START_ARTIFACTS.md and shared with ai-os.
 */

export type ContractStatus = 'draft' | 'approved' | 'blocked';

export type RunStatus =
  | 'approved' | 'bound' | 'running' | 'verification'
  | 'passed' | 'rework' | 'blocked';

export type ContractBudget = {
  /** Whole amounts are ints and fractional money is a string, so the frozen
   *  JSON hashes identically in Python and in the browser. */
  max_usd: number | string | null;
  max_tokens: number | null;
  max_minutes: number | null;
  max_steps: number | null;
};

export type ContractListRow = {
  id: string;
  contract_hash: string;
  status: ContractStatus;
  version: number;
  goal: string;
  expected_result: string;
  budget: ContractBudget;
  run_count: number;
  latest_run_status: RunStatus | null;
  approved_at: string | null;
  created_at: string | null;
};

export type ContractRunSummary = {
  id: string;
  run_no: number;
  status: RunStatus;
  binding: Record<string, unknown>;
  cost_usd: string;
  tokens: number | null;
  steps: number | null;
  error_count: number;
  acceptance_total: number;
  acceptance_passed: number;
  evidence_count: number;
  started_at: string | null;
  finished_at: string | null;
};

export type ContractKnowledgeRef = {
  ref: string;
  kind: string;
  version: string;
  resolved_at: string | null;
};

export type ContractDetail = {
  id: string;
  contract_hash: string;
  status: ContractStatus;
  version: number;
  goal: string;
  expected_result: string;
  /** The frozen contract JSON, exactly as hashed. */
  payload: {
    schema?: string;
    allowed_models?: string[];
    allowed_tools?: string[];
    forbidden_actions?: string[];
    approval_gates?: string[];
    acceptance?: Array<{ rule: string; type: string }>;
    budget?: ContractBudget;
    [key: string]: unknown;
  };
  knowledge_refs: ContractKnowledgeRef[];
  runs: ContractRunSummary[];
  approved_at: string | null;
  created_at: string | null;
};

export type ContractAcceptance = {
  run_id: string;
  acceptance: Array<{
    rule: string;
    passed: boolean;
    evidence: Record<string, unknown>;
    checked_at: string | null;
  }>;
  passed: number;
  total: number;
};

export type ContractEvidence = {
  evidence: Array<{
    pack_hash: string;
    manifest: Record<string, unknown>;
    object_key: string;
    created_at: string | null;
  }>;
};

export type ContractCatalog = {
  schema: string;
  acceptance_rules: Array<{ id: string; type: string }>;
  tools: Array<{ id: string; kind: string; side_effect: boolean }>;
  forbidden_actions: Array<{ id: string; kind: string }>;
  approval_gates: Array<{ id: string; requires_human: boolean }>;
  /** How the allowlist is honoured, so the UI never overstates enforcement. */
  enforcement: string;
  enforced_by: string[];
};

/** A contract payload as the builder assembles it, before freezing. */
export type ContractDraft = {
  schema: 'tvijo-execution-contract/v1';
  goal: string;
  expected_result: string;
  approved_knowledge: Array<{ ref: string; kind: string; version: string }>;
  allowed_models: string[];
  allowed_tools: string[];
  forbidden_actions: string[];
  budget: {
    max_usd: number | string;
    max_tokens: number;
    max_minutes: number;
    max_steps: number;
  };
  acceptance: Array<{ rule: string; type: 'deterministic' }>;
  approval_gates: string[];
  principal: string;
  version: number;
};

export type ContractCreated = {
  id: string;
  contract_hash: string;
  status: ContractStatus;
  version: number;
};

/** What POST /contracts/{id}/runs/ returns once the run has finished. */
export type ContractRunResult = {
  run_id: string;
  contract_id: string;
  run_no: number;
  status: RunStatus;
  cost_usd: string;
  tokens: number | null;
  steps: number | null;
  errors: Array<{ code: string; message: string }>;
  acceptance_passed: number;
  acceptance_total: number;
};
