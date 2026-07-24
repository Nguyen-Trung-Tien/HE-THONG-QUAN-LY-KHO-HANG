import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getAllStock, deleteStock } from "../../API/stock/stockAPI";
import InventoryStatusCard from "./InventoryStatusCard";
import InventoryListCard from "./InventoryListCard";
import AuditLogs from "./AuditLogs";
import { toast } from "react-toastify";
import CreateProduct from "../ProductsComponent/CreateProduct";
import EditProduct from "../ProductsComponent/EditProduct";
import ProductDetail from "../ProductsComponent/ProductDetail";
import QRCodeGenerator from "../QRCodeGenerator";

// Common Components
import Button from '../common/Button';
import Input from '../common/Input';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import Badge from '../common/Badge';
import Card from '../common/Card';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import ExportExcel from '../common/ExportExcel';
import ExportPDF from '../common/ExportPDF';
import { cn } from "../../utils/cn";
import { FiPlus, FiSearch, FiRefreshCw, FiCamera } from "react-icons/fi";
import QRScannerModal from "../common/QRScannerModal";

function Inventory() {
  const userRole = useSelector((state) => state.user.role || state.user.currentUser?.role);
  const isAccountant = userRole === "accountant";

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getAllStock();
      const formatted = (data || []).map((stock) => ({
        ...stock,
        id: stock.id,
        name: stock.name || "Không rõ",
        price: stock.price || 0,
        lastUpdated: stock.updatedAt,
      }));
      setInventoryItems(formatted);
    } catch {
      toast.error("Lỗi khi tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteStock(selectedProduct.id);
      setInventoryItems((prev) => prev.filter((item) => item.id !== selectedProduct.id));
      toast.success("Xóa sản phẩm thành công");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const filteredItems = useMemo(() => {
    return inventoryItems
      .filter((item) => {
        if (activeTab === "all") return true;
        return item.status === activeTab;
      })
      .filter((item) => {
        if (!searchTerm) return true;
        return (
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toString().includes(searchTerm)
        );
      });
  }, [inventoryItems, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, page]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => (page - 1) * itemsPerPage + index + 1,
      className: 'w-16'
    },
    {
      title: 'Sản phẩm',
      key: 'name',
      render: (name, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle dark:bg-white/5 overflow-hidden flex-shrink-0">
             {row.image ? (
               <img src={row.image} alt={name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </div>
             )}
          </div>
          <span className="font-bold text-text-primary uppercase tracking-tight">{name}</span>
        </div>
      )
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (cat) => <Badge variant="neutral" size="sm">{cat || 'N/A'}</Badge>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, item) => {
        const status = item.stock === 0 ? "Hết hàng" : item.stock < 10 ? "Sắp hết" : "Còn hàng";
        const variant = status === "Hết hàng" ? "error" : status === "Sắp hết" ? "warning" : "success";
        return <Badge variant={variant} size="sm">{status}</Badge>;
      }
    },
    {
      title: 'Giá',
      key: 'price',
      render: (price) => <span className="text-[11px] font-black text-primary">{price.toLocaleString()}đ</span>
    },
    {
      title: 'Số lượng',
      key: 'stock',
      render: (stock, row) => <span className="text-[11px] font-bold text-text-primary">{stock} <span className="text-[10px] text-text-tertiary font-medium">{row.unit}</span></span>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: (_, item) => (
        <div className="flex justify-end space-x-0.5 scale-90 origin-right">
          <Button 
            variant="ghost" size="icon" className="text-info hover:bg-info/10" 
            onClick={() => { setSelectedProduct(item); setIsQrModalOpen(true); }}
            title="Mã QR"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </Button>
          <Button 
            variant="ghost" size="icon" className="text-primary hover:bg-primary/10" 
            onClick={() => { setSelectedProduct(item); setIsDetailModalOpen(true); }}
            title="Xem chi tiết"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </Button>
          {!isAccountant && (
            <>
              <Button 
                variant="ghost" size="icon" className="text-primary hover:bg-primary/10" 
                onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }}
                title="Chỉnh sửa"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
              <Button 
                variant="ghost" size="icon" className="text-error hover:bg-error/10 transition-colors" 
                onClick={() => { setSelectedProduct(item); setIsDeleteModalOpen(true); }}
                title="Xóa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-3">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Hàng hóa</Badge>
          <h1 className="heading-1">
            Quản Lý Tồn Kho
          </h1>
          <p className="subheading">Mức độ hàng hóa và vị trí lưu kho hệ thống</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <ExportPDF
            data={inventoryItems}
            fileName="Bao_cao_ton_kho"
            title="Báo cáo tồn kho hàng hóa"
            columns={[
              { key: 'id', header: 'Ma hang' },
              { key: 'name', header: 'Ten san pham' },
              { key: 'category', header: 'Danh muc' },
              { key: 'stock', header: 'So luong' },
              { key: 'unit', header: 'Don vi' },
              { key: 'price', header: 'Gia' },
              { key: 'status', header: 'Trang thai' },
            ]}
          />
          <ExportExcel
            data={inventoryItems}
            allData={inventoryItems}
            fileName="Danh_sach_ton_kho"
            sheetName="TonKho"
            columns={[
              { key: 'id', header: 'Mã hàng' },
              { key: 'name', header: 'Tên sản phẩm' },
              { key: 'category', header: 'Danh mục' },
              { key: 'stock', header: 'Số lượng' },
              { key: 'unit', header: 'Đơn vị' },
              { key: 'price', header: 'Giá' },
              { key: 'status', header: 'Trạng thái' },
              { key: 'supplierName', header: 'Nhà cung cấp' },
            ]}
          />
          {!isAccountant && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<FiPlus />}
              className="rounded-xl shadow-primary/30"
            >
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-soft-xl border-border/50 dark:border-dark-border/40" noPadding>
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-border/40 dark:border-dark-border/40">
          <div className="flex bg-bg-subtle dark:bg-white/5 p-1 rounded-2xl w-full md:w-auto overflow-x-auto border border-border/40 dark:border-dark-border/40 backdrop-blur-sm">
            {["all", "Còn hàng", "Hết hàng"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={cn(
                  "px-6 py-2 text-[10px] font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest",
                  activeTab === tab
                    ? "bg-white dark:bg-dark-card text-primary shadow-soft-md scale-[1.05]"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {tab === "all" ? "Tất cả" : tab}
              </button>
            ))}
          </div>

          <div className="w-full md:w-64">
            <Input
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11"
              leftIcon={<FiSearch size={16} />}
              rightIcon={
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="hover:text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-bg-subtle dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
                  title="Quét mã QR tìm kiếm"
                >
                  <FiCamera size={16} />
                </button>
              }
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <Table 
            columns={columns} 
            data={currentItems} 
            loading={loading} 
          />
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-border/40 dark:border-dark-border/40 gap-3">
          <div className="text-[10px] font-black text-text-tertiary uppercase tracking-wider bg-bg-subtle/50 dark:bg-white/5 px-4 py-2 rounded-xl border border-border/40 dark:border-dark-border/40">
            Hiển thị <span className="text-primary">{currentItems.length}</span> / {filteredItems.length} sản phẩm
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
            className="mt-0"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatusCard inventoryItems={inventoryItems} />
        <InventoryListCard
          inventoryItems={inventoryItems}
        />
      </div>

      <AuditLogs />

      {/* Modals */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Mã QR Sản phẩm"
        size="sm"
      >
        <QRCodeGenerator
          productData={selectedProduct}
          onClose={() => setIsQrModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm sản phẩm mới"
        size="md"
      >
        <CreateProduct onSuccess={() => { setIsCreateModalOpen(false); fetchInventory(); }} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa sản phẩm"
        size="md"
      >
        <EditProduct
          productData={selectedProduct}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => { setIsEditModalOpen(false); fetchInventory(); }}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết sản phẩm"
        size="md"
      >
        <ProductDetail productData={selectedProduct} />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"? Hành động này không thể hoàn tác.`}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          setSearchTerm(code);
          setPage(1);
        }}
      />
    </div>
  );
}

export default Inventory;
