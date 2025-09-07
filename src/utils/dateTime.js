// File: src/utils/dateTime.js (ESM)

export const _TRANS_INTO_TIME = {
  1: '06:30',
  2: '07:20',
  3: '08:10',
  4: '09:10',
  5: '10:00',
  6: '10:50',
  7: '12:30',
  8: '13:20',
  9: '14:10',
  10: '15:10',
  11: '16:00',
  12: '16:50',
  13: '18:00',
  14: '18:50',
  15: '19:50',
  16: '20:40',
  17: '21:30',
};

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
  const mondayDates = Array.from({ length: numberOfWeek }, (_, i) => {
    const currentMonday = new Date(startMonday);
    currentMonday.setDate(startMonday.getDate() + i * 7);
    return formatDate(currentMonday);
  });
  return mondayDates;
}

export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
