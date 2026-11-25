/** Fixed public source, bounded response and explicit output fields. No account data. */
export const RELEASE_URL = 'https://dsh.tvijo.com/api/dshrem/v1/public/extension-release';
const MAX_RELEASE_BYTES = 96 * 1024;
const RELEASE_CACHE_MS = 60_000;
export type PublicExtensionRelease = {
  version:string; asOf:string; status:'published'|'prepared'; publishedAt:string|null;
  downloadPage:string; directDownload:string|null; source:string; changelog:string;
  sha256:string; bytes:number; editorRequirement:string; verifiedEnvironment:string;
};
const gitSource = /^https:\/\/github\.com\/nikbibamon\/dshrempub\/tree\/[A-Za-z0-9._/-]+$/;
const gitChangelog = /^https:\/\/github\.com\/nikbibamon\/dshrempub\/blob\/[A-Za-z0-9._/-]+\/vscode\/CHANGELOG\.md$/;
export function parsePublicRelease(data:any): PublicExtensionRelease|null {
  if (!data || data.schema !== 'tvijo.extension-release/v1' ||
      typeof data.latest_version !== 'string' || !/^\d+\.\d+\.\d+$/.test(data.latest_version) ||
      typeof data.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.as_of) ||
      !['published','prepared'].includes(data.publication?.status) ||
      data.links?.download !== 'https://dsh.tvijo.com/download#vscode' ||
      typeof data.links.source !== 'string' || typeof data.links.changelog !== 'string' ||
      !gitSource.test(data.links?.source) || !gitChangelog.test(data.links?.changelog) ||
      /(?:\/\.\.?|[%\\\s])/.test(data.links.source + data.links.changelog) ||
      data.package?.filename !== `tvijo-dshrem-${data.latest_version}.vsix` ||
      typeof data.package.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(data.package.sha256) ||
      !Number.isSafeInteger(data.package.bytes) || data.package.bytes<=0 ||
      typeof data.package.editor_requirement !== 'string' || data.package.editor_requirement.length>100 ||
      typeof data.package.verified_environment !== 'string' || data.package.verified_environment.length>3000) return null;
  const published = data.publication.status === 'published';
  if (published && (typeof data.publication.published_at !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.publication.published_at))) return null;
  return {version:data.latest_version,asOf:data.as_of,status:data.publication.status,publishedAt:published?data.publication.published_at:null,
    downloadPage:data.links.download,directDownload:published?'https://dsh.tvijo.com/downloads/'+data.package.filename:null,
    source:data.links.source,changelog:data.links.changelog,sha256:data.package.sha256,bytes:data.package.bytes,
    editorRequirement:data.package.editor_requirement,verifiedEnvironment:data.package.verified_environment};
}
let cachedRelease: { release: PublicExtensionRelease; expiresAt: number } | undefined;

async function readReleaseBody(response: Response, signal: AbortSignal): Promise<string | null> {
  const { body } = response;
  if (!body) return null;
  if (!response.ok || Number(response.headers.get('content-length')) > MAX_RELEASE_BYTES) {
    void body.cancel().catch(() => {});
    return null;
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  const reader = body.getReader();
  const cancelRead = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancelRead, { once: true });
  let complete = false;
  let bytes = 0;
  let text = '';
  try {
    signal.throwIfAborted();
    for (;;) {
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) {
        complete = true;
        return text + decoder.decode();
      }
      bytes += value.byteLength;
      if (bytes > MAX_RELEASE_BYTES) return null;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    signal.removeEventListener('abort', cancelRead);
    if (!complete) cancelRead();
    reader.releaseLock();
  }
}

export async function fetchPublicRelease(fresh = false): Promise<PublicExtensionRelease | null> {
  if (!fresh && cachedRelease && Date.now() < cachedRelease.expiresAt) return cachedRelease.release;
  try {
    const signal = AbortSignal.timeout(4000);
    // Next.js buffers cacheable fetches before returning them. Cache only the validated result.
    const response = await fetch(RELEASE_URL, {
      cache: 'no-store', credentials: 'omit', signal, headers: { Accept: 'application/json' },
    });
    const text = await readReleaseBody(response, signal);
    if (text === null) return null;
    const release = parsePublicRelease(JSON.parse(text));
    if (!fresh && release) cachedRelease = { release, expiresAt: Date.now() + RELEASE_CACHE_MS };
    return release;
  } catch {
    return null;
  }
}
