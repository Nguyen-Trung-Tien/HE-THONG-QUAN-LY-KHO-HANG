import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../API/suppliersApi/suppliersApi";
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
import { FiPlus, FiSearch, FiEdit3, FiTrash2, FiMapPin, FiPhone, FiInfo, FiArrowLeft } from "react-icons/fi";
import { cn } from "../../utils/cn";

function SuppliersPage() {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const editIdRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSuppliers = useCallback(async () => {
      setLoading(true);
      try {
        const res = await getAllSuppliers({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        });
        setSuppliers(res.suppliers || []);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        toast.error(error.message || "Failed to fetch suppliers");
        setSuppliers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }, [currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
      fetchSuppliers();
    }, [fetchSuppliers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateSupplier(editIdRef.current, form);
        toast.success("Cập nhật nhà cung cấp thành công");
      } else {
        await createSupplier(form);
        toast.success("Thêm nhà cung cấp thành công");
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(error.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (supplier) => {
    setForm({
      name: supplier.name || "",
      phoneNumber: supplier.phoneNumber || "",
      address: supplier.address || "",
      description: supplier.description || "",
    });
    setIsEditing(true);
    editIdRef.current = supplier.id;
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await deleteSupplier(selectedSupplier.id);
      toast.success("Xóa thành công");
      fetchSuppliers();
    } catch (error) {
      toast.error(error.message || "Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    }
  };

  const confirmDelete = (supplier) => {
    if (currentUser.role !== "admin") {
      toast.warning("Chỉ Admin mới có quyền xóa!");
      return;
    }
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    {
      title: 'Nhà cung cấp',
      key: 'name',
      render: (name) => (
        <div className="flex flex-col">
           <span className="font-black text-text-primary uppercase tracking-tight line-clamp-1">{name}</span>
           <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest mt-0.5">Supplier Partner</span>
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'phoneNumber',
      render: (phone) => (
        <div className="flex items-center gap-x-2 text-text-secondary">
          <FiPhone size={12} className="text-success/60" />
          <span className="text-xs font-bold">{phone || "-"}</span>
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (address) => (
        <div className="flex items-center gap-x-2 text-text-secondary max-w-[200px]" title={address}>
          <FiMapPin size={12} className="text-error/60 shrink-0" />
          <span className="text-[11px] font-medium truncate italic">{address || "-"}</span>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: (_, supplier) => (
        <div className="flex justify-end gap-x-1 scale-90 origin-right">
          <Button 
            variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-xl"
            onClick={() => handleEdit(supplier)}
            title="Sửa"
          >
            <FiEdit3 className="size-4" />
          </Button>
          <Button 
            variant="ghost" size="icon" className="text-error/60 hover:text-error hover:bg-error/10 rounded-xl"
            onClick={() => confirmDelete(supplier)}
            title="Xóa"
          >
            <FiTrash2 className="size-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Đối tác</Badge>
          <h1 className="heading-1">
            Nhà Cung Cấp
          </h1>
          <p className="subheading">Đối tác và nguồn cung hàng hóa hệ thống</p>
        </div>
        
        <div className="flex flex-wrap gap-2 scale-90 sm:scale-100 origin-right">
          <ExportPDF
            data={suppliers}
            allData={suppliers}
            fileName="Danh_sach_nha_cung_cap"
            title="Danh sách các nhà cung cấp"
            columns={[
              { key: 'id', header: 'Ma NCC' },
              { key: 'name', header: 'Ten nha cung cap' },
              { key: 'phoneNumber', header: 'So dien thoai' },
              { key: 'address', header: 'Dia chi' },
            ]}
          />
          <ExportExcel
            data={suppliers}
            allData={suppliers}
            fileName="Danh_sach_nha_cung_cap"
            sheetName="NhaCungCap"
            columns={[
              { key: 'id', header: 'Mã NCC' },
              { key: 'name', header: 'Tên nhà cung cấp' },
              { key: 'phoneNumber', header: 'Số điện thoại' },
              { key: 'address', header: 'Địa chỉ' },
            ]}
          />
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              setForm({ name: "", phoneNumber: "", address: "", description: "" });
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            leftIcon={<FiPlus className="size-4" />}
            className="rounded-xl shadow-primary/30"
          >
            Thêm đối tác
          </Button>
        </div>
      </div>

      <Card className="shadow-soft-xl border-border/50 dark:border-dark-border/40" noPadding>
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-border/40 dark:border-dark-border/40">
           <div className="hidden md:block">
              <Badge variant="neutral" size="sm" className="bg-bg-subtle/50 dark:bg-white/5 uppercase font-black tracking-widest">
                 Tổng cộng: {suppliers.length} NCC
              </Badge>
           </div>
          <div className="w-full md:w-80">
            <Input
              placeholder="Tìm theo tên hoặc SĐT…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(Page => 1);
              }}
              className="h-10"
              leftIcon={<FiSearch size={18} />}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <Table 
            columns={columns} 
            data={suppliers} 
            loading={loading} 
            emptyMessage="Không tìm thấy nhà cung cấp nào"
          />
        </div>

        <div className="p-6 border-t border-border/40 dark:border-dark-border/40 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Cập nhật đối tác" : "Thêm đối tác cung ứng"}
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {isEditing ? "Lưu thay đổi" : "Tạo nhà cung cấp"}
            </Button>
          </div>
        }
      >
        <form className="flex flex-col gap-y-6 p-2" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-4">
             <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <FiPlus size={32} />
             </div>
             <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] text-center">
                Vui lòng cung cấp đầy đủ thông tin pháp lý của đối tác cung ứng
             </p>
          </div>

          <Input
            label="Tên nhà cung cấp"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ví dụ: Công ty TNHH MTV…"
            className="h-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              value={form.phoneNumber}
              onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="09xx xxx xxx"
              className="h-12"
              leftIcon={<FiPhone />}
            />
            <Input
              label="Địa chỉ trụ sở"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Thành phố, Tỉnh…"
              className="h-12"
              leftIcon={<FiMapPin />}
            />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <label 
              htmlFor="supplier-description"
              className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1"
            >
              <FiInfo className="text-primary/40" />
              <span>Ghi chú hệ thống</span>
            </label>
            <textarea
              id="supplier-description"
              className="w-full bg-bg-subtle/30 dark:bg-white/[0.02] border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl py-3.5 px-5 outline-none focus:bg-white dark:focus:bg-dark-card focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold shadow-inner-sm transition-all duration-300 min-h-[120px] resize-none"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Thông tin thêm về sản phẩm cung cấp, chính sách chiết khấu…"
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Hành động này sẽ xóa vĩnh viễn nhà cung cấp "${selectedSupplier?.name}" khỏi hệ thống. Các dữ liệu liên quan có thể bị ảnh hưởng.`}
        confirmText="Xác nhận xóa"
        variant="danger"
      />
    </div>
  );
}

export default SuppliersPage;
