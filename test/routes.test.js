import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Ngăn index.js tự listen; ta tự mở cổng ephemeral. Set env trước khi import.
process.env.VERCEL = '1';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ci-test-secret-key';

const { default: app } = await import('../index.js');

let server, base;
before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});
after(() => server?.close());

test('GET / trả trang HTML (200)', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /IUH Calendar to ICS/);
});

test('POST /api/link thiếu credential -> 400', async () => {
  const res = await fetch(`${base}/api/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.match(json.error, /MSSV/);
});

test('GET /api/calendar thiếu token -> 400', async () => {
  const res = await fetch(`${base}/api/calendar`);
  assert.equal(res.status, 400);
  assert.match(await res.text(), /token/i);
});

test('GET /api/calendar token hỏng -> 400', async () => {
  const res = await fetch(`${base}/api/calendar?token=garbage`);
  assert.equal(res.status, 400);
  assert.match(await res.text(), /không hợp lệ|hỏng/i);
});
