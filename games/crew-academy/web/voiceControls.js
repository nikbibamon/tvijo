import {icon} from './icons.js';
import {bus, state, toggleVoice, voiceProblem} from './tvijoService.js';

export function bindVoiceControls() {
  const buttons = document.querySelectorAll('[data-voice]');
  const notice = document.querySelector('[data-voice-problem]');
  function refresh() {
    const pressed = String(state.voice);
    for (const button of buttons) {
      if (button.getAttribute('aria-pressed') === pressed) continue;
      const label = state.voice ? 'Выключить озвучку' : 'Включить озвучку';
      button.innerHTML = icon(state.voice ? 'sound' : 'mute');
      button.title = label;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', pressed);
    }
    notice.hidden = !voiceProblem;
  }
  for (const button of buttons) button.addEventListener('click', toggleVoice);
  bus.addEventListener('change', refresh);
  bus.addEventListener('voice-status', refresh);
  refresh();
}
