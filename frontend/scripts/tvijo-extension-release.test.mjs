import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPublicRelease, RELEASE_URL } from '../src/lib/tvijo-extension-release.ts';

const LIMIT = 96 * 1024;
const encoder = new TextEncoder();
const download = 'https://dsh.tvijo.com/download#vscode';
const source = 'https://github.com/nikbibamon/dshrempub/tree/release-fixture';
const changelog = 'https://github.com/nikbibamon/dshrempub/blob/release-fixture/vscode/CHANGELOG.md';
const sha256 = 'a'.repeat(64);

function catalog() {
  return {
    schema: 'tvijo.extension-release/v1',
    latest_version: '0.10.29',
    as_of: '2026-11-25',
    publication: { status: 'published', published_at: '2026-11-14' },
    links: { download, source, changelog, extra: 'unused-link' },
    package: {
      filename: 'tvijo-dshrem-0.10.29.vsix',
      bytes: 1312779,
      sha256,
      editor_requirement: '>=1.95.0',
      verified_environment: 'Проверено 🧪',
    },
    verification: { extra: 'private-field-fixture' },
    releases: Array.from({ length: 36 }, (_, index) => ({
      version: index < 30 ? `0.10.${29 - index}` : `0.9.${35 - index}`,
      date: '2026-11-14',
      status: 'published',
      channel: 'stable',
      title: { en: 'Release history', ru: 'История выпусков' },
      changes: [{ en: 'Public release notes. '.repeat(30), ru: 'Обновление. '.repeat(40) }],
      limitations: [],
    })),
  };
}

const publicMetadata = {
  version: '0.10.29',
  asOf: '2026-11-25',
  status: 'published',
  publishedAt: '2026-11-14',
  downloadPage: download,
  directDownload: 'https://dsh.tvijo.com/downloads/tvijo-dshrem-0.10.29.vsix',
  source,
  changelog,
  sha256,
  bytes: 1312779,
  editorRequirement: '>=1.95.0',
  verifiedEnvironment: 'Проверено 🧪',
};

function sizeCatalog(bytes, codeUnits) {
  const data = catalog();
  const note = data.releases[0].changes[0];
  const initial = JSON.stringify(data);
  const extraBytes = bytes - encoder.encode(initial).byteLength;
  const extraUnits = codeUnits - initial.length;
  const cyrillic = extraBytes - extraUnits;
  note.ru += 'я'.repeat(cyrillic);
  note.en += 'x'.repeat(extraUnits - cyrillic);
  const text = JSON.stringify(data);
  assert.equal(text.length, codeUnits);
  const encoded = encoder.encode(text);
  assert.equal(encoded.byteLength, bytes);
  return encoded;
}

function streamed(chunks, init = {}, { stall = false, onCancel } = {}) {
  let pulls = 0;
  let cancels = 0;
  const response = new Response(new ReadableStream({
    pull(controller) {
      const chunk = chunks[pulls++];
      if (chunk) controller.enqueue(chunk);
      else if (!stall) controller.close();
    },
    cancel() {
      cancels++;
      return onCancel?.();
    },
  }, { highWaterMark: 0 }), init);
  return { response, get pulls() { return pulls; }, get cancels() { return cancels; } };
}

function mockFetch(t, response) {
  return t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, RELEASE_URL);
    assert.equal(url, 'https://dsh.tvijo.com/api/dshrem/v1/public/extension-release');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.ok(options.signal instanceof AbortSignal);
    return response;
  });
}

test('accepts a full 36-release catalog at the observed size and projects only public fields', async (t) => {
  const bytes = sizeCatalog(85_641, 66_153);
  const marker = Buffer.from(encoder.encode('🧪'));
  const split = Buffer.from(bytes).indexOf(marker) + 2;
  assert.ok(split > 2);
  const upstream = streamed([bytes.subarray(0, split), bytes.subarray(split, 65536), bytes.subarray(65536)]);
  const fetch = mockFetch(t, upstream.response);

  assert.deepEqual(await fetchPublicRelease(true), publicMetadata);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(upstream.cancels, 0);
  assert.equal(upstream.response.body.locked, false);
});

test('accepts exactly 96 KiB of multibyte JSON', async (t) => {
  const bytes = sizeCatalog(LIMIT, 74_000);
  mockFetch(t, streamed([bytes.subarray(0, 32768), bytes.subarray(32768)]).response);
  assert.deepEqual(await fetchPublicRelease(true), publicMetadata);
});

for (const headers of [undefined, { 'Content-Length': '5' }]) {
  test(`cancels chunked overflow ${headers ? 'with a false low Content-Length' : 'without Content-Length'}`, async (t) => {
    const bytes = sizeCatalog(LIMIT + 1, 74_000);
    const upstream = streamed([bytes.subarray(0, LIMIT), bytes.subarray(LIMIT), encoder.encode('unread')],
      { headers }, { onCancel: () => new Promise(() => {}) });
    mockFetch(t, upstream.response);

    assert.equal(await fetchPublicRelease(true), null);
    assert.equal(upstream.pulls, 2);
    assert.equal(upstream.cancels, 1);
    assert.equal(upstream.response.body.locked, false);
  });
}

