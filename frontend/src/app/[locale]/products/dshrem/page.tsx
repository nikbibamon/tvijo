import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import LiveExtensionRelease from '@/components/kb/LiveExtensionRelease';
import {fetchPublicRelease} from '@/lib/tvijo-extension-release';
export const revalidate=60;
export function generateMetadata({params}:{params:{locale:string}}):Metadata {
  const ru=params.locale==='ru';
  return {title:'Tvijo DSHREM for VS Code',description:ru?'Выбранный контекст, проверяемые правки и актуальные сведения о выпуске.':'Selected context, reviewable edits and current release evidence.',alternates:{canonical:`https://tvijo.com/${ru?'ru':'en'}/products/dshrem`,languages:{en:'https://tvijo.com/en/products/dshrem',ru:'https://tvijo.com/ru/products/dshrem'}}};
}
export default async function Page({params}:{params:{locale:string}}) {
  if(!['en','ru'].includes(params.locale))notFound();
  const ru=params.locale==='ru',release=await fetchPublicRelease();
  return <><Navbar/><div className="tk-page pt-24"><link rel="stylesheet" href="/knowledge-assets/graph.css?v=1"/>
    <main className="tk-main" lang={ru?'ru':'en'}><p className="tk-eyebrow">TVIJO / DEVELOPER TOOLS</p>
      <h1 id="article-top" tabIndex={-1}>Tvijo DSHREM for VS Code</h1>
      <p className="tk-summary">{ru?'Работайте с выбранным проектом, явными разрешениями и проверяемыми изменениями.':'Work with your selected project, explicit permissions and reviewable changes.'}</p>
      <p>{ru?'Возможности и ограничения зависят от установленной версии и настроек хоста. Проверьте текущий выпуск ниже, затем следуйте инструкции установки.':'Capabilities and limits depend on the installed version and host setup. Check the current release below, then follow the installation instructions.'}</p>
      <LiveExtensionRelease locale={params.locale} initialRelease={release}/>
      <p><a href={`/${ru?'ru':'en'}/knowledge/dsh-harness-orchestration#article-top`}>{ru?'Как устроена оркестрация и что нужно проверить на своём хосте':'How orchestration works and what to verify on your host'}</a></p>
      <p><a href={`/${ru?'ru':'en'}/changelog`}>{ru?'Журнал изменений Tvijo':'Tvijo changelog'}</a> · <a href="https://dsh.tvijo.com/learn">{ru?'Руководство DSHREM':'DSHREM guide'}</a></p>
    </main></div><Footer/></>;
}
