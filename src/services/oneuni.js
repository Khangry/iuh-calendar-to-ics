// File: src/services/oneuni.js (ESM)
// Client cho REST API app OneUni (nhà cung cấp ASCVN) -> lịch học/thi.
// Thay hẳn flow scrape `k` + CAPTCHA cũ. Reverse từ libapp.so v1.5.3 + live capture.
//
// Luồng: getToken (OAuth2 password grant tại AUTH_BASE) -> getLich (POST tới
// chính url_uni của trường, server tự biết SV qua Bearer token).

import fs from 'fs';
import tls from 'tls';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agent } from 'undici';
import {
  AUTH_BASE,
  URL_UNI,
  CLIENT_ID,
  CLIENT_SECRET,
  SCOPE,
} from '../config.js';

// sv.iuh.edu.vn chỉ gửi leaf cert, THIẾU intermediate CA -> Node không dựng được
// chuỗi tin cậy (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Thay vì tắt verify, nạp thẳng
// intermediate 'RapidSSL TLS RSA CA G1' (đã tải sẵn ở src/certs/) làm CA, kèm
// toàn bộ root mặc định của Node -> verify TLS vẫn BẬT (rejectUnauthorized:true).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const intermediateCa = fs.readFileSync(
  path.join(__dirname, '..', 'certs', 'rapidssl-intermediate.pem'),
  'utf8'
);
const dataDispatcher = new Agent({
  connect: {
    ca: [intermediateCa, ...tls.rootCertificates],
    rejectUnauthorized: true,
  },
});

const AUTH_TIMEOUT_MS = 15000;
const DATA_TIMEOUT_MS = 20000;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Auth (OAuth2 password grant / OpenIddict) ────────────────
export async function getToken(username, password) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: SCOPE,
    username,
    password,
    url_uni: URL_UNI,
  });
  const res = await fetchWithTimeout(
    `${AUTH_BASE}/AUTH/connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
    AUTH_TIMEOUT_MS
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Đăng nhập thất bại (${res.status}): ${text}`);
  }
  return res.json();
}

export async function refreshToken(refresh_token) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token,
    url_uni: URL_UNI,
  });
  const res = await fetchWithTimeout(
    `${AUTH_BASE}/AUTH/connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
    AUTH_TIMEOUT_MS
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh token thất bại (${res.status}): ${text}`);
  }
  return res.json();
}

// ── Decode JWT payload (không verify chữ ký, chỉ lấy info hiển thị) ──
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// ── Lấy lịch học + lịch thi (loaiLich 0 = tất cả) ────────────
// LƯU Ý: endpoint data nằm ở url_uni (server trường), KHÔNG ở AUTH_BASE.
export async function getLich(accessToken, tuNgay, denNgay, loaiLich = 0) {
  const iso = (d) => `${d}T00:00:00.000`;
  const res = await fetchWithTimeout(
    `${URL_UNI}api/v1/SinhVien/LichHocLichThi`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        accept: 'application/json',
        language: 'vi',
      },
      body: JSON.stringify({
        loaiLich,
        tuNgay: iso(tuNgay),
        denNgay: iso(denNgay),
      }),
      dispatcher: dataDispatcher,
    },
    DATA_TIMEOUT_MS
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lấy lịch thất bại (${res.status}): ${text}`);
  }
  const json = await res.json();
  if (json.isOk === false) {
    throw new Error(`API lỗi: ${JSON.stringify(json.errorMessages)}`);
  }
  return json.result || [];
}
