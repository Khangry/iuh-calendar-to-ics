// File: index.js (ESM)

import express from 'express';
import scheduleRoutes from './src/routes/schedule.js'; 
import api from './src/routes/api.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile = path.join(__dirname, 'public', 'index.html');
});

app.use('/schedule', scheduleRoutes);
app.use('/api', api);

app.listen(PORT, () => {
  console.log(`🚀 Máy chủ đang chạy tại http://localhost:${PORT}`);
  console.log(`👉 Để sử dụng, hãy truy cập: http://localhost:${PORT}/schedule?k=YOUR_K_VALUE`);
});
