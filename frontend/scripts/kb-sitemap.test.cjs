'use strict';

// Exercise the real sitemap module without Next's build or a live API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/sitemap.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function load(feed) {
  const calls = [];
  const warnings = [];
  const module = { exports: {} };
  const modules = {
    '@/data/compare': { comparisons: [] },
    '@/data/solutions': { solutions: [] },
    '@/i18n/config': { LOCALES: ['en', 'ru', 'uk'], DEFAULT_LOCALE: 'en' },
    '@/lib/seo/marketing': { MARKETING_LOCALES: ['en', 'ru'], ENGLISH_ONLY_LOCALES: ['en'] },
    '@/services/seo-geo-api': { fetchCatalog: async () => null },
    '@/data/module-slugs': { MODULE_SLUGS: [] },
    '@/data/agent-skills': { AGENT_SKILL_INDEX_LOCALES: ['en', 'ru'] },
  };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: name => {
      assert.ok(Object.hasOwn(modules, name), `unexpected import: ${name}`);
      return modules[name];
    },
    process: { env: {} }, URL, AbortSignal, Date, Set, Map,
    console: { warn: text => warnings.push(text) },
    fetch: async (url, options) => {
      calls.push({ url, options });
      const payload = await feed(calls.length, url);
      return { ok: true, json: async () => payload };
    },
  });
  return { sitemap: module.exports.default, calls, warnings };
}

const article = (slug, extra = {}) => ({
  slug, category_slug: 'airadar-learning', updated_at: '2026-09-29T15:48:38Z',
  published_at: '2026-09-28T15:00:00Z', ...extra,
});
const urlsOf = pages => Array.from(pages, page => page.url);
const articleUrl = slug => `https://tvijo.com/en/kb/airadar-learning/${slug}`;
let assertions = 0;
async function check(name, fn) {
  await fn();
  assertions += 1;
  console.log(`PASS ${name}`);
}

(async () => {
  const baseline = await load(async () => { throw Error('offline'); }).sitemap();
  await check('all prior sitemap URLs survive successful feed enrichment', async () => {
    const run = load(async () => [article('source-notebook')]);
    const result = await run.sitemap();
    const urls = new Set(result.map(page => page.url));
    for (const page of baseline) assert.ok(urls.has(page.url), page.url);
    assert.ok(urls.has(articleUrl('source-notebook')));
    assert.ok(urls.has('https://tvijo.com/en/kb/airadar-learning'));
    assert.equal(run.calls.length, 1);
    assert.equal(run.calls[0].options.next.revalidate, 3600);
    assert.ok(run.calls[0].options.signal instanceof AbortSignal);
  });
  await check('new entries use source dates and verified English locale only', async () => {
    const result = await load(async () => [article('source-notebook')]).sitemap();
    const added = result.find(page => page.url === articleUrl('source-notebook'));
    assert.equal(added.lastModified.toISOString(), '2026-09-29T15:48:38.000Z');
    assert.equal(result.filter(page => page.url.endsWith('/source-notebook')).length, 1);
  });
  await check('duplicates and invalid timestamps do not produce misleading entries', async () => {
    const result = await load(async () => [
      article('source-notebook'), article('source-notebook'),
      article('no-date', { updated_at: 'invalid', published_at: '2999-01-01' }),
    ]).sitemap();
    assert.equal(result.filter(page => page.url === articleUrl('source-notebook')).length, 1);
    assert.equal(result.find(page => page.url === articleUrl('no-date')).lastModified, undefined);
  });
  await check('Django results/next pagination remains same-origin and complete', async () => {
    const run = load(async n => n === 1
      ? { results: [article('first')], next: '?lang=en&page=2' }
      : { results: [article('second')], next: null });
    const result = await run.sitemap();
    assert.equal(run.calls.length, 2);
    for (const slug of ['first', 'second']) assert.ok(result.some(page => page.url === articleUrl(slug)));
  });
  await check('API outage preserves the complete curated sitemap', async () => {
    const run = load(async () => { throw Error('offline'); });
    const result = await run.sitemap();
    assert.deepEqual(urlsOf(result), urlsOf(baseline));
    assert.equal(run.warnings.length, 1);
  });
  await check('subsequent API outage retains last successful KB entries', async () => {
    const run = load(async n => {
      if (n > 1) throw Error('offline');
      return [article('retained')];
    });
    await run.sitemap();
    const result = await run.sitemap();
    assert.ok(result.some(page => page.url === articleUrl('retained')));
  });
  await check('empty or malformed success never replaces last successful KB entries', async () => {
    for (const invalid of [[], [null], [article('../private')], [article('good'), article('invalid', { category_slug: '../private' })]]) {
      const run = load(async n => n === 1 ? [article('retained')] : invalid);
      await run.sitemap();
      const result = await run.sitemap();
      assert.ok(result.some(page => page.url === articleUrl('retained')));
      assert.equal(run.warnings.length, 1);
      const fresh = load(async () => invalid);
      assert.deepEqual(urlsOf(await fresh.sitemap()), urlsOf(baseline));
      assert.equal(fresh.warnings.length, 1);
    }
  });
  await check('foreign pagination and cyclic pagination cannot make extra requests', async () => {
    for (const next of ['https://other.invalid/api/private', '?lang=en']) {
      const run = load(async () => ({ results: [article('partial')], next }));
      const result = await run.sitemap();
      assert.equal(run.calls.length, 1);
      assert.deepEqual(urlsOf(result), urlsOf(baseline));
    }
  });
  await check('pagination and item budgets fail closed without deleting curated URLs', async () => {
    const paged = load(async n => ({ results: [article(`page-${n}`)], next: `?lang=en&page=${n + 1}` }));
    assert.deepEqual(urlsOf(await paged.sitemap()), urlsOf(baseline));
    assert.equal(paged.calls.length, 5);
    const oversized = load(async () => Array.from({ length: 1001 }, (_, n) => article(`item-${n}`)));
    assert.deepEqual(urlsOf(await oversized.sitemap()), urlsOf(baseline));
    assert.equal(oversized.calls.length, 1);
  });
  console.log(`${assertions} focused sitemap checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
