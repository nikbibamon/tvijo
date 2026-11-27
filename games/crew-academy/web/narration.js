export function createNarrator(host, now = Date.now) {
  const queue = [];
  let active = null;
  let last = '', finishedAt = 0;

  function next() {
    if (active || !queue.length) return;
    const text = queue.shift();
    const synth = host.speechSynthesis;
    try {
      const line = new host.SpeechSynthesisUtterance(text);
      active = line;
      line.lang = 'ru-RU';
      line.rate = 1;
      const voices = synth.getVoices?.() || [];
      const russian = voices.filter(v => /^ru(?:[-_]|$)/i.test(v.lang));
      const voice = russian.find(v => v.default) || russian.find(v => v.localService) || russian[0];
      if (voice) line.voice = voice;
      const finish = () => {
        if (active !== line) return;
        active = null;
        last = text;
        finishedAt = now();
        next();
      };
      line.onend = line.onerror = finish;
      synth.speak(line);
    } catch {
      active = null;
      next();
    }
  }

  return {
    say(value) {
      const text = String(value || '').replace(/\s+/g, ' ').trim();
      if (!text || !host?.speechSynthesis || !host.SpeechSynthesisUtterance) return;
      if (active?.text === text || queue.includes(text) || (last === text && now() - finishedAt < 1500)) return;
      queue.push(text);
      next();
    },
    stop() {
      queue.length = 0;
      const speaking = active !== null;
      active = null;
      last = '';
      if (speaking) host.speechSynthesis.cancel();
    }
  };
}
