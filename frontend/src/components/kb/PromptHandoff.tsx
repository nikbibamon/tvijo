'use client';
import {useEffect, useRef} from 'react';

declare global {interface Window {TvijoPromptHandoff?:{mount:(root:HTMLElement)=>void}}}
export default function PromptHandoff({locale='en'}:{locale?:string}) {
  const root=useRef<HTMLElement>(null), ru=locale==='ru';
  useEffect(() => {
    let cancelled=false;
    const mount=()=>{if(!cancelled && root.current)window.TvijoPromptHandoff?.mount(root.current);};
    if(window.TvijoPromptHandoff)mount();
    else {const script=document.createElement('script');script.src='/knowledge-assets/prompt-handoff.js?v=1';script.onload=mount;document.head.append(script);}
    return ()=>{cancelled=true;};
  },[]);
  const prompt=ru ? 'Помоги создать небольшое приложение в Tvijo. Сначала уточни цель и критерии приёмки, предложи план, работай только с разрешёнными файлами, проверь результат тестами. Не запускай платные API без принятого лимита. Руководство: https://dsh.tvijo.com/knowledge/settings-explained?lang=ru' : 'Help me build a small application with Tvijo. First clarify the goal and acceptance checks, propose a plan, change only authorized files and verify the result with tests. Do not start paid API work without an accepted cap. Guide: https://dsh.tvijo.com/knowledge/settings-explained';
  return <section ref={root} className="tk-handoff" data-tvijo-prompt lang={ru?'ru':'en'}>
    <h2>{ru?'Продолжите в своём инструменте':'Continue in your tool'}</h2>
    <label>{ru?'Промпт для передачи':'Prompt to hand off'}<textarea rows={5} maxLength={3000} data-prompt-text defaultValue={prompt}/></label>
    <p>{ru?'Кнопка передаст видимый текст выбранному сервису. Удалите секреты и приватные данные; у сервиса свои условия и стоимость.':'A button passes the visible text to the selected service. Remove secrets and private data; that service has its own terms and charges.'}</p>
    <button type="button" data-prompt-copy>{ru?'Скопировать промпт':'Copy prompt'}</button>
    <div className="tk-prompt-links" data-prompt-links/><p className="tk-meta" data-prompt-status role="status"/>
    <p className="tk-meta">{ru?'Для настольных ссылок требуется установленное приложение. Если переход не сработал, скопируйте текст.':'Desktop links require the installed application. If a link does not work, copy the text.'}</p>
  </section>;
}
