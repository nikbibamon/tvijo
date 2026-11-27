import assert from 'node:assert/strict';
import test from 'node:test';
import {beaconAction, restoreBeacon} from '../web/expedition/beacon.js';
import {riftRooms, collectPrize, packNames} from '../web/expedition/rooms.js';
import {radioStep, resolveRadioItem} from '../web/expedition/radio.js';
import {miniAppRoute, telegramLaunch} from '../web/miniApp.js';

test('the dock entry loads alongside normal browser and Telegram launches', () => {
  const dock = new URL('https://example.org/first-shift.html');
  assert.equal(telegramLaunch(dock), null);
  assert.equal(miniAppRoute(''), 'first-shift');
});

for (const orders of [['echo','power'],['power','echo']]) {
  test('beacon evidence, corrected translation, lens and revisit: ' + orders.join(' then '), () => {
    let play=restoreBeacon(null);
    beaconAction(play, 'shutters');
    assert.equal(play.shutters, false);
    beaconAction(play, orders[0]); beaconAction(play, 'shutters');
    assert.equal(play.shutters,false);
    play=restoreBeacon(JSON.parse(JSON.stringify(play)));
    beaconAction(play, orders[1]); beaconAction(play, 'shutters');
    assert.equal(play.shutters,true);
    for (const [i,w] of ['питать','питать','открыть'].entries()) beaconAction(play,'word',i,w);
    beaconAction(play,'check'); beaconAction(play,'take');
    assert.equal(play.taken,false); assert.equal(play.verified,false);
    beaconAction(play,'word',0,'слушать'); beaconAction(play,'undo');
    assert.equal(play.words[0],'питать');
    beaconAction(play,'word',0,'слушать'); beaconAction(play,'check'); beaconAction(play,'take');
    assert.equal(restoreBeacon(JSON.parse(JSON.stringify(play))).taken,true);
    const oldSave = {balance:37,completed:['dock']};
    assert.equal(collectPrize(oldSave,'alphabet'),true);
    assert.equal(collectPrize(oldSave,'alphabet'),false);
    assert.deepEqual(packNames(oldSave),['Линза связи']);
    assert.deepEqual(oldSave.completed,['dock']); assert.equal(oldSave.balance,37);
  });
}
test('six distinct rewards and recovery from an incomplete notebook', () => {
  assert.equal(new Set(riftRooms.map(room=>room.id)).size,6);
  const corrupted=restoreBeacon({taken:true,verified:true,words:[null],shutters:true});
  assert.equal(corrupted.taken,false);
  const save={}; assert.equal(collectPrize(save,'not-a-room'),false);
  for (const room of riftRooms) collectPrize(save,room.id);
  assert.equal(packNames(save).length,6);
});
test('radio request accepts synonyms, both cable ends and the different ramp solution',()=>{
  assert.equal(resolveRadioItem('Пришлите верёвку, пожалуйста'),'rope');
  assert.equal(resolveRadioItem('трос или трап'),'ambiguous');
  for(const [phrase,order] of [['пришлите верёвку',['far','near']],['мостик',['near','far']]]) {
    let s={item:'',near:false,far:false,crossed:false};
    s=radioStep(s,'request',phrase).next;
    assert.equal(radioStep(s,'cross').next.crossed,false);
    s=radioStep(s,order[0]).next; s=radioStep(s,order[1]).next;
    assert.equal(radioStep(s,'cross').next.crossed,true);
  }
});
