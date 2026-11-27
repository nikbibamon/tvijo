const clip = new URL('./audio/glass-dome.mp3', import.meta.url);

export function createDomeRecording(host) {
  let context;
  let samples;

  function prepare() {
    const AudioContext = host?.AudioContext || host?.webkitAudioContext;
    if (!AudioContext) return;
    try {
      context ??= new AudioContext();
      if (context.state !== 'running') context.resume().catch(() => {});
    } catch {}
  }

  function load() {
    samples ??= host.fetch(clip).then(response => {
      if (!response.ok) throw new Error('Audio unavailable');
      return response.arrayBuffer();
    }).then(bytes => context.decodeAudioData(bytes)).catch(error => {
      samples = undefined;
      throw error;
    });
    return samples;
  }

  function play(onStart, onFinish) {
    let stopped = false;
    let source;
    prepare();
    (async () => {
      if (!context) throw new Error('Web Audio unavailable');
      const buffer = await load();
      if (stopped) return;
      if (context.state !== 'running') throw new Error('Audio suspended');
      source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => {
        if (stopped) return;
        source.disconnect();
        source = undefined;
        onFinish();
      };
      source.start();
      onStart();
    })().catch(() => {
      if (stopped) return;
      source?.disconnect();
      source = undefined;
      onFinish(true);
    });
    return () => {
      stopped = true;
      if (!source) return;
      source.onended = null;
      source.stop();
      source.disconnect();
      source = undefined;
    };
  }

  return {prepare, play};
}
