const en={
  title:'Clocktower Workshop',series:'Centaur Chronicles',chronicles:'All Chronicles',levels:'Blueprints',
  place:'Build',remove:'Remove',placeBlock:'Place block',removeBlock:'Remove block',undo:'Undo',reset:'Clear blocks',walk:'Walk to the clock',next:'Next blueprint',
  hint:'Hint',film:'Watch the ending',close:'Close',finished:'The clock is awake!',ending:'Tomorrow clicks into place. Lira turns to Yan. “Now we can build something of our own.”',
  passed:'Yan reached the clock.',placed:'Block placed.',fixed:'Start and clock bases stay in place.',
  noBlocks:'That block is used up. Remove one to reuse it.',tooHigh:'This stack is four blocks high.',
  unset:'Remove a block you placed.',emptyHistory:'There is no move to undo.',locked:'Finish the previous blueprint first.',
  tryPath:'Connect the route. Yan can climb one block at a time.',balance:'You need more demo credits. The puzzle opens the same workshop for free.',
  unlocked:'Workshop open.',moved:'The active blueprint changed.',unavailable:'The action could not be saved. Try again.',
  ready:'Path ready',blocked:'Path incomplete',design:'Build and explore',completed:'Complete',
  oak:'Wood',stone:'Stone',prism:'Prism',selected:'Selected tile',
  boardHelp:'Tap a tile to use the tool. Arrow keys move the cursor, Enter uses the tool.',
  choose:'Choose a block',credits:'Open for 10 demo credits',
  creditTitle:'Open the workshop',creditBody:'Use 10 demo credits to start with blueprint 2.',creditBalance:'Demo balance',
  proceed:'Confirm demo spend',cancel:'Cancel',
  rooms:{
    gap:['The missing step','Place a wood block in the glowing gap.','Tap the gold outline between the two islands.'],
    stairs:['Climb to the clock','Build a staircase. Yan can climb one block at a time.','Place one block next to Yan’s island, then stack two beside it.'],
    relay:['The prism relay','Put a prism on the marked socket and build a path through it.','Raise the socket to two blocks with a prism on top. Build three blocks in the gap after the stone platform.'],
    studio:['Free build','Build your own floating island. Your work is saved as you go.','Place or remove blocks anywhere. Undo brings back the last arrangement.']
  }
};
const ru={
  title:'Лестница к Семейным часам',series:'Хроники Центавра',chronicles:'Все главы',levels:'Чертежи',
  place:'Строить',remove:'Убрать',placeBlock:'Поставить блок',removeBlock:'Снять блок',undo:'Отменить',reset:'Убрать все блоки',walk:'Идти к часам',next:'Следующий чертёж',
  hint:'Подсказка',film:'Смотреть финал',close:'Закрыть',finished:'Часы ожили!',ending:'Завтра вернулось. Лира повернулась к Яну. «Теперь можем построить что-нибудь своё».',
  passed:'Ян дошёл до часов.',placed:'Блок поставлен.',fixed:'Опоры старта и часов закреплены.',
  noBlocks:'Эти блоки закончились. Сними один, чтобы использовать снова.',tooHigh:'Здесь уже четыре блока.',
  unset:'Можно снять блок, который ты поставил.',emptyHistory:'Пока нечего отменять.',locked:'Сначала пройди предыдущий чертёж.',
  tryPath:'Соедини маршрут. Ян поднимается на одну ступеньку за шаг.',balance:'Не хватает демо-кредитов. Реши головоломку за 0 кредитов.',
  unlocked:'Мастерская открыта.',moved:'Открыт другой чертёж.',unavailable:'Ход не сохранился. Попробуй ещё раз.',
  ready:'Путь готов',blocked:'Ещё есть разрыв',design:'Строй и пробуй',completed:'Пройдено',
  oak:'Дерево',stone:'Камень',prism:'Призма',selected:'Выбранная клетка',
  boardHelp:'Коснись клетки, чтобы изменить её. Стрелки перемещают курсор, Enter применяет действие.',
  choose:'Выбери блок',credits:'Открыть за 10 демо-кредитов',
  creditTitle:'Открыть мастерскую',creditBody:'За 10 демо-кредитов мастерская откроется со второго чертежа.',creditBalance:'Демо-баланс',
  proceed:'Списать демо-кредиты',cancel:'Отмена',
  rooms:{
    gap:['Пропавшая ступень','Поставь деревянный блок в светящийся проём.','Нажми на золотой контур между островками.'],
    stairs:['Подъём к часам','Построй лестницу. Ян поднимается на одну ступеньку за шаг.','Поставь один блок рядом с островком Яна, а затем два друг на друга в следующем проёме.'],
    relay:['Свет призмы','Поставь призму в отмеченное гнездо и проложи путь через него.','Подними гнездо на два блока, призма сверху. После каменной площадки проложи опору высотой три блока.'],
    studio:['Свободная стройка','Построй свой парящий остров. Блоки сохраняются по мере работы.','Блоки можно поставить или снять в любой клетке. Отмена восстанавливает прежнюю форму.']
  }
};

export function strings(language) {
  return language==='ru'?ru:en;
}
