import { portalApiFetch } from './portal-auth-fetch';
export type GatewayProject = { id: string; name: string; role: string; is_default: boolean };
export type Receipt = {
  task_id: string; project_id: string; status: string; revision: string;
  acceptance: { status: string };
  model_usage: { input_tokens: number | null; output_tokens: number | null; status: string };
  provider_cost: { amount_usd: string | null; known_amount_usd: string | null; status: string; payer: string; invoice_verified: boolean };
  service_credit: { unit: string; status: string; reserved_micro_tvijo: number | null; debited_micro_tvijo: number | null; held_micro_tvijo: number | null; released_micro_tvijo: number | null };
};
export type ProjectList = { schema_version: string; projects: GatewayProject[]; truncated: boolean };
export type ReceiptList = { schema_version: string; project_id: string; tasks: Receipt[]; next_cursor: string | null };
function assertContract(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      (value as Record<string, unknown>).schema_version !== 'tvijo.receipts.v1' ||
      (value as Record<string, unknown>).source !== 'dshrem-gateway') throw new Error('Invalid receipt response');
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid receipt response');
  return value as Record<string, unknown>;
}
function text(value: unknown): value is string { return typeof value === 'string' && value.length <= 512; }
function numberOrNull(value: unknown) { return value === null || (Number.isSafeInteger(value) && Number(value) >= 0); }
function moneyOrNull(value: unknown) { return value === null || (typeof value === 'string' && /^\d{1,20}(?:\.\d{1,20})?$/.test(value)); }
export function parseProjects(value: unknown): ProjectList {
  assertContract(value);
  if (!Array.isArray(value.projects) || value.projects.length > 100 || typeof value.truncated !== 'boolean') throw new Error('Invalid project response');
  for (const raw of value.projects) {
    const project = object(raw);
    if (!text(project.id) || !/^[A-Za-z0-9_-]{1,100}$/.test(project.id) || !text(project.name) || !text(project.role)) throw new Error('Invalid project response');
  }
  return value as unknown as ProjectList;
}
export function parseReceipts(value: unknown): ReceiptList {
  assertContract(value);
  if (!text(value.project_id) || !Array.isArray(value.tasks) || value.tasks.length > 50 || !(value.next_cursor === null || text(value.next_cursor))) throw new Error('Invalid receipt response');
  for (const raw of value.tasks) {
    const task = object(raw), acceptance = object(task.acceptance), usage = object(task.model_usage), cost = object(task.provider_cost), credit = object(task.service_credit);
    if (!text(task.task_id) || task.project_id !== value.project_id || !text(task.status) || !text(task.revision) || !text(acceptance.status) ||
        !text(usage.status) || !numberOrNull(usage.input_tokens) || !numberOrNull(usage.output_tokens) ||
        !text(cost.status) || cost.currency !== 'USD' || !['platform_api', 'customer_provider_account'].includes(String(cost.payer)) || !moneyOrNull(cost.amount_usd) || !moneyOrNull(cost.known_amount_usd) || typeof cost.invoice_verified !== 'boolean' ||
        credit.unit !== 'micro_tvijo' || !text(credit.status) || !numberOrNull(credit.reserved_micro_tvijo) || !numberOrNull(credit.debited_micro_tvijo) || !numberOrNull(credit.held_micro_tvijo) || !numberOrNull(credit.released_micro_tvijo)) throw new Error('Invalid receipt response');
  }
  return value as unknown as ReceiptList;
}
/** Exact decimal presentation; the API retains its integer micro_tvijo units. */
export function formatTvijoTokens(micro: number | null | undefined): string | null {
  if (typeof micro !== 'number' || !Number.isSafeInteger(micro) || micro < 0) return null;
  // Decimal string splitting avoids floating-point rounding at MAX_SAFE_INTEGER.
  const digits = String(micro).padStart(7, '0');
  const whole = digits.slice(0, -6);
  const fraction = digits.slice(-6).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}
const base = '/workspace/receipts/projects';
export const receiptApi = {
  projects: async (signal?: AbortSignal) => parseProjects(await portalApiFetch<unknown>(base, { signal, cache: 'no-store' })),
  tasks: async (project: string, cursor: string, signal?: AbortSignal) => parseReceipts(await portalApiFetch<unknown>(
    `${base}/${encodeURIComponent(project)}/tasks?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
    { signal, cache: 'no-store' })),
};
