import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteManyCustomer,
} from "../../API/customer/customerApi";
import { toast } from "react-toastify";
import CustomerTable from "./CustomerTable";
import CustomerModal from "./CustomerModal";
import FilterBar from "./FilterBar";
import { useSelector } from "react-redux";
import AddressAutocomplete from "../AddressAutocomplete";
import ExportExcel from "../common/ExportExcel";
import ExportPDF from "../common/ExportPDF";

// Common Components
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

function Customer() {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteManyModalOpen, setIsDeleteManyModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllCustomers();
      if (res?.data?.errCode === 0) {
        setCustomers(res.data.customers || []);
        setError(null);
      } else {
        setError(res?.data?.errMessage || "Failed to load customers");
      }
    } catch {
          setError(null);
        }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    let data = [...customers];
    if (search) {
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
          c.address?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }
    return data;
  }, [customers, search, statusFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(
    () =>
      filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredCustomers, page, itemsPerPage]
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setForm({ ...customer });
      setIsEditing(true);
    } else {
      setForm({
        id: null,
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (isEditing) {
        await updateCustomer(data);
        toast.success("Cập nhật khách hàng thành công!");
      } else {
        await createCustomer(data);
        toast.success("Tạo khách hàng thành công!");
      }
      fetchCustomers();
      setIsModalOpen(false);
    } catch {
      toast.error("Lỗi khi lưu khách hàng!");
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await deleteCustomer(selectedCustomer.id);
      if (res?.data?.errCode === 0) {
        toast.success("Xóa thành công!");
        fetchCustomers();
      } else {
        toast.error(res?.data?.errMessage || "Xóa thất bại!");
      }
    } catch {
      toast.error("Lỗi khi xóa khách hàng!");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      const res = await deleteManyCustomer(selectedIds);
      if (res?.data?.errCode === 0) {
        toast.success("Xóa thành công!");
        setSelectedIds([]);
        fetchCustomers();
      } else {
        toast.error(res?.data?.errMessage || "Xóa thất bại!");
      }
    } catch {
      toast.error("Xóa thất bại!");
    } finally {
      setIsDeleteManyModalOpen(false);
    }
  };

  const confirmDelete = (customer) => {
    if (currentUser.role !== "admin") {
      toast.warning("Chỉ Admin mới có quyền xóa!");
      return;
    }
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMultiple = () => {
    if (currentUser.role !== "admin") {
      toast.warning("Chỉ Admin mới có quyền xóa!");
      return;
    }
    if (!selectedIds.length) return;
    setIsDeleteManyModalOpen(true);
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id))
      setSelectedIds(prev => prev.filter((x) => x !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0) setSelectedIds([]);
    else setSelectedIds(paginatedCustomers.map((c) => c.id));
  };

  return (
    <div className="flex flex-col gap-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <Badge variant="primary" className="mb-1">Đối tác</Badge>
          <h1 className="heading-1">
            Quản Lý Khách Hàng
          </h1>
          <p className="subheading">Cơ sở dữ liệu khách hàng và giao dịch</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="danger" 
              size="md"
              onClick={confirmDeleteMultiple}
              leftIcon={<svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            >
              Xóa {selectedIds.length} mục
            </Button>
          )}
          <ExportPDF
            data={customers}
            allData={customers}
            fileName="Danh_sach_khach_hang"
            title="Danh sách khách hàng"
            columns={[
              { key: 'id', header: 'Ma KH' },
              { key: 'name', header: 'Ten khach hang' },
              { key: 'email', header: 'Email' },
              { key: 'phoneNumber', header: 'So dien thoai' },
              { key: 'address', header: 'Dia chi' },
            ]}
          />
          <ExportExcel 
            data={customers}
            allData={customers}
            fileName="Danh_sach_khach_hang"
            sheetName="KhachHang"
            columns={[
              { key: 'id', header: 'Mã KH' },
              { key: 'name', header: 'Tên khách hàng' },
              { key: 'email', header: 'Email' },
              { key: 'phoneNumber', header: 'Số điện thoại' },
              { key: 'address', header: 'Địa chỉ' },
            ]}
          />
          <Button 
            variant="primary" 
            size="md"
            onClick={() => handleOpenModal()}
            leftIcon={<svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
          >
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/5 dark:bg-error/10 border border-error/20 text-error rounded-xl flex items-center shadow-sm">
          <svg className="size-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-black uppercase tracking-tight">{error}</span>
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <CustomerTable
        customers={paginatedCustomers}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        onEdit={handleOpenModal}
        onDelete={confirmDelete}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <CustomerModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        form={form}
        onChange={handleChange}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa khách hàng"
        message={`Bạn có chắc muốn xóa khách hàng "${selectedCustomer?.name}"? Hành động này không thể hoàn tác.`}
      />

      <ConfirmModal
        isOpen={isDeleteManyModalOpen}
        onClose={() => setIsDeleteManyModalOpen(false)}
        onConfirm={handleDeleteMultiple}
        title="Xác nhận xóa nhiều khách hàng"
        message={`Bạn có chắc muốn xóa ${selectedIds.length} khách hàng đã chọn? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
export default Customer;
