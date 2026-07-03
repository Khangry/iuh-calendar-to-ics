# IUH Calendar to ICS

Xuất **lịch học & lịch thi** của sinh viên Đại học Công nghiệp TP.HCM (IUH) ra
một link `.ics` **subscribe được** vào Google Calendar / Apple Calendar / Outlook.
Thêm một lần, lịch tự cập nhật định kỳ.

> **Mới:** không còn cần mã `k` hay giải CAPTCHA. Đăng nhập trực tiếp bằng
> **MSSV + mật khẩu** (giống app **OneUni**) — không CAPTCHA, chạy nền ổn định.

---

## 1. Cách dùng

### Bước 1 — Tạo link lịch

1. Mở trang web của ứng dụng (bản đã deploy của bạn, hoặc `http://localhost:3000`
   khi chạy local).
2. Nhập **Mã số sinh viên** + **Mật khẩu** (cùng tài khoản dùng cho app OneUni /
   cổng sinh viên).
3. Bấm **Tạo link lịch**. Nếu đúng, trang hiện lời chào kèm 2 link:
   - **Link webcal** — bấm thẳng để thêm vào ứng dụng lịch.
   - **Link https** — dùng cho ứng dụng nào cần dán URL thủ công.

> Mật khẩu được **mã hoá** trước khi nhét vào link và **không lưu, không ghi log**.
> Server chỉ dùng nó để đăng nhập lấy lịch mỗi lần lịch đồng bộ. Giữ link riêng tư
> như giữ mật khẩu — ai có link vẫn xem được lịch của bạn.

### Bước 2 — Thêm vào ứng dụng lịch

