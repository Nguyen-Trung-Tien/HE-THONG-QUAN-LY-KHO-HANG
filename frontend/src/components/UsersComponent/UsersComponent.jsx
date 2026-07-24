import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  DeleteUser,
  GetDetailUser,
  SignUpUser,
  UpdateDetailUser,
} from "../../API/user/userApi";

// Common Components
import Button from '../common/Button';
import Input from '../common/Input';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import Badge from '../common/Badge';
import Card from '../common/Card';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { FiPlus, FiSearch, FiEdit3, FiTrash2, FiUser } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function UsersComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    gender: "Nam",
    status: "Hoạt động",
    address: "",
    phoneNumber: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    status: "All",
    gender: "All",
  });

  const loadUsers = () => {
    setLoading(true);
    GetDetailUser("All")
      .then((res) => {
        if (res.errCode === 0) {
          setUsers(res.users || []);
        } else {
          toast.error(res.errMessage || "Lỗi tải dữ liệu!");
        }
      })
      .catch(() => toast.error("Lỗi tải dữ liệu!"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadUsers(), []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        filters.search === "" ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filters.search.toLowerCase());
      const matchRole = filters.role === "All" || u.role === filters.role;
      const matchStatus = filters.status === "All" || u.status === filters.status;
      const matchGender = filters.gender === "All" || u.gender === filters.gender;
      return matchSearch && matchRole && matchStatus && matchGender;
    });
  }, [users, filters]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const userData = isEditing ? { ...form, id: editId } : form;
    const action = isEditing
      ? UpdateDetailUser(userData)
      : SignUpUser(userData);

    action
      .then((res) => {
        if (res.errCode === 0) {
          toast.success(isEditing ? "Cập nhật thành công!" : "Thêm mới thành công!");
          loadUsers();
          setIsModalOpen(false);
        } else {
          toast.error(res.errMessage || "Đã có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("Đã có lỗi xảy ra!"));
  };

  const handleEdit = (user) => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
      gender: user.gender,
      status: user.status,
      address: user.address,
      phoneNumber: user.phoneNumber,
    });
    setEditId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    DeleteUser(selectedUser.id)
      .then(() => {
        toast.success("Xóa người dùng thành công!");
        loadUsers();
      })
      .catch(() => toast.error("Xóa thất bại!"))
      .finally(() => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      });
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'name',
      render: (_, u) => (
        <div className="flex items-center">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner-sm mr-3">
            {u.firstName?.[0]}{u.lastName?.[0]}
          </div>
          <div>
            <div className="text-xs font-black text-text-primary uppercase tracking-tight">{u.lastName} {u.firstName}</div>
            <div className="text-[10px] text-text-tertiary font-bold">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      key: 'phoneNumber',
      render: (val) => <span className="text-xs font-bold text-text-secondary">{val || "-"}</span>
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: (role) => (
        <Badge variant={role === 'admin' ? 'error' : 'success'} size="sm" className="uppercase tracking-widest">{role}</Badge>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (status) => (
        <Badge variant={status === 'Hoạt động' ? 'success' : 'error'} size="sm">{status}</Badge>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: (_, u) => (
        <div className="flex justify-end gap-x-1 scale-90 origin-right">
          <Button 
            variant="ghost" size="icon" className="text-primary hover:bg-primary/10 transition-all rounded-xl"
            onClick={() => handleEdit(u)}
            title="Chỉnh sửa"
          >
            <FiEdit3 className="size-4" />
          </Button>
          {u.role !== "admin" && (
            <Button 
              variant="ghost" size="icon" className="text-error/60 hover:text-error hover:bg-error/10 transition-colors rounded-xl"
              onClick={() => {
                setSelectedUser(u);
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
    <div className="flex flex-col gap-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-3">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Nhân sự</Badge>
          <h1 className="heading-1">
            Quản Lý Nhân Viên
          </h1>
          <p className="subheading">Tài khoản và phân quyền người dùng</p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setForm({
              firstName: "", lastName: "", email: "", password: "",
              role: "user", gender: "Nam", status: "Hoạt động",
              address: "", phoneNumber: ""
            });
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          leftIcon={<FiPlus />}
        >
          Thêm nhân viên
        </Button>
      </div>

      <Card className="shadow-soft-xl border-border/50 dark:border-dark-border/40" noPadding>
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border/40 dark:border-dark-border/40">
          <div className="flex-1">
            <Input
              name="search"
              placeholder="Tìm kiếm theo tên hoặc email…"
              value={filters.search}
              onChange={handleFilterChange}
              className="h-11"
              leftIcon={<FiSearch />}
            />
          </div>
          <div className="flex gap-2">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-border/40 dark:border-dark-border/40 rounded-xl bg-white dark:bg-dark-card text-[11px] font-black uppercase tracking-widest text-text-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            >
              <option className="dark:bg-dark-card dark:text-text-primary" value="All">Tất cả vai trò</option>
              <option className="dark:bg-dark-card dark:text-text-primary" value="admin">Quản lý</option>
              <option className="dark:bg-dark-card dark:text-text-primary" value="Kế toán">Kế toán</option>
              <option className="dark:bg-dark-card dark:text-text-primary" value="Nhân viên">Nhân viên</option>
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-border/40 dark:border-dark-border/40 rounded-xl bg-white dark:bg-dark-card text-[11px] font-black uppercase tracking-widest text-text-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            >
              <option className="dark:bg-dark-card dark:text-text-primary" value="All">Tất cả trạng thái</option>
              <option className="dark:bg-dark-card dark:text-text-primary" value="Hoạt động">Hoạt động</option>
              <option className="dark:bg-dark-card dark:text-text-primary" value="Bị khóa">Bị khóa</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden">
          <Table 
            columns={columns} 
            data={currentUsers} 
            loading={loading} 
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
        title={isEditing ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="md" onClick={handleSubmit}>
              {isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Họ" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Input label="Tên" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditing && (
              <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            )}
            <Input 
              label={isEditing ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"} 
              type="password" name="password" value={form.password} onChange={handleChange} required={!isEditing} 
              containerClassName={isEditing ? "col-span-2" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Địa chỉ" name="address" value={form.address} onChange={handleChange} />
            <Input label="Số điện thoại" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="form-role" className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                <span>Vai trò</span>
                <div className="size-1 rounded-full bg-primary/40" />
              </label>
              <select id="form-role" name="role" value={form.role} onChange={handleChange} className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-11 px-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold shadow-inner-sm transition-all duration-300">
                <option className="dark:bg-dark-card dark:text-text-primary" value="admin">Quản lý</option>
                <option className="dark:bg-dark-card dark:text-text-primary" value="Kế toán">Kế toán</option>
                <option className="dark:bg-dark-card dark:text-text-primary" value="Nhân viên">Nhân viên</option>
              </select>
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="form-gender" className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                <span>Giới tính</span>
                <div className="size-1 rounded-full bg-primary/40" />
              </label>
              <select id="form-gender" name="gender" value={form.gender} onChange={handleChange} className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-11 px-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold shadow-inner-sm transition-all duration-300">
                <option className="dark:bg-dark-card dark:text-text-primary" value="Nam">Nam</option>
                <option className="dark:bg-dark-card dark:text-text-primary" value="Nữ">Nữ</option>
                <option className="dark:bg-dark-card dark:text-text-primary" value="Khác">Khác</option>
              </select>
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="form-status" className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
                <span>Trạng thái</span>
                <div className="size-1 rounded-full bg-primary/40" />
              </label>
              <select id="form-status" name="status" value={form.status} onChange={handleChange} className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-11 px-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold shadow-inner-sm transition-all duration-300">
                <option className="dark:bg-dark-card dark:text-text-primary" value="Hoạt động">Hoạt động</option>
                <option className="dark:bg-dark-card dark:text-text-primary" value="Bị khóa">Bị khóa</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc muốn xóa nhân viên "${selectedUser?.lastName} ${selectedUser?.firstName}"? Hành động này không thể hoàn tác.`}
        variant="danger"
      />
    </div>
  );
}