test('rejects an oversized Content-Length before reading and cancels the body', async (t) => {
  const upstream = streamed([encoder.encode(JSON.stringify(catalog()))], {
    headers: { 'Content-Length': String(LIMIT + 1) },
  });
  mockFetch(t, upstream.response);

  assert.equal(await fetchPublicRelease(true), null);
  assert.equal(upstream.pulls, 0);
  assert.equal(upstream.cancels, 1);
});

test('fails closed for HTTP errors and cancels their bodies', async (t) => {
  const upstream = streamed([encoder.encode(JSON.stringify(catalog()))], { status: 503 });
  mockFetch(t, upstream.response);
  assert.equal(await fetchPublicRelease(true), null);
  assert.equal(upstream.pulls, 0);
  assert.equal(upstream.cancels, 1);
});

test('fails closed for a missing response body', async (t) => {
  mockFetch(t, new Response(null, { status: 204 }));
  assert.equal(await fetchPublicRelease(true), null);
});

test('cancels immediately on invalid UTF-8 inside otherwise valid JSON', async (t) => {
  const data = catalog();
  data.package.verified_environment = 'UTF8_MARKER';
  const text = JSON.stringify(data);
  const [start, end] = text.split('UTF8_MARKER');
  const upstream = streamed([encoder.encode(start), Uint8Array.of(0xc0, 0xaf), encoder.encode(end)]);
  mockFetch(t, upstream.response);

  assert.equal(await fetchPublicRelease(true), null);
  assert.equal(upstream.pulls, 2);
  assert.equal(upstream.cancels, 1);
});

test('rejects incomplete UTF-8 and malformed JSON', async (t) => {
  for (const bytes of [Uint8Array.of(0xf0, 0x9f), encoder.encode('{"schema":')]) {
    const mock = mockFetch(t, new Response(bytes));
    assert.equal(await fetchPublicRelease(true), null);
    mock.mock.restore();
  }
});

test('fails closed for malformed fields including coercible arrays and unsafe URLs', async (t) => {
  const mutations = [
    (data) => { data.schema = 'other'; },
    (data) => { data.latest_version = ['0.10.29']; },
    (data) => { data.as_of = [data.as_of]; },
    (data) => { data.publication.published_at = [data.publication.published_at]; },
    (data) => { data.publication.status = 'unknown'; },
    (data) => { data.links.download = 'https://example.test/download'; },
    (data) => { data.links.source = [source]; },
    (data) => { data.links.source += '/../unexpected'; },
    (data) => { data.links.changelog = 'https://github.com/example/untrusted/vscode/CHANGELOG.md'; },
    (data) => { data.package.filename = '../tvijo-dshrem-0.10.29.vsix'; },
    (data) => { data.package.sha256 = [sha256]; },
    (data) => { data.package.bytes = 0; },
    (data) => { data.package.editor_requirement = null; },
    (data) => { data.package.verified_environment = 'x'.repeat(3001); },
  ];
  for (const mutate of mutations) {
    const data = catalog();
    mutate(data);
    const mock = mockFetch(t, new Response(JSON.stringify(data)));
    assert.equal(await fetchPublicRelease(true), null, mutate.toString());
    mock.mock.restore();
  }
});

test('prepared releases omit the direct download and publication time', async (t) => {
  const data = catalog();
  data.publication.status = 'prepared';
  mockFetch(t, new Response(JSON.stringify(data)));
  assert.deepEqual(await fetchPublicRelease(true), {
    ...publicMetadata, status: 'prepared', directDownload: null, publishedAt: null,
  });
});

test('a four-second deadline cancels an upstream read stuck before EOF', async (t) => {
  const controller = new AbortController();
  t.mock.method(AbortSignal, 'timeout', (ms) => {
    assert.equal(ms, 4000);
    return controller.signal;
  });
  const upstream = streamed([encoder.encode(JSON.stringify(catalog()))], {}, { stall: true });
  mockFetch(t, upstream.response);
  const pending = fetchPublicRelease(true);
  await new Promise(setImmediate);
  assert.equal(upstream.pulls, 2);
  controller.abort();

  assert.equal(await pending, null);
  assert.equal(upstream.cancels, 1);
  assert.equal(upstream.response.body.locked, false);
});

test('fails closed when the upstream read errors', async (t) => {
  const response = new Response(new ReadableStream({
    pull(controller) { controller.error(new TypeError('upstream reset')); },
  }));
  mockFetch(t, response);
  assert.equal(await fetchPublicRelease(true), null);
  assert.equal(response.body.locked, false);
});

test('caches validated metadata for sixty seconds and preserves fresh reads', async (t) => {
  let now = 100_000;
  t.mock.method(Date, 'now', () => now);
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(catalog())));
  assert.deepEqual(await fetchPublicRelease(), publicMetadata);
  now += 59_999;
  assert.deepEqual(await fetchPublicRelease(), publicMetadata);
  assert.equal(fetch.mock.callCount(), 1);
  assert.deepEqual(await fetchPublicRelease(true), publicMetadata);
  assert.equal(fetch.mock.callCount(), 2);
  now++;
  assert.deepEqual(await fetchPublicRelease(), publicMetadata);
  assert.equal(fetch.mock.callCount(), 3);
});
