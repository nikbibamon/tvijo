import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { invitationLinks, miniAppRoute, telegramLaunch } from '../web/miniApp.js';
import { openOnlineDB } from '../server/online-db.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://academy.example';
const prefix = '/games/academy/';
const code = 'a1'.repeat(16);

before(async () => { await import('../tools/build.mjs'); });

test('Mini App and browser invitations select the same post without carrying private launch data', () => {
  const page = new URL(origin + prefix + '?private=discard#hq');
  for (const [kind, route] of [['b','beacon/'], ['r','r/']]) {
    const links = invitationLinks(kind, code, page, 'AcademyTestBot');
    assert.equal(links.browser, origin + prefix + '#' + route + code);
    const start = new URL(links.inTelegram).searchParams.get('startapp');
    assert.equal(miniAppRoute(start), route + code);
    const launch = new URL(origin + prefix + '?tgWebAppStartParam=' + start + '#tgWebAppVersion=8.0');
    assert.deepEqual(telegramLaunch(launch), { fromTelegram:true, route:route + code });
    const data = new URLSearchParams({ start_param:start, user:'unused' });
    launch.search = ''; launch.hash = new URLSearchParams({ tgWebAppData:data.toString() }).toString();
    assert.equal(telegramLaunch(launch).route, route + code);
    assert.equal(invitationLinks(kind, code, page, '').inTelegram, links.browser);
  }
  assert.equal(telegramLaunch(page), null);
  assert.equal(miniAppRoute('b_invalid'), 'first-shift');
});

test('SQLite rolls back an entire failed batch and can accept the next request', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'academy-sql-'));
  const storage = await openOnlineDB(join(folder,'test.sqlite3'));
  try {
    const stmt = storage.DB.prepare('INSERT INTO crew_pilot_first VALUES (?,?,?,?)').bind('a','shift_hq',4,'today');
    await assert.rejects(storage.DB.batch([stmt,stmt]));
    const before = await storage.DB.prepare('SELECT count(*) AS n FROM crew_pilot_first').bind().all();
    assert.equal(before.results[0].n, 0);
    await stmt.run();
  } finally { await storage.close(); await rm(folder,{recursive:true,force:true}); }
});

async function launchServer(database) {
  const child = spawn(process.execPath, ['server/online.mjs'], { cwd:root, stdio:['ignore','pipe','inherit'],
    env:{ ...process.env, PORT:'0', TVIJO_ACADEMY_DB:database, TVIJO_ACADEMY_URL:origin + prefix, TVIJO_TELEGRAM_BOT:'AcademyTestBot' } });
  const closed = once(child, 'exit');
  const lines = createInterface({ input:child.stdout });
  try {
    const line = await Promise.race([once(lines,'line').then(([value])=>value), closed.then(()=>{throw Error('Server stopped before listen');})]);
    const match = /listening on 127\.0\.0\.1:(\d+)/.exec(line);
    assert.ok(match, line);
    return { url:'http://127.0.0.1:' + match[1], async stop(){ if (child.exitCode === null) child.kill('SIGTERM'); await closed; } };
  } catch (error) { child.kill(); throw error; }
}

test('two HTTP clients resume distinct posts after a full server restart and receive one beacon', {timeout:30000}, async () => {
  const folder = await mkdtemp(join(tmpdir(), 'academy-http-'));
  const database = join(folder, 'game.sqlite3');
  let server;
  function pilot() {
    let cookie = '';
    return async (path, body, expected=200) => {
      const headers = { Origin:origin };
      if (cookie) headers.Cookie = cookie;
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const response = await fetch(server.url + prefix + 'api/' + path, {
        headers, method:body === undefined ? 'GET' : 'POST', body:JSON.stringify(body)
      });
      const data = await response.json();
      assert.equal(response.status, expected, JSON.stringify(data));
      const session = response.headers.get('set-cookie');
      if (session) {
        assert.ok(session.includes('Path=' + prefix + 'api;'));
        assert.match(session,/HttpOnly/); assert.match(session,/Secure/); assert.match(session,/Partitioned/);
        cookie = session.split(';')[0];
      }
      return data;
    };
  }
  try {
    server = await launchServer(database);
    const page = await fetch(server.url + prefix);
    assert.match(await page.text(), /Академия экипажа/);
    assert.equal((await fetch(server.url + prefix + 'art/runners/robot.webp')).status, 200);
    assert.equal((await fetch(server.url + '/api/crew/room')).status, 404);
    assert.equal((await fetch(server.url + prefix.slice(0,-1),{redirect:'manual'})).status, 308);
    const host = pilot(), guest = pilot();
    assert.equal((await host('herdr/health')).billing, 'demo');
    for (const player of [host,guest]) {
      await player('crew/join',{hero:'robot'},201);
      await player('crew/profile',{hero:'robot',focus:'build',visible:true});
    }
    const link = (await host('crew/beacon-link',{action:'create'})).code;
    const path = 'crew/room?beacon=' + link;
    assert.equal((await guest(path)).beacon.status,'offer');
    await guest('crew/beacon-link',{action:'accept',code:link});
    const a = (await host(path)).beacon.relay;
    const relay = (player, seat, action, sequence) => player('crew/relay',{other:seat.other,mission:seat.mission,action,sequence});
    const symbols = (await relay(host,a,'scan')).relay.sequence;
    await relay(host,a,'send');
    await server.stop(); server = await launchServer(database);
    const resumed = await guest(path), b = resumed.beacon.relay;
    assert.equal(resumed.telegramBot,'AcademyTestBot');
    assert.equal(b.phase,'sent'); assert.equal(b.sequence,symbols);
    assert.equal(a.mission,b.mission); assert.equal(b.role,'engineer'); assert.equal((await host(path)).beacon.relay.role,'scout');
    await relay(guest,b,'tune',symbols); await relay(guest,b,'tune',symbols);
    for (const player of [host,guest]) {
      const result = await player(path);
      assert.equal(result.beacon.status,'done'); assert.equal(result.me.beacons,1);
    }
  } finally {
    await server?.stop();
    await rm(folder,{recursive:true,force:true});
  }
});
