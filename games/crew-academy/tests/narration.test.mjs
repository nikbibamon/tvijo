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
