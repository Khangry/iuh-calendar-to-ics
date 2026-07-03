// File: src/routes/link.js (ESM)
// POST /api/link — nhận MSSV + mật khẩu, đăng nhập thử để xác thực, rồi trả về
// URL subscribe chứa credential đã MÃ HOÁ (không bao giờ để plaintext).

import express from 'express';
import { getToken, decodeJwt } from '../services/oneuni.js';
import { encrypt } from '../services/crypto.js';
import { USER_TYPE, SCHOOL_CODE } from '../config.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { mssv, password } = req.body || {};
    if (!mssv || !password) {
      return res
        .status(400)
        .json({ error: 'Vui lòng nhập MSSV và mật khẩu.' });
    }

    // Ghép username theo định dạng OneUni: <MSSV><USER_TYPE><SCHOOL_CODE>.
    const username = `${String(mssv).trim()}${USER_TYPE}${SCHOOL_CODE}`;

    // Đăng nhập thử để xác thực credential trước khi phát link.
    const tok = await getToken(username, password);
    const info = decodeJwt(tok.id_token || tok.access_token || '');
    const name = [info.lastname, info.firstname].filter(Boolean).join(' ');

    // Mã hoá credential -> token nhúng URL. Login tươi mỗi lần feed được gọi.
    const enc = encrypt({ username, password });

    const base = `${req.protocol}://${req.get('host')}`;
    const httpsUrl = `${base}/api/calendar?token=${encodeURIComponent(enc)}`;
    const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:');

    return res.json({ name: name || null, httpsUrl, webcalUrl });
  } catch (err) {
    // Không log mật khẩu. Chỉ trả thông báo an toàn.
    console.error('[ERROR] /api/link:', err.message);
    return res
      .status(401)
      .json({ error: 'Đăng nhập thất bại. Kiểm tra lại MSSV/mật khẩu.' });
  }
});

export default router;
