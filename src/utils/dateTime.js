// File: src/utils/dateTime.js (ESM)
import { _TRANS_INTO_STUDY_TIME } from './transIntoTime.js';

export function add50Minutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + 50);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function add60Minutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + 60);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function add90Minutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + 90);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function getPreviousMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getModayLists(numberOfWeek) {
  const today = new Date();
  const startMonday = getPreviousMonday(today);
  const mondayDates = [];

  // Chuyển đổi numberOfWeek sang số nguyên và kiểm tra tính hợp lệ
  const numWeeks = parseInt(numberOfWeek, 10);
  if (isNaN(numWeeks) || numWeeks <= 0) {
    console.warn(
      `[WARN] Invalid numberOfWeek provided: ${numberOfWeek}. Returning empty list.`
    );
    return []; // Trả về mảng rỗng hoặc xử lý lỗi tùy theo yêu cầu
  }

  // Tạo một bản sao của ngày thứ Hai đầu tiên để có thể thay đổi trong vòng lặp
  let currentMonday = new Date(startMonday);

  for (let i = 0; i < numWeeks; i++) {
    mondayDates.push(formatDate(currentMonday));
    // Tăng ngày lên 7 để có ngày thứ Hai của tuần tiếp theo
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return mondayDates;
}

export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
