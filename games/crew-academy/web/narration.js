import {createDomeRecording} from './domeRecording.js';
import {greenhouseReading} from './strategy.js';

export function createNarrator(host, now = Date.now, onPlayback = () => {}) {
  const recording = createDomeRecording(host);
  const queue = [];
  let active = null;
  let last = '', finishedAt = 0;

  function next() {
    if (active || !queue.length) return;
    const text = queue.shift();
    const current = {text, cancel: null};
    active = current;
    const hasRecording = text.includes(greenhouseReading);
    const synth = host?.speechSynthesis;

    function finish(failed = false) {
      if (active !== current) return;
      active = null;
      last = text;
      finishedAt = now();
      if (failed) onPlayback(false);
      next();
    }
    function start() {
      if (active === current) onPlayback(true);
    }
    function recover() {
      if (hasRecording) current.cancel = recording.play(start, finish);
      else finish(true);
    }

    if (!synth || !host.SpeechSynthesisUtterance) {
      recover();
      return;
    }

    let released = false;
    let timer;
    function clearTimer() {
      if (timer !== undefined) host.clearTimeout(timer);
      timer = undefined;
    }
    function release() {
      if (released || active !== current) return false;
      released = true;
      clearTimer();
      return true;
    }
    function cancelSpeech() {
      released = true;
      clearTimer();
      try { synth.cancel(); } catch {}
    }

    try {
      const voices = synth.getVoices?.() || [];
      const russian = voices.filter(v => /^ru(?:[-_]|$)/i.test(v.lang));
      const voice = russian.find(v => v.default) || russian.find(v => v.localService) || russian[0];
      if (hasRecording && synth.getVoices && !voice) {
        recover();
        return;
      }
      const line = new host.SpeechSynthesisUtterance(text);
      line.lang = 'ru-RU';
      line.rate = 1;
      if (voice) line.voice = voice;
      current.cancel = cancelSpeech;
      line.onstart = () => {
        if (released || active !== current) return;
        clearTimer();
        start();
      };
      line.onend = () => { if (release()) finish(); };
      line.onerror = event => {
        if (!release()) return;
        if (['canceled', 'interrupted'].includes(event?.error)) finish();
        else recover();
      };
      timer = host.setTimeout?.(() => {
        if (!release()) return;
        cancelSpeech();
        recover();
      }, 1800);
      synth.speak(line);
    } catch {
      if (release()) recover();
    }
  }

  return {
    prepare: recording.prepare,
    say(value) {
      const text = String(value || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (active?.text === text || queue.includes(text) || (last === text && now() - finishedAt < 1500)) return;
      queue.push(text);
      next();
    },
    stop() {
      queue.length = 0;
      const current = active;
      active = null;
      last = '';
      current?.cancel?.();
    }
  };
}
