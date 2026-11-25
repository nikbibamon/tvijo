import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPublicPricing } from '../src/lib/tvijo-public-pricing.ts';

const rate = {
  id: 'ds41f', name: 'DeepSeek V4.1 Flash', provider: 'deepinfra', live_tested: true,
  source: 'https://deepinfra.com/deepseek-ai/DeepSeek-V4.1-Flash-1017', observed_at: '2026-10-24',
  input_per_million_usd: '0.20', output_per_million_usd: '0.60',
  input_per_million_tt: '216', output_per_million_tt: '648',
};
const catalog = { tt_per_usd: 1000, managed_markup_percent: '8', prices_are_not_settlement: true };

test('uses the fixed anonymous gateway URL and projects only complete verified rows', async () => {
  const result = await loadPublicPricing(async (url, request) => {
    assert.equal(url, 'https://dsh.tvijo.com/api/dshrem/v1/public/pricing');
    assert.equal(request.credentials, 'omit');
    assert.equal(request.cache, 'no-store');
    assert.equal(request.redirect, 'error');
    assert.equal(request.headers, undefined);
    return Response.json({ ...catalog, models: [rate,
      { ...rate, id: 'unverified', live_tested: false },
      { ...rate, id: 'unpriced', input_per_million_usd: null },
      { ...rate, id: 'bad-source', source: 'javascript:void(0)' },
      { ...rate, id: 'undated', observed_at: '' },
    ] });
  });
  assert.deepEqual(result, { tt_per_usd: 1000, managed_markup_percent: '8', models: [rate] });
});

test('distinguishes a verified empty catalog from an unavailable catalog', async () => {
  assert.deepEqual((await loadPublicPricing(async () => Response.json({ ...catalog, models: [] }))).models, []);
  assert.equal(await loadPublicPricing(async () => new Response(null, { status: 503 })), null);
  assert.equal(await loadPublicPricing(async () => Response.json({ models: [] })), null);
  assert.equal(await loadPublicPricing(async () => { throw new Error('fetch timeout'); }), null);
});
