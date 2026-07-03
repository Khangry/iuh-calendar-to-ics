// File: src/utils/dateTime.js (ESM)
// Tiện ích ngày cho feed lịch.

// Date -> 'YYYY-MM-DD' (theo giờ địa phương của server).
export function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Cộng/trừ số ngày, trả về 'YYYY-MM-DD'.
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

// Kiểm tra chuỗi đúng dạng 'YYYY-MM-DD'.
export function isYmd(str) {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str);
}
