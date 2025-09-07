// File: index.js (ESM)

import express from 'express';
import scheduleRoutes from './src/routes/schedule.js'; 
import api from './src/routes/api.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Service đang hoạt động. Vui lòng truy cập /schedule?k=YOUR_K_VALUE');
});

app.use('/schedule', scheduleRoutes);
app.use('/api', api);

app.listen(PORT, () => {
    console.log(`🚀 Máy chủ đang chạy tại http://localhost:${PORT}`);
    console.log(`👉 Để sử dụng, hãy truy cập: http://localhost:${PORT}/schedule?k=YOUR_K_VALUE`);
});
