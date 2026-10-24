/** Fixed public source, bounded response and explicit output fields. No account data. */
export const RELEASE_URL = 'https://dsh.tvijo.com/api/dshrem/v1/public/extension-release';
export type PublicExtensionRelease = {
  version:string; asOf:string; status:'published'|'prepared'; publishedAt:string|null;
  downloadPage:string; directDownload:string|null; source:string; changelog:string;
  sha256:string; bytes:number; editorRequirement:string; verifiedEnvironment:string;
};
const gitSource = /^https:\/\/github\.com\/nikbibamon\/dshrempub\/tree\/[A-Za-z0-9._/-]+$/;
const gitChangelog = /^https:\/\/github\.com\/nikbibamon\/dshrempub\/blob\/[A-Za-z0-9._/-]+\/vscode\/CHANGELOG\.md$/;
export function parsePublicRelease(data:any): PublicExtensionRelease|null {
  if (!data || data.schema !== 'tvijo.extension-release/v1' || !/^\d+\.\d+\.\d+$/.test(data.latest_version) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.as_of) || !['published','prepared'].includes(data.publication?.status) ||
      data.links?.download !== 'https://dsh.tvijo.com/download#vscode' ||
      !gitSource.test(data.links?.source) || !gitChangelog.test(data.links?.changelog) ||
      /(?:\/\.\.?|[%\\\s])/.test(data.links.source + data.links.changelog) ||
      data.package?.filename !== `tvijo-dshrem-${data.latest_version}.vsix` ||
      !/^[a-f0-9]{64}$/.test(data.package.sha256) || !Number.isSafeInteger(data.package.bytes) || data.package.bytes<=0 ||
      typeof data.package.editor_requirement !== 'string' || data.package.editor_requirement.length>100 ||
      typeof data.package.verified_environment !== 'string' || data.package.verified_environment.length>3000) return null;
  const published = data.publication.status === 'published';
  if (published && !/^\d{4}-\d{2}-\d{2}$/.test(data.publication.published_at)) return null;
  return {version:data.latest_version,asOf:data.as_of,status:data.publication.status,publishedAt:published?data.publication.published_at:null,
    downloadPage:data.links.download,directDownload:published?'https://dsh.tvijo.com/downloads/'+data.package.filename:null,
    source:data.links.source,changelog:data.links.changelog,sha256:data.package.sha256,bytes:data.package.bytes,
    editorRequirement:data.package.editor_requirement,verifiedEnvironment:data.package.verified_environment};
}
export async function fetchPublicRelease():Promise<PublicExtensionRelease|null> {
  try {
    const response = await fetch(RELEASE_URL,{next:{revalidate:60},signal:AbortSignal.timeout(4000),headers:{Accept:'application/json'}});
    if (!response.ok) return null;
    const text = await response.text(); if(text.length>65536) return null;
    return parsePublicRelease(JSON.parse(text));
  } catch { return null; }
}
