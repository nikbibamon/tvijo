#!/usr/bin/env node
/**
 * The browser must hash a contract exactly as Python does.
 *
 * The builder previews `contract_hash` before freezing. If the browser's
 * canonical form differs from `apps/contracts/hash.py` by a single byte, the
 * preview shows one hash and the backend stores another — and the user has no
 * way to notice. This test pins the golden vector from
 * plans/0409/10_START_ARTIFACTS.md, the same one apps/contracts/tests.py uses.
 *
 * Run: node --experimental-strip-types scripts/contract-hash.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

/**
 * The shipped module is TypeScript. Node 22 strips types natively, so this
 * imports the real implementation rather than a copy — a copy would drift and
 * still pass.
 *
 * Run: node --experimental-strip-types scripts/contract-hash.test.mjs
 */
const { canonicalize } = await import('../src/lib/contract-canonical.ts');

const GOLDEN_PAYLOAD = {
  schema: 'tvijo-execution-contract/v1',
  goal: 'Check a company and prepare a report',
  expected_result: 'Report with a source per claim',
  approved_knowledge: [
    { ref: 'registry:edr@2026-09-04', kind: 'registry', version: '2026-09-04' },
  ],
  allowed_models: ['gpt-5.6-sol', 'deepseek-v4'],
  allowed_tools: ['http.read', 'postgres.read'],
  forbidden_actions: ['email.send', 'shell.write', 'payment.execute'],
  budget: { max_usd: 3, max_tokens: 150000, max_minutes: 20, max_steps: 30 },
  acceptance: [
    { rule: 'every_claim_has_source', type: 'deterministic' },
    { rule: 'edrpou_matches', type: 'deterministic' },
    { rule: 'no_unverified_accusation', type: 'deterministic' },
  ],
  approval_gates: ['before_external_action'],
  principal: 'user:demo',
  version: 1,
};

const GOLDEN_CANONICAL =
  '{"acceptance":[{"rule":"every_claim_has_source","type":"deterministic"},'
  + '{"rule":"edrpou_matches","type":"deterministic"},'
  + '{"rule":"no_unverified_accusation","type":"deterministic"}],'
  + '"allowed_models":["gpt-5.6-sol","deepseek-v4"],'
  + '"allowed_tools":["http.read","postgres.read"],'
  + '"approval_gates":["before_external_action"],'
  + '"approved_knowledge":[{"kind":"registry","ref":"registry:edr@2026-09-04","version":"2026-09-04"}],'
  + '"budget":{"max_minutes":20,"max_steps":30,"max_tokens":150000,"max_usd":3},'
  + '"expected_result":"Report with a source per claim",'
  + '"forbidden_actions":["email.send","shell.write","payment.execute"],'
  + '"goal":"Check a company and prepare a report","principal":"user:demo",'
  + '"schema":"tvijo-execution-contract/v1","version":1}';

const GOLDEN_HASH =
  '13b4f34c280ec2a804122f24b92d190b4682fb4878211bcb42fc501f383b9901';

test('canonical form matches the frozen string byte for byte', () => {
  assert.equal(canonicalize(GOLDEN_PAYLOAD), GOLDEN_CANONICAL);
});

test('hash matches the golden vector shared with ai-os', () => {
  const hash = createHash('sha256').update(canonicalize(GOLDEN_PAYLOAD), 'utf8').digest('hex');
  assert.equal(hash, GOLDEN_HASH);
});

test('key order does not depend on insertion order', () => {
  const reordered = Object.fromEntries(
    Object.entries(GOLDEN_PAYLOAD).reverse(),
  );
  assert.equal(canonicalize(reordered), GOLDEN_CANONICAL);
});

test('a fractional number is refused instead of hashing differently', () => {
  // Python renders 3.0 as "3.0" and JSON.stringify renders it as "3"; the
  // schema requires fractional money as a string precisely to avoid this.
  assert.throws(() => canonicalize({ budget: { max_usd: 3.5 } }), /non-integer/);
});

test('non-ASCII text is kept literal, as ensure_ascii=False does', () => {
  assert.equal(canonicalize({ goal: 'Проверить компанию' }), '{"goal":"Проверить компанию"}');
});
