import React, { useState, useEffect } from "react";
import { fetchLocations, generateLocations, assignProductToLocation } from "../../API/locationsApi/locationsApi";
import { getStockProduct } from "../../API/stock/stockAPI";
import { toast } from "react-toastify";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Card from "../common/Card";
import Badge from "../common/Badge";
import { FiGrid, FiBox, FiCpu, FiTrendingUp, FiCheckCircle, FiInfo, FiLayers, FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function WarehouseMap() {
  const [locations, setLocations] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAisle, setSelectedAisle] = useState("A");
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignProductId, setAssignProductId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [locsRes, stocksRes] = await Promise.all([
        fetchLocations(),
        getStockProduct()
      ]);
      setLocations(locsRes.locations || []);
      setStocks(stocksRes || []);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu sơ đồ kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await generateLocations();
      if (res.success) {
        toast.success(`Đã tự động khởi tạo ${res.count} vị trí kệ hàng thành công!`);
        loadData();
      } else {
        toast.info(res.message);
      }
    } catch {
      toast.error("Lỗi khởi tạo sơ đồ kho");
    }
  };

  const handleOpenAssign = (loc) => {
    setSelectedLoc(loc);
    const assignedProduct = loc.stocks?.[0];
    setAssignProductId(assignedProduct ? String(assignedProduct.id) : "");
    setShowAssignModal(true);
  };

  const handleAssignSave = async () => {
    if (!selectedLoc) return;
    setSaving(true);
    try {
      const prodId = assignProductId ? Number(assignProductId) : null;
      await assignProductToLocation(selectedLoc.id, prodId);
      toast.success(prodId ? "Đã gán sản phẩm vào vị trí kho!" : "Đã giải phóng vị trí kho!");
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gán vị trí thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Group locations for the map rendering
  const aisleLocations = locations.filter(l => l.aisle === selectedAisle);
  const racks = Array.from(new Set(aisleLocations.map(l => l.rack))).sort((a, b) => Number(a) - Number(b));
  const shelves = ["3", "2", "1"]; // render shelves top-down
  const bins = ["1", "2"];

  // Calculate statistics
  const totalSlots = locations.length;
  const occupiedSlots = locations.filter(l => l.stocks?.length > 0).length;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Đang dựng sơ đồ kho trực quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft-xl border-border/40 p-6 flex items-center justify-between group hover:shadow-soft-2xl transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tổng số vị trí kệ</p>
            <p className="text-2xl font-black text-text-primary tracking-tight">{totalSlots} vị trí</p>
          </div>
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl">
            <FiLayers />
          </div>
        </Card>
        <Card className="shadow-soft-xl border-border/40 p-6 flex items-center justify-between group hover:shadow-soft-2xl transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Vị trí đã sử dụng</p>
            <p className="text-2xl font-black text-text-primary tracking-tight">
              {occupiedSlots} / {totalSlots} <span className="text-xs text-text-secondary">slots</span>
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-success/10 flex items-center justify-center text-success text-xl">
            <FiCheckCircle />
          </div>
        </Card>
        <Card className="shadow-soft-xl border-border/40 p-6 flex items-center justify-between group hover:shadow-soft-2xl transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tỉ lệ lấp đầy</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-text-primary tracking-tight">{occupancyRate}%</span>
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                occupancyRate > 80 ? "bg-error/10 text-error" : occupancyRate > 50 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
              )}>
                {occupancyRate > 80 ? "Đầy nghẽn" : occupancyRate > 50 ? "Ổn định" : "Thông thoáng"}
              </span>
            </div>
          </div>
          <div className="size-12 rounded-2xl bg-info/10 flex items-center justify-center text-info text-xl">
            <FiTrendingUp />
          </div>
        </Card>
      </div>

      {totalSlots === 0 ? (
        <Card className="py-16 text-center border-dashed border-2 border-border/60 max-w-2xl mx-auto space-y-6">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary text-2xl">
            <FiGrid />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black text-text-primary">Chưa Khởi Tạo Sơ Đồ Kho</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Hệ thống chưa tìm thấy dữ liệu tọa độ kệ kho. Bấm nút bên dưới để tự động tạo sơ đồ lưới vị trí chuẩn hóa 2D (4 Dãy x 4 Kệ x 3 Tầng x 2 Ngăn = 96 vị trí).
            </p>
          </div>
          <Button variant="primary" onClick={handleGenerate} className="px-8 rounded-xl shadow-primary/30">
            Tự động sinh sơ đồ vị trí
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Aisle Selection Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 border-border/40 shadow-soft-xl">
              <h4 className="text-[10px] font-black uppercase text-text-tertiary tracking-widest mb-4 flex items-center gap-2">
                <FiLayers className="text-primary" /> Chọn Dãy Hàng (Aisles)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {["A", "B", "C", "D"].map((aisle) => {
                  const aisleSlots = locations.filter(l => l.aisle === aisle);
                  const occupied = aisleSlots.filter(l => l.stocks?.length > 0).length;
                  const rate = aisleSlots.length > 0 ? Math.round((occupied / aisleSlots.length) * 100) : 0;
                  
                  return (
                    <button
                      key={aisle}
                      onClick={() => setSelectedAisle(aisle)}
                      className={cn(
                        "p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden group cursor-pointer",
                        selectedAisle === aisle
                          ? "border-primary bg-primary/5 text-primary shadow-soft-sm font-black"
                          : "border-border/50 bg-white dark:bg-dark-card text-text-secondary hover:border-text-tertiary"
                      )}
                    >
                      <span className="text-lg font-black">Khu {aisle}</span>
                      <span className="text-[9px] font-bold opacity-60">Lấp đầy: {rate}%</span>
                      <div className={cn(
                        "w-full h-1 absolute bottom-0 left-0 transition-all",
                        rate > 80 ? "bg-error" : rate > 50 ? "bg-warning" : "bg-success"
                      )} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-bg-subtle/40 dark:bg-white/[0.02] border border-border/40 text-[10px] text-text-tertiary space-y-3 font-semibold">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-md bg-bg-subtle border border-border" />
                  <span>Ngăn trống (Chưa gán hàng)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-md bg-success/20 border border-success" />
                  <span>Dưới 50% sức chứa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-md bg-primary/20 border border-primary" />
                  <span>Chiếm 50% - 80% sức chứa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-md bg-warning/20 border border-warning animate-pulse" />
                  <span>Quá tải (Trên 80% sức chứa)</span>
                </div>
              </div>
            </Card>
          </div>

          {/* 2D Map Grid Panel */}
          <div className="lg:col-span-3">
            <Card className="p-6 border-border/40 shadow-soft-xl overflow-x-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">Bản đồ lưới mặt cắt Dãy {selectedAisle}</h3>
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5">Hiển thị Racks vs Shelves & Bins</p>
                </div>
                <Badge variant="primary" className="font-bold">Khu {selectedAisle}</Badge>
              </div>

              {/* Grid map */}
              <div className="min-w-[700px] space-y-6">
                <div className="grid grid-cols-5 gap-4">
                  {/* Y-axis labels label */}
                  <div className="col-span-1 flex flex-col justify-between py-6 text-right pr-4 text-[9px] font-black uppercase tracking-wider text-text-tertiary space-y-14">
                    {shelves.map((s) => (
                      <div key={s} className="h-14 flex items-center justify-end gap-1">
                        <span>Tầng {s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rack Columns */}
                  {racks.map((rack) => (
                    <div key={rack} className="col-span-1 space-y-4">
                      {/* Rack Title */}
                      <div className="text-center font-black text-[10px] text-text-secondary uppercase tracking-widest py-1 bg-bg-subtle/50 dark:bg-white/5 rounded-lg border border-border/30">
                        Kệ {rack}
                      </div>

                      {/* Stacked Shelves */}
                      <div className="space-y-4 border-x border-dashed border-border/40 px-2 py-4 bg-bg-subtle/10 dark:bg-white/[0.01] rounded-2xl">
                        {shelves.map((shelf) => (
                          <div key={shelf} className="space-y-1.5">
                            {/* Bins row inside shelf */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {bins.map((bin) => {
                                // Find location
                                const loc = aisleLocations.find(l => l.rack === rack && l.shelf === shelf && l.bin === bin);
                                if (!loc) return <div key={bin} className="aspect-video bg-border/20 rounded-md border border-dashed" />;

                                const product = loc.stocks?.[0];
                                const hasProduct = !!product;
                                const qty = product?.stock || 0;
                                const capacity = loc.capacity || 500;
                                const percentage = hasProduct ? Math.round((qty / capacity) * 100) : 0;

                                return (
                                  <button
                                    key={bin}
                                    onClick={() => handleOpenAssign(loc)}
                                    className={cn(
                                      "aspect-video rounded-xl border flex flex-col p-2 text-left justify-between transition-all duration-300 hover:scale-[1.04] cursor-pointer shadow-sm relative overflow-hidden group",
                                      !hasProduct
                                        ? "bg-white dark:bg-dark-card border-border/50 text-text-tertiary hover:border-primary/50"
                                        : percentage > 80
                                        ? "bg-warning/10 border-warning text-warning-hover hover:bg-warning/20 shadow-warning/10"
                                        : percentage > 50
                                        ? "bg-primary/10 border-primary text-primary-hover hover:bg-primary/20 shadow-primary/10"
                                        : "bg-success/10 border-success text-success-hover hover:bg-success/20 shadow-success/10"
                                    )}
                                  >
                                    <div className="flex justify-between items-start w-full">
                                      <span className="text-[9px] font-black tracking-widest">{bin === "1" ? "Trái" : "Phải"}</span>
                                      {hasProduct && (
                                        <span className="text-[8px] font-black bg-white/40 dark:bg-black/30 px-1 rounded-md">
                                          {percentage}%
                                        </span>
                                      )}
                                    </div>
                                    
                                    {hasProduct ? (
                                      <div className="space-y-0.5 truncate w-full">
                                        <p className="text-[9px] font-black uppercase tracking-tight truncate leading-tight">
                                          {product.name}
                                        </p>
                                        <p className="text-[8px] font-semibold opacity-85">
                                          {qty}/{capacity} {product.unit}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center py-1.5 opacity-30 w-full">
                                        <FiBox size={12} className="mb-0.5" />
                                        <span className="text-[7px] font-bold uppercase tracking-wider">Trống</span>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Product Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={selectedLoc ? `Vị trí: Khu ${selectedLoc.aisle} - Kệ ${selectedLoc.rack} - Tầng ${selectedLoc.shelf} - Ngăn ${selectedLoc.bin}` : ""}
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="h-10 px-6 rounded-xl">Hủy</Button>
            <Button variant="primary" onClick={handleAssignSave} loading={saving} className="h-10 px-8 rounded-xl shadow-primary/30">
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-6 p-2">
          {selectedLoc?.stocks?.[0] ? (
            <div className="p-4 rounded-2xl bg-bg-subtle/50 dark:bg-white/5 border border-border/40 space-y-3">
              <div className="flex items-center gap-x-2 text-primary">
                <FiInfo className="size-4" />
                <h4 className="text-[9px] font-black uppercase tracking-widest">Hàng hóa hiện tại</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-text-primary">
                <div>Sản phẩm: <span className="text-primary uppercase">{selectedLoc.stocks[0].name}</span></div>
                <div>Tồn thực tế: <span>{selectedLoc.stocks[0].stock} {selectedLoc.stocks[0].unit}</span></div>
                <div>Sức chứa: <span>{selectedLoc.capacity}</span></div>
                <div>Sử dụng: <span className={cn(
                  selectedLoc.stocks[0].stock > selectedLoc.capacity ? "text-error" : "text-success"
                )}>{Math.round((selectedLoc.stocks[0].stock / selectedLoc.capacity) * 100)}%</span></div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-bg-subtle/50 dark:bg-white/5 border border-dashed border-border/60 text-center text-text-tertiary flex flex-col items-center gap-1.5">
              <FiAlertCircle size={20} />
              <p className="text-[9px] font-black uppercase tracking-widest">Chưa gán hàng hóa cho ô kệ này</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center gap-x-1">
              <span>Gán/Thay đổi sản phẩm</span>
            </label>
            <select
              value={assignProductId}
              onChange={(e) => setAssignProductId(e.target.value)}
              className="w-full bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-2xl h-11 px-4 outline-none font-bold"
            >
              <option value="">-- Giải phóng vị trí này (Để trống) --</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category} - Tồn: {s.stock} {s.unit})
                </option>
              ))}
            </select>
            <p className="text-[8px] text-text-tertiary ml-2 font-semibold">
              * Lưu ý: Khi gán sản phẩm, vị trí cũ của sản phẩm đó (nếu có) sẽ không bị ảnh hưởng.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
