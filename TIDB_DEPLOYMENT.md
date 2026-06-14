# Hướng dẫn kết nối & Triển khai Database lên TiDB Cloud

Tài liệu này hướng dẫn cách kết nối và chạy migrations cho cơ sở dữ liệu MySQL tương thích trên **TiDB Cloud Serverless** với các thông số kết nối của bạn.

---

## 1. Thông tin kết nối TiDB Cloud của bạn

Dưới đây là thông số kết nối của bạn đã được thiết lập sẵn trong hệ thống:

- **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Username**: `oQ2wqkPLNZrFREe.root`
- **Password**: *(Nhập mật khẩu bạn đã tạo trên TiDB Cloud)*
- **Database**: `sys` *(Hoặc tên database tùy chỉnh của bạn)*
- **SSL/TLS Mode**: `REQUIRED` (Bắt buộc)

---

## 2. Cấu hình biến môi trường (Environment Variables)

### Chạy Local (Môi trường phát triển)
Tệp `.env` trong thư mục `backend/` được giữ nguyên để kết nối với database MySQL local (localhost). Bạn có thể tiếp tục chạy thử nghiệm và phát triển local bằng lệnh:
```bash
npm run start
```

### Sử dụng TiDB Cloud ở Local
Để tham chiếu hoặc test kết nối TiDB Cloud ngay tại local mà không làm ảnh hưởng đến tệp `.env` hiện tại, bạn có thể sử dụng tệp **`backend/.env.production`** vừa được tạo. Tệp này chứa cấu hình kết nối trực tiếp đến TiDB Cloud:
```env
DB_PROD_USERNAME=oQ2wqkPLNZrFREe.root
DB_PROD_PASSWORD=gzt66Ah0uCnVNW3j
DB_PROD_NAME=httt
DB_PROD_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PROD_PORT=4000
DB_PROD_DIALECT=mysql
DB_PROD_SSL=true
DB_PROD_SSL_REJECT_UNAUTHORIZED=false
```

> [!NOTE]
> TiDB Cloud yêu cầu kết nối bảo mật SSL. Thiết lập `DB_PROD_SSL=true` và `DB_PROD_SSL_REJECT_UNAUTHORIZED=false` sẽ tự động cấu hình Sequelize sử dụng SSL kết nối mà không cần tải chứng chỉ CA cục bộ về máy.

---

## 3. Khởi tạo Database & Dữ liệu trên TiDB Cloud

Do các tệp migrations trong thư mục `backend/src/migrations` có định dạng tên không đồng nhất (một số tệp bắt đầu bằng chữ như `migrations-Create-...`, một số tệp bắt đầu bằng số như `20260520...`), Sequelize CLI sẽ chạy các tệp này theo thứ tự bảng chữ cái dẫn đến lỗi phụ thuộc bảng (ví dụ: chạy sửa đổi cột trước khi bảng được tạo).

Do đó, phương pháp tối ưu để khởi tạo Database trên TiDB Cloud là:

### Bước 1: Khởi tạo Database và bảng bằng SQL Dump
1. Đăng nhập vào trang quản trị [TiDB Cloud](https://tidbcloud.com/).
2. Chọn Cluster của bạn, mở tab **Chat2Query** (hoặc sử dụng các công cụ kết nối cơ sở dữ liệu như DBeaver, Navicat, TablePlus).
3. Tạo database mới nếu chưa có:
   ```sql
   CREATE DATABASE IF NOT EXISTS httt;
   USE httt;
   ```
4. Thực thi hoặc import các tệp SQL dump nằm trong thư mục [backend/db/](file:///d:/LEARN/HE-THONG-QUAN-LY-KHO/backend/db) vào database `httt` để tạo cấu trúc bảng và nạp dữ liệu mẫu ban đầu.

### Bước 2: Chạy migrations bổ sung (nếu có)
Sau khi đã import các bảng cơ bản từ SQL Dump, các cấu trúc tiếp theo hoặc các thay đổi sau này có thể được đồng bộ bằng lệnh:
```bash
# Sử dụng cấu hình trong .env.production để đồng bộ các thay đổi mới nhất
npx sequelize-cli db:migrate --env production
```

---

## 4. Hướng dẫn Deploy lên Render (Backend)

1. Truy cập [Render Dashboard](https://dashboard.render.com/).
2. Chọn **Blueprints** -> **New Blueprint Instance**.
3. Kết nối với repository GitHub chứa source code này.
4. Render sẽ tự động phát hiện tệp `render.yaml` ở gốc thư mục.
5. Nhập các thông tin biến môi trường còn thiếu (chỉ cần nhập `DB_PROD_PASSWORD` từ TiDB, các biến khác đã được cấu hình mặc định hoặc tự động sinh ra).
6. Nhấn **Approve** để bắt đầu build & deploy.

---

## 5. Hướng dẫn Deploy lên Vercel (Frontend)

1. Truy cập [Vercel Dashboard](https://vercel.com/).
2. Chọn **Add New** -> **Project**.
3. Import repository này.
4. Ở phần **Configure Project**:
   - Thiết lập **Root Directory** là `frontend`.
   - Trong phần **Environment Variables**, thêm biến môi trường sau:
     - **Key**: `VITE_API_URL`
     - **Value**: *(Đường dẫn Web Service của Backend chạy trên Render, ví dụ: `https://httt-quan-ly-kho-backend.onrender.com`)*
5. Nhấn **Deploy**. Cấu hình `vercel.json` sẽ tự động xử lý Client-side Routing cho React Router.
