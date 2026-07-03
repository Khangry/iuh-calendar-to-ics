// File: index.js (ESM) — Express app, chạy được cả local lẫn Vercel serverless.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import linkRoutes from './src/routes/link.js';
import calendarRoutes from './src/routes/calendar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /api/link   -> tạo URL subscribe từ MSSV + mật khẩu (mã hoá).
// GET  /api/calendar?token=... -> feed .ics (login tươi mỗi lần gọi).
app.use('/api/link', linkRoutes);
app.use('/api/calendar', calendarRoutes);

// Chỉ listen khi chạy trực tiếp (local). Trên Vercel, app được import làm handler.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Máy chủ đang chạy tại http://localhost:${PORT}`);
  });
}

export default app;
