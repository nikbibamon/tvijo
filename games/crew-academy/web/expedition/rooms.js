export const riftRooms = [
  { id: 'alphabet', name: 'Алфавит маяка', place: 'Кристальный разлом', crew: 'Самолётик, Ассистентка и Дочка', task: 'Узнай по работе приборов, что означают три знака на шлюзе.', art: './expedition/art/beacon-idle.webp', prize: 'Линза связи' },
  { id: 'cargo', name: 'Склад Робота', place: 'Грузовой отсек', crew: 'Робот', task: 'Подтолкни энергоячейку на плиту, чтобы запустить конвейер.', art: './art/foundry.webp', prize: 'Энергоячейка' },
  { id: 'chain', name: 'Цепная реакция', place: 'Энергоблок', crew: 'Дочка и Робот', task: 'Поверни желоб и рычаг, чтобы шар включил лампу.', art: './art/beacon.webp', prize: 'Световое реле' },
  { id: 'drones', name: 'Ремонтный шлюз', place: 'Оранжерея дронов', crew: 'Пять ремонтных дронов', task: 'Назначь строителя и стрелочника, чтобы вывести всех пятерых.', art: './art/greenhouse.webp', prize: 'Знак спасателей' },
  { id: 'pulse', name: 'Шахта эха', place: 'Нижние штольни', crew: 'Сын', task: 'Расчисти завал импульсом и дойди до шлюза.', art: './art/mine.webp', prize: 'Резонатор' },
  { id: 'radio', name: 'Радиомастерская', place: 'Солнечный причал', crew: 'Полевой экипаж', task: 'Запроси по рации предмет и найди способ перебраться на другой берег.', art: './art/dock.webp', prize: 'Радиометка' }
];

export const stationRooms = [
  {id: 'mirrors', name: 'Зеркальная станция', place: 'Станция времени', chapter: 'station', next: 'time-archive',
    crew: 'Ассистентка', task: 'Поймай луч тремя зеркалами и открой нишу с призмой.', art: './art/foundry.webp', prize: 'Призма станции'},
  {id: 'time-archive', name: 'Архив двух времён', place: 'Станция времени', chapter: 'station',
    crew: 'Синий Гуманоид', task: 'Достань печать в прошлом и принеси её к шлюзу в настоящем.', art: './art/relay.webp', prize: 'Печать времени'}
];

export const rooms = [...riftRooms, ...stationRooms];

export const roomById = id => rooms.find(room => room.id === id);
export const roomHref = id => './expedition.html' + (id ? '#' + id : '');
export const hasPrize = (profile, id) => Array.isArray(profile.expeditionRewards) && profile.expeditionRewards.includes(id);
export function collectPrize(profile, id) {
  if (!roomById(id) || hasPrize(profile, id)) return false;
  profile.expeditionRewards = [...(Array.isArray(profile.expeditionRewards) ? profile.expeditionRewards : []), id];
  return true;
}
export const packNames = profile => rooms.filter(room => hasPrize(profile, room.id)).map(room => room.prize);
