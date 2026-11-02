// Run with Node from the isolated tvijo/frontend checkout with @playwright/test installed.
// Start the fixture frontend on loopback with NEXT_PUBLIC_API_URL=/api/v1 first.
'use strict';
const path = require('node:path');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const frontendRequire = createRequire(path.resolve('package.json'));
const { chromium, expect } = frontendRequire('@playwright/test');

async function main() {
  const origin = new URL(process.env.AGENTROY_TEST_ORIGIN || 'http://127.0.0.1:3000');
  if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' || origin.username || origin.password)
    throw new Error('Use the isolated IPv4 loopback fixture.');
  // Match the client guard in the checked-out fixture. Authentication is mocked.
  const guard = fs.readFileSync('src/components/agentroy/AgentroyGuard.tsx', 'utf8');
  const email = process.env.AGENTROY_TEST_OWNER_EMAIL || /const OWNER_EMAIL = '([^']+)'/.exec(guard)?.[1];
  if (!email) throw new Error('Provide the fixture owner email for this revision.');
  const worker = { online: true, last_seen: null };
  const stamp = '2026-11-02T00:00:00Z';
  const tasks = ['A','B'].map((name, i) => ({
    id: '00000000-0000-4000-8000-00000000000' + (i + 1), title: 'Fixture task ' + name,
    status: 'completed', project: 'ai-os', executor: 'ds41f', api_cap_usd: '0.50',
    spent_usd: '0.00', created_at: stamp, updated_at: stamp, version: 1,
  }));
  const replies = new Map([
    ['auth/me/', { id: '00000000-0000-4000-8000-000000000071', email, is_staff: true, is_superuser: false }],
    ['agentroy/bootstrap/', { projects: [], executors: [], limits: { task_api_usd: '0.50' }, worker }],
    ['agentroy/tasks/', { tasks }],
    ...tasks.map(t => ['agentroy/tasks/' + t.id + '/', {
      task: t, worker, messages: [{ id: t.id, role: 'worker', kind: 'result',
        text: 'Result of ' + t.title, created_at: stamp }],
    }]),
  ]);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const writes = [];
    const detailsRead = [];
    let visibleTasks = tasks;
    let fixtureUser = replies.get('auth/me/');
    await context.route('**/*', route => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin !== origin.origin) return route.abort();
      if (url.pathname.startsWith('/api/')) {
        // The site-wide PageTracker posts on navigation. Keep it inside the fixture.
        if (url.pathname === '/api/v1/trading/track/' && req.method() === 'POST') {
          return route.fulfill({ status: 204 });
        }
        if (req.method() !== 'GET') writes.push(req.method() + ' ' + url.pathname);
        const key = url.pathname.slice('/api/v1/'.length);
        const ok = url.pathname.startsWith('/api/v1/') && req.method() === 'GET' && replies.has(key);
        if (key === 'auth/me/') return route.fulfill({ json: fixtureUser });
        if (key === 'agentroy/tasks/' && ok) return route.fulfill({ json: { tasks: visibleTasks } });
        if (key.startsWith('agentroy/tasks/') && key !== 'agentroy/tasks/') {
          detailsRead.push(key);
          if (!visibleTasks.some(t => key === 'agentroy/tasks/' + t.id + '/')) {
            return route.fulfill({ status: 403, json: {} });
          }
        }
        return route.fulfill({ status: ok ? 200 : 404, json: ok ? replies.get(key) : {} });
      }
      return req.method() === 'GET' || req.method() === 'HEAD' ? route.continue() : route.abort();
    });
    await context.addInitScript(() => localStorage.setItem('access_token', 'synthetic-fixture-only'));
    const page = await context.newPage();
    await page.goto(new URL('/en/agentroy', origin).href);
    const result = name => page.getByText('Result of Fixture task ' + name, { exact: true });
    await expect(result('A')).toBeVisible();
    await page.getByRole('button', { name: /Fixture task B/ }).click();
    await expect(result('B')).toBeVisible();
    await page.reload();
    await expect(result('B')).toBeVisible();
    await expect(page.getByRole('button', { name: /Fixture task B/ })).toHaveAttribute('aria-current', 'true');
    // The API can withdraw a task between visits. Never request its saved ID.
    visibleTasks = [tasks[0]];
    detailsRead.length = 0;
    await page.reload();
    await expect(result('A')).toBeVisible();
    expect(detailsRead).not.toContain('agentroy/tasks/' + tasks[1].id + '/');
    // A different account in the same tab cannot see the previous result.
    fixtureUser = { ...fixtureUser, id: '00000000-0000-4000-8000-000000000072', email: 'outsider@example.test' };
    detailsRead.length = 0;
    await page.reload();
    await expect(page.getByRole('heading', { name: /restricted to the configured owner/i })).toBeVisible();
    await expect(result('A')).toHaveCount(0);
    expect(detailsRead).toEqual([]);
    expect(writes).toEqual([]);
    process.stdout.write('PASS: reload, removed selection, denied account, zero AgentRoy mutations.\n');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
