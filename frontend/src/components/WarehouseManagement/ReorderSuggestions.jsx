import React, { useState, useEffect } from "react";
import { getReorderSuggestions, createReorderReceipt } from "../../API/stock/stockAPI";
import { toast } from "react-toastify";
import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";
import Table from "../common/Table";
import Badge from "../common/Badge";
import { FiAlertTriangle, FiShoppingBag, FiTruck, FiBox, FiCheckSquare, FiSquare, FiPlusCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function ReorderSuggestions({ onImportReceiptCreated }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: boolean }
  const [quantities, setQuantities] = useState({}); // { [productId]: number }
  const [creatingReceipts, setCreatingReceipts] = useState({}); // { [supplierId]: boolean }

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getReorderSuggestions();
      setSuggestions(data || []);
      
      // Initialize states
      const initialSelected = {};
      const initialQtys = {};
      data?.forEach(s => {
        initialSelected[s.id] = true; // select all by default
        initialQtys[s.id] = s.suggestedQty || 10;
      });
      setSelectedItems(initialSelected);
      setQuantities(initialQtys);
    } catch {
      toast.error("Lỗi khi tải đề xuất đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleSelectToggle = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQtyChange = (id, val) => {
    const qty = Math.max(1, parseInt(val) || 0);
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleCreateDraftReceipt = async (supplierId, supplierName, supplierItems) => {
    // Filter out only checked items
    const checkedItems = supplierItems.filter(item => selectedItems[item.id]);
    
    if (checkedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mặt hàng để lập phiếu!");
      return;
    }

    setCreatingReceipts(prev => ({ ...prev, [supplierId]: true }));
    try {
      const payload = {
        supplierId: Number(supplierId),
        items: checkedItems.map(item => ({
          productId: item.id,
          quantity: quantities[item.id],
          price: item.price || "0",
          batchNumber: `AUTO-${Date.now().toString().slice(-6)}`,
          expiryDate: null
        }))
      };

      const res = await createReorderReceipt(payload);
      if (res.success) {
        toast.success(`Đã tự động tạo Phiếu Nhập Nháp #${res.receiptId} thành công!`);
        
        // Notify parent component to redirect to importReceipts tab
        if (onImportReceiptCreated) {
          onImportReceiptCreated();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo phiếu nhập nháp thất bại");
    } finally {
      setCreatingReceipts(prev => ({ ...prev, [supplierId]: false }));
    }
  };

  // Group items by supplier
  const groupedSuggestions = suggestions.reduce((acc, curr) => {
    const sId = curr.supplierId || "no-supplier";
    const sName = curr.supplier?.name || "Chưa gán nhà cung cấp";
    if (!acc[sId]) {
      acc[sId] = {
        supplierId: sId,
        supplierName: sName,
        items: []
      };
    }
    acc[sId].items.push(curr);
    return acc;
  }, {});

  const suppliersGroupList = Object.values(groupedSuggestions);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Đang tải đề xuất đặt hàng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Message */}
      <div className="bg-warning/5 border border-warning/20 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-warning/10 text-warning flex items-center justify-center text-lg shrink-0">
            <FiAlertTriangle />
          </div>
          <div>
            <h4 className="text-xs font-black text-text-primary uppercase tracking-tight">Nhắc nhở bổ sung hàng hóa</h4>
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wide mt-0.5">
              Hệ thống tìm thấy {suggestions.length} sản phẩm có mức tồn kho thấp hơn ngưỡng an toàn tối thiểu (`minStock`).
            </p>
          </div>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <Card className="py-16 text-center border-dashed border-2 border-border/60 max-w-2xl mx-auto space-y-4">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto text-success text-2xl">
            <FiCheckSquare />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">Tồn kho đạt trạng thái tối ưu</h3>
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
              Không có sản phẩm nào nằm dưới ngưỡng an toàn cần bổ sung.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {suppliersGroupList.map((group) => (
            <Card key={group.supplierId} noPadding className="shadow-soft-xl border-border/40 overflow-hidden">
              {/* Supplier header */}
              <div className="p-5 bg-bg-subtle/20 dark:bg-white/[0.01] border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FiTruck size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">{group.supplierName}</h3>
                    <p className="text-[9px] text-text-tertiary font-semibold uppercase tracking-wider mt-0.5">
                      {group.items.length} mặt hàng cần nhập thêm
                    </p>
                  </div>
                </div>

                {group.supplierId !== "no-supplier" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={creatingReceipts[group.supplierId]}
                    onClick={() => handleCreateDraftReceipt(group.supplierId, group.supplierName, group.items)}
                    className="rounded-xl shadow-primary/20 text-[9px] h-9 tracking-wider font-black uppercase flex items-center gap-1.5"
                    leftIcon={<FiPlusCircle className="size-4" />}
                  >
                    Tạo phiếu nhập nháp
                  </Button>
                ) : (
                  <Badge variant="error" className="text-[8px] uppercase tracking-wider font-bold">Vui lòng gán nhà cung cấp trước</Badge>
                )}
              </div>

              {/* Table of items */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-subtle/10 dark:bg-white/[0.005] border-b border-border/30 text-[9px] text-text-tertiary font-black uppercase tracking-wider">
                      <th className="py-4 px-6 w-12 text-center"></th>
                      <th className="py-4 px-6">Sản phẩm</th>
                      <th className="py-4 px-6">Danh mục</th>
                      <th className="py-4 px-6 text-center">Tồn hiện tại</th>
                      <th className="py-4 px-6 text-center">Tồn an toàn</th>
                      <th className="py-4 px-6 text-center w-36">SL gợi ý nhập</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-text-primary">
                    {group.items.map((item) => {
                      const isSelected = !!selectedItems[item.id];
                      return (
                        <tr key={item.id} className={cn(
                          "hover:bg-bg-subtle/5 dark:hover:bg-white/[0.005] transition-colors duration-200",
                          !isSelected && "opacity-55"
                        )}>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectToggle(item.id)}
                              className="text-primary hover:scale-110 transition-transform cursor-pointer"
                            >
                              {isSelected ? (
                                <FiCheckSquare size={16} className="text-primary" />
                              ) : (
                                <FiSquare size={16} className="text-text-tertiary" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6 font-bold uppercase tracking-tight">
                            {item.name}
                          </td>
                          <td className="py-4 px-6 text-[10px] text-text-secondary font-black uppercase tracking-wider">
                            {item.category || "Chưa có"}
                          </td>
                          <td className="py-4 px-6 text-center font-bold">
                            <span className="text-error font-black">{item.stock}</span> {item.unit}
                          </td>
                          <td className="py-4 px-6 text-center font-medium text-text-secondary">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <Input
                                type="number"
                                min="1"
                                value={quantities[item.id] || ""}
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                disabled={!isSelected}
                                className="h-9 w-24 text-center font-bold rounded-lg border-border/50 text-xs shadow-none"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
