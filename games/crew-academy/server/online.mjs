import http from 'node:http';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openOnlineDB } from './online-db.mjs';
import { validBotName } from '../web/crewLabels.js';
import game from '../dist/server/index.js';

const defaultDB = fileURLToPath(new URL('../var/academy-online.sqlite3', import.meta.url));

export async function startAcademy({ publicURL, database = defaultDB, port = 8785, bot = '', onStorageFailure }) {
  const base = new URL(publicURL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if ((base.protocol !== 'https:' && !(local && base.protocol === 'http:')) ||
      base.username || base.password || base.search || base.hash ||
      !/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(base.pathname)) {
    throw new Error('TVIJO_ACADEMY_URL must be a canonical HTTPS URL ending in / (HTTP allowed on loopback)');
  }
  if (bot && !validBotName(bot)) throw new Error('Invalid TVIJO_TELEGRAM_BOT username');
  const prefix = base.pathname.slice(0, -1);
  const storage = await openOnlineDB(database);
  const env = { DB: storage.DB, TVIJO_TELEGRAM_BOT: bot };
  const server = http.createServer(async (req, res) => {
    try {
      const publicRequest = new URL(req.url, base.origin);
      if (!req.url.startsWith('/') || req.url.startsWith('//') || publicRequest.origin !== base.origin) {
        res.writeHead(400).end(); return;
      }
      if (prefix && publicRequest.pathname === prefix) {
        res.writeHead(308, { Location: base.pathname + publicRequest.search }).end(); return;
      }
      if (!publicRequest.pathname.startsWith(base.pathname)) { res.writeHead(404).end(); return; }
      publicRequest.pathname = publicRequest.pathname.slice(prefix.length);
      const init = { method: req.method, headers: req.headers };
      if (req.method === 'POST') {
        init.body = Readable.toWeb(req);
        init.duplex = 'half';
      }
      const reply = await game.fetch(new Request(publicRequest, init), env);
      const headers = Object.fromEntries(reply.headers);
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie']
          .replace('Path=/api', 'Path=' + prefix + '/api')
          .replace('SameSite=Lax', 'SameSite=None; Partitioned');
      }
      const body = req.method === 'HEAD' ? undefined : Buffer.from(await reply.arrayBuffer());
      res.writeHead(reply.status, headers).end(body);
    } catch {
      if (!res.headersSent) res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end('{"error":"unavailable"}');
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  try {
    await new Promise((ready, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', ready);
    });
  } catch (error) {
    await storage.close();
    throw error;
  }
  let closing;
  function close() {
    closing ??= new Promise(done => server.close(done)).finally(() => storage.close());
    return closing;
  }
  storage.stopped.then(error => {
    if (!closing) { onStorageFailure?.(error); close(); }
  });
  return { port: server.address().port, close };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.umask(0o077);
  const port = Number(process.env.PORT || 8785);
  const publicURL = process.env.TVIJO_ACADEMY_URL || 'http://127.0.0.1:' + port + '/';
  const app = await startAcademy({ publicURL, port, database: process.env.TVIJO_ACADEMY_DB, bot: process.env.TVIJO_TELEGRAM_BOT,
    onStorageFailure() { console.error('Academy SQLite worker stopped'); process.exitCode = 1; } });
  console.log('Academy listening on 127.0.0.1:' + app.port + ' for ' + publicURL);
  process.once('SIGTERM', () => app.close());
  process.once('SIGINT', () => app.close());
}
