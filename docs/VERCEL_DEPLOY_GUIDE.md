# Hướng dẫn thiết lập Environment Variables trên Vercel

Để Dashboard hoạt động sau khi deploy, bạn cần copy các giá trị từ file nội bộ của bạn vào phần **Settings -> Environment Variables** trên dự án Vercel.

### 1. SHEET_ID
Dùng để xác định Google Sheet nào sẽ được đọc dữ liệu.
- **Key:** `SHEET_ID`
- **Value:** (Lấy giá trị từ file `.env.local` tại dòng `SHEET_ID=...`)

### 2. GOOGLE_CREDENTIALS
Dùng để xác thực quyền truy cập vào Google Sheets API.
- **Key:** `GOOGLE_CREDENTIALS`
- **Value:** (Lấy giá trị từ file `.env.local` tại dòng `GOOGLE_CREDENTIALS='...'`. **Lưu ý:** Không copy dấu nháy đơn ở đầu và cuối).

### 3. Quy trình thực hiện
1. Mở dự án trên Vercel.
2. Chọn tab **Settings**.
3. Chọn mục **Environment Variables** ở cột bên trái.
4. Thêm lần lượt 2 biến trên.
5. Nhấn **Redeploy** (trong tab Deployments) để áp dụng cấu hình mới.
