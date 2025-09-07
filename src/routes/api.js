import express from 'express';
const api = express.Router();

import { getModayLists } from '../utils/dateTime.js';
import { fetchAndProcessSchedule } from '../services/iuhScraper.js';

api.get('/', async (req, res) => {
  try {
    const { k } = req.query;
    if (!k) {
      return res
        .status(400)
        .send('Lỗi: Vui lòng cung cấp tham số "k" trên URL.');
    }
    console.log(`[INFO] Bắt đầu trả dữ liệu về API cho mã k: ${k}`);
    const { w } = req.query || 4;
    console.log(`[INFO] Đang xử lý lịch học cho yêu cầu của API ${w} tuần.`);
    let mondayDates = getModayLists(w);
    const allClasses = await fetchAndProcessSchedule(k, mondayDates);
    if (allClasses.length === 0) {
      return res.status(404).send('Không tìm thấy lịch học nào...');
    }
    res.status(200).json(allClasses);
  } catch (error) {
    console.error('[ERROR] Đã xảy ra lỗi:', error.message);
    res.status(500).send('Đã xảy ra lỗi không mong muốn trên máy chủ.');
  }
});
export default api;