import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllProducts, deleteProduct } from "../../API/products/productsApi";
import { toast } from "react-toastify";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";
import ProductDetail from "./ProductDetail";
import { useSelector } from "react-redux";

// Common Components
import Button from "../common/Button";
import Input from "../common/Input";
import Table from "../common/Table";
import Pagination from "../common/Pagination";
import Badge from "../common/Badge";
import Card from "../common/Card";
import Modal from "../common/Modal";
import ConfirmModal from "../common/ConfirmModal";
import ExportExcel from "../common/ExportExcel";
import ExportPDF from "../common/ExportPDF";
import { cn } from "../../utils/cn";
import { FiPlus, FiSearch, FiEye, FiEdit3, FiTrash2, FiPackage } from "react-icons/fi";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const userRole = useSelector((state) => state.user.role);
  const isAdminOrDev = userRole === "admin" || userRole === "dev";

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(page, 10);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      toast.success("Xóa thành công");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => filter === "Tất cả" || p.status === filter)
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, filter, search]);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => <span className="font-extrabold text-text-tertiary">#{(page - 1) * 10 + index + 1}</span>,
    },
    {
      title: "Sản phẩm",
      key: "name",
      render: (name, row) => (
        <div className="flex items-center space-x-3">
          <div className="size-10 rounded-xl bg-bg-subtle dark:bg-white/5 border border-border/50 dark:border-dark-border/40 p-1 flex items-center justify-center flex-shrink-0">
            {row.image ? (
              <img src={row.image} alt={name} className="size-full object-cover rounded-lg" />
            ) : (
              <FiPackage className="text-primary size-5" />
            )}
          </div>
          <div>
            <p className="font-black text-text-primary dark:text-dark-text-primary text-xs sm:text-sm">{name}</p>
            <p className="text-[10px] font-bold text-text-tertiary uppercase">{row.category || 'Mặc định'}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Giá bán",
      key: "price",
      render: (price) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
          {Number(price || 0).toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      render: (stock, row) => (
        <div className="flex items-center space-x-1.5">
          <span className={cn(
            "font-extrabold text-xs sm:text-sm",
            stock > 10 ? "text-text-primary dark:text-dark-text-primary" : "text-amber-500"
          )}>
            {stock}
          </span>
          <span className="text-[10px] font-bold text-text-tertiary uppercase">{row.unit || 'Cái'}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (status) => (
        <Badge variant={status === "Còn hàng" ? "success" : "error"} size="sm">
          {status || 'Còn hàng'}
        </Badge>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, product) => (
        <div className="flex items-center space-x-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-info hover:bg-info/10 touch-target"
            onClick={() => { setSelectedProduct(product); setIsDetailModalOpen(true); }}
            title="Xem chi tiết"
          >
            <FiEye className="size-4" />
          </Button>
          {isAdminOrDev && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 touch-target"
                onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }}
                title="Chỉnh sửa"
              >
                <FiEdit3 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-error hover:bg-error/10 touch-target"
                onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}
                title="Xóa"
              >
                <FiTrash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/50 dark:border-dark-border/40 shadow-soft-xl">
        <div>
          <Badge variant="primary" className="mb-2">Hệ Thống Kho Hàng</Badge>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary dark:text-dark-text-primary tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mt-0.5">
            Danh mục và trạng thái tồn kho hàng hóa thực tế
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ExportPDF
            data={products}
            fileName="Danh_sach_san_pham"
            title="Danh sách danh mục hàng hóa"
            columns={[
              { key: 'id', header: 'Ma SP' },
              { key: 'name', header: 'Ten san pham' },
              { key: 'category', header: 'Danh muc' },
              { key: 'price', header: 'Gia ban' },
              { key: 'stock', header: 'Ton kho' },
              { key: 'unit', header: 'Don vi' },
              { key: 'status', header: 'Trang thai' },
            ]}
          />
          <ExportExcel
            data={products}
            allData={products}
            fileName="Danh_sach_san_pham"
            sheetName="SanPham"
            columns={[
              { key: 'id', header: 'Mã SP' },
              { key: 'name', header: 'Tên sản phẩm' },
              { key: 'category', header: 'Danh mục' },
              { key: 'price', header: 'Giá bán' },
              { key: 'stock', header: 'Tồn kho' },
              { key: 'unit', header: 'Đơn vị' },
              { key: 'status', header: 'Trạng thái' },
            ]}
          />
          {isAdminOrDev && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<FiPlus className="size-4" />}
            >
              Thêm mới
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-soft-2xl border-border/50 dark:border-dark-border/40" noPadding>
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3 justify-between border-b border-border/40 dark:border-dark-border/40 bg-gradient-to-r from-bg-subtle/20 dark:from-white/[0.01] to-transparent">
          <div className="flex bg-bg-subtle dark:bg-white/5 p-1 rounded-xl w-full md:w-auto border border-border/50 dark:border-dark-border/60">
            {["Tất cả", "Còn hàng", "Hết hàng"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-tight touch-target flex items-center justify-center",
                  filter === tab ? "bg-white dark:bg-dark-card text-primary shadow-sm" : "text-text-secondary dark:text-dark-text-secondary hover:text-text-primary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Tìm theo tên sản phẩm…"
              leftIcon={<FiSearch className="size-4" />}
            />
          </div>
        </div>

        <div className="overflow-hidden p-2 sm:p-4">
          <Table columns={columns} data={filteredProducts} loading={loading} />
        </div>

        <div className="p-4 border-t border-border/40 dark:border-dark-border/40 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Thêm sản phẩm mới" size="md">
        <CreateProduct onSuccess={() => { setIsCreateModalOpen(false); fetchProduct(); }} />
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Chỉnh sửa sản phẩm" size="md">
        <EditProduct productData={selectedProduct} onSuccess={() => { setIsEditModalOpen(false); fetchProduct(); }} />
      </Modal>
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Chi tiết sản phẩm" size="md">
        <ProductDetail productData={selectedProduct} />
      </Modal>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"?`}
      />
    </div>
  );
};

export default ProductList;
