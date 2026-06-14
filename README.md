# 🚀 Smart WMS v3.6.0 — Hệ Thống Quản Lý Kho Doanh Nghiệp Thông Minh

<div align="center">
  <img src="./public/home.png" alt="Smart WMS Dashboard" width="800" style="border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.3)" />

  <br />

[![Phiên bản](https://img.shields.io/badge/Phiên_bản-3.6.0-0f766e?style=for-the-badge&logo=github)](https://github.com/yourusername/he-thong-quan-ly-kho)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

  <p align="center">
    <strong>Giải pháp quản lý kho bãi thông minh, bảo mật, tự động tối ưu hóa sắp xếp và vận hành bãi kho dành cho doanh nghiệp hiện đại.</strong>
  </p>
</div>

---

## 🌟 Tổng quan hệ thống

**Smart WMS** là hệ thống quản lý kho (Warehouse Management System) thế hệ mới. Trong phiên bản **v3.6.0**, hệ thống đã nâng cấp toàn diện các nghiệp vụ kho tự động hóa cốt lõi, tích hợp quét mã di động trực tiếp và khả năng phân tích biểu đồ Pareto ABC thông minh kết hợp đề xuất bố trí tối ưu hóa không gian lưu trữ thực tế.

---

## ✨ Điểm nổi bật & Tính năng mới trong phiên bản v3.6.0

### 1. 📷 Quét mã QR/Barcode bằng Camera Di Động (Mobile QR Scanner)
- **Tích hợp sâu:** Nhúng trực tiếp camera quét mã thông qua thư viện `html5-qrcode`.
- **Thao tác nhanh:**
  - **Tồn kho:** Quét nhãn để tìm kiếm, lọc nhanh sản phẩm.
  - **Nhập/Xuất kho:** Quét nhãn sản phẩm để điền nhanh vào form chi tiết chứng từ mà không cần gõ bàn phím.
  - **Kiểm kê:** Quét mã vạch trên kệ để nạp tự động thông tin tồn kho hệ thống và điền lượng đếm thực tế.

### 2. 📦 Quản lý Lô Hàng & Chiến Lược FIFO/FEFO Tự Động
- **Quản lý HSD:** Bổ sung số lô (`batchNumber`) và ngày hết hạn (`expiryDate`) trong chi tiết nhập/xuất.
- **Giải thuật phân bổ thông minh:** Khi tạo phiếu xuất, hệ thống tự động tìm kiếm và trừ kho của các lô hàng theo thứ tự ưu tiên:
  - **FEFO (First Expired, First Out):** Ưu tiên xuất lô có hạn dùng gần nhất trước để tránh hàng hết hạn.
  - **FIFO (First In, First Out):** Ưu tiên xuất các lô hàng nhập kho trước đối với hàng không có hạn sử dụng.
- **Tính toàn vẹn:** Khóa và chặn các lô hàng bị lỗi, hàng chờ kiểm định chất lượng để ngăn xuất nhầm.

### 3. 📝 Quy Trình Kiểm Kê & Cân Đối Tồn Kho Tự Động
- **Phiếu kiểm kê (Inventory Count Sheets):** Lập đợt kiểm kê nháp, tự động điền số tồn hiện tại của hệ thống (`systemQty`).
- **Tự động cân đối (Stock Adjustment):** Khi duyệt phiếu kiểm kê, hệ thống tự động tính chênh lệch thừa/thiếu, cập nhật lại số lượng khớp thực tế trong bảng `Stocks` và `StockBatches`, đồng thời chèn log lịch sử hoạt động `ADJUSTMENT` trong cùng một transaction an toàn.

### 4. 🔒 Phân Quyền Người Dùng Chi Tiết (Granular RBAC)
- **Vai trò rõ ràng:**
  - **Thủ kho (keeper):** Thao tác đầy đủ nghiệp vụ nhập/xuất kho và kiểm kê. Ẩn menu thống kê doanh thu và quản trị nhân sự.
  - **Kế toán kho (accountant):** Xem thống kê, báo cáo doanh thu, tồn kho và danh sách hóa đơn. Chỉ được **Xem chi tiết** (Read-only) các phiếu nhập/xuất kho (toàn bộ form điều khiển sẽ khóa `disabled` và ẩn nút Lưu/Xóa để tránh chỉnh sửa số liệu).
  - **Admin / Dev:** Toàn quyền hệ thống.

### 5. 🗺️ Sơ Đồ Kho 2D Trực Quan (Visual Warehouse Bento Map)
- **Mô hình kệ chi tiết:** Quản lý không gian kho theo Dãy (Aisle), Kệ (Rack), Tầng (Shelf), và Ngăn (Bin) với sức chứa (`capacity`).
- **Bản đồ trực quan:** Hiển thị lưới ô 2D Bento Grid tô màu theo tỷ lệ lấp đầy: Xám (Trống), Xanh lá (<50%), Xanh dương (50%-80%), Cam/Đỏ (>80% - Quá tải).
- **Tương tác trực tiếp:** Click vào ngăn kệ để xem sản phẩm đang gán, gán nhanh sản phẩm mới hoặc giải phóng ngăn kệ.

### 6. 🛒 Hệ Thống Tự Động Đề Xuất Đặt Hàng (Auto-Reordering Suggestions)
- **Ngưỡng an toàn động:** Theo dõi hàng hóa dưới ngưỡng an toàn tối thiểu (`stock <= minStock`).
- **Gộp nhóm thông minh:** Gom các sản phẩm thiếu hụt theo **Nhà cung cấp** và tự động tính toán lượng cần đặt thêm (`SuggestedQty = minStock * 3 - stock`).
- **Lập phiếu siêu tốc:** Tạo tự động một **Phiếu Nhập Nháp** trực tiếp và chuyển hướng người dùng về tab Phiếu nhập để phê duyệt cực kỳ mượt mà.

### 7. 📊 Phân Tích Pareto ABC & Chỉ Số Vòng Quay Kho
- **Phân loại ABC:** Tự động phân loại hàng hóa định kỳ theo mức độ quan trọng giá trị tiêu thụ xuất kho: **Nhóm A** (70-80% giá trị), **Nhóm B** (15-20%), **Nhóm C** (5-10%).
- **Biểu đồ Pareto Combo:** Kết hợp cột (Bar) doanh thu và đường (Line) tỷ lệ phần trăm tích lũy chuẩn hóa.
- **Khuyến nghị vị trí (Smart Placement Warnings):** Đưa ra cảnh báo và đề xuất dịch chuyển kệ (e.g. Cảnh báo hàng Nhóm A bán chạy nằm ở vị trí xa Khu C/D -> đề xuất chuyển về vị trí Khu A gần cổng; Cảnh báo hàng Nhóm C bán chậm nằm ở vị trí đắc địa Khu A -> đề xuất chuyển đi).

---

## 🛠️ Công nghệ sử dụng

### Frontend (Modern & Performance)
- **React 19 & Vite:** Sử dụng phiên bản React mới nhất cho hiệu năng vượt trội.
- **Redux Toolkit:** Quản lý state tập trung, đồng nhất cho toàn bộ ứng dụng.
- **Tailwind CSS v4:** Styling hiện đại, bento grid responsive hoàn hảo.
- **Chart.js & react-chartjs-2:** Trực quan hóa dữ liệu và biểu đồ Pareto sinh động.

### Backend (Robust & Scalable)
- **Node.js & Express 5:** Xử lý bất đồng bộ toàn diện.
- **Sequelize ORM:** Quản lý database chuyên nghiệp hỗ trợ transaction nghiệp vụ phức tạp.
- **MySQL:** Lưu trữ dữ liệu an toàn và hiệu suất cao.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js (v20.0.0 trở lên)
- MySQL (v8.0 trở lên)

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Cấu hình DB_URL, JWT_SECRET, PORT trong file .env
npx sequelize-cli db:migrate
npm start
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Ảnh chụp giao diện

|      Sơ đồ kho Bento 2D         |               Biểu đồ Pareto ABC                   |       Đề xuất Đặt hàng          |
| :-----------------------------: | :------------------------------------------------: | :-----------------------------: |
| ![Map Grid](./public/home.png)  | ![ABC Analysis](./public/home.png)                 | ![Reorder](./public/archive.svg)|

---

<div align="center">
  <p>Được thực hiện với ❤️ bởi Nhóm 6 — WMS Enterprise Solution 2026</p>
</div>
