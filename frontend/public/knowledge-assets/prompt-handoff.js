/* Public prompt handoff: no telemetry, prefetch, inference or automatic submission. */
'use strict';
(() => {
  function urls(text) {
    if (typeof text !== 'string' || !text.trim() || text.length > 3000) return [];
    const q = encodeURIComponent(text);
    return [
      ['Codex', 'codex://new?prompt=' + q],
      ['Claude Code', 'claude-cli://open?q=' + q],
      ['ChatGPT', 'https://chatgpt.com/'],
      ['Claude', 'https://claude.ai/new'],
      ['Cursor', 'https://cursor.com/link/prompt?text=' + q],
      ['Lovable', 'https://lovable.dev/#prompt=' + q],
    ].filter(([,url]) => url.length <= 10000);
  }
  function mount(root) {
    if (root.dataset.promptMounted) return;
    root.dataset.promptMounted = 'true';
    const input = root.querySelector('[data-prompt-text]'), links = root.querySelector('[data-prompt-links]');
    const status = root.querySelector('[data-prompt-status]'), copy = root.querySelector('[data-prompt-copy]');
    if (!input || !links || !status || !copy) return;
    const ru = root.lang === 'ru';
    const update = () => {
      links.replaceChildren();
      const destinations = urls(input.value);
      for (const [name,url] of destinations) {
        const a = document.createElement('a'); a.textContent = name; a.href = url;
        if (name === 'ChatGPT' || name === 'Claude') {
          a.textContent = name + (ru ? ' · скопировать и открыть' : ' · copy & open');
          a.addEventListener('click', async e => {
            e.preventDefault();
            window.open(url, '_blank', 'noopener,noreferrer');
            try {
              await navigator.clipboard.writeText(input.value);
              status.textContent = ru ? 'Скопировано. Вставьте и проверьте промпт в открытом сервисе.' : 'Copied. Paste and review the prompt in the opened service.';
            } catch {
              input.focus(); input.select();
              status.textContent = ru ? 'Скопируйте выделенный текст и вставьте в открытом сервисе.' : 'Copy the selected text and paste it in the opened service.';
            }
          });
        }
        if (!url.startsWith('https:')) a.title = ru ? 'Нужно установленное приложение' : 'Requires the installed app';
        a.rel = 'noopener noreferrer'; a.referrerPolicy = 'no-referrer';
        if (url.startsWith('https:')) a.target = '_blank';
        links.append(a);
      }
      status.textContent = !input.value.trim() ? (ru ? 'Введите текст промпта.' : 'Enter a prompt.')
        : destinations.length === 0 ? (ru ? 'Текст слишком длинный для ссылок. Используйте копирование.' : 'Text is too long for links. Copy it instead.') : destinations.length < 6 ? (ru ? 'Текст слишком длинный для некоторых ссылок. Используйте копирование.' : 'Some links exceed their length limit. Copy the text instead.') : '';
    };
    input.addEventListener('input', update);
    copy.addEventListener('click', async () => {
      try {
        if (!input.value.trim()) { update(); return; }
        await navigator.clipboard.writeText(input.value);
        status.textContent = ru ? 'Промпт скопирован.' : 'Prompt copied.';
      } catch {
        input.focus(); input.select();
        status.textContent = ru ? 'Текст выделен. Скопируйте его через Ctrl+C или меню устройства.' : 'Text selected. Copy with Ctrl+C or your device menu.';
      }
    });
    update();
  }
  window.TvijoPromptHandoff = {mount, urls};
  const init = () => document.querySelectorAll('[data-tvijo-prompt]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
