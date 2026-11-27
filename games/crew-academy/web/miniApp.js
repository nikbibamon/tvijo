// Telegram start parameters select a public invitation. The game checks consent and the
// player's private session on the server before it assigns either post.
import {validBotName} from './crewLabels.js';
const routes = { b: 'beacon', r: 'r' };

export function miniAppRoute(parameter) {
  const match = /^([br])_([0-9a-f]{32})$/.exec(parameter || '');
  return match ? routes[match[1]] + '/' + match[2] : 'first-shift';
}

export function invitationLinks(kind, code, page, bot) {
  if (!Object.hasOwn(routes, kind) || !/^[0-9a-f]{32}$/.test(code)) throw new Error('Invalid invitation');
  const browser = new URL(page.pathname, page.origin);
  browser.hash = routes[kind] + '/' + code;
  const inTelegram = validBotName(bot) ? 'https://t.me/' + bot + '?startapp=' + kind + '_' + code : browser.href;
  return { browser: browser.href, inTelegram };
}

export function openTelegramShare(event, url) {
  const app = window.Telegram?.WebApp;
  if (app?.isVersionAtLeast?.('6.1') && typeof app.openTelegramLink === 'function') {
    app.openTelegramLink(url);
    event.preventDefault();
  }
}

export function telegramLaunch(url) {
  const hash = new URLSearchParams(url.hash.slice(1));
  const fromTelegram = ['tgWebAppData', 'tgWebAppPlatform', 'tgWebAppVersion'].some(key => hash.has(key));
  const direct = url.searchParams.get('tgWebAppStartParam');
  if (!fromTelegram && direct === null) return null;
  const initial = new URLSearchParams(hash.get('tgWebAppData') || '');
  return { fromTelegram, route: miniAppRoute(direct || initial.get('start_param')) };
}

export async function enterMiniApp() {
  const url = new URL(location.href);
  const launch = telegramLaunch(url);
  let returning = false;
  try { returning = sessionStorage.getItem('academy.telegram') === 'yes'; } catch {}
  if (!launch && !returning) return;
  if (launch?.fromTelegram || returning) {
    document.body.classList.add('in-telegram');
    try { sessionStorage.setItem('academy.telegram', 'yes'); } catch {}
    if (!window.Telegram?.WebApp) {
      await new Promise(done => {
        const script = document.createElement('script');
        let expired = false;
        const timeout = setTimeout(() => { expired = true; done(); }, 1800);
        script.onload = () => { clearTimeout(timeout); if (expired) miniAppReady(); done(); };
        script.onerror = () => { clearTimeout(timeout); done(); };
        script.src = 'https://telegram.org/js/telegram-web-app.js?65';
        document.head.append(script);
      });
    }
  }
  if (launch) {
    url.searchParams.delete('tgWebAppStartParam');
    if (launch.fromTelegram || !url.hash) url.hash = launch.route;
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
}

export function miniAppReady() {
  const app = window.Telegram?.WebApp;
  app?.ready();
  app?.expand();
}
