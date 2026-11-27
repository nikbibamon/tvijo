'use client';
import {Suspense,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {getAccessToken,logout} from '@/services/auth';

function ConnectAcademy(){
  const nonce=useSearchParams().get('state')||'';
  const [busy,setBusy]=useState(false),[expired,setExpired]=useState(false),[message,setMessage]=useState('');
  const valid=/^[0-9a-f]{64}$/.test(nonce);
  const own='/ru/game/academy-connect?state='+encodeURIComponent(nonce);
  const login='/ru/login?redirect='+encodeURIComponent(own);
  useEffect(()=>{if(valid&&!getAccessToken())location.replace(login);},[valid,login]);
  async function connect(){
    if(!valid||busy)return;
    const token=getAccessToken();
    if(!token){location.assign(login);return;}
    setBusy(true);setMessage('');
    try{
      const res=await fetch('/api/game/academy-proof',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{Authorization:'Bearer '+token,'X-Crew-State':nonce},signal:AbortSignal.timeout(5000)});
      if(res.status===401){setExpired(true);setMessage('Сессия Tvijo истекла. Войди снова, чтобы продолжить.');return;}
      if(!res.ok)throw Error();
      const data=await res.json(),url=new URL(data.returnUrl);
      if(url.origin!=='https://tvijo-crew-academy.be9ava.chatgpt.site'||url.pathname!=='/'||!url.hash.startsWith('#tvijo='))throw Error();
      location.replace(url.href);
    }catch{setMessage('Связь с Академией сейчас недоступна. Попробуй ещё раз.');}finally{setBusy(false);}
  }
  return <main style={{maxWidth:520,margin:'12vh auto',padding:'1.5rem'}}>
    <p>Tvijo · Академия экипажа</p><h1>Привязать игровой позывной</h1>
    {valid?<><p>Открыть Академию с текущим аккаунтом Tvijo? Игра получит отдельный игровой идентификатор. Публикацию карточки в рейтинге ты включаешь в самой игре.</p>
    <button type="button" disabled={busy||expired} onClick={connect}>{busy?'Подключаем…':'Привязать и вернуться в игру'}</button>
    {expired&&<button type="button" onClick={()=>{logout();location.assign(login);}}>Войти заново</button>}</>:<p>Начни вход в разделе «Игроки» в Академии, чтобы получить действующий запрос.</p>}
    <p role="status">{message}</p><a href="https://tvijo-crew-academy.be9ava.chatgpt.site/">Вернуться в Академию</a>
  </main>;
}
export default function CrewConnectPage(){
  return <Suspense fallback={<p>Подключаем Академию…</p>}><ConnectAcademy/></Suspense>;
}
