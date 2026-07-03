import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toEvent, toEvents } from '../src/utils/scheduleMapper.js';

const studyItem = (over = {}) => ({
  loaiLich: 1,
  id: 1,
  ngay: '2026-06-03T00:00:00',
  tenMonHoc: 'Mạch điện',
  tietHocThi: 'Tiết 1 - 3',
  tenPhong: 'V13.01',
  maLopHocPhan: '429700192705',
  chiTiets: [
    { label: 'Nhóm', value: '1' },
    { label: 'Giảng viên', value: 'Nguyễn Văn A' },
  ],
  ...over,
});

const examItem = (over = {}) => ({
  loaiLich: 2,
  id: 223555,
  ngay: '2026-06-03T00:00:00',
  tenMonHoc: 'Mạch điện',
  tietHocThi: 'Tiết 5 - 6',
  tenPhong: 'V13.01',
  chiTiets: [
    { label: 'Thời gian thi', value: '60' },
    { label: 'Hình thức thi', value: 'Tự luận' },
  ],
  ...over,
});

test('học "Tiết 1 - 3" -> 06:30–09:00', () => {
  const e = toEvent(studyItem());
  assert.equal(e.startHM, '06:30');
  assert.equal(e.endHM, '09:00');
  assert.equal(e.isExam, false);
  assert.equal(e.title, 'Mạch điện');
});

test('thi 60 phút "Tiết 5 - 6" -> 10:10–11:10, có prefix [Thi]', () => {
  const e = toEvent(examItem());
  assert.equal(e.startHM, '10:10');
  assert.equal(e.endHM, '11:10');
  assert.equal(e.isExam, true);
  assert.equal(e.title, '[Thi] Mạch điện');
});

test('thi 90 phút "Tiết 1 - 3" -> 06:30–08:00', () => {
  const e = toEvent(
    examItem({ tietHocThi: 'Tiết 1 - 3', chiTiets: [{ label: 'Thời gian thi', value: '90' }] })
  );
  assert.equal(e.startHM, '06:30');
  assert.equal(e.endHM, '08:00');
});

test('học một tiết "Tiết 7" -> 12:30–13:20', () => {
  const e = toEvent(studyItem({ tietHocThi: 'Tiết 7' }));
  assert.equal(e.startHM, '12:30');
  assert.equal(e.endHM, '13:20');
});

test('description gộp LHP | Nhóm | GV', () => {
  const e = toEvent(studyItem());
  assert.match(e.desc, /LHP: 429700192705/);
  assert.match(e.desc, /Nhóm 1/);
  assert.match(e.desc, /GV: Nguyễn Văn A/);
});

test('item thiếu tietHocThi -> null', () => {
  assert.equal(toEvent(studyItem({ tietHocThi: '' })), null);
});

test('item thiếu ngay -> null', () => {
  assert.equal(toEvent(studyItem({ ngay: '' })), null);
});

test('toEvents lọc bỏ item không hợp lệ', () => {
  const list = toEvents([studyItem(), studyItem({ ngay: '' }), examItem()]);
  assert.equal(list.length, 2);
});

test('date cắt còn YYYY-MM-DD', () => {
  assert.equal(toEvent(studyItem()).date, '2026-06-03');
});
