import axios from 'axios';
import https from 'https';
import { load } from 'cheerio';
import { _TRANS_INTO_STUDY_TIME } from '../utils/transIntoTime.js';
import { add50Minutes } from '../utils/dateTime.js';
import { getCache, setCache } from './cache.js';
import { IUH_BASE_URL } from '../config.js'; // Import IUH_BASE_URL

// Helper function to clean text
function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ') || '';
}

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
        thu: cleanText(parts[0]),
        ngay: cleanText(parts[1]),
      });
    }
  });
  $('tbody tr td:first-child b').each((i, el) => {
    periods.push(cleanText($(el).text()));
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
            const tietText = cleanText($(classElement).find('p').eq(1).text());
            const tietMatch = tietText.match(/Tiết: (\d+) - (\d+)/);
            if (tietMatch) {
              classInfo.tietBatDau = parseInt(tietMatch[1]);
              classInfo.tietKetThuc = parseInt(tietMatch[2]);
              classInfo.gioBatDau = _TRANS_INTO_STUDY_TIME[classInfo.tietBatDau];
              const lastPeriodStartTime =
                _TRANS_INTO_STUDY_TIME[classInfo.tietKetThuc];
              classInfo.gioKetThuc = add50Minutes(lastPeriodStartTime);
            }
            classInfo.name = cleanText($(classElement).find('b a').text());
            classInfo.code = cleanText($(classElement).find('p').eq(0).text());
            classInfo.tietHocRaw = tietText;
            classInfo.phongHoc = cleanText($(classElement).find('p span').text().replace('Phòng:', ''));
            classInfo.giangVien = cleanText($(classElement).find('p').last().text().replace('GV:', ''));
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
  // Tách các ngày đã có trong cache và chưa có
  const cachedResults = [];
  const uncachedDates = [];

  for (const date of mondayDates) {
    const cached = getCache(k, [date]);
    if (cached) {
      cachedResults.push(...cached);
    } else {
      uncachedDates.push(date);
    }
  }
  console.log(`[INFO] Đã trả về ${cachedResults.length} dữ liệu về lịch học từ cache`);
  let fetchedResults = [];
  if (uncachedDates.length > 0) {
    // Sử dụng IUH_BASE_URL từ biến môi trường
    const url = `${IUH_BASE_URL}/SinhVienTraCuu/GetDanhSachLichTheoTuan`;
    // KHUYẾN NGHỊ: Chỉ sử dụng trong môi trường phát triển.
    // Trong môi trường production, hãy đảm bảo chứng chỉ SSL hợp lệ
    // hoặc cấu hình biến môi trường để kiểm soát hành vi này.
    const insecureAgent = new https.Agent({ rejectUnauthorized: process.env.NODE_ENV !== 'production' });

    const fetchPromises = uncachedDates.map((pNgayHienTai) => {
      const payload = new URLSearchParams({ k, pNgayHienTai, pLoaiLich: '0' });
      return axios.post(url, payload.toString(), { httpsAgent: insecureAgent });
    });

    const responses = await Promise.all(fetchPromises);
    console.log(
      `[INFO] Đã nhận được ${responses.length} phản hồi từ máy chủ IUH.`
    );

    for (let i = 0; i < responses.length; i++) {
      const classesForWeek = processClassesFromHtml(responses[i].data);
      fetchedResults.push(...classesForWeek);
      // Lưu từng ngày vào cache riêng biệt
      setCache(k, [uncachedDates[i]], classesForWeek);
    }
    console.log(
      `[INFO] Tổng cộng đã phân tích được ${fetchedResults.length} lớp học từ IUH.`
    );
  }

  // Ghép kết quả từ cache và từ IUH
  const allClasses = [...cachedResults, ...fetchedResults];

  return allClasses;
}
