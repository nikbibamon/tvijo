import {seededRandom} from '../playground/grid.js';

export const eras = {
  palace: {
    name:'Дворец маятников', year:'0480', period:'Эпоха звёздных карт', dress:'Королевские мантии и золочёные камзолы',
    objects:{chart:['Звёздная карта',29,55],clock:['Семейные часы',51,32],bells:['Шкаф с колоколами',78,51]}
  },
  harbor: {
    name:'Лунная гавань', year:'0732', period:'Эпоха парусов', dress:'Плащи мореходов и тёплые шарфы',
    objects:{lantern:['Фонарь',24,59],lens:['Приливная линза',69,40],crank:['Ворот',70,68]}
  },
  canopy: {
    name:'Город крон', year:'1240', period:'Эпоха живых мостов', dress:'Куртки путешественников со светящимися швами',
    objects:{archive:['Архивариус Таи',21,53],receiver:['Приёмник',67,40],gate:['Арка перехода',86,44]}
  }
};

export const family = {
  reader:{name:'Лира', title:'Принцесса · читает знаки', portrait:'daughter'},
  engineer:{name:'Ян', title:'Принц · чинит механизмы', portrait:'son'}
};
export const signs = {
  moon:{name:'Луна',glyph:'☾'},star:{name:'Звезда',glyph:'✦'},wave:{name:'Волна',glyph:'≋'}
};

const task = (era,object,role,goal,line,options={})=>({era,object,role,goal,line,...options});

export const chapters = {
  origin: {
    name:'Завтра застряло в часах',label:'Пролог', summary:'Семейные часы пошли назад. Найди пропавшее завтра.',
    steps:[
      task('palace','chart','reader','Попроси Лиру прочитать звёздную карту.',
        'Лира нашла знак луны. Он укажет гавань, когда часы откроют дорогу.',{item:'Карта с луной'}),
      task('palace','clock','engineer','Попроси Яна повернуть кольцо часов.',
        'Ян повернул кольцо. В часах показалась Лунная гавань.'),
      task('harbor','lantern','engineer','Ян может зажечь фонарь у окна.',
        'Ян зажёг фонарь. В его свете на линзе видны три знака.',{item:'Лунный фонарь'}),
      task('harbor','lens','reader','Лира настраивает линзу. Выбери знак со звёздной карты.',
        'Лунный луч открыл дорогу в Город крон.',{sign:'moon'}),
      task('canopy','archive','reader','Пусть Лира спросит Таи, где отыскать пропавшее завтра.',
        'Таи отдал семя будущего. Вернись во дворец и попроси Яна вставить его в часы.',{item:'Семя будущего'}),
      task('palace','clock','engineer','Ян может вставить семя будущего в семейные часы.',
        'Часы пошли вперёд. Теперь у семьи снова есть завтра.')
    ],
    film:[
      {era:'palace',shot:'clock',line:'Король Ориан поднял палец. Часы тикнули… дважды назад.'},
      {era:'harbor',shot:'light',line:'Лира послала в линзу лунный луч. За горизонтом ответили огни будущего.'},
      {era:'canopy',shot:'seed',line:'Таи протянул Яну семя. «Посади его во вчера, и завтра само вырастет».'},
      {era:'palace',shot:'dawn',line:'Часы пробили утро. Королева Селена засмеялась. «Вот теперь можно завтракать!»'}
    ]
  },
  bridge: {
    name:'Мост для Таи',label:'Готовая глава',summary:'В Городе крон погас мост. Попробуй зажечь его из другой эпохи.',
    steps:[
      task('canopy','archive','reader','Лира, спроси Таи, какой огонь нужен мосту.',
        'Таи показал звезду. Нужна такая же линза из Лунной гавани.',{item:'Звёздная отметка'}),
      task('harbor','crank','engineer','Попроси Яна достать запасную линзу воротом.',
        'Ян достал линзу. Теперь её надо поставить в приёмник Таи.',{item:'Запасная линза'}),
      task('canopy','receiver','reader','Лира подаст знак из заметки Таи.',
        'Приёмник поймал звезду. Осталось открыть арку.',{sign:'star'}),
      task('canopy','gate','engineer','Ян, открой арку над мостом.',
        'Ветки соединились. Таи побежал проверять мост и забыл свою линзу в архиве.')
    ],
    film:[
      {era:'canopy',shot:'seed',line:'Таи ждал гостей, а мост внизу упрямо спал.'},
      {era:'harbor',shot:'light',line:'Ян поднял линзу со дна. В ней застряла крошечная звезда.'},
      {era:'canopy',shot:'dawn',line:'Лира зажгла путь. Таи первым перебежал через реку и пригласил семью на чай.'}
    ]
  }
};

export const titleFor = key=>eras[key].name;

const readers={palace:'chart',harbor:'lens',canopy:'archive'};
const gears={palace:'bells',harbor:'crank',canopy:'receiver'};
const lights={palace:'clock',harbor:'lens',canopy:'gate'};

export function adventure({era,seed,number}) {
  const pick=seededRandom(seed);
  const nextEras=Object.keys(eras).filter(key=>key!==era);
  const destination=nextEras[pick(nextEras.length)];
  const signKeys=Object.keys(signs);
  const sign=signKeys[pick(signKeys.length)];
  const extra=signKeys.filter(key=>key!==sign)[pick(2)];
  const steps=[
    task(era,readers[era],'reader','Отыщи знак вылазки и запомни его.',
      'На записке знак «'+signs[sign].name+'». Сохрани её до конца вылазки.',{item:'Записка · '+signs[sign].name}),
    task(destination,gears[destination],'engineer','Запусти механизм в другой эпохе.',
      number>1?'Механизм готов. Вернись за вторым знаком.':'Механизм готов. Теперь передай знак из записки.')
  ];
  if (number>1) steps.push(task(era,readers[era],'reader','Прочти второй знак на обороте записки.',
    'На обороте знак «'+signs[extra].name+'». Сначала передай первый, потом второй.',{item:'Оборот · '+signs[extra].name}));
  steps.push(task(destination,lights[destination],'reader','Передай первый знак из записки.',
    number>1?'Первый знак принят.':'Вылазка завершена. Часы записали маршрут.',{sign}));
  if (number>1) steps.push(task(destination,lights[destination],'reader','Передай знак с оборота записки.',
    'Оба знака приняты. Часы записали маршрут.',{sign:extra}));
  return {name:'Вылазка '+number+' · '+titleFor(era),label:'Собранная глава',steps};
}
