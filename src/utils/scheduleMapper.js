// File: src/utils/scheduleMapper.js (ESM)
// Map 1 item từ API LichHocLichThi -> object sự kiện chuẩn cho ICS.
//
// Response KHÔNG có giờ đồng hồ, chỉ có `tietHocThi` dạng text ("Tiết 5 - 6").
// Phải tra bảng tiết -> giờ của IUH. Lịch HỌC và lịch THI dùng bảng khác nhau.

import {
  _TRANS_INTO_STUDY_TIME as STUDY,
  _TRANS_INTO_60_MINUTES_EXAM_START_TIME as EXAM60,
  _TRANS_INTO_90_MINUTES_EXAM_START_TIME as EXAM90,
} from './transIntoTime.js';

// Cộng thêm `mins` phút vào chuỗi 'HH:MM', trả về 'HH:MM'.
function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Lấy value theo label trong chiTiets.
function chiTiet(item, label) {
  return (item.chiTiets || []).find((c) => c.label === label)?.value ?? null;
}

/**
 * @param {object} item - phần tử trong result[] của API
 * @returns {object|null} sự kiện { id, title, location, date, startHM, endHM, desc, isExam }
 */
export function toEvent(item) {
  const date = (item.ngay || '').slice(0, 10); // 'YYYY-MM-DD'
  const nums = (item.tietHocThi || '').match(/\d+/g)?.map(Number) || [];
  if (!date || nums.length === 0) return null;

  const first = nums[0];
  const last = nums[nums.length - 1];
  const isExam = item.loaiLich === 2;

  let startHM, endHM;
  if (isExam) {
    const mins = parseInt(chiTiet(item, 'Thời gian thi') || '60', 10);
    const table = mins >= 90 ? EXAM90 : EXAM60;
    // Fallback về giờ học nếu tiết thi không nằm trong bảng thi.
    startHM = table[first] || STUDY[first] || '00:00';
    endHM = addMinutes(startHM, mins);
  } else {
    startHM = STUDY[first] || '00:00';
    // Mỗi tiết học kéo dài 50 phút; end = giờ bắt đầu tiết cuối + 50.
    const lastStart = STUDY[last] || STUDY[first] || '00:00';
    endHM = addMinutes(lastStart, 50);
  }

  const nhom = chiTiet(item, 'Nhóm');
  const gv = chiTiet(item, 'Giảng viên');
  const ghi = chiTiet(item, 'Ghi chú');
  const hinhThuc = chiTiet(item, 'Hình thức thi');

  const desc = [
    item.maLopHocPhan && `LHP: ${item.maLopHocPhan}`,
    nhom && `Nhóm ${nhom}`,
    hinhThuc && `Hình thức: ${hinhThuc}`,
    gv && `GV: ${gv}`,
    ghi,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    id: item.id,
    title: `${isExam ? '[Thi] ' : ''}${item.tenMonHoc || ''}`.trim(),
    location: item.tenPhong || '',
    date,
    startHM,
    endHM,
    desc,
    isExam,
  };
}

/**
 * Map cả list, bỏ item không hợp lệ.
 * @param {object[]} items
 * @returns {object[]}
 */
export function toEvents(items) {
  return (items || []).map(toEvent).filter(Boolean);
}
