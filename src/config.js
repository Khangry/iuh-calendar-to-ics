// File: src/config.js (ESM)
// Nạp biến môi trường (.env khi chạy local; Vercel inject khi deploy).

import dotenv from 'dotenv';
dotenv.config();

// Nơi lấy token (OAuth2 / OpenIddict). Dùng chung cho mọi trường OneUni.
export const AUTH_BASE =
  process.env.AUTH_BASE || 'https://mobile.oneuni.com.vn';

// url_uni: base của API dữ liệu = server riêng của trường. Đổi biến này (kèm
// định dạng username) để mở rộng sang trường khác dùng OneUni.
export const URL_UNI =
  process.env.URL_UNI || 'https://sv.iuh.edu.vn/AppSVGV/';

export const CLIENT_ID = process.env.CLIENT_ID || 'mobile_flutter';
export const CLIENT_SECRET = process.env.CLIENT_SECRET; // bắt buộc set qua env
export const SCOPE = process.env.SCOPE || 'offline_access openid';

// Ghép username: <MSSV><USER_TYPE><SCHOOL_CODE>, vd IUH: 200012342IUH.
export const USER_TYPE = process.env.USER_TYPE || '2'; // 2 = sinh viên
export const SCHOOL_CODE = process.env.SCHOOL_CODE || 'IUH';

// Khoảng ngày mặc định khi client không truyền from/to (số ngày).
export const DEFAULT_DAYS_BACK = parseInt(
  process.env.DEFAULT_DAYS_BACK || '90',
  10
);
export const DEFAULT_DAYS_FORWARD = parseInt(
  process.env.DEFAULT_DAYS_FORWARD || '180',
  10
);
