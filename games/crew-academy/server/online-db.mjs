import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

export async function openOnlineDB(filename) {
  const path = resolve(filename);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const worker = fileURLToPath(new URL('./sqlite_worker.py', import.meta.url));
  const child = spawn('python3', ['-u', worker, path], { stdio: ['pipe', 'pipe', 'inherit'] });
  const pending = new Map();
  const lines = createInterface({ input: child.stdout });
  let sequence = 0;
  let failure;
  const stopped = new Promise(resolveStop => {
    const stop = error => {
      failure = error instanceof Error ? error : new Error('Academy SQLite worker stopped');
      for (const request of pending.values()) request.reject(failure);
      pending.clear();
      resolveStop(failure);
    };
    child.once('error', stop);
    child.once('exit', stop);
    child.stdin.on('error', stop);
  });
  const ready = once(lines, 'line').then(([line]) => {
    if (JSON.parse(line).ready !== true) throw new Error('Academy database failed to start');
  });
  await Promise.race([ready, stopped.then(error => { throw error; })]);
  lines.on('line', line => {
    const reply = JSON.parse(line);
    const request = pending.get(reply.id);
    if (!request) return;
    pending.delete(reply.id);
    if (reply.error) request.reject(new Error(reply.error));
    else request.resolve(reply.results);
  });
  function send(statements, batch) {
    if (failure) return Promise.reject(failure);
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      child.stdin.write(JSON.stringify({ id, statements, batch }) + '\n');
    });
  }
  const DB = {
    prepare(sql) {
      return { bind(...args) {
        const statement = [sql, args];
        const single = async () => (await send([statement], false))[0];
        return { statement, all: single, run: single };
      } };
    },
    batch(statements) { return send(statements.map(item => item.statement), true); }
  };
  return { DB, stopped, close() { child.stdin.end(); return stopped; } };
}
