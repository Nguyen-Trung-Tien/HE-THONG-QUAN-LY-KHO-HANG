import React, { useState } from "react";
import { FiTrash2, FiCamera } from "react-icons/fi";
import Button from "../common/Button";
import Input from "../common/Input";
import Badge from "../common/Badge";
import QRScannerModal from "../common/QRScannerModal";
import { toast } from "react-toastify";

export default function ReceiptDetailRow({
  detail,
  index,
  productOptions,
  handleDetailChange,
  removeReceiptDetail,
  formLoading,
  CURRENCY_UNIT,
}) {
  const [isRowScannerOpen, setIsRowScannerOpen] = useState(false);
  const DEFAULT_DISCOUNT_PERCENT = 10;
  const handleProductSelect = (e) => {
    const stockId = Number(e.target.value);
    const selectedProduct = productOptions.find((p) => p.id === stockId);
    
    let price = 0;
    if (selectedProduct && selectedProduct.price != null) {
      const basePrice = Number(selectedProduct.price) || 0;
      const discounted = Math.round(basePrice * (1 - DEFAULT_DISCOUNT_PERCENT / 100));
      price = Math.max(0, discounted);
    }

    handleDetailChange(index, {
      productId: stockId,
      StockProductData: selectedProduct || { name: "", unit: "" },
      price: price
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
        toast.error("Mã QR không hợp lệ cho sản phẩm");
        return;
      }

      const selectedProduct = productOptions.find((p) => p.id === productId);
      if (!selectedProduct) {
        toast.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        return;
      }

      let price = 0;
      if (selectedProduct.price != null) {
        const basePrice = Number(selectedProduct.price) || 0;
        const discounted = Math.round(basePrice * (1 - DEFAULT_DISCOUNT_PERCENT / 100));
        price = Math.max(0, discounted);
      }

      handleDetailChange(index, {
        productId: productId,
        StockProductData: selectedProduct,
        price: price
      });
      toast.success(`Đã chọn sản phẩm: ${selectedProduct.name}`);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xử lý mã quét");
    }
  };

  const StockProductData = detail.StockProductData || {};

  return (
    <div className="group flex flex-col w-full gap-4 p-6 border border-border/50 rounded-3xl shadow-sm bg-white dark:bg-dark-card hover:border-primary/40 hover:shadow-soft-xl transition-all duration-300 relative overflow-hidden">
      {/* Index Badge */}
      <div className="absolute top-0 left-0 w-8 h-8 bg-bg-subtle dark:bg-dark-border/40 flex items-center justify-center rounded-br-2xl text-[10px] font-black text-text-tertiary">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="flex flex-wrap gap-6 items-end pt-2">
        <div className="flex flex-col flex-1 min-w-[280px] space-y-2">
          <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span>Sản phẩm</span>
              <div className="w-1 h-1 rounded-full bg-primary/40" />
            </span>
            <button
              type="button"
              onClick={() => setIsRowScannerOpen(true)}
              className="text-[9px] text-primary hover:text-primary/80 font-black tracking-widest uppercase hover:underline flex items-center gap-1 cursor-pointer"
              title="Quét mã QR sản phẩm"
            >
              <FiCamera className="size-3.5" /> Quét QR
            </button>
          </label>
          <select
            value={detail.productId}
            onChange={handleProductSelect}
            className="w-full bg-bg-subtle/30 dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl py-3 px-5 outline-none transition-all duration-300 focus:bg-white focus:dark:bg-dark-card focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold shadow-inner-sm"
            disabled={formLoading || productOptions.length === 0}
          >
            <option className="dark:bg-dark-card dark:text-text-primary" value="">
              {productOptions.length === 0
                ? "Không có dữ liệu hàng hóa"
                : "-- Chọn sản phẩm nhập --"}
            </option>
            {productOptions.map((p) => (
              <option className="dark:bg-dark-card dark:text-text-primary" key={p.id} value={p.id}>
                {p.name} ({p.supplierName || "N/A"})
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <Input
            label="Số lượng"
            type="number"
            min="1"
            placeholder="0"
            value={detail.quantity}
            onChange={(e) =>
              handleDetailChange(index, "quantity", Number(e.target.value))
            }
            disabled={formLoading}
          />
        </div>

        <div className="w-40">
          <Input
            label={`Đơn giá (${CURRENCY_UNIT})`}
            type="number"
            min="0"
            step="100"
            value={detail.price}
            onChange={(e) =>
              handleDetailChange(index, "price", Number(e.target.value))
            }
            disabled={formLoading}
          />
        </div>

        <div className="w-36">
          <Input
            label="Số lô"
            placeholder="LOT-X"
            value={detail.batchNumber || ""}
            onChange={(e) =>
              handleDetailChange(index, "batchNumber", e.target.value)
            }
            disabled={formLoading}
          />
        </div>

        <div className="w-44">
          <Input
            label="Hạn sử dụng"
            type="date"
            value={detail.expiryDate || ""}
            onChange={(e) =>
              handleDetailChange(index, "expiryDate", e.target.value)
            }
            disabled={formLoading}
          />
        </div>

        <Button
          variant="ghost" 
          size="icon" 
          className="text-error/40 hover:text-error hover:bg-error/10 mb-1 rounded-2xl"
          onClick={() => removeReceiptDetail(index)}
          disabled={formLoading}
        >
          <FiTrash2 className="size-5" />
        </Button>
      </div>

      {detail.StockProductData?.id && (
        <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-gradient-to-r from-bg-subtle/50 dark:from-white/[0.02] to-transparent border border-border/30 dark:border-dark-border/40">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-tighter">Hiện có</span>
              <span className="text-xs font-black text-text-primary">
                {detail.StockProductData.stock} <span className="text-[10px] text-text-tertiary uppercase ml-0.5">{detail.StockProductData.unit}</span>
              </span>
            </div>
            <div className="flex flex-col border-l border-border/50 pl-4">
              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-tighter">Phân loại</span>
              <span className="text-xs font-black text-text-primary truncate">{detail.StockProductData.category}</span>
            </div>
            <div className="flex flex-col border-l border-border/50 pl-4 col-span-2">
              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-tighter">Nhà cung cấp gốc</span>
              <span className="text-xs font-black text-text-primary truncate">{detail.StockProductData.supplierName || "—"}</span>
            </div>
          </div>
          <div className="flex items-center">
             <Badge variant={detail.StockProductData.status === "Còn hàng" ? "success" : "error"} size="sm">
               {detail.StockProductData.status}
             </Badge>
          </div>
        </div>
      )}

      <QRScannerModal
        isOpen={isRowScannerOpen}
        onClose={() => setIsRowScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
