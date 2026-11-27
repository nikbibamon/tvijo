// Read-only checks against the same catalog, geometry and built worker used by players.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {access, readFile} from 'node:fs/promises';
import {heroes, levels} from '../web/catalog.js';
import {encodeWorld, decodeWorld, routeReachable, verifyPlan, worldLevel, worldNames} from '../web/worlds.js';

const root = new URL('../', import.meta.url);
const sha256 = data => createHash('sha256').update(data).digest('hex');
const file = path => new URL(path, root);

async function verifyArt() {
  const lock = JSON.parse(await readFile(file('tvijor/baseline.json'), 'utf8'));
  const assets = Object.entries(lock.files).filter(([, item]) => item.kind);
  assert.equal(lock.files['web/art/crew/crew.webp']?.kind, 'cast', 'Group reference is missing');
  const keys = ['captain', 'assistant', 'blue', 'son', 'daughter', 'robot', 'plane'];
  for (const hero of keys) {
    assert.ok(heroes[hero], 'Missing approved hero: ' + hero);
    assert.equal(lock.files['web/art/crew/' + hero + '.webp']?.kind, 'portrait', hero);
    const sprite = lock.files['web/art/runners/' + hero + '.webp'];
    assert.deepEqual([sprite?.kind, sprite?.width, sprite?.height], ['runner', 512, 128], hero);
  }
  for (const [path, art] of assets) {
    assert.equal(sha256(await readFile(file(path))), art.sha256, 'Accepted art changed: ' + path);
  }
  return {lockedAssets: assets.length, approvedHeroes: keys.length, posesPerHero: 4};
}

async function verifyRoutes() {
  const ids = new Set(levels.map(level => level.id));
  assert.equal(ids.size, levels.length);
  for (const id of ['dock','rift','mine','beacon','greenhouse','foundry']) assert.ok(ids.has(id), id);
  for (const level of levels) {
    assert.ok(verifyPlan(level.tasks) && routeReachable(level), 'Campaign ' + level.id);
    await access(file('web/art/' + level.art + '.webp'));
  }
  let generated = 0;
  for (const theme of Object.keys(worldNames)) {
    for (const path of ['build','survey','rescue','signal','duet']) {
      for (const steps of [2,3,4]) {
        for (const shadow of [false, true]) {
          for (const seed of [0, 1, 65535, 21983217, 4294967295]) {
            const spec = {theme, path, steps, shadow, seed};
            const code = encodeWorld(spec);
            assert.deepEqual(decodeWorld(code), spec, 'Share code ' + code);
            assert.ok(routeReachable(worldLevel(spec)), 'Unreachable world ' + code);
            generated++;
          }
        }
      }
    }
  }
  return {campaign: levels.map(level => level.name), generated, seedsPerConfiguration: 5};
}

async function verifyBuild() {
  const {default: worker} = await import('../dist/server/index.js');
  const request = route => worker.fetch(new Request('https://academy.test' + route), {});
  const page = await request('/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /id="stage"/);
  const health = await request('/api/herdr/health');
  assert.equal(health.status, 200);
  const body = await health.json();
  assert.equal(body.billing, 'demo');
  const art = await request('/art/runners/captain.webp');
  assert.equal(art.status, 200);
  assert.match(art.headers.get('Content-Type'), /image\/webp/);
  const bundle = await readFile(file('dist/server/index.js'));
  return {workerBytes:bundle.byteLength, workerSHA256:sha256(bundle), homepage:page.status, health:health.status, runner:art.status, billing:body.billing};
}

const commands = {art:verifyArt, routes:verifyRoutes, build:verifyBuild};
const command = process.argv[2];
if (!Object.hasOwn(commands, command)) throw new Error('Expected art, routes or build');
console.log(JSON.stringify(await commands[command]()));
