// File: src/services/icsConverter.js (ESM)
// Xuất danh sách sự kiện -> chuỗi .ics chuẩn RFC 5545.
// Giờ địa phương gắn TZID Asia/Ho_Chi_Minh (+07), dòng CRLF, escape ký tự.

function foldLine(line) {
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  const parts = [];
  let current = line;
  while (current.length > 0) {
    if (current.length > maxLen) {
      parts.push(current.substring(0, maxLen));
      current = ' ' + current.substring(maxLen);
    } else {
      parts.push(current);
      current = '';
    }
  }
  return parts.join('\r\n');
}

function escapeIcsText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// 'YYYY-MM-DD' + 'HH:MM' -> 'YYYYMMDDTHHMMSS' (giờ địa phương, không hậu tố Z).
function fmtLocal(date, hhmm) {
  const [y, mo, d] = date.split('-');
  const [h, mi] = hhmm.split(':');
  return `${y}${mo}${d}T${pad(h)}${pad(mi)}00`;
}

function stampUTC() {
  const now = new Date();
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

/**
 * @param {object[]} events - từ scheduleMapper.toEvents()
 * @returns {string} nội dung .ics
 */
export function convertToIcs(events) {
  const stamp = stampUTC();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iuh-calendar-to-ics//OneUni//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch học (IUH)',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Ho_Chi_Minh',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  events.forEach((e) => {
    // UID ổn định derive từ id nội bộ -> calendar update thay vì tạo trùng.
    const uid = `iuh-${e.id}@oneuni`;
    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${uid}`));
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${fmtLocal(e.date, e.startHM)}`);
    lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${fmtLocal(e.date, e.endHM)}`);
    lines.push(foldLine(`SUMMARY:${escapeIcsText(e.title)}`));
    if (e.location) {
      lines.push(foldLine(`LOCATION:${escapeIcsText(e.location)}`));
    }
    if (e.desc) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcsText(e.desc)}`));
    }
    lines.push(`LAST-MODIFIED:${stamp}`);
    lines.push('TRANSP:OPAQUE');
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(foldLine(`DESCRIPTION:${escapeIcsText(e.title)}`));
    lines.push('TRIGGER:-PT15M');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
