import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertToIcs } from '../src/services/icsConverter.js';

const study = {
  id: 1, title: 'Mạch điện', location: 'V13.01',
  date: '2026-06-03', startHM: '06:30', endHM: '09:00',
  desc: 'LHP: X | Nhóm 1', isExam: false,
};
const exam = {
  id: 223555, title: '[Thi] Mạch điện', location: 'V13.01',
  date: '2026-06-03', startHM: '10:10', endHM: '11:10',
  desc: 'Hình thức: Tự luận', isExam: true,
};

test('ICS: có VCALENDAR + VTIMEZONE Asia/Ho_Chi_Minh', () => {
  const ics = convertToIcs([study]);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /BEGIN:VTIMEZONE\r\nTZID:Asia\/Ho_Chi_Minh/);
  assert.match(ics, /TZOFFSETTO:\+0700/);
});

test('ICS: DTSTART/DTEND giờ địa phương gắn TZID', () => {
  const ics = convertToIcs([study]);
  assert.match(ics, /DTSTART;TZID=Asia\/Ho_Chi_Minh:20260603T063000/);
  assert.match(ics, /DTEND;TZID=Asia\/Ho_Chi_Minh:20260603T090000/);
});

test('ICS: UID ổn định derive từ item.id', () => {
  const ics = convertToIcs([exam]);
  assert.match(ics, /UID:iuh-223555@oneuni/);
});

test('ICS: dòng kết thúc CRLF', () => {
  const ics = convertToIcs([study]);
  assert.ok(ics.includes('\r\n'));
  assert.ok(!/[^\r]\n/.test(ics), 'không được có LF trần');
});

test('ICS: escape ký tự đặc biệt trong SUMMARY/DESCRIPTION', () => {
  const ics = convertToIcs([{ ...study, title: 'A; B, C\\D', desc: 'x,y;z' }]);
  assert.match(ics, /SUMMARY:A\\; B\\, C\\\\D/);
  assert.match(ics, /DESCRIPTION:x\\,y\\;z/);
});

test('ICS: mỗi event 1 cặp VEVENT, có VALARM', () => {
  const ics = convertToIcs([study, exam]);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.equal((ics.match(/END:VEVENT/g) || []).length, 2);
  assert.match(ics, /BEGIN:VALARM/);
});

test('ICS: list rỗng vẫn ra calendar hợp lệ', () => {
  const ics = convertToIcs([]);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /END:VCALENDAR/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 0);
});
