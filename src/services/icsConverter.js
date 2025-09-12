// File: src/services/icsConverter.js (ESM)

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
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function formatIcsDateTimeUTC(ngay, gio) {
  if (!ngay || !gio) return null;
  const [day, month, year] = ngay.split('/');
  const [hours, minutes] = gio.split(':');
  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString().replace(/[-:.]/g, '').slice(0, 15);
}

export function convertToIcs(allClasses) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'PRODID:TuanKhangCalendar',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch học (IUH)',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ];
  allClasses.forEach((classInfo) => {
    if (!classInfo.ngay || !classInfo.gioBatDau || !classInfo.gioKetThuc)
      return;
    const dtstart = formatIcsDateTimeUTC(classInfo.ngay, classInfo.gioBatDau);
    const dtend = formatIcsDateTimeUTC(classInfo.ngay, classInfo.gioKetThuc);
    const dtstamp =
      new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
    const uid = `${dtstart}-${classInfo.code.replace(/\s/g, '')}@iuh.edu.vn`;
    const summary = `[${classInfo.phongHoc}] - ${classInfo.name}`;
    const descriptionParts = [
      classInfo.name,
      classInfo.code,
      classInfo.tietHocRaw,
      `Phòng: ${classInfo.phongHoc}`,
      `GV: ${classInfo.giangVien}`,
    ];
    const description = descriptionParts
      .map((part) => escapeIcsText(part))
      .join('\\n');

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(
      foldLine(`UID:${uid}`),
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`
    );
    icsContent.push(foldLine(`SUMMARY:${escapeIcsText(summary)}`));
    icsContent.push(`DESCRIPTION:${description}`);
    icsContent.push(`LAST-MODIFIED:${dtstamp}`);
    icsContent.push(foldLine(`LOCATION:${escapeIcsText(classInfo.phongHoc)}`));
    icsContent.push('TRANSP:OPAQUE');
    icsContent.push('BEGIN:VALARM');
    icsContent.push('ACTION:DISPLAY');
    icsContent.push(`DESCRIPTION:${description}`);
    icsContent.push('TRIGGER:-P0DT0H10M0S');
    icsContent.push('END:VALARM');
    icsContent.push('END:VEVENT');
  });
  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}
