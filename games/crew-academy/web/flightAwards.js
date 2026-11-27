export const flightAwards=[
 {id:'capsule',title:'Первый захват',goal:'Забери капсулу на Солнечном причале.',credits:5,stage:'dock'},
 {id:'drone',title:'Хранитель дронов',goal:'Доставь разведчика из Оранжереи.',credits:10,stage:'greenhouse'},
 {id:'robot',title:'Мастер орбиты',goal:'Вместе с Роботом запусти Кузницу.',credits:15,stage:'foundry'},
 {id:'architect',title:'Архитектор миров',goal:'Нарисуй свой первый мир в мастерской.',credits:8},
 {id:'crew',title:'Две звезды',goal:'Приглашённый пилот выполняет два поручения. Знак получают оба.',credits:10},
 {id:'conductor',title:'Дирижёр экипажа',goal:'Собери команду и зажги Сердце маяка.',credits:10,stage:'beacon'}
];
export function awardAvailable(award,save){
  if(award.stage)return save.completed.includes(award.stage);
  if(award.id==='architect')return !!save.worldDrawn||save.log.some(e=>e.type==='world'&&e.text.startsWith('Собран мир'));
  return award.id==='crew'&&save.crewMedal===true;
}
