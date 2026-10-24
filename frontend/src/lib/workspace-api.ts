/**
 * Tvijo /workspace API client (ТЗ §9/§10).
 *
 * Thin typed wrapper over `portalApiFetch` (which already does single-flight
 * JWT refresh). All calls are user-scoped on the backend. No API payload is
 * stored in localStorage.
 */

import { portalApiDownload, portalApiFetch } from '@/lib/portal-auth-fetch';
import type {
  AccessKey,
  AccessKeyCreatePayload,
  ActivityOverview,
  AssistantAnswer,
  BillingSummary,
  BillingTransactions,
  BootstrapResponse,
  BudgetPolicy,
  BudgetPolicyPatch,
  CallLogEntry,
  CredentialCreatePayload,
  CredentialVerifyResult,
  DomainCheckResponse,
  GuardrailsSummary,
  GatewayKey,
  GatewayKeyCreatePayload,
  GatewayKeysResponse,
  GatewayKeyStatus,
  InfraCapability,
  InfraCatalog,
  InfraOrder,
  ModelsProvider,
  ModelsUsage,
  ProviderCredential,
  Run,
  SkillPacksResponse,
  WorkspaceDashboard,
  WorkspacePreferences,
  WorkspacePreferencesPatch,
  DomainSearch,
  SolutionCatalog,
  SolutionRequest,
  ContractListRow,
  ContractDetail,
  ContractAcceptance,
  ContractEvidence,
  ContractCatalog,
  ContractDraft,
  ContractCreated,
  ContractRunResult,
} from '@/types/workspace';

const WS = '/workspace';

