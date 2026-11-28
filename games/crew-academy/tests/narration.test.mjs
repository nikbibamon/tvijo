import assert from 'node:assert/strict';
import test from 'node:test';
import {createNarrator} from '../web/narration.js';
import {worldLevel, makeSpec} from '../web/worlds.js';
import {moves} from '../web/catalog.js';
import {intent, planTurn} from '../web/strategy.js';

test('a generated greenhouse describes the dome once across separate orders, reload and a chain', () => {
  const level = worldLevel(makeSpec('Оранжерея, разведка и проверка эха'));
  const line = 'Стеклянный купол снова пропускает свет.';
  const order = (done, text) => planTurn({level, done, tier:'standard', parsed:intent(text), hero:'plane'});
  const first = order([], moves.scan.example);
  const next = order(JSON.parse(JSON.stringify(first.changes)), moves.compare.example);
  assert.deepEqual(next.changes, ['compare']);
  assert.equal(first.lines.filter(x => x.text.includes(line)).length, 1);
  assert.equal(next.lines.filter(x => x.text.includes(line)).length, 0);
  const chain = order([], moves.scan.example + ' затем ' + moves.compare.example);
  assert.equal(chain.lines.filter(x => x.text.includes(line)).length, 1);
});

test('new radio replies finish in order, immediate echoes are dropped and mute clears the queue', () => {
  let now = 5000, cancels = 0;
  const played = [];
  const voice = {lang:'ru-RU',localService:true};
  const host = {
    speechSynthesis: {
      speak: u => played.push(u), cancel: () => { cancels++; },
      getVoices: () => [{lang:'en-US',default:true},voice]
    },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } }
  };
  const radio = createNarrator(host, () => now);
  radio.say('Стеклянный купол снова пропускает свет.');
  radio.say('Стеклянный  купол снова пропускает свет.');
  radio.say('Гнездо готово.'); radio.say('Гнездо готово.');
  assert.equal(played.length,1); assert.equal(played[0].voice,voice); assert.equal(cancels,0);
  played[0].onend(); assert.equal(played[1].text,'Гнездо готово.');
  played[1].onend(); radio.say('Гнездо готово.'); assert.equal(played.length,2);
  now += 2000; radio.say('Гнездо готово.'); radio.say('Следующий шаг.');
  radio.stop(); played[2].onend(); assert.equal(played.length,3); assert.equal(cancels,1);
  radio.say('Новый маршрут.'); radio.say('Новый напарник.');
  played[3].onerror(); assert.equal(played[4].text,'Новый напарник.');
});
test('native audio failures are reported once per failed line and canceled callbacks stay silent', () => {
  const played = [], events = [];
  const host = {
    speechSynthesis: {speak: line => played.push(line), cancel() {}},
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } }
  };
  const radio = createNarrator(host, Date.now, playing => events.push(playing));
  radio.say('Антенна.'); radio.say('Рычаг.');
  played[0].onerror({error:'synthesis-failed'});
  assert.equal(played[1].text, 'Рычаг.');
  played[1].onstart(); radio.stop();
  played[1].onerror({error:'canceled'});
  assert.deepEqual(events, [false, true]);
  createNarrator({}, Date.now, value => events.push(value)).say('Шлюз.');
  assert.deepEqual(events, [false, true, false]);
});

function mockAudio(voices = [], load = async () => new Uint8Array(12).buffer) {
  const played = [], clips = [], events = [];
  let requests = 0;
  const host = {
    speechSynthesis: {getVoices: () => voices, speak: line => played.push(line), cancel() {}},
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    fetch: async url => {
      assert.match(url.pathname, /\/audio\/glass-dome\.mp3$/);
      requests++;
      return {ok: true, arrayBuffer: load};
    },
    AudioContext: class {
      state = 'suspended';
      resume() { this.state = 'running'; return Promise.resolve(); }
      decodeAudioData(data) { return Promise.resolve(data); }
      createBufferSource() {
        return {connect() {}, disconnect() {}, start() { clips.push(this); },
          stop() { this.stopped = true; }};
      }
    }
  };
  const radio = createNarrator(host, Date.now, playing => events.push(playing));
  return {host, radio, played, clips, events, requests: () => requests};
}

const fullReport = 'Стеклянный купол снова пропускает свет. Разведка завершена.';
const tick = () => new Promise(resolve => setImmediate(resolve));

test('an empty voice list plays the packaged dome report once and mute stops it', async () => {
  const {radio, played, clips, events, requests} = mockAudio();
  radio.prepare();
  radio.say(fullReport);
  radio.say(fullReport);
  radio.say('Следующий приказ выполнен.');
  await tick();
  assert.equal(requests(), 1);
  assert.equal(played.length, 0);
  assert.equal(clips.length, 1);
  assert.deepEqual(events, [true]);
  const lateEnd = clips[0].onended;
  radio.stop();
  assert.equal(clips[0].stopped, true);
  assert.equal(clips[0].onended, null);
  lateEnd();
  assert.equal(played.length, 0);
});

test('a successful native line uses no recording and an engine failure falls back once', async () => {
  const {radio, played, clips, events, requests} = mockAudio([{lang: 'ru-RU'}]);
  radio.say(fullReport);
  played[0].onstart();
  played[0].onend();
  assert.equal(requests(), 0);
  radio.stop();
  radio.say(fullReport);
  played[1].onerror({error: 'synthesis-failed'});
  played[1].onerror({error: 'synthesis-failed'});
  await tick();
  assert.deepEqual(events, [true, true]);
  assert.equal(clips.length, 1);
  clips[0].onended();
});

test('changing scene while the recording loads prevents sound from the old scene', async () => {
  let resolve;
  const response = new Promise(r => { resolve = r; });
  const {radio, clips, played} = mockAudio([], () => response);
  radio.say(fullReport);
  radio.stop();
  radio.say('Новое поле.');
  resolve(new Uint8Array(12).buffer);
  await tick();
  assert.equal(played[0].text, 'Новое поле.');
  assert.equal(clips.length, 0);
});

test('a stalled native voice is canceled before starting the recording', async () => {
  const {host, radio, clips, events, played} = mockAudio([{lang: 'ru-RU'}]);
  let deadline;
  host.setTimeout = callback => { deadline = callback; return 1; };
  host.clearTimeout = () => {};
  host.speechSynthesis.cancel = () => played[0].onerror({error: 'canceled'});
  radio.say(fullReport);
  deadline();
  played[0].onstart();
  await tick();
  assert.equal(clips.length, 1);
  assert.deepEqual(events, [true]);
});
