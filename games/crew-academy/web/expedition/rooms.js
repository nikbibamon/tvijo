export const riftRooms = [
  { id: 'alphabet', name: 'Алфавит маяка', place: 'Кристальный разлом', crew: 'Самолётик, Ассистентка и Дочка', task: 'Узнай по работе приборов, что означают три знака на шлюзе.', art: './expedition/art/beacon-idle.webp', prize: 'Линза связи' },
  { id: 'cargo', name: 'Склад Робота', place: 'Грузовой отсек', crew: 'Робот', task: 'Развези энергоячейку и хладагент по двум плитам. Затем отправь посылку в Ремонтный шлюз.', art: './warehouse/depot.webp', prize: 'Энергоячейка' },
  { id: 'chain', name: 'Цепная реакция', place: 'Энергоблок', crew: 'Дочка и Робот', task: 'Зажги сигнальную лампу, а затем направь шар к насосу охлаждения.', art: './chain/power-chamber.webp', prize: 'Световое реле' },
  { id: 'drones', name: 'Ремонтный шлюз', place: 'Оранжерея дронов', crew: 'Пять ремонтных дронов', task: 'Доведи пятерых до шлюза. После дневной смены откроется ночная с грузовым лифтом.', art: './sluice/hangar.webp', prize: 'Знак спасателей' },
  { id: 'pulse', name: 'Шахта эха', place: 'Нижние штольни', crew: 'Сын', task: 'Расчисти завал импульсом и дойди до шлюза.', art: './art/mine.webp', prize: 'Резонатор' },
  { id: 'radio', name: 'Радиомастерская', place: 'Солнечный причал', crew: 'Полевой экипаж', task: 'Запроси по рации предмет и найди способ перебраться на другой берег.', art: './art/dock.webp', prize: 'Радиометка' }
];

export const stationRooms = [
  {id: 'mirrors', name: 'Зеркальная станция', place: 'Станция времени', chapter: 'station', next: 'time-archive',
    crew: 'Ассистентка', task: 'Поймай луч тремя зеркалами и открой нишу с призмой.', art: './art/foundry.webp', prize: 'Призма станции'},
  {id: 'time-archive', name: 'Архив двух времён', place: 'Станция времени', chapter: 'station',
    crew: 'Синий Гуманоид', task: 'Достань печать в прошлом и принеси её к шлюзу в настоящем.', art: './echo/archive.webp', prize: 'Печать времени'}
];

export const rooms = [...riftRooms, ...stationRooms];
export const prizes = [...rooms, {id: 'orbital-storm', name: 'Орбитальный шторм', prize: 'Знак спасения Светляка'},
  {id:'echo-mine', name:'Шахта эха', prize:'Чёрный ящик разведчика'},
  {id:'drones-night', name:'Ночная смена в шлюзе', prize:'Фонарь ночной смены'},
  {id:'cargo-express',name:'Экспресс-сортировка',prize:'Марка экспресс-груза'},
  {id:'chain-pump',name:'Контур охлаждения',prize:'Ключ насоса'},
  {id:'rescue-pair',name:'Линия спасения',prize:'Знак спасательной связки'}];

export const roomById = id => rooms.find(room => room.id === id);
export const prizeById = id => prizes.find(item => item.id === id);
export const roomHref = id => './expedition.html' + (id ? '#' + id : '');
export const hasPrize = (profile, id) => Array.isArray(profile.expeditionRewards) && profile.expeditionRewards.includes(id);
export function collectPrize(profile, id) {
  if (!prizeById(id) || hasPrize(profile, id)) return false;
  profile.expeditionRewards = [...(Array.isArray(profile.expeditionRewards) ? profile.expeditionRewards : []), id];
  return true;
}
export const packNames = profile => prizes.filter(item => hasPrize(profile, item.id)).map(item => item.prize);
