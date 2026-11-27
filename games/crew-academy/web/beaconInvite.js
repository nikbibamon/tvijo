// One address follows both posts from the invitation to the result.
export function beaconInvitation(room,{el,group,para,action,ii,request,track,share,play,campaign,code}){
 const me=room.me,offer=room.beacon||{status:'unavailable'};
 const setup=code&&code!=='mine';
 const intro=group('beacon-brief',ii('radio'),group('',el('h3','','Парный маяк'),para('Разведчик считывает три импульса. Инженер повторяет их на другом посту.')));
 const go=()=>action('Продолжить кампанию',campaign,'btn secondary','play');
 const button=(label,handler)=>action(label,handler,'btn primary','radio');
 if(offer.status==='unavailable'||offer.status==='closed'||offer.status==='declined'){
   const message=offer.status==='declined'?'Приглашение отклонено.':offer.status==='closed'?'Приглашение закрыто.':'Это приглашение уже недоступно.';
   return [intro,para(message),group('actions',...(offer.owner?[button('Создать новое приглашение',()=>request('beacon-link',{action:'create'}))]:[]),go())];
 }
 if(offer.status==='done')return [intro,el('h3','','Маяк зажжён!'),para('Смена с пилотом «'+offer.partner+'» завершена.'),group('actions',...(offer.owner?[button('Пригласить ещё одного друга',()=>request('beacon-link',{action:'create'}))]:[]),go())];
 if(offer.status==='active')return [intro,button('На свой пост',()=>play(offer)),go()];
 if(offer.status==='waiting'){
   const link=new URL(location.pathname,location.origin);link.hash='beacon/'+offer.code;
   const address=el('input','share-url');address.value=link.href;address.readOnly=true;address.setAttribute('aria-label','Ссылка на второй пост');
   const telegram=new URL('https://t.me/share/url');telegram.searchParams.set('url',link.href);telegram.searchParams.set('text','Я на посту разведчика в Tvijo. Займёшь второй пост в Парном маяке?');
   const send=share('Отправить в Telegram',telegram.href);send.className='btn primary';send.onclick=()=>track('beacon_share_open');
   const copy=action('Скопировать ссылку',async()=>{try{await navigator.clipboard.writeText(link.href);copy.textContent='Ссылка скопирована';}catch{address.focus();address.select();}},'btn secondary');
   return [intro,para('Это твоё приглашение. Ждём согласия напарника. По этой же ссылке ты вернёшься на пост разведчика.'),address,group('actions',send,copy),action('Отозвать приглашение',()=>request('beacon-link',{action:'cancel',code:offer.code}),'text-btn'),go()];
 }
 const incoming=offer.status==='offer'&&setup;
 const lead=incoming?'Пилот «'+offer.host+'» зовёт тебя на пост инженера.':'Позови друга на пост инженера. Ты будешь разведчиком.';
 const out=[intro,para(lead)];
 if(!me){
   out.push(button('Получить игровой позывной',()=>request('join',{hero:room.selectedHero,...(incoming?{beacon:code}:{})})));
 }else if(!me.visible){
   out.push(para('Для парной игры карточка с позывным и игровыми результатами видна в рейтинге. Её можно скрыть в профиле.','subtle'),
     button('Открыть мою карточку в рейтинге',()=>request('profile',{visible:true,hero:me.hero,focus:me.focus})));
 }else if(incoming){
   out.push(button('Принять приглашение и занять пост',()=>request('beacon-link',{action:'accept',code})));
 }else{
   out.push(button('Создать приглашение на второй пост',()=>request('beacon-link',{action:'create'})));
 }
 if(incoming&&me)out.push(action('Отклонить приглашение',()=>request('beacon-link',{action:'decline',code}),'text-btn'));
 out.push(go());return out;
}
