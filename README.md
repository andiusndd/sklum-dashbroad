# SKLUM Standalone Dashboard

Dashboard thuần (Pure HTML/JS) kết nối Google Sheets API thông qua Node.js proxy.

## 🚀 Khởi động nhanh

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Chạy Server**:
   ```bash
   npm start
   ```
   Sau đó truy cập: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc thư mục

- `index.html`: Giao diện Dashboard (HTML/CSS/JS thuần).
- `server.js`: Node.js server xử lý lấy dữ liệu từ Google Sheets API.
- `.env.local`: Chứa thông tin cấu hình và thông tin Service Account của Google.

## 🛠 Cách hoạt động

1. Khi truy cập trang web, `index.html` sẽ gửi yêu cầu lấy dữ liệu tới `/api/data`.
2. `server.js` đọc cấu hình từ `.env.local`, sử dụng thư viện `googleapis` để lấy dữ liệu từ Google Sheet.
3. Dữ liệu được trả về dưới dạng JSON và `index.html` sẽ cập nhật giao diện (Bảng, Biểu đồ, Metrics).

---
*Ghi chú: Project này đã được chuyển đổi từ Next.js sang "Code thuần" để tăng tốc độ cài đặt và dễ dàng chỉnh sửa trực tiếp.*
