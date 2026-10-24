'use client';
import { useEffect,useState } from 'react';
import { parsePublicRelease, type PublicExtensionRelease } from '@/lib/tvijo-extension-release';

export default function LiveExtensionRelease({locale='en',initialRelease=null}:{locale?:string;initialRelease?:PublicExtensionRelease|null}) {
  const ru=locale==='ru';
  const [release,setRelease]=useState(initialRelease);
  const [status,setStatus]=useState('loading');
  useEffect(()=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
    fetch('/api/connected-extension-release',{credentials:'omit',cache:'no-store',signal:controller.signal}).then(async response=>{
      if(!response.ok)throw new Error('unavailable');
      const data=await response.json();
      const parsed=parsePublicRelease({schema:'tvijo.extension-release/v1',latest_version:data.version,as_of:data.asOf,publication:{status:data.status,published_at:data.publishedAt},links:{download:data.downloadPage,source:data.source,changelog:data.changelog},package:{filename:`tvijo-dshrem-${data.version}.vsix`,sha256:data.sha256,bytes:data.bytes,editor_requirement:data.editorRequirement,verified_environment:data.verifiedEnvironment}});
      if(!parsed)throw new Error('invalid');
      setRelease(parsed);setStatus('ready');
    }).catch(()=>{setStatus('unavailable');}).finally(()=>clearTimeout(timer));
    return()=>{controller.abort();clearTimeout(timer);};
  },[]);
  const tr=(en:string,russian:string)=>ru?russian:en;
  return <div className="tk-page rounded-xl"><link rel="stylesheet" href="/knowledge-assets/graph.css?v=1" />
    <section className="tk-evidence" aria-label={tr('Current extension release','Текущий выпуск расширения')} data-live-extension-release={status}>
      <p className="tk-eyebrow">TVIJO DSHREM / VS CODE</p>
      <h2>{tr('Current extension release','Текущий выпуск расширения')}</h2>
      {status==='ready'&&release&&<><p><strong data-extension-version={release.version}>{release.version}</strong> · {release.status==='published'?tr('Published','Опубликован'):tr('Prepared · publication pending','Подготовлен · публикация ожидается')} · <time dateTime={release.asOf}>{release.asOf}</time></p>
        <p>{tr('Minimum VS Code','Минимальная версия VS Code')}: {release.editorRequirement}</p>
        <p>{release.verifiedEnvironment}</p>
        <p><a href={release.downloadPage}>{tr('Download and install','Скачать и установить')}</a> · <a href={release.changelog}>{tr('Source changelog','Журнал исходников')}</a> · <a href={release.source}>{tr('Versioned source','Исходники этой версии')}</a></p>
        {release.status==='published'&&release.directDownload&&<p><a href={release.directDownload}>{tr('Download published VSIX','Скачать опубликованный VSIX')}</a></p>}
        <details><summary>{tr('Package verification','Проверка пакета')}</summary><p className="break-all">SHA-256: <code>{release.sha256}</code></p><p>{release.bytes} bytes</p></details>
      </>}
      {status==='loading'&&<p role="status">{tr('Checking current release metadata…','Проверяем метаданные текущего выпуска…')}</p>}
      {status==='unavailable'&&<p role="status">{tr('Current metadata is unavailable. Open the canonical release history before choosing a version.','Текущие метаданные недоступны. Перед выбором версии откройте каноническую историю выпусков.')}</p>}
      <p><a href="https://dsh.tvijo.com/changelog">{tr('Canonical extension release history','Каноническая история выпусков расширения')}</a> · <a href="https://dsh.tvijo.com/api/dshrem/v1/public/extension-release">Release JSON</a></p>
      <p><a href={`/${ru?'ru':'en'}/knowledge#article-top`}>{tr('Neovim, orchestration and quality guides','Neovim, оркестрация и проверка качества')}</a></p>
    </section>
  </div>;
}
