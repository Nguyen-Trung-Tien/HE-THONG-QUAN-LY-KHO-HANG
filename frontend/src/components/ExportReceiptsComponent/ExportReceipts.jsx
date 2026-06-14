import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchExportReceipts,
  createExportReceipt,
  updateExportReceipt,
  deleteExportReceipt,
} from "../../API/exportReceiptsApi/exportReceiptsApi";
import { getAllShippers } from "../../API/shipper/shipperApi";
import { fetchAllCustomers } from "../../API/customer/customerApi";
import { getAllStock } from "../../API/stock/stockAPI";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// Common Components
import Button from '../common/Button';
import Input from '../common/Input';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import ExportExcel from '../common/ExportExcel';
import ExportPDF from '../common/ExportPDF';
import { 
  FiPlus, FiSearch, FiTruck, FiUser, FiCalendar, FiFileText, 
  FiPackage, FiAlertCircle, FiCheckCircle, FiClock, FiTrash2, FiPlusCircle, FiInfo, FiCamera 
} from "react-icons/fi";
import { cn } from "../../utils/cn";
import QRScannerModal from "../common/QRScannerModal";

export default function ExportReceipts() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const isAccountant = currentUser?.role === "accountant";
  const [receipts, setReceipts] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [form, setForm] = useState({
    customerId: "",
    shipperId: "",
    export_date: "",
    status: "pending",
    note: "",
    items: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScanIndex, setActiveScanIndex] = useState(null);
  const itemsPerPage = 10;

  const loadData = useCallback(async (page = currentPage, searchQuery = search) => {
    setLoading(true);
    try {
      const [res, shippersRes, customersRes, stocksRes] = await Promise.all([
        fetchExportReceipts({ page, limit: itemsPerPage, search: searchQuery }),
        getAllShippers(),
        fetchAllCustomers(1, 1000),
        getAllStock(1, 1000)
      ]);

      if (res.data.success) {
        setReceipts(res.data.receipts || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
      }
      setShippers(shippersRes || []);
      setCustomers(customersRes?.data?.customers || []);
      setStocks(stocksRes?.data || []);
    } catch {
      toast.error("Lỗi Server 500");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const pending = receipts.filter(r => r.status === 'pending').length;
    const shipping = receipts.filter(r => r.status === 'shipping').length;
    const delivered = receipts.filter(r => r.status === 'delivered').length;
    return [
      { label: "Chờ xử lý", value: pending, color: "text-warning", bg: "bg-warning/10", icon: <FiClock /> },
      { label: "Đang giao", value: shipping, color: "text-primary", bg: "bg-primary/10", icon: <FiTruck /> },
      { label: "Hoàn tất", value: delivered, color: "text-success", bg: "bg-success/10", icon: <FiCheckCircle /> },
      { label: "Tổng phiếu", value: receipts.length, color: "text-info", bg: "bg-info/10", icon: <FiFileText /> },
    ];
  }, [receipts]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: "", quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const handleScanSuccess = (scannedText) => {
    try {
      let productId = null;
      try {
        const parsed = JSON.parse(scannedText);
        productId = Number(parsed.id);
      } catch (err) {
        productId = Number(scannedText);
      }

      if (isNaN(productId) || !productId) {
        toast.error("Mã QR không hợp lệ");
        return;
      }

      const selectedProduct = stocks.find((s) => s.id === productId);
      if (!selectedProduct) {
        toast.error(`Không tìm thấy hàng hóa với ID: ${productId}`);
        return;
      }

      if (selectedProduct.stock <= 0) {
        toast.error(`Sản phẩm ${selectedProduct.name} đã hết hàng trong kho!`);
        return;
      }

      handleItemChange(activeScanIndex, "productId", productId);
      toast.success(`Đã chọn: ${selectedProduct.name}`);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi quét mã");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isAccountant) {
      toast.error("Tài khoản Kế toán không có quyền lập hoặc sửa phiếu!");
      return;
    }
    if (form.items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm!");
      return;
    }

    try {
      const payload = {
        ...form,
        customerId: Number(form.customerId),
        shipperId: form.shipperId ? Number(form.shipperId) : null,
        userId: currentUser.id,
        exportDetailData: form.items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }))
      };

      if (isEditing) await updateExportReceipt(editId, payload);
      else await createExportReceipt(payload);

      toast.success(isEditing ? "Cập nhật thành công!" : "Tạo phiếu thành công!");
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Thao tác thất bại!");
    }
  };

  const handleEdit = (item) => {
    setForm({
      customerId: item.customerId,
      shipperId: item.shipperId || "",
      export_date: item.export_date ? item.export_date.split("T")[0] : "",
      status: item.status,
      note: item.note || "",
      items: item.exportDetailData ? item.exportDetailData.map(d => ({
        productId: d.productId,
        quantity: d.quantity
      })) : []
    });
    setIsEditing(true);
    setEditId(item.id);
    setShowModal(true);
  };

  const columns = [
    {
      title: 'Mã phiếu',
      key: 'id',
      className: 'w-24 text-center font-black text-primary uppercase tracking-tighter',
      render: (id) => <span>#{id}</span>
    },
    {
      title: 'Ngày xuất',
      key: 'export_date',
      render: (date) => <span className="text-xs font-bold text-text-secondary">{new Date(date).toLocaleDateString("vi-VN")}</span>
    },
    {
      title: 'Khách hàng',
      key: 'customerData',
      render: (customer) => (
        <div className="flex items-center gap-x-2">
           <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <FiUser size={14} />
           </div>
           <span className="font-bold text-text-primary uppercase tracking-tight truncate max-w-[150px]">{customer?.name || "N/A"}</span>
        </div>
      )
    },
    {
      title: 'Hàng hóa',
      key: 'exportDetailData',
      render: (details) => (
        <span className="text-[10px] font-black bg-bg-subtle/50 dark:bg-white/5 px-2 py-1 rounded-lg border border-border/50 dark:border-dark-border/40">
           {details?.length || 0} mục
        </span>
      )
    },
    {
      title: 'Shipper',
      key: 'shipperData',
      render: (shipper) => (
        <div className="flex items-center gap-x-2">
           <FiTruck className="text-text-tertiary" />
           <span className="text-xs font-medium text-text-secondary">{shipper?.name || "Chưa gán"}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (status) => {
        const variants = {
          pending: "warning",
          shipping: "primary",
          delivered: "success",
          cancelled: "error"
        };
        const labels = {
          pending: "Chờ xử lý",
          shipping: "Đang giao",
          delivered: "Hoàn tất",
          cancelled: "Đã hủy"
        };
        return <Badge variant={variants[status] || "neutral"} size="sm">{labels[status] || status}</Badge>
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: (_, r) => (
        <div className="flex justify-end gap-x-1 scale-90 origin-right">
          <Button 
            variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-xl"
            onClick={() => handleEdit(r)}
            title={isAccountant ? "Xem chi tiết" : "Sửa"}
          >
             {isAccountant ? (
               <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
             ) : (
               <FiFileText className="size-4" />
             )}
          </Button>
          {!isAccountant && (
            <Button 
              variant="ghost" size="icon" className="text-error hover:bg-error/10 rounded-xl"
              onClick={() => {
                if (currentUser.role !== "admin") {
                  toast.warning("Chỉ Admin mới có quyền xóa!");
                  return;
                }
                setSelectedReceiptId(r.id);
                setIsDeleteModalOpen(true);
              }}
              title="Xóa"
            >
               <FiTrash2 className="size-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Nghiệp vụ</Badge>
          <h1 className="heading-1">
            Quản Lý Xuất Kho
          </h1>
          <p className="subheading">Theo dõi hàng hóa rời kho và phân phối</p>
        </div>
        <div className="flex flex-wrap gap-2 scale-90 sm:scale-100 origin-right">
          <ExportPDF
            data={receipts}
            allData={receipts}
            fileName="Danh_sach_phieu_xuat"
            title="Danh sách phiếu xuất kho"
            columns={[
              { key: "id", header: "Ma phieu" },
              { key: "export_date", header: "Ngay xuat" },
              { key: "customerData.name", header: "Khach hang" },
              { key: "shipperData.name", header: "Shipper" },
              { key: "status", header: "Trang thai" },
            ]}
          />
          {!isAccountant && (
            <Button
              onClick={() => {
                setForm({ 
                  customerId: "", 
                  shipperId: "", 
                  export_date: new Date().toISOString().split("T")[0], 
                  status: "pending", 
                  note: "",
                  items: []
                });
                setIsEditing(false);
                setShowModal(true);
              }}
              variant="primary"
              className="rounded-xl shadow-primary/30 h-11 px-8"
              leftIcon={<FiPlusCircle className="size-5" />}
            >
              Lập phiếu mới
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border/40 dark:border-dark-border/40 shadow-soft-xl group hover:shadow-soft-2xl transition-all duration-500">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-text-primary tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card noPadding className="shadow-soft-2xl border-border/40 dark:border-dark-border/40 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-subtle/20 dark:bg-white/[0.01]">
          <div className="w-full md:w-96">
            <Input
              placeholder="Tìm mã phiếu, khách hàng hoặc ghi chú..."
              value={search}
              onChange={handleSearchChange}
              className="h-11"
              leftIcon={<FiSearch size={18} />}
            />
          </div>
          <div className="flex items-center gap-x-2">
            <ExportExcel
              data={receipts}
              allData={receipts}
              fileName="Danh_sach_phieu_xuat"
              sheetName="PhieuXuat"
              columns={[
                { key: "id", header: "Mã phiếu" },
                { key: "export_date", header: "Ngày xuất" },
                { key: "customerData.name", header: "Khách hàng" },
                { key: "shipperData.name", header: "Shipper" },
                { key: "status", header: "Trạng thái" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={receipts} 
            loading={loading} 
            emptyMessage="Hệ thống không tìm thấy phiếu xuất nào phù hợp"
          />
        </div>

        <div className="p-8 border-t border-border/40 dark:border-dark-border/40 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          try {
            await deleteExportReceipt(selectedReceiptId);
            toast.success("Hệ thống đã xóa phiếu xuất và hoàn tồn kho!");
            loadData();
          } catch {
            toast.error("Thao tác xóa thất bại!");
          }
          setIsDeleteModalOpen(false);
        }}
        title="Xác nhận xóa dữ liệu"
        message="Dữ liệu phiếu xuất sẽ bị gỡ bỏ hoàn toàn. Hệ thống sẽ tự động hoàn lại số lượng tồn kho cho các sản phẩm trong phiếu này."
        confirmText="Xác nhận gỡ bỏ"
        variant="danger"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? `Chi tiết phiếu xuất #${editId}` : "Khởi tạo xuất kho"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="h-11 px-6 rounded-xl">Đóng</Button>
            {!isAccountant && (
              <Button variant="primary" onClick={handleSubmit} className="h-11 px-10 shadow-primary/30 rounded-xl">
                {isEditing ? "Cập nhật dữ liệu" : "Xác nhận xuất kho"}
              </Button>
            )}
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          {/* Section 1: General Info */}
          <div className="bg-bg-subtle/30 dark:bg-white/5 p-6 rounded-3xl border border-border/40 dark:border-white/5">
            <div className="flex items-center gap-x-2 mb-4 text-primary">
              <FiInfo className="size-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Thông tin chung</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                  <span>Khách hàng *</span>
                  <div className="size-1 rounded-full bg-primary/40" />
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  required
                  disabled={isAccountant}
                  className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl h-11 px-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold disabled:opacity-60"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                  <span>Shipper phụ trách</span>
                </label>
                <select
                  name="shipperId"
                  value={form.shipperId}
                  onChange={handleChange}
                  disabled={isAccountant}
                  className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl h-11 px-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold disabled:opacity-60"
                >
                  <option value="">-- Tự do / Chưa gán --</option>
                  {shippers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>
              <Input
                label="Ngày xuất hàng"
                type="date"
                name="export_date"
                value={form.export_date}
                onChange={handleChange}
                required
                disabled={isAccountant}
                className="h-11"
                leftIcon={<FiCalendar />}
              />
            </div>
          </div>

          {/* Section 2: Product Items */}
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-x-2 text-primary">
                  <FiPackage className="size-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Danh sách hàng hóa</h4>
                </div>
                 {!isAccountant && (
                   <Button 
                     type="button" variant="ghost" size="sm" 
                     onClick={handleAddItem}
                     className="text-primary hover:bg-primary/10 rounded-xl"
                     leftIcon={<FiPlus />}
                   >
                     Thêm mặt hàng
                   </Button>
                 )}
             </div>

             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {form.items.map((item, index) => {
                  const selectedStock = stocks.find(s => s.id === Number(item.productId));
                  return (
                    <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-bg-subtle/20 dark:bg-white/[0.02] border border-border/40 dark:border-white/5 items-end animate-in fade-in slide-in-from-left-2">
                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-[9px] font-black text-text-tertiary uppercase ml-2 tracking-widest flex items-center justify-between">
                          <span>Chọn sản phẩm</span>
                          {!isAccountant && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveScanIndex(index);
                                setIsScannerOpen(true);
                              }}
                              className="text-[9px] text-primary hover:text-primary/80 font-black tracking-widest uppercase hover:underline flex items-center gap-1 cursor-pointer"
                              title="Quét mã QR chọn hàng"
                            >
                              <FiCamera className="size-3" /> Quét QR
                            </button>
                          )}
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          disabled={isAccountant}
                          className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-10 px-4 outline-none font-bold disabled:opacity-60"
                        >
                          <option value="">-- Chọn sản phẩm trong kho --</option>
                          {stocks.map((s) => (
                            <option key={s.id} value={s.id} disabled={s.stock <= 0}>
                              {s.name} (Tồn: {s.stock} {s.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                         <Input
                           label="Số lượng"
                           type="number"
                           min="1"
                           max={selectedStock?.stock || 9999}
                           value={item.quantity}
                           onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                           disabled={isAccountant}
                           className="h-10"
                         />
                      </div>
                      {!isAccountant && (
                        <Button 
                          type="button" variant="ghost" size="icon" 
                          onClick={() => handleRemoveItem(index)}
                          className="text-error/60 hover:text-error hover:bg-error/10 mb-0.5 rounded-lg"
                        >
                           <FiTrash2 size={16} />
                        </Button>
                      )}
                    </div>
                  )
                })}
                {form.items.length === 0 && (
                  <div className="text-center py-10 rounded-3xl border-2 border-dashed border-border/40 dark:border-white/5 opacity-40">
                     <FiPackage size={32} className="mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Chưa có sản phẩm nào được chọn</p>
                  </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40 dark:border-white/5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                <span>Tiến độ thực hiện</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isAccountant}
                className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl h-11 px-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold disabled:opacity-60"
              >
                <option value="pending">Chờ xử lý (Lưu kho)</option>
                <option value="shipping">Đang vận chuyển</option>
                <option value="delivered">Đã giao hàng thành công</option>
                <option value="cancelled">Hủy phiếu xuất</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                <span>Ghi chú nghiệp vụ</span>
              </label>
              <textarea
                name="note"
                placeholder="Lý do xuất, yêu cầu đặc biệt…"
                value={form.note}
                onChange={handleChange}
                disabled={isAccountant}
                rows="2"
                className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl py-3 px-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold resize-none disabled:opacity-60"
              />
            </div>
          </div>
        </form>
      </Modal>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