**Google Calendar** (nên làm trên máy tính):
1. Vào [calendar.google.com](https://calendar.google.com) → bên trái, cạnh
   **Lịch khác** bấm dấu **+** → **Từ URL**.
2. Dán **link https** → **Thêm lịch**.
3. Google tự đồng bộ định kỳ (thường vài giờ một lần — độ trễ do Google quyết định).

**Apple Calendar (iPhone/iPad):**
1. **Cài đặt** → **Lịch** → **Tài khoản** → **Thêm tài khoản** → **Khác** →
   **Thêm lịch đăng ký**.
2. Dán **link https** (hoặc bấm **link webcal** từ trình duyệt) → **Tiếp** → **Lưu**.

**Apple Calendar (macOS):** app Lịch → **Tệp** → **Đăng ký lịch mới** → dán link.

**Outlook:** **Thêm lịch** → **Đăng ký từ web** → dán **link https**.

### Cập nhật & giới hạn

- Lịch tự làm mới; **chu kỳ đồng bộ do ứng dụng lịch quyết định**, không phải app này.
- Mặc định lấy **90 ngày trước → 180 ngày sau**. Muốn đổi, thêm tham số vào link:
  `...&from=2026-01-01&to=2026-12-31` (định dạng `YYYY-MM-DD`).
- **Đổi mật khẩu SV** → link cũ hết hiệu lực, vào web tạo link mới.

---

## 2. Tự deploy lên Vercel

1. **Fork** repo này về GitHub của bạn.
2. Vào [vercel.com](https://vercel.com) → **Add New Project** → chọn repo vừa fork.
3. Mục **Environment Variables**, thêm:

   | Biến | Bắt buộc | Giá trị |
   |---|---|---|
   | `CLIENT_SECRET` | ✅ | client_secret app OneUni (xem `.env.example`). |
   | `ENCRYPTION_KEY` | ✅ | Chuỗi bí mật **dài, ngẫu nhiên** để mã hoá credential. |

   Tuỳ chọn: `URL_UNI`, `USER_TYPE`, `SCHOOL_CODE`, `DEFAULT_DAYS_BACK`,
   `DEFAULT_DAYS_FORWARD` (xem bảng dưới).
4. Bấm **Deploy**. Xong, mở domain Vercel cấp → dùng theo Mục 1.

> ⚠️ Đổi `ENCRYPTION_KEY` sau này = **mọi link đã phát đều hỏng**, sinh viên phải
> tạo lại. Đặt một lần rồi giữ nguyên.

---

## 3. Chạy local

```bash
yarn install
cp .env.example .env      # rồi điền CLIENT_SECRET + ENCRYPTION_KEY
yarn start                # http://localhost:3000
```

---

## 4. Biến môi trường

| Biến | Mặc định | Mô tả |
|---|---|---|
| `CLIENT_SECRET` | — (bắt buộc) | client_secret app OneUni (OAuth2). |
| `ENCRYPTION_KEY` | — (bắt buộc) | Khoá mã hoá credential nhúng link. |
| `URL_UNI` | `https://sv.iuh.edu.vn/AppSVGV/` | Base API dữ liệu của trường. |
| `USER_TYPE` | `2` | Loại tài khoản (2 = sinh viên). |
| `SCHOOL_CODE` | `IUH` | Mã trường. |
| `DEFAULT_DAYS_BACK` | `90` | Số ngày lấy về trước. |
| `DEFAULT_DAYS_FORWARD` | `180` | Số ngày lấy về sau. |

**Dùng cho trường khác trên OneUni:** đổi `URL_UNI` + `SCHOOL_CODE` (username
OneUni có dạng `<MSSV><USER_TYPE><SCHOOL_CODE>`).

---

## 5. Endpoint (cho nhà phát triển)

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/link` | Body JSON `{ mssv, password }` → `{ name, httpsUrl, webcalUrl }`. Login thử để xác thực. |
| `GET`  | `/api/calendar?token=<enc>` | Trả `text/calendar`. Tuỳ chọn `&from=YYYY-MM-DD&to=YYYY-MM-DD`. |

### Kiến trúc

Stateless, hợp serverless: `/api/link` mã hoá `{username,password}` (AES-256-GCM,
khoá = SHA-256 của `ENCRYPTION_KEY`) vào URL. `/api/calendar` giải mã → **login
tươi mỗi lần gọi** → lấy lịch → trả `.ics`. Token OneUni sống 30 phút nên luôn
login lại, không cần lưu state.

### API OneUni (ASCVN)

- **Token:** `POST https://mobile.oneuni.com.vn/AUTH/connect/token` — OAuth2
  password grant. Field `url_uni` route request về hệ thống của trường (bắt buộc).
- **Dữ liệu:** `POST <url_uni>api/v1/SinhVien/LichHocLichThi` kèm `Bearer` token,
  `loaiLich: 0` = cả học lẫn thi. Server tự biết SV qua token.

### Bảng tiết → giờ (IUH)

Response **không có giờ đồng hồ**, chỉ có `tietHocThi` dạng text → map bằng bảng
cố định trong [`src/utils/transIntoTime.js`](src/utils/transIntoTime.js). Học và
thi khác giờ:

- **Học:** mỗi tiết 50 phút. `Tiết a - b` → start = giờ bắt đầu tiết `a`,
  end = giờ bắt đầu tiết `b` + 50′. VD `Tiết 1 - 3` → **06:30–09:00**.
- **Thi:** start theo bảng riêng (60′ / 90′) theo tiết đầu; end = start + số phút
  thi (từ `chiTiets`). VD thi 60′ `Tiết 5 - 6` → **10:10–11:10**.

### Cert TLS

`sv.iuh.edu.vn` chỉ gửi leaf cert, **thiếu intermediate CA** → Node báo
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Không tắt verify: đã nạp intermediate
`RapidSSL TLS RSA CA G1` ([`src/certs/rapidssl-intermediate.pem`](src/certs/rapidssl-intermediate.pem))
làm CA cho undici Agent, kèm root mặc định của Node — verify **vẫn bật**
(`rejectUnauthorized: true`), chỉ áp cho host dữ liệu. Chuỗi:
leaf → `RapidSSL TLS RSA CA G1` → `DigiCert Global Root G2` (có sẵn trong Node).

Nếu trường xoay cert sang CA khác, tải intermediate mới:
```bash
openssl s_client -connect sv.iuh.edu.vn:443 -servername sv.iuh.edu.vn </dev/null 2>/dev/null \
  | openssl x509 -noout -ext authorityInfoAccess         # đọc CA Issuers URL
curl -s <CA-Issuers-URL> | openssl x509 -inform DER -out src/certs/rapidssl-intermediate.pem
```

---

## 6. CI/CD

GitHub Actions chạy **lint + test** trên mọi push/PR vào `main`, và **chỉ deploy
production khi test xanh**.

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — lint + test (mọi
  input/output: crypto, mapper tiết→giờ, ICS, validation route).
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — job `deploy`
  `needs: test`, deploy bằng Vercel CLI. Auto Git-deploy của Vercel đã tắt trong
  [`vercel.json`](vercel.json) (`git.deploymentEnabled.main = false`) để workflow
  là đường deploy **duy nhất** (không double-deploy).

Chạy test local:
```bash
yarn test        # node --test, không cần thêm dependency
```

**Secrets cần set** (GitHub repo → Settings → Secrets and variables → Actions):

| Secret | Lấy ở đâu |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | chạy `vercel link` local → đọc `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | như trên |

> `ENCRYPTION_KEY` / `CLIENT_SECRET` khi chạy runtime vẫn set trong **Vercel**
> Environment Variables (không phải GitHub Secrets). GitHub chỉ cần secret để
> deploy; test dùng giá trị giả trong workflow.

## Liên hệ

Vấn đề hoặc góp ý: mở GitHub Issue.
