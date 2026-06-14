# 📢 THÔNG BÁO CẬP NHẬT PHIÊN BẢN: SMART WMS v3.6.0

**Phiên bản:** v3.6.0  
**Ngày phát hành:** 14/06/2026  
**Trạng thái:** Sẵn sàng hoạt động (Production-Ready)

---

## 🎯 Giới Thiệu Phiên Bản Mới

Ban quản trị xin trân trọng thông báo phát hành phiên bản **Smart WMS v3.6.0**. Bản cập nhật này tập trung vào tính tự động hóa, tăng tốc độ tác nghiệp của thủ kho bằng công nghệ quét camera di động trực tiếp, nâng cao bảo mật bằng phân quyền chi tiết (RBAC), và thông minh hóa bãi kho bằng sơ đồ trực quan cùng biểu đồ phân tích Pareto ABC.

---

## 🚀 Các Tính Năng & Thay Đổi Lớn (Major Features)

### 1. 📷 Quét Mã QR Di Động (Mobile QR Scanner)
* **Mô tả:** Nhúng trực tiếp camera quét mã vạch/QR lên giao diện web.
* **Tác dụng:** Cắt giảm 80% thời gian tìm hàng thủ công. Chỉ cần đưa nhãn hàng trước camera để tự động tìm kiếm, điền thông tin phiếu nhập, phiếu xuất và đối soát kiểm kho.

### 2. 📅 Tối Ưu Hóa Xuất Kho Theo Lô FIFO/FEFO
* **Mô tả:** Hệ thống tự động phân loại, ưu tiên trừ kho của lô hàng hết hạn trước (**FEFO**) và lô hàng nhập trước đối với hàng không có hạn sử dụng (**FIFO**).
* **Tác dụng:** Giảm thiểu tối đa tình trạng hàng tồn bị hết hạn, lãng phí tài nguyên của doanh nghiệp.

### 3. ⚖️ Quy Trình Kiểm Kho & Tự Động Cân Đối Tồn Kho
* **Mô tả:** Tạo đợt kiểm kho và ghi nhận lượng đếm thực tế. Khi duyệt phiếu kiểm kê, hệ thống tự động bù trừ số lượng chênh lệch trong DB (`Stocks`, `StockBatches`) và chèn log lịch sử hoạt động `ADJUSTMENT`.
* **Tác dụng:** Đảm bảo số liệu tồn kho trên phần mềm luôn khớp 100% với thực tế tại kho bãi.

### 4. 🔒 Phân Quyền Chi Tiết (Granular RBAC)
* **Mô tả:** Phân quyền chặt chẽ giữa hai vai trò nghiệp vụ chính:
  - **Kế toán kho (`accountant`):** Được cấp quyền xem Thống kê báo cáo (`/stats`), nhưng chỉ có quyền Xem chi tiết (Read-only) phiếu nhập/xuất kho. Giao diện tự động khóa tất cả input và ẩn các nút sửa/xóa/lập phiếu mới.
  - **Thủ kho (`keeper`):** Được cấp quyền đầy đủ để lập và xử lý phiếu nhập/xuất/kiểm kho, ẩn hoàn toàn các mục thống kê doanh thu và quản lý nhân sự.

### 5. 🗺️ Sơ Đồ Kho Bento 2D (Visual Shelf Map)
* **Mô tả:** Bản vẽ 2D trực quan thể hiện mặt cắt các Dãy, Kệ, Tầng, Ngăn trong kho. Tô màu tự động biểu diễn tỷ lệ chiếm chỗ để cảnh báo quá tải (>80%).
* **Tác dụng:** Click vào từng ô để quản lý sắp xếp sản phẩm trực quan, giải phóng ngăn kệ trống.

### 6. 🔔 Tự Động Gợi Ý Đặt Hàng (Auto-Reordering)
* **Mô tả:** Hệ thống phát hiện hàng dưới mức tồn tối thiểu (`stock <= minStock`), tự động gom nhóm theo nhà cung cấp và gợi ý số lượng cần đặt.
* **Tác dụng:** Hỗ trợ tạo tự động Phiếu Nhập Nháp chỉ với 1 click, giúp quá trình thu mua hàng diễn ra trơn tru.

### 7. 📊 Phân Tích Pareto ABC & Vòng Quay Kho
* **Mô tả:** Phân loại sản phẩm thành Nhóm A (bán chạy nhất), Nhóm B (trung bình), Nhóm C (bán chậm) dựa trên giá trị xuất kho. Vẽ biểu đồ Pareto combo bar-line sang trọng.
* **Tác dụng:** Đưa ra cảnh báo bố trí kho hàng lệch (e.g. Cảnh báo chuyển hàng Nhóm A về khu vực gần cổng, chuyển hàng Nhóm C lên tầng cao kệ) để rút ngắn quãng đường vận chuyển của thủ kho.

---

## 🛠️ Hướng Dẫn Nâng Cấp Hệ Thống (Upgrade Instructions)

Để nâng cấp hệ thống hiện tại từ v3.5.0 lên v3.6.0, vui lòng thực hiện các bước sau:

### Bước 1: Cập nhật mã nguồn & database trong Backend
1. Mở terminal tại thư mục `backend` và chạy lệnh cập nhật các bảng cơ sở dữ liệu mới (vị trí kho, kiểm kho):
   ```bash
   npx sequelize-cli db:migrate
   ```
2. Khởi động lại server backend:
   ```bash
   npm run start
   ```

### Bước 2: Biên dịch và chạy lại Frontend
1. Cài đặt các thư viện mới (như quét mã camera):
   ```bash
   npm install
   ```
2. Chạy môi trường phát triển (Development):
   ```bash
   npm run dev
   ```
3. (Tùy chọn) Biên dịch bản đóng gói thương mại (Production bundle):
   ```bash
   npm run build
   ```

---

<div align="right">
  <p><strong>Ban Quản Trị Hệ Thống Smart WMS</strong></p>
  <p><em>Bộ phận Kỹ thuật & Nghiệp vụ giải pháp doanh nghiệp</em></p>
</div>
