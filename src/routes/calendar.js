// File: src/routes/calendar.js (ESM)
// GET /api/calendar?token=<enc>[&from=YYYY-MM-DD&to=YYYY-MM-DD]
// Feed chính: calendar app gọi định kỳ. Giải mã credential -> login tươi ->
// lấy lịch học+thi -> trả .ics.

import express from 'express';
import { decrypt } from '../services/crypto.js';
import { getToken, getLich } from '../services/oneuni.js';
import { toEvents } from '../utils/scheduleMapper.js';
import { convertToIcs } from '../services/icsConverter.js';
import { addDays, isYmd } from '../utils/dateTime.js';
import { DEFAULT_DAYS_BACK, DEFAULT_DAYS_FORWARD } from '../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { token, from, to } = req.query;
    if (!token) {
      return res.status(400).send('Thiếu tham số "token".');
    }

    let cred;
    try {
      cred = decrypt(token);
    } catch {
      return res.status(400).send('Token không hợp lệ hoặc đã hỏng.');
    }

    // Khoảng ngày: dùng from/to nếu hợp lệ, nếu không lấy mặc định rộng.
    const today = new Date();
    const tuNgay = isYmd(from) ? from : addDays(today, -DEFAULT_DAYS_BACK);
    const denNgay = isYmd(to) ? to : addDays(today, DEFAULT_DAYS_FORWARD);

    const tok = await getToken(cred.username, cred.password);
    const raw = await getLich(tok.access_token, tuNgay, denNgay, 0);
    const events = toEvents(raw);
    const ics = convertToIcs(events);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="LichHoc_IUH.ics"'
    );
    // Cho calendar app cache ngắn, tránh gọi login liên tục.
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.status(200).send(ics);
  } catch (err) {
    console.error('[ERROR] /api/calendar:', err.message);
    return res.status(502).send('Không lấy được lịch từ hệ thống trường.');
  }
});

export default router;
