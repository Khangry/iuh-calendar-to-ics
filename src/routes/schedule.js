// File: src/routes/schedule.js (ESM)

import express from 'express';
const router = express.Router();

import { getPreviousMonday, formatDate } from '../utils/dateTime.js';
import { fetchAndProcessSchedule } from '../services/iuhScraper.js';
import { convertToIcs } from '../services/icsConverter.js';

router.get('/', async (req, res) => {
    try {
        const { k } = req.query;
        if (!k) {
            return res.status(400).send('Lỗi: Vui lòng cung cấp tham số "k" trên URL.');
        }
        console.log(`[INFO] Bắt đầu xử lý yêu cầu cho mã k: ${k}`);

        const today = new Date();
        const startMonday = getPreviousMonday(today);
        const mondayDates = Array.from({ length: 8 }, (_, i) => {
            const currentMonday = new Date(startMonday);
            currentMonday.setDate(startMonday.getDate() + i * 7);
            return formatDate(currentMonday);
        });

        const allClasses = await fetchAndProcessSchedule(k, mondayDates);
        if (allClasses.length === 0) {
            return res.status(404).send('Không tìm thấy lịch học nào...');
        }
        const icsData = convertToIcs(allClasses);
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="LichHoc_IUH.ics"');
        res.status(200).send(icsData);
        console.log(`[SUCCESS] Đã trả về tệp ICS thành công.`);
    } catch (error) {
        console.error("[ERROR] Đã xảy ra lỗi:", error.message);
        res.status(500).send("Đã xảy ra lỗi không mong muốn trên máy chủ.");
    }
});

export default router;