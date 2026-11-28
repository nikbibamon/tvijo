# Clocktower Workshop · выход на площадки

Актуальность требований сверена 28 ноября 2026 года. Полная «Академия экипажа» и «Хроники Центавра» доступны на нашем сайте. Для внешних каталогов первая игра — самостоятельная Clocktower Workshop с английским стартом. Она включает три чертежа, финальную анимацию и сохранение в свободной стройке.

В анкете CrazyGames «What platforms has your team released games on before?» отмечаем **Web / browser**. Уже опубликована браузерная Академия. Steam, iOS, Android, Roblox, Console и Other добавляем только по факту выхода на соответствующей площадке. [Академия](https://tvijo-crew-academy.be9ava.chatgpt.site/)

| Очередь | Площадка и условия | Какая версия подходит |
|---|---|---|
| 1 · Android | **Google Play.** Регистрация разработчика, проверка личности и разовый сбор 25 долларов США. Для организации обычно требуется D‑U‑N‑S. Для новых личных аккаунтов действует закрытый тест с 12 подключёнными тестировщиками в течение 14 дней подряд перед заявкой в production. Сборка Android App Bundle с актуальным target SDK, целевая аудитория, контентный рейтинг, Data Safety и политика конфиденциальности. [Аккаунт](https://support.google.com/googleplay/android-developer/answer/6112435) · [Тип аккаунта](https://support.google.com/googleplay/android-developer/answer/13634885) · [Тестирование](https://support.google.com/googleplay/android-developer/answer/14151465) · [API](https://support.google.com/googleplay/android-developer/answer/11926878) · [Families](https://support.google.com/googleplay/android-developer/answer/9893335) | Отдельное офлайн-приложение. Игра и её сохранение находятся на устройстве. Первая сборка бесплатная. Для будущей продажи цифровых кредитов в приложении проектируется Play Billing согласно применимой политике. [Платежи](https://support.google.com/googleplay/android-developer/answer/9858738) |
| 1 · веб | **CrazyGames.** Английская локализация, быстрый вход, оригинальная игра и читаемость в iframe. Не позднее 20 секунд до игры для внешней загрузки. Без SDK полный объём не выше 50 МБ, для мобильной главной — не выше 20 МБ. SDK необязателен в Basic Launch и нужен для Full Launch. Монетизация в Basic Launch недоступна. Основная площадка ориентирована на 13+, требования к контенту — PEGI 12. [Техника](https://docs.crazygames.com/requirements/technical/) · [Геймплей](https://docs.crazygames.com/requirements/gameplay/) · [Отбор](https://docs.crazygames.com/) | Своя английская игра с первым кликом на поле. Игровой вход через головоломку. В сборке отсутствуют кошелёк Tvijo, аккаунт, чат, реклама и ссылки на игру на других сайтах. В заявке мобильность отмечаем после физического теста, до него допустим вариант только для компьютеров. |
| 1 · веб | **itch.io.** HTML5-игра с файлом index.html в корне ZIP и относительными путями. Можно использовать для прогона до заявок с отбором. [Руководство](https://itch.io/docs/creators/html5) | Отдельный ZIP с тем же полным игровым циклом, без зависимостей от основного сайта. |
| 2 · веб | **Poki.** Заявка, оценка качества и отдельная интеграция SDK. По договору бывает веб-эксклюзивность или неэксклюзивный вариант, право распространять эту же игру на своём домене и других веб-площадках зависит от соглашения. [Заявка](https://developers.poki.com/) · [Договор](https://developers.poki.com/guide/revenue-deal-types) | Оставить полную Академию на своём домене. Для той же самостоятельной игры нужен неэксклюзивный договор или отдельное согласование до подписания. |
| 2 · сеть веб-порталов | **GameDistribution.** Партнёрский SDK с рекламой и требования к исходящим ссылкам. [Партнёрство](https://gamedistribution.com/developers/) · [Ссылки](https://gamedistribution.com/developers/faq/general-questions/can-my-game-contain-outgoing-links/) | Отдельный пакет после проверки условий по рекламе для выбранной аудитории. |
| 3 · мобильная | **App Store.** Apple Developer Program, нативная сборка и App Review. Проверяются самостоятельная функциональность приложения, правила встроенных покупок и требования Kids Category, если выбрана. [Apple Developer Program](https://developer.apple.com/programs/whats-included/) · [App Review](https://developer.apple.com/app-store/review/guidelines/) | Адаптация той же самостоятельной офлайн-игры. |
| 3 · ПК | **Steam.** Нужна самостоятельная сборка для ПК и страница магазина. Steam Direct берёт 100 долларов США за продукт. Для первых выпусков от оплаты до релиза предусмотрено 30 дней, страница Coming Soon должна быть открыта хотя бы две недели. [Steamworks](https://partner.steamgames.com/doc/gettingstarted/onboarding) · [Сбор](https://partner.steamgames.com/doc/gettingstarted/appfee) | Отдельная ПК-версия после живого теста содержания и глубины. |
| Позже | **Roblox и консоли.** Roblox требует собственный experience и прохождение условий публикации Creator Hub. Консоли требуют отдельных платформенных сборок и процессов партнёра. [Roblox Creator Hub](https://create.roblox.com/docs/production/publishing/publish-experiences-and-places) | Самостоятельный проект после проверки спроса на механику. |

## Сборки

Полная версия открывает мастерскую в Хрониках через короткую головоломку или за 10 демо-кредитов. Три чертежа различают открытие, прохождение и финал. Английский и русский можно переключить в мастерской на сайте.

Команды из каталога игры

```sh
npm test
npm run build
npm run build:store -- crazygames
npm run build:store -- itch
npm run build:store -- android
```

Пакеты находятся в dist/store. Для браузера архивируется содержимое конкретной папки, так что index.html лежит в корне архива. Android-проект в android-clockwork сам создаёт локальные веб-ресурсы. Открыть его в Android Studio с SDK 36, Gradle 8.13, JDK 17 и доступным Node.js. Начальный applicationId — com.tvijo.clockwork. Собрать debug APK для тестового телефона, затем подписанный AAB для Play Console. [Среда Gradle](https://developer.android.com/build/releases/agp-8-13-0-release-notes) · [Подпись](https://support.google.com/googleplay/android-developer/answer/9842756)

Макет списка Google Play

- **Title** — Clocktower Workshop
- **Short description** — Build a path across floating islands and wake the family clock.
- **Full description** — Guide Yan through three building puzzles in the Centaur Chronicles. Fill the missing step, build stairs and power a prism relay. Then design a floating island in Free Build. Play offline with progress and buildings saved on your device.

## Проверка перед отправкой

На первом экране цель и место для первого блока видны сразу. Проверить в чистом профиле Chrome, затем во встроенном окне и на реальном телефоне. Пройти три чертежа, получить финал, открыть стройку и перезагрузить игру. Замер готовности координат и кнопок ведётся локально с навигации до интерактивного поля. Для живого пилота отдельно записать первый ход, первый финиш и продолжение. CrazyGames Basic Launch дополнительно оценивает длительность игры, D1, конверсию в игру и CTR. [Метрики CrazyGames](https://docs.crazygames.com/resources/basic-launch-metrics/)

Самостоятельная сборка рисует сцену и героев своим кодом Canvas. Поставщик звуковых файлов, внешние шрифты и SDK в ней отсутствуют. В карточке владельца фиксируются права на использованный код, изображения, музыку, логотип и материалы страницы магазина перед подтверждением в форме. Для текущей Академии и её сюжетных иллюстраций реестр ассетов ведётся отдельно.

Владелец Play Console выбирает существующий аккаунт или регистрирует личный либо организационный, подтверждает данные, принимает договор и оплачивает сбор. На Android перед отправкой нужны подписанный AAB, проверка офлайн-запуска на физическом телефоне и заполненные карточка и декларации. Браузерная проверка и исходники Android-проекта имеют отдельные статусы.