export const workspaceApi = {
  bootstrap: () => portalApiFetch<BootstrapResponse>(`${WS}/bootstrap/`),

  activityOverview: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return portalApiFetch<ActivityOverview>(
      `${WS}/activity/overview/${q ? `?${q}` : ''}`);
  },

  // Connections / credentials
  listCredentials: () => portalApiFetch<ProviderCredential[]>(`${WS}/connections/`),
  createCredential: (payload: CredentialCreatePayload) =>
    portalApiFetch<ProviderCredential>(`${WS}/connections/`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  // `key_info` is only present for providers with a live, non-generation key
  // check (today: OpenRouter, via GET /api/v1/key).
  verifyCredential: (id: string) =>
    portalApiFetch<CredentialVerifyResult>(
      `${WS}/connections/${id}/verify/`, { method: 'POST' }),
  revokeCredential: (id: string) =>
    portalApiFetch<{ id: string; status: string }>(
      `${WS}/connections/${id}/revoke/`, { method: 'POST' }),

  // Access keys
  listAccessKeys: () => portalApiFetch<AccessKey[]>(`${WS}/access-keys/`),
  createAccessKey: (payload: AccessKeyCreatePayload) =>
    portalApiFetch<AccessKey>(`${WS}/access-keys/`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  revokeAccessKey: (id: string) =>
    portalApiFetch<{ id: string; revoked_at: string | null }>(
      `${WS}/access-keys/${id}/revoke/`, { method: 'POST' }),

  // AI OS gateway keys for external Hermes/client servers
  listGatewayKeys: () =>
    portalApiFetch<GatewayKeysResponse>(`${WS}/gateway-keys/`),
  createGatewayKey: (payload: GatewayKeyCreatePayload) =>
    portalApiFetch<GatewayKey>(`${WS}/gateway-keys/`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  gatewayKeyStatus: (id: string) =>
    portalApiFetch<GatewayKeyStatus>(`${WS}/gateway-keys/${id}/status/`),
  revokeGatewayKey: (id: string) =>
    portalApiFetch<{ id: string; revoked_at: string | null }>(
      `${WS}/gateway-keys/${id}/revoke/`, { method: 'POST' }),

  // Models
  modelsProviders: () => portalApiFetch<{ providers: ModelsProvider[] }>(
    `${WS}/models/providers/`),
  modelsUsage: () => portalApiFetch<ModelsUsage>(`${WS}/models/usage/`),
  modelsCalls: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return portalApiFetch<{ calls: CallLogEntry[] }>(
      `${WS}/models/calls/${q ? `?${q}` : ''}`);
  },

  // Skill packs (authenticated Markdown-only ZIPs; never auto-installed)
  skillPacks: () => portalApiFetch<SkillPacksResponse>(`${WS}/skill-packs/`),
  downloadSkillPack: (downloadUrl: string, key: string) =>
    portalApiDownload(downloadUrl, `tvijo-${key}-skill-pack.zip`),

  // Runs
  runs: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return portalApiFetch<{ runs: Run[]; count: number }>(
      `${WS}/runs/${q ? `?${q}` : ''}`);
  },

  // Guardrails / billing
  guardrailsSummary: () =>
    portalApiFetch<GuardrailsSummary>(`${WS}/guardrails/summary/`),
  billingSummary: () =>
    portalApiFetch<BillingSummary>(`${WS}/billing/summary/`),
  billingTransactions: () =>
    portalApiFetch<BillingTransactions>(`${WS}/billing/transactions/`),
  updateBudgetPolicy: (patch: BudgetPolicyPatch) =>
    portalApiFetch<BudgetPolicy>(`${WS}/budget-policy/`, {
      method: 'PATCH', body: JSON.stringify(patch),
    }),

  // Preferences (only really-stored settings)
  preferences: () =>
    portalApiFetch<WorkspacePreferences>(`${WS}/preferences/`),
  updatePreferences: (patch: WorkspacePreferencesPatch) =>
    portalApiFetch<WorkspacePreferences>(`${WS}/preferences/`, {
      method: 'PATCH', body: JSON.stringify(patch),
    }),

  // Infra (feature-flagged)
  infraCapability: () =>
    portalApiFetch<InfraCapability>(`${WS}/infra/capability/`),
  infraCatalog: () =>
    portalApiFetch<InfraCatalog>(`${WS}/infra/catalog/`),
  infraOrders: () =>
    portalApiFetch<{ orders: InfraOrder[] }>(`${WS}/infra/orders/list/`),

  // Domains (availability only)
  domainSuggest: (idea: string, limit = 20) =>
    portalApiFetch<{ suggestions: string[] }>(`${WS}/domains/suggest/`, {
      method: 'POST', body: JSON.stringify({ idea, limit }),
    }),
  domainCheck: (domains: string[]) =>
    portalApiFetch<DomainCheckResponse>(`${WS}/domains/check/`, {
      method: 'POST', body: JSON.stringify({ domains }),
    }),
  domainSearches: () =>
    portalApiFetch<{ searches: DomainSearch[] }>(`${WS}/domains/searches/`),

  // Solution catalog + in-product assistant
  /**
   * Everything the dashboard needs in one call: account state, the
   * server-computed next action and the catalog with this user's requests.
   */
  dashboard: (locale?: string) => portalApiFetch<WorkspaceDashboard>(
    `${WS}/dashboard/${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`),
  catalog: (locale?: string) => portalApiFetch<SolutionCatalog>(
    `${WS}/catalog/${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`),
  requestSolution: (payload: {
    solution_id: string;
    delivery: string;
    message?: string;
    contact?: string;
    source?: 'dashboard' | 'catalog' | 'assistant';
  }) =>
    portalApiFetch<SolutionRequest>(`${WS}/requests/`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  assistantAsk: (question: string, locale: string) =>
    portalApiFetch<AssistantAnswer>(`${WS}/assistant/ask/`, {
      method: 'POST', body: JSON.stringify({ question, locale }),
    }),
  assistantEscalate: (payload: {
    query_id?: string;
    /** Original wording, sent only when the user consents to share it. */
    question?: string;
    question_consent?: boolean;
    message?: string;
    contact?: string;
  }) =>
    portalApiFetch<SolutionRequest>(`${WS}/assistant/escalate/`, {
      method: 'POST', body: JSON.stringify(payload),
    }),

  // Execution Contracts. These live at /api/v1/contracts/, not under
  // /workspace/, because ai-os calls the same routes with a service token.
  // Every response is scoped to the caller; another user's contract is a 404.
  contracts: () =>
    portalApiFetch<{ contracts: ContractListRow[] }>('/contracts/'),
  contract: (id: string) =>
    portalApiFetch<ContractDetail>(`/contracts/${id}/`),
  contractRunAcceptance: (contractId: string, runId: string) =>
    portalApiFetch<ContractAcceptance>(
      `/contracts/${contractId}/runs/${runId}/acceptance/`),
  contractRunEvidence: (contractId: string, runId: string) =>
    portalApiFetch<ContractEvidence>(
      `/contracts/${contractId}/runs/${runId}/evidence/`),

  // The vocabulary a contract may declare. Served by the backend so the
  // builder can only offer rules, tools and gates that real code honours.
  contractCatalog: () => portalApiFetch<ContractCatalog>('/contracts/tools/'),
  // Create is idempotent on the hash: re-posting the same payload returns the
  // existing contract instead of a duplicate.
  createContract: (payload: ContractDraft) =>
    portalApiFetch<ContractCreated>('/contracts/create/', {
      method: 'POST', body: JSON.stringify(payload),
    }),
  approveContract: (id: string) =>
    portalApiFetch<ContractCreated>(`/contracts/${id}/approve/`, { method: 'POST' }),
  /**
   * Executes the contract on the user's own key and spends real money, so the
   * caller must pass an idempotency key: without one a double-click buys the
   * same answer twice.
   */
  createContractRun: (id: string, model: string, idempotencyKey: string) =>
    portalApiFetch<ContractRunResult>(`/contracts/${id}/runs/`, {
      method: 'POST',
      body: JSON.stringify({ model }),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
};
