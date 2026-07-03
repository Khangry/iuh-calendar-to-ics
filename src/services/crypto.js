// File: src/services/crypto.js (ESM)
// Mã hoá/giải mã credential (MSSV + mật khẩu) bằng AES-256-GCM.
// Khoá lấy từ biến môi trường ENCRYPTION_KEY (chuỗi bất kỳ), được băm SHA-256
// thành khoá 32 byte. Chuỗi mã hoá gói (iv | authTag | ciphertext) rồi encode
// base64url để nhúng an toàn vào URL subscribe.

import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // GCM khuyến nghị nonce 96-bit
const TAG_LEN = 16;

function getKey() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('Thiếu ENCRYPTION_KEY trong biến môi trường.');
  }
  // Băm về đúng 32 byte, cho phép người dùng đặt passphrase bất kỳ độ dài.
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

function toBase64Url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64');
}

/**
 * Mã hoá một object thành chuỗi base64url an toàn cho URL.
 * @param {object} payload - vd { username, password }
 * @returns {string}
 */
export function encrypt(payload) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return toBase64Url(Buffer.concat([iv, tag, ciphertext]));
}

/**
 * Giải mã chuỗi tạo bởi encrypt(). Ném lỗi nếu token bị sửa/hỏng.
 * @param {string} token
 * @returns {object}
 */
export function decrypt(token) {
  const key = getKey();
  const raw = fromBase64Url(token);
  if (raw.length < IV_LEN + TAG_LEN) {
    throw new Error('Token không hợp lệ.');
  }
  const iv = raw.subarray(0, IV_LEN);
  const tag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = raw.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8'));
}
