import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getAllImportReceipts,
  createImportReceipt,
  updateImportReceipt,
  deleteImportReceipt,
} from "../../API/importReceiptApi/importReceiptApi";
import { getManySupplier } from "../../API/suppliersApi/suppliersApi";
import { getStockProduct } from "../../API/stock/stockAPI";
import { useLocation } from "react-router-dom";
import ReceiptTable from "./ReceiptTable";
import ReceiptFormModal from "./ReceiptFormModal";

// Common Components
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import ConfirmModal from "../common/ConfirmModal";
import Pagination from "../common/Pagination";
import ExportExcel from "../common/ExportExcel";
import ExportPDF from "../common/ExportPDF";
import Badge from "../common/Badge";
import { FiPlus, FiSearch, FiFileText } from "react-icons/fi";
import { cn } from "../../utils/cn";

const CURRENCY_UNIT = "VND";

export default function ImportReceipt() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const isAccountant = currentUser?.role === "accountant";

  const [receipts, setReceipts] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [receiptFormData, setReceiptFormData] = useState({
    id: null,
    supplierData: null,
    import_date: "",
    note: "",
    details: [],
    userId: null,
    userName: "",
    userEmail: "",
    userRole: "",
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openForm) {
      setShowReceiptForm(true);
    }
  }, [location]);

  const fetchReceipts = useCallback(
    async (page = currentPage, search = searchQuery) => {
      setLoading(true);
      try {
        const res = await getAllImportReceipts({
          page,
          limit: itemsPerPage,
          search,
        });
        if (res.success) {
          setReceipts(res.receipts || []);
          setTotalPages(res.totalPages || 1);
          setCurrentPage(res.currentPage || 1);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu phiếu nhập");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchQuery, itemsPerPage],
  );

  const fetchStockProducts = useCallback(async () => {
    try {
      const stocks = await getStockProduct();
      const products = stocks.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        stock: item.stock,
        price: Number(item.price) || 0,
        type: item.type,
        status: item.status,
        warehouseAddress: item.warehouseAddress,
        supplierId: item.supplierId,
        supplierName: item.supplierName,
      }));
      setProductOptions(products);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await getManySupplier();
      setSupplierOptions([...new Map(data.map((s) => [s.name, s])).values()]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
    fetchSuppliers();
    fetchStockProducts();
  }, [fetchReceipts, fetchSuppliers, fetchStockProducts]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReceiptDelete = async () => {
    try {
      await deleteImportReceipt(selectedReceiptId);
      toast.success("Xóa phiếu nhập thành công!");
      fetchReceipts();
    } catch {
      toast.error(`Xóa phiếu nhập thất bại`);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedReceiptId(null);
    }
  };

  const openReceiptForm = (receipt = null) => {
    if (!currentUser || !currentUser.id) {
      toast.warning("Vui lòng đăng nhập lại!");
      return;
    }

    if (receipt) {
      setReceiptFormData({
        id: receipt.id,
        supplierData: receipt.supplierData || null,
        import_date: receipt.import_date?.split("T")[0] || "",
        note: receipt.note || "",
        details:
          receipt.importDetailData?.map((item) => ({
            productId: item.productId || "",
            StockProductData: item.StockProductData || { name: "", unit: "" },
            quantity: item.quantity || 1,
            price: item.price || 0,
            batchNumber: item.batchNumber || "",
            expiryDate: item.expiryDate?.split("T")[0] || "",
          })) || [],
        userId: receipt.userId || currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userEmail: currentUser.email,
      });
    } else {
      setReceiptFormData({
        id: null,
        supplierData: null,
        import_date: new Date().toISOString().split("T")[0],
        note: "",
        details: [
          {
            productId: "",
            StockProductData: { name: "", unit: "" },
            quantity: 1,
            price: 0,
            batchNumber: "",
            expiryDate: "",
          },
        ],
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userEmail: currentUser.email,
        userRole: currentUser.role,
      });
    }

    setShowReceiptForm(true);
  };

  const handleFormChange = (field, value) => {
    if (field === "userId") value = value ? Number(value) : null;

    if (field === "supplierData") {
      setReceiptFormData((prev) => {
        const updatedDetails = prev.details.map((d) => {
          if (
            value &&
            d.StockProductData?.supplierId &&
            d.StockProductData.supplierId !== value.id
          ) {
            return {
              ...d,
              productId: "",
              StockProductData: { name: "", unit: "" },
              price: 0,
            };
          }
          return d;
        });
        return { ...prev, [field]: value, details: updatedDetails };
      });
      return;
    }
    setReceiptFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (index, fieldOrObject, value) => {
    setReceiptFormData((prev) => {
      const newDetails = [...prev.details];
      let updatedDetail = { ...newDetails[index] };

      if (typeof fieldOrObject === "object") {
        updatedDetail = { ...updatedDetail, ...fieldOrObject };
      } else {
        updatedDetail[fieldOrObject] = value;
      }

      let newSupplierData = prev.supplierData;
      const productId = updatedDetail.productId;
      if (productId) {
        const product =
          updatedDetail.StockProductData ||
          productOptions.find((p) => p.id === productId);
        if (
          product?.supplierId &&
          (!newSupplierData || newSupplierData.id !== product.supplierId)
        ) {
          const autoSupplier = supplierOptions.find(
            (s) => s.id === product.supplierId,
          );
          if (autoSupplier) {
            newSupplierData = autoSupplier;
          }
        }
      }

      newDetails[index] = updatedDetail;
      return { ...prev, details: newDetails, supplierData: newSupplierData };
    });
  };

  const addReceiptDetail = () =>
    setReceiptFormData({
      ...receiptFormData,
      details: [
        ...receiptFormData.details,
        {
          productId: "",
          StockProductData: { name: "", unit: "" },
          quantity: 1,
          price: 0,
          batchNumber: "",
          expiryDate: "",
        },
      ],
    });

  const removeReceiptDetail = (index) => {
    const newDetails = [...receiptFormData.details];
    newDetails.splice(index, 1);
    setReceiptFormData({ ...receiptFormData, details: newDetails });
  };

  const handleReceiptSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isAccountant) {
      toast.error("Tài khoản Kế toán không có quyền lập hoặc sửa phiếu!");
      return;
    }
    setFormLoading(true);

    const { supplierData, import_date, userId, details, note } =
      receiptFormData;

    // Validation
    if (!supplierData?.id) {
      toast.error("Vui lòng chọn nhà cung cấp");
      setFormLoading(false);
      return;
    }
    if (!import_date) {
      toast.error("Vui lòng chọn ngày nhập");
      setFormLoading(false);
      return;
    }
    if (details.length === 0) {
      toast.error("Phiếu nhập phải có ít nhất một mặt hàng");
      setFormLoading(false);
      return;
    }

    const invalidDetail = details.find(
      (d) => !d.productId || !d.quantity || Number(d.quantity) <= 0,
    );
    if (invalidDetail) {
      toast.info(
        "Vui lòng kiểm tra lại thông tin các mặt hàng (Mã SP, Số lượng > 0)",
      );
      setFormLoading(false);
      return;
    }

    const payload = {
      supplierId: supplierData.id,
      userId: userId || currentUser?.id,
      import_date: import_date,
      note: note || "Nhập kho hàng hóa",
      details: details.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: String(item.price),
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate || null,
      })),
    };

    if (!payload.userId) {
      toast.error(
        "Không tìm thấy thông tin người lập phiếu. Vui lòng đăng nhập lại.",
      );
      setFormLoading(false);
      return;
    }

    try {
      if (receiptFormData.id) {
        await updateImportReceipt(receiptFormData.id, payload);
        toast.success("Cập nhật phiếu nhập thành công!");
      } else {
        await createImportReceipt(payload);
        toast.success("Tạo phiếu nhập thành công!");
      }
      setShowReceiptForm(false);
      fetchReceipts();
    } catch (err) {
      console.error("Submit Error:", err);
      const errorMsg =
        err.response?.data?.error || err.message || "Lỗi không xác định";
      toast.error(`Lỗi khi lưu phiếu nhập: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const calculateTotalCost = (details) =>
    `${details
      .reduce((sum, r) => sum + r.quantity * r.price, 0)
      .toLocaleString("vi-VN")} ${CURRENCY_UNIT}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Nghiệp vụ</Badge>
          <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase leading-none">
            Phiếu Nhập Kho
          </h2>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-1">Quản lý dòng hàng hóa nhập vào hệ thống</p>
        </div>
        <div className="flex flex-wrap gap-2 scale-90 sm:scale-100 origin-right relative z-50">
          <ExportPDF
            data={receipts}
            allData={receipts}
            fileName="Danh_sach_phieu_nhap"
            title="Danh sách phiếu nhập kho"
            columns={[
              { key: "id", header: "Ma phieu" },
              { key: "import_date", header: "Ngay nhap" },
              { key: "supplierData.name", header: "Nha cung cap" },
              { key: "userData.email", header: "Nguoi lap" },
              { key: "note", header: "Ghi chu" },
            ]}
          />
          <ExportExcel
            data={receipts}
            allData={receipts}
            fileName="Danh_sach_phieu_nhap"
            sheetName="PhieuNhap"
            columns={[
              { key: "id", header: "Mã phiếu" },
              { key: "import_date", header: "Ngày nhập" },
              { key: "supplierData.name", header: "Nhà cung cấp" },
              { key: "userData.email", header: "Người lập" },
              { key: "note", header: "Ghi chú" },
            ]}
          />
          {!isAccountant && (
            <Button
              onClick={() => openReceiptForm()}
              variant="primary"
              className="rounded-xl shadow-primary/30 h-10 px-6"
              leftIcon={<FiPlus className="size-4" />}
            >
              Tạo phiếu mới
            </Button>
          )}
        </div>
      </div>

      <Card noPadding className="shadow-soft-xl border-border/50 dark:border-dark-border/40">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-border/40 dark:border-dark-border/40">
           <div className="hidden md:block">
              <Badge variant="neutral" size="sm" className="bg-bg-subtle/50 dark:bg-dark-card/40 uppercase font-black tracking-widest">
                 Tổng cộng: {receipts.length} phiếu
              </Badge>
           </div>
          <div className="w-full md:w-80">
            <Input
              placeholder="Tìm kiếm phiếu nhập..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10"
              leftIcon={<FiSearch size={18} />}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <ReceiptTable
            receipts={receipts}
            handleEdit={openReceiptForm}
            handleDelete={(id) => {
              if (currentUser.role !== "admin") {
                toast.warning("Chỉ Admin mới có quyền xóa!");
                return;
              }
              setSelectedReceiptId(id);
              setIsDeleteModalOpen(true);
            }}
            loading={loading}
          />
        </div>

        <div className="p-6 border-t border-border/40 dark:border-dark-border/40 flex justify-center">
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
        onConfirm={handleReceiptDelete}
        title="Xác nhận xóa phiếu nhập"
        message="Hành động này sẽ xóa vĩnh viễn phiếu nhập và toàn bộ dữ liệu chi tiết liên quan. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xác nhận xóa"
        variant="danger"
      />

      <ReceiptFormModal
        show={showReceiptForm}
        onClose={() => setShowReceiptForm(false)}
        formData={receiptFormData}
        handleFormChange={handleFormChange}
        handleDetailChange={handleDetailChange}
        addReceiptDetail={addReceiptDetail}
        removeReceiptDetail={removeReceiptDetail}
        handleSubmit={handleReceiptSubmit}
        formLoading={formLoading}
        supplierOptions={supplierOptions}
        productOptions={
          receiptFormData.supplierData
            ? productOptions.filter(
                (p) =>
                  !p.supplierId ||
                  String(p.supplierId) ===
                    String(receiptFormData.supplierData.id),
              )
            : productOptions
        }
        calculateTotalCost={calculateTotalCost}
        CURRENCY_UNIT={CURRENCY_UNIT}
      />
    </div>
  );
}
