import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ci-test-secret-key';
const { encrypt, decrypt } = await import('../src/services/crypto.js');

test('crypto: round-trip giữ nguyên payload', () => {
  const payload = { username: '200012342IUH', password: 'p@ss word,;\\/#' };
  const dec = decrypt(encrypt(payload));
  assert.deepEqual(dec, payload);
});

test('crypto: output là base64url an toàn cho URL', () => {
  const token = encrypt({ username: 'a', password: 'b' });
  assert.match(token, /^[A-Za-z0-9\-_]+$/);
});

test('crypto: hai lần mã hoá ra khác nhau (IV ngẫu nhiên)', () => {
  const a = encrypt({ username: 'a', password: 'b' });
  const b = encrypt({ username: 'a', password: 'b' });
  assert.notEqual(a, b);
});

test('crypto: token bị sửa -> ném lỗi (auth tag)', () => {
  const token = encrypt({ username: 'a', password: 'b' });
  assert.throws(() => decrypt(token.slice(0, -2) + 'xx'));
});

test('crypto: token rác -> ném lỗi', () => {
  assert.throws(() => decrypt('garbage'));
});
