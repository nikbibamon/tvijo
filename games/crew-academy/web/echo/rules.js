export const minePrize = 'echo-mine';
export const phaseIds = ['signals', 'rail', 'return', 'log'];
export const phaseNames = ['Разведка', 'Вагонетка', 'Эвакуация', 'Итог'];
export const stops = [13, 30, 53, 72, 89];
const messages = {
  start: ['captain', 'Самолётик и Гуманоид слышат разные сигналы. Вызови обоих.'],
  plane: ['plane', 'Три коротких импульса. Кто-то повторяет позывной из-под вагонетки.'],
  blue: ['blue', 'От верхней жилы приходит одно долгое эхо. Похоже на золото.'],
  missing: ['daughter', 'Для сверки нужны оба показания. Коснись портрета второго разведчика.'],
  ore: ['blue', 'Чистое золото! Жила звенит один раз. Дрон подавал три сигнала.'],
  cart: ['plane', 'Три импульса совпали! Вагонетка зажала дрон. Нужно освободить путь.'],
  cup: ['robot', 'Желоб смотрит в приёмную чашу. Шар сможет нажать на рычаг.'],
  bin: ['robot', 'Желоб направлен в сборный лоток.'],
  siding: ['robot', 'Стрелка переведена на свободный боковой путь.'],
  buffer: ['robot', 'Стрелка направлена к тупику.'],
  spill: ['robot', 'Шар скатился в лоток. До рычага он не дошёл. Можно запустить ещё раз.'],
  bump: ['robot', 'Рычаг сработал, вагонетка упёрлась в буфер. Переведи стрелку.'],
  released: ['plane', 'Шар нажал рычаг, вагонетка ушла на боковой путь. Дрон свободен!'],
  walk: ['son', 'Иду по настилу.'],
  gap: ['son', 'В настиле разрыв. Его можно перепрыгнуть налегке или проложить переправу.'],
  banks: ['robot', 'Анкеры для переправы стоят по краям разрыва.'],
  rope: ['robot', 'Трос натянут. У анкера можно прокатиться с грузом прямо к шлюзу.'],
  plank: ['robot', 'Настил выдвинут, по нему можно провести дрон пешком.'],
  jump: ['son', 'Разрыв позади. С грузом понадобится переправа.'],
  load: ['son', 'С дроном прыгать нельзя. Здесь можно натянуть трос или выдвинуть настил.'],
  ride: ['son', 'Каретка прошла по тросу до шлюза. Дрон со мной!'],
  caught: ['son', 'Зацепил дрон. Возвращаемся к освещённому шлюзу слева.'],
  done: ['captain', 'Дрон на борту. Чёрный ящик доставлен в штаб.']
};
export const messageFor = key => messages[key] || messages.start;
export const gearLabel = tool => ({rope:'Трос', plank:'Выдвижной настил'}[tool] || 'Без переправы');
export function freshMine() {
  return {v:1, phase:0, heard:[], chute:false, siding:false, ore:0, tries:0, pos:1,
    tool:'', carrying:false, last:'start', radio:['start']};
}
export function restoreMine(record) {
  if (!record || record.v !== 1 || !Number.isInteger(record.phase) || !phaseIds[record.phase]
      || !Number.isInteger(record.pos) || stops[record.pos] === undefined || !Array.isArray(record.heard)
      || !['', 'rope', 'plank'].includes(record.tool)) return freshMine();
  const heard = [...new Set(record.heard.filter(x => x === 'blue' || x === 'plane'))];
  if (record.phase > 0 && heard.length !== 2 || record.phase > 1 && !(record.chute && record.siding)
      || record.phase === 3 && (!record.carrying || record.pos !== 0 || !record.tool)) return freshMine();
  const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
  return {...freshMine(), phase:record.phase, pos:record.pos, heard, chute:record.chute === true,
    siding:record.siding === true, tool:record.tool, carrying:record.carrying === true,
    tries:count(record.tries), ore:count(record.ore), last:Object.hasOwn(messages,record.last)?record.last:'start',
    radio:Array.isArray(record.radio)?record.radio.filter(k=>Object.hasOwn(messages,k)).slice(-18):['start']};
}
function say(s, key) {
  s.last = key;
  if (s.radio.at(-1) !== key) s.radio = [...s.radio.slice(-17), key];
  return s;
}
export function mineAction(previous, action) {
  if (action === 'restart' && previous.phase === 3) return freshMine();
  if (previous.phase === 3) return previous;
  const s = {...previous};
  if (s.phase === 0) {
    if (action === 'plane' || action === 'blue') {
      if (!s.heard.includes(action)) s.heard = [...s.heard, action];
      return say(s, action);
    }
    if (action !== 'ore' && action !== 'cart') return previous;
    if (s.heard.length !== 2) return say(s,'missing');
    if (action === 'ore') s.ore++; else s.phase = 1;
    return say(s,action);
  }
  if (s.phase === 1) {
    if (action === 'chute') {s.chute = !s.chute; return say(s,s.chute?'cup':'bin');}
    if (action === 'switch') {s.siding = !s.siding; return say(s,s.siding?'siding':'buffer');}
    if (action !== 'run') return previous;
    s.tries++;
    if (!s.chute) return say(s,'spill');
    if (!s.siding) return say(s,'bump');
    s.phase = 2;
    return say(s,'released');
  }
  const atGap = s.pos === 1 || s.pos === 2;
  switch (action) {
    case 'left':
    case 'right': {
      const dest = s.pos + (action === 'left' ? -1 : 1);
      if (stops[dest] === undefined) return previous;
      if (s.pos + dest === 3 && s.tool !== 'plank') return say(s,'gap');
      s.pos = dest; return say(s,'walk');
    }
    case 'rope':
    case 'plank':
      if (!atGap) return say(s,'banks');
      s.tool = action; return say(s,action);
    case 'cross':
      if (!atGap) return previous;
      if (s.tool === 'rope') {
        s.pos = s.pos === 1 ? 2 : s.carrying ? 0 : 1;
        return say(s,s.pos===0?'ride':'rope');
      }
      if (s.carrying && s.tool !== 'plank') return say(s,'load');
      s.pos = 3 - s.pos; return say(s,s.tool==='plank'?'walk':'jump');
    case 'use':
      if (s.pos === 4 && !s.carrying) {s.carrying = true; return say(s,'caught');}
      if (s.pos === 0 && s.carrying) {s.phase = 3; return say(s,'done');}
      return previous;
    default: return previous;
  }
}
export function mineReport(s) {
  return {first:s.heard[0], ore:s.ore, tries:s.tries, tool:s.tool};
}
