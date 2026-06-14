import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { createInventoryCount } from "../../API/inventoryCountApi/inventoryCountApi";
import { getStockProduct, getStockById } from "../../API/stock/stockAPI";

// Common Components
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import QRScannerModal from "../common/QRScannerModal";

import { FiPlus, FiTrash2, FiCamera } from "react-icons/fi";

export default function InventoryCountFormModal({ isOpen, onClose, onSuccess }) {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [formLoading, setFormLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  
  // Cache for product details (to avoid repeatedly fetching batches)
  const [productDetailsCache, setProductDetailsCache] = useState({});

  const [formData, setFormData] = useState({
    countDate: new Date().toISOString().split("T")[0],
    note: "",
    details: [
      {
        productId: "",
        batchNumber: "",
        actualQty: 0,
        reason: "Kiểm kê định kỳ",
        systemQty: 0, // for UI display
        availableBatches: [], // cached batches for select dropdown
      },
    ],
  });

  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScanIdx, setActiveScanIdx] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const stocks = await getStockProduct();
      setProductOptions(stocks || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách sản phẩm");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Reset form
      setFormData({
        countDate: new Date().toISOString().split("T")[0],
        note: "",
        details: [
          {
            productId: "",
            batchNumber: "",
            actualQty: 0,
            reason: "Kiểm kê định kỳ",
            systemQty: 0,
            availableBatches: [],
          },
        ],
      });
    }
  }, [isOpen, fetchProducts]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadProductBatches = async (index, productId) => {
    if (!productId) return;
    
    try {
      let details = productDetailsCache[productId];
      if (!details) {
        details = await getStockById(productId);
        setProductDetailsCache((prev) => ({ ...prev, [productId]: details }));
      }

      setFormData((prev) => {
        const newDetails = [...prev.details];
        newDetails[index] = {
          ...newDetails[index],
          systemQty: details.stock || 0, // default to overall stock
          availableBatches: details.batches || [],
          batchNumber: "", // reset selected batch
        };
        return { ...prev, details: newDetails };
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể lấy thông tin lô hàng");
    }
  };

  const handleDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const newDetails = [...prev.details];
      const detail = { ...newDetails[index], [field]: value };

      if (field === "productId") {
        newDetails[index] = {
          ...detail,
          batchNumber: "",
          systemQty: 0,
          availableBatches: [],
        };
        // Trigger async loading
        setTimeout(() => loadProductBatches(index, value), 50);
      } else if (field === "batchNumber") {
        if (value) {
          const selectedBatch = detail.availableBatches.find((b) => b.batchNumber === value);
          detail.systemQty = selectedBatch ? selectedBatch.quantity : 0;
        } else {
          // Fallback to overall product stock from cache
          const cached = productDetailsCache[detail.productId];
          detail.systemQty = cached ? cached.stock : 0;
        }
        newDetails[index] = detail;
      } else {
        newDetails[index] = detail;
      }

      return { ...prev, details: newDetails };
    });
  };

  const addDetailRow = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          productId: "",
          batchNumber: "",
          actualQty: 0,
          reason: "Kiểm kê định kỳ",
          systemQty: 0,
          availableBatches: [],
        },
      ],
    }));
  };

  const removeDetailRow = (index) => {
    setFormData((prev) => {
      const newDetails = [...prev.details];
      newDetails.splice(index, 1);
      return { ...prev, details: newDetails };
    });
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
        toast.error("Mã QR không hợp lệ cho hàng hóa");
        return;
      }

      const found = productOptions.find((p) => p.id === productId);
      if (!found) {
        toast.error(`Không tìm thấy hàng hóa với ID: ${productId}`);
        return;
      }

      handleDetailChange(activeScanIdx, "productId", productId);
      toast.success(`Đã chọn: ${found.name}`);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xử lý dữ liệu quét");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!formData.countDate) {
      toast.error("Vui lòng nhập ngày kiểm kê");
      return;
    }

    const invalid = formData.details.find((d) => !d.productId);
    if (invalid) {
      toast.error("Vui lòng chọn sản phẩm cho tất cả các dòng");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        countDate: formData.countDate,
        note: formData.note,
        userId: currentUser?.id || null,
        details: formData.details.map((d) => ({
          productId: Number(d.productId),
          batchNumber: d.batchNumber || null,
          actualQty: Number(d.actualQty),
          reason: d.reason || "Kiểm kê định kỳ",
        })),
      };

      const res = await createInventoryCount(payload);
      if (res.success) {
        toast.success("Khởi tạo phiếu kiểm kê thành công!");
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Lập phiếu kiểm kê thất bại");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khởi tạo phiếu kiểm kê kho"
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} disabled={formLoading} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={formLoading}
            className="h-10 px-8 rounded-xl shadow-primary/30"
          >
            Lưu phiếu kiểm
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-subtle/30 dark:bg-white/5 p-5 rounded-2xl border border-border/40 dark:border-dark-border/40">
          <Input
            label="Ngày kiểm kê"
            type="date"
            value={formData.countDate}
            onChange={(e) => handleFormChange("countDate", e.target.value)}
            disabled={formLoading}
            className="h-10 bg-white dark:bg-dark-card"
          />
          <Input
            label="Ghi chú phiếu"
            placeholder="Lý do kiểm kê, đợt kiểm kê..."
            value={formData.note}
            onChange={(e) => handleFormChange("note", e.target.value)}
            disabled={formLoading}
            className="h-10 bg-white dark:bg-dark-card"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary">
              Danh sách hàng kiểm đếm
            </h4>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={addDetailRow}
              disabled={formLoading}
              className="rounded-xl border-dashed px-4 flex items-center gap-1.5"
            >
              <FiPlus /> Thêm dòng
            </Button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-bg-subtle/10 dark:bg-white/[0.01] p-3 rounded-2xl border border-border/40 dark:border-dark-border/40">
            {formData.details.map((detail, index) => (
              <div
                key={index}
                className="flex flex-wrap md:flex-nowrap gap-4 p-4 rounded-xl bg-white dark:bg-dark-card border border-border/40 dark:border-dark-border/40 items-end shadow-sm hover:border-primary/30 transition-colors relative group"
              >
                {/* Index badge */}
                <div className="absolute top-0 left-0 bg-bg-subtle dark:bg-dark-border/60 px-2 py-0.5 rounded-br-lg text-[8px] font-black text-text-tertiary">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Product Select */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider flex justify-between ml-1">
                    <span>Sản phẩm</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScanIdx(index);
                        setIsScannerOpen(true);
                      }}
                      className="text-[9px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FiCamera /> Quét QR
                    </button>
                  </label>
                  <select
                    value={detail.productId}
                    onChange={(e) => handleDetailChange(index, "productId", e.target.value)}
                    className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-10 px-3 outline-none font-bold"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Select (Conditional) */}
                <div className="w-36 space-y-1.5">
                  <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider ml-1">Số lô</label>
                  <select
                    value={detail.batchNumber}
                    onChange={(e) => handleDetailChange(index, "batchNumber", e.target.value)}
                    disabled={!detail.productId || detail.availableBatches.length === 0}
                    className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-10 px-3 outline-none font-bold disabled:opacity-50"
                  >
                    <option value="">-- Toàn bộ kho --</option>
                    {detail.availableBatches.map((b) => (
                      <option key={b.id} value={b.batchNumber}>
                        {b.batchNumber} (Tồn: {b.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* System Qty (Read Only) */}
                <div className="w-24 space-y-1.5">
                  <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider ml-1">Tồn HT</label>
                  <Input
                    type="number"
                    value={detail.systemQty}
                    disabled
                    className="h-10 bg-bg-subtle/40 dark:bg-white/[0.02] text-center font-bold"
                  />
                </div>

                {/* Actual Qty */}
                <div className="w-28 space-y-1.5">
                  <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider ml-1">Đếm thực tế</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={detail.actualQty}
                    onChange={(e) => handleDetailChange(index, "actualQty", Number(e.target.value))}
                    className="h-10 text-center font-bold"
                  />
                </div>

                {/* Discrepancy Display */}
                <div className="w-20 text-center pb-2.5 font-black text-xs">
                  {Number(detail.actualQty) - detail.systemQty === 0 ? (
                    <span className="text-text-tertiary">Khớp</span>
                  ) : Number(detail.actualQty) - detail.systemQty > 0 ? (
                    <span className="text-success">+{Number(detail.actualQty) - detail.systemQty}</span>
                  ) : (
                    <span className="text-error">{Number(detail.actualQty) - detail.systemQty}</span>
                  )}
                </div>

                {/* Reason */}
                <div className="w-40 space-y-1.5">
                  <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider ml-1">Lý do</label>
                  <Input
                    placeholder="Ví dụ: Hao hụt"
                    value={detail.reason}
                    onChange={(e) => handleDetailChange(index, "reason", e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={formData.details.length === 1}
                  onClick={() => removeDetailRow(index)}
                  className="text-error/40 hover:text-error hover:bg-error/10 mb-0.5 rounded-xl flex-shrink-0"
                >
                  <FiTrash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Camera QR Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </Modal>
  );
}
