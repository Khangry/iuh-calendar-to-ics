# IUH Calendar to ICS

Ứng dụng này cho phép bạn chuyển đổi lịch học từ hệ thống IUH sang định dạng tệp lịch `.ics` (dùng cho Google Calendar, Outlook, v.v.) hoặc lấy dữ liệu lịch học dưới dạng JSON qua API.

## Tính năng

- Tải lịch học IUH dưới dạng file `.ics` để nhập vào các ứng dụng lịch.
- Truy xuất dữ liệu lịch học IUH dưới dạng JSON qua API.

## Yêu cầu

- Node.js >= 14
- Kết nối Internet

## Cài đặt

```bash
git clone https://github.com/your-repo/iuh-calendar-to-ics.git
cd iuh-calendar-to-ics
npm install
```

## Chạy ứng dụng

```bash
npm start
```

Mặc định ứng dụng chạy tại `http://localhost:3000`.

## Sử dụng

### 1. Tải lịch học dưới dạng file `.ics`

Truy cập đường dẫn sau trên trình duyệt:

```
http://localhost:3000/schedule?k=YOUR_K_VALUE
```

- Thay `YOUR_K_VALUE` bằng mã truy vấn lịch học của bạn (lấy từ hệ thống IUH).
- Tuỳ chọn: Thêm `w` để lấy số tuần (mặc định là 8 tuần).
  - Ví dụ: `http://localhost:3000/schedule?k=YOUR_K_VALUE&w=10`

Kết quả: Trình duyệt sẽ tải về file `LichHoc_IUH.ics`.

### 2. Lấy dữ liệu lịch học dưới dạng JSON

Gửi request GET tới:

```
http://localhost:3000/api?k=YOUR_K_VALUE
```

- Tuỳ chọn: Thêm `w` để lấy số tuần (mặc định là 8 tuần).
  - Ví dụ: `http://localhost:3000/api?k=YOUR_K_VALUE&w=10`

Kết quả: Nhận về dữ liệu JSON chứa thông tin các lớp học.

## Ví dụ

```bash
curl "http://localhost:3000/api?k=abcxyz123&w=8"
```

## Thông tin thêm

- Nếu không cung cấp tham số `k`, hệ thống sẽ báo lỗi.
- Dữ liệu lấy trực tiếp từ hệ thống IUH, cần đảm bảo mã `k` hợp lệ.

## Liên hệ

Nếu có vấn đề hoặc góp ý, vui lòng liên hệ qua GitHub Issues.
