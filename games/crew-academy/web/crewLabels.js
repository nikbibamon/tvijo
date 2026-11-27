export const interests={explore:'Ищу секретные маршруты',build:'Собираю миры',plan:'Придумываю планы для агентов',help:'Помогаю с заданиями'};
export const radioPhrases={hello:'Привет, напарник! На связи.',plan:'Предлагаю разделить задачи. Я займусь разведкой.',check:'Какой шаг нам стоит перепроверить?',thanks:'Спасибо за помощь экипажу!',world:'Посмотри мой маршрут!'};
export const crewBadges={start:'Первое дежурство',bridge:'Механик переправы',chain:'Координатор шлюза',check:'Проверил гипотезу',beacon:'Связист маяка'};
export const beaconTones=[
 {name:'Звезда',symbol:'✦',color:'#ffd279'}, {name:'Волна',symbol:'≈',color:'#72e7e0'},
 {name:'Круг',symbol:'●',color:'#f6a4b0'}, {name:'Ромб',symbol:'◆',color:'#c2a8ff'}
];
export const toneText=code=>Array.from(code||'',v=>beaconTones[Number(v)]?.name||'').join(' · ');
export const validPixelAvatar=v=>v===''||typeof v==='string'&&/^[0-3]:[0-7]{256}$/.test(v);
export function randomTransmission(){
 const bytes=crypto.getRandomValues(new Uint8Array(3));
 // Vary all three symbols without producing a trivial repeated tone.
 const a=bytes[0]%4,b=(a+1+bytes[1]%3)%4,c=(b+1+bytes[2]%3)%4;
 return String(a)+b+c;
}
export function projectRelay(row,id){
 if(!row)return null;
 const role=row.scout===id?'scout':'engineer';
 const canHear=row.phase==='sent'||row.phase==='done'||role==='scout'&&row.phase==='found';
 return {mission:row.mission,role,phase:row.phase,sequence:canHear?row.sequence:null};
}
