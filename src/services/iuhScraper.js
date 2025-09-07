// File: src/services/iuhScraper.js (ESM - Đã sửa lỗi Cheerio)

import axios from 'axios';
import https from 'https';
import { load } from 'cheerio';
import { _TRANS_INTO_TIME, add50Minutes } from '../utils/dateTime.js';

function processClassesFromHtml(htmlData) {
  const $ = load(htmlData);

  const classesForWeek = [];
  const days = [];
  const periods = [];
  $('thead th').each((i, el) => {
    if (i > 0) {
      const fullDateText = $(el).html() || '';
      const parts = fullDateText.split('<br>');
      days.push({
        thu: parts[0]?.trim().replace(/\s+/g, ' ') || '',
        ngay: parts[1]?.trim().replace(/\s+/g, ' ') || '',
      });
    }
  });
  $('tbody tr td:first-child b').each((i, el) => {
    periods.push($(el).text().trim());
  });
  $('tbody tr').each((rowIndex, rowElement) => {
    const period = periods[rowIndex];
    $(rowElement)
      .find('td')
      .each((colIndex, cellElement) => {
        if (colIndex === 0) return;
        const dayInfo = days[colIndex - 1];
        if (!dayInfo) return;
        $(cellElement)
          .find('.content')
          .each((classIndex, classElement) => {
            const classInfo = {};
            const tietText = $(classElement)
              .find('p')
              .eq(1)
              .text()
              .trim()
              .replace(/\s+/g, ' ');
            const tietMatch = tietText.match(/Tiết: (\d+) - (\d+)/);
            if (tietMatch) {
              classInfo.tietBatDau = parseInt(tietMatch[1]);
              classInfo.tietKetThuc = parseInt(tietMatch[2]);
              classInfo.gioBatDau = _TRANS_INTO_TIME[classInfo.tietBatDau];
              const lastPeriodStartTime =
                _TRANS_INTO_TIME[classInfo.tietKetThuc];
              classInfo.gioKetThuc = add50Minutes(lastPeriodStartTime);
            }
            classInfo.name = $(classElement)
              .find('b a')
              .text()
              .trim()
              .replace(/\s+/g, ' ');
            classInfo.code = $(classElement)
              .find('p')
              .eq(0)
              .text()
              .trim()
              .replace(/\s+/g, ' ');
            classInfo.tietHocRaw = tietText;
            classInfo.phongHoc = $(classElement)
              .find('p span')
              .text()
              .replace('Phòng:', '')
              .trim()
              .replace(/\s+/g, ' ');
            classInfo.giangVien = $(classElement)
              .find('p')
              .last()
              .text()
              .replace('GV:', '')
              .trim()
              .replace(/\s+/g, ' ');
            classInfo.thu = dayInfo.thu;
            classInfo.ngay = dayInfo.ngay;
            classInfo.caHoc = period;
            classesForWeek.push(classInfo);
          });
      });
  });
  return classesForWeek;
}

export async function fetchAndProcessSchedule(k, mondayDates) {
  const url = 'https://sv.iuh.edu.vn/SinhVienTraCuu/GetDanhSachLichTheoTuan';
  const insecureAgent = new https.Agent({ rejectUnauthorized: false });

  const fetchPromises = mondayDates.map((pNgayHienTai) => {
    const payload = new URLSearchParams({ k, pNgayHienTai, pLoaiLich: '0' });
    return axios.post(url, payload.toString(), { httpsAgent: insecureAgent });
  });

  const responses = await Promise.all(fetchPromises);
  console.log(
    `[INFO] Đã nhận được ${responses.length} phản hồi từ máy chủ IUH.`
  );

  const allClasses = [];
  for (const response of responses) {
    const classesForWeek = processClassesFromHtml(response.data);
    allClasses.push(...classesForWeek);
  }
  console.log(
    `[INFO] Tổng cộng đã phân tích được ${allClasses.length} lớp học.`
  );

  return allClasses;
}
